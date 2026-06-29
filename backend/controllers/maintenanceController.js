const db = require('../config/db');

// Tenant: Submit a maintenance request
const submitMaintenanceRequest = async (req, res) => {
  const user_id = req.user.user_id;
  const { title, description, priority } = req.body;

  try {
    // Get tenant and active room
    const [tenantRows] = await db.query('SELECT tenant_id FROM tenants WHERE user_id = ?', [user_id]);
    if (tenantRows.length === 0) return res.status(404).json({ message: 'Tenant record not found.' });
    const tenant_id = tenantRows[0].tenant_id;

    const [allocRows] = await db.query('SELECT room_id FROM room_allocations WHERE tenant_id = ? AND allocation_status = "active"', [tenant_id]);
    if (allocRows.length === 0) return res.status(400).json({ message: 'You must have an active room allocation to submit a request.' });
    const room_id = allocRows[0].room_id;

    await db.query(
      'INSERT INTO maintenance_requests (tenant_id, room_id, title, description, priority) VALUES (?, ?, ?, ?, ?)',
      [tenant_id, room_id, title, description, priority || 'low']
    );

    res.status(201).json({ message: 'Maintenance request submitted successfully.' });
  } catch (error) {
    console.error('Error submitting maintenance request:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Admin: Get all maintenance requests
const getAllMaintenanceRequests = async (req, res) => {
  try {
    const query = `
      SELECT mr.request_id, mr.title, mr.description, mr.priority, mr.status, mr.created_at,
             r.room_number, u.full_name AS tenant_name, su.full_name AS staff_name, mr.assigned_staff_id
      FROM maintenance_requests mr
      JOIN rooms r ON mr.room_id = r.room_id
      JOIN tenants t ON mr.tenant_id = t.tenant_id
      JOIN users u ON t.user_id = u.user_id
      LEFT JOIN users su ON mr.assigned_staff_id = su.user_id
      ORDER BY mr.created_at DESC
    `;
    const [rows] = await db.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Admin: Assign request to staff
const assignStaff = async (req, res) => {
  const { id } = req.params;
  const { staff_id } = req.body;

  try {
    if (!staff_id) {
      return res.status(400).json({ message: 'Staff ID is required.' });
    }

    // Verify staff user exists and has Staff role
    const [staffRows] = await db.query('SELECT r.role_name FROM users u JOIN roles r ON u.role_id = r.role_id WHERE u.user_id = ?', [staff_id]);
    if (staffRows.length === 0 || staffRows[0].role_name !== 'Staff') {
      return res.status(400).json({ message: 'Invalid Staff ID.' });
    }

    await db.query(
      'UPDATE maintenance_requests SET assigned_staff_id = ?, status = "Assigned" WHERE request_id = ?',
      [staff_id, id]
    );

    res.status(200).json({ message: 'Maintenance request assigned successfully.' });
  } catch (error) {
    console.error('Error assigning staff:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Admin: Fetch all staff for assignment drop-downs
const getAllStaff = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT u.user_id, u.full_name, u.email FROM users u JOIN roles r ON u.role_id = r.role_id WHERE r.role_name = "Staff"');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Admin: Update maintenance status
const updateMaintenanceStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    if (!status) return res.status(400).json({ message: 'Status is required.' });
    
    await db.query(
      'UPDATE maintenance_requests SET status = ? WHERE request_id = ?',
      [status, id]
    );
    res.status(200).json({ message: 'Status updated successfully.' });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

module.exports = { submitMaintenanceRequest, getAllMaintenanceRequests, assignStaff, getAllStaff, updateMaintenanceStatus };
