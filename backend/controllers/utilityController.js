const db = require('../config/db');

// Get all utility bills
const getAllUtilityBills = async (req, res) => {
  try {
    const query = `
      SELECT ub.utility_bill_id, ub.billing_month, 
             ub.electricity_charge, ub.water_charge, ub.internet_charge, ub.other_charge, 
             ub.total_amount, ub.due_date, ub.payment_date, ub.status,
             t.tenant_id, t.nic_number, u.full_name,
             ra.room_id, r.room_number
      FROM utility_bills ub
      JOIN tenants t ON ub.tenant_id = t.tenant_id
      JOIN users u ON t.user_id = u.user_id
      LEFT JOIN room_allocations ra ON t.tenant_id = ra.tenant_id AND ra.allocation_status = 'active'
      LEFT JOIN rooms r ON ra.room_id = r.room_id
      ORDER BY ub.due_date DESC
    `;
    
    const [rows] = await db.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching utility bills:', error);
    res.status(500).json({ message: 'Server error while fetching utility bills.', error: error.message });
  }
};

// Create a new utility bill
const createUtilityBill = async (req, res) => {
  const { tenant_id, billing_month, electricity_charge, water_charge, internet_charge, other_charge, due_date } = req.body;

  if (!tenant_id || !billing_month || !due_date) {
    return res.status(400).json({ message: 'Tenant, billing month, and due date are required.' });
  }

  try {
    // Check for duplicate bill for the SAME TENANT in the SAME MONTH
    const [existing] = await db.query(
      'SELECT utility_bill_id FROM utility_bills WHERE tenant_id = ? AND billing_month = ?',
      [tenant_id, billing_month]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'A utility bill for this tenant already exists for the selected billing month.' });
    }

    await db.query(
      `INSERT INTO utility_bills 
       (tenant_id, billing_month, electricity_charge, water_charge, internet_charge, other_charge, due_date, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'unpaid')`,
      [
        tenant_id, 
        billing_month, 
        electricity_charge || 0, 
        water_charge || 0, 
        internet_charge || 0, 
        other_charge || 0, 
        due_date
      ]
    );

    res.status(201).json({ message: 'Utility bill recorded successfully.' });
  } catch (error) {
    console.error('Bill creation error:', error);
    res.status(500).json({ message: 'Server error recording utility bill.', error: error.message });
  }
};

// Update bill status (e.g., mark as paid)
const updateUtilityStatus = async (req, res) => {
  const { bill_id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required.' });
  }

  try {
    let updateQuery = 'UPDATE utility_bills SET status = ? WHERE utility_bill_id = ?';
    let queryParams = [status, bill_id];

    if (status === 'paid') {
      updateQuery = 'UPDATE utility_bills SET status = ?, payment_date = CURRENT_DATE WHERE utility_bill_id = ?';
    }

    const [result] = await db.query(updateQuery, queryParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Utility bill record not found.' });
    }

    res.status(200).json({ message: 'Utility bill status updated successfully.' });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error updating utility bill status.', error: error.message });
  }
};

module.exports = { getAllUtilityBills, createUtilityBill, updateUtilityStatus };
