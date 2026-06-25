const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Register a User
const register = async (req, res) => {
  const { full_name, email, phone, password, role_name, nic_number, emergency_contact } = req.body;

  // Basic Validation
  if (!full_name || !email || !phone || !password || !role_name) {
    return res.status(400).json({ message: 'All standard fields are required.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Check if user already exists
    const [existingUser] = await connection.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    // Get role_id from role_name
    const [roleRows] = await connection.query('SELECT role_id FROM roles WHERE role_name = ?', [role_name]);
    if (roleRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Invalid role specified.' });
    }
    const role_id = roleRows[0].role_id;

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert User
    const [userResult] = await connection.query(
      'INSERT INTO users (role_id, full_name, email, phone, password_hash) VALUES (?, ?, ?, ?, ?)',
      [role_id, full_name, email, phone, password_hash]
    );
    const user_id = userResult.insertId;

    // If role is Tenant, create Tenant Profile
    if (role_name === 'Tenant') {
      if (!nic_number || !emergency_contact) {
        await connection.rollback();
        return res.status(400).json({ message: 'NIC number and emergency contact are required for tenants.' });
      }

      // Check if NIC already registered
      const [existingNIC] = await connection.query('SELECT tenant_id FROM tenants WHERE nic_number = ?', [nic_number]);
      if (existingNIC.length > 0) {
        await connection.rollback();
        return res.status(400).json({ message: 'NIC number is already registered.' });
      }

      await connection.query(
        'INSERT INTO tenants (user_id, nic_number, emergency_contact) VALUES (?, ?, ?)',
        [user_id, nic_number, emergency_contact]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'User registered successfully!' });

  } catch (error) {
    await connection.rollback();
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  } finally {
    connection.release();
  }
};

// Login User
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // Find user and join role to get role_name
    const [userRows] = await db.query(
      `SELECT u.*, r.role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.role_id 
       WHERE u.email = ?`,
      [email]
    );

    if (userRows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const user = userRows[0];

    // Check account status
    if (user.account_status !== 'active') {
      return res.status(403).json({ message: `Account is ${user.account_status}. Please contact the admin.` });
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT Token (expires in 24 hours)
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role_name: user.role_name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return response without password hash
    const { password_hash, ...userResponse } = user;
    res.status(200).json({
      message: 'Login successful!',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
};

// Get Current Logged-in User Profile
const getMe = async (req, res) => {
  try {
    const { user_id, role_name } = req.user;

    let query = `
      SELECT u.user_id, u.full_name, u.email, u.phone, u.account_status, u.created_at, r.role_name
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      WHERE u.user_id = ?
    `;

    // If tenant, join tenant info
    if (role_name === 'Tenant') {
      query = `
        SELECT u.user_id, u.full_name, u.email, u.phone, u.account_status, u.created_at, r.role_name,
               t.tenant_id, t.nic_number, t.emergency_contact, t.check_in_date, t.check_out_date
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        LEFT JOIN tenants t ON u.user_id = t.user_id
        WHERE u.user_id = ?
      `;
    }

    const [userRows] = await db.query(query, [user_id]);
    if (userRows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(userRows[0]);
  } catch (error) {
    console.error('getMe Error:', error);
    res.status(500).json({ message: 'Server error retrieving profile.', error: error.message });
  }
};

module.exports = { register, login, getMe };
