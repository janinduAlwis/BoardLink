const db = require('../config/db');

// Tenant: Register a visitor
const registerVisitor = async (req, res) => {
  const user_id = req.user.user_id;
  const { visitor_name, visit_date, purpose } = req.body;

  try {
    const [tenantRows] = await db.query('SELECT tenant_id FROM tenants WHERE user_id = ?', [user_id]);
    if (tenantRows.length === 0) return res.status(404).json({ message: 'Tenant record not found.' });
    const tenant_id = tenantRows[0].tenant_id;

    if (!visitor_name || !visit_date || !purpose) {
      return res.status(400).json({ message: 'Visitor name, date, and purpose are required.' });
    }

    await db.query(
      'INSERT INTO visitors (tenant_id, visitor_name, visit_date, purpose) VALUES (?, ?, ?, ?)',
      [tenant_id, visitor_name, visit_date, purpose]
    );

    res.status(201).json({ message: 'Visitor registered and pending approval.' });
  } catch (error) {
    console.error('Error registering visitor:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Admin: Get all visitors
const getAllVisitors = async (req, res) => {
  try {
    const query = `
      SELECT v.visitor_id, v.visitor_name, v.visit_date, v.arrival_time, v.departure_time, v.purpose, v.approval_status,
             u.full_name AS tenant_name
      FROM visitors v
      JOIN tenants t ON v.tenant_id = t.tenant_id
      JOIN users u ON t.user_id = u.user_id
      ORDER BY v.visit_date DESC, v.visitor_id DESC
    `;
    const [rows] = await db.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching visitors:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Admin: Update visitor status (Approve/Reject)
const updateVisitorStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'Approved', 'Rejected'

  if (!status || !['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' });
  }

  try {
    await db.query('UPDATE visitors SET approval_status = ? WHERE visitor_id = ?', [status, id]);
    res.status(200).json({ message: `Visitor ${status.toLowerCase()} successfully.` });
  } catch (error) {
    console.error('Error updating visitor:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

module.exports = { registerVisitor, getAllVisitors, updateVisitorStatus };
