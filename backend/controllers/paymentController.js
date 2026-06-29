const db = require('../config/db');

// Get all rent payments
const getAllPayments = async (req, res) => {
  try {
    const query = `
      SELECT rp.payment_id, rp.billing_month, rp.rent_amount, rp.due_date, 
             rp.payment_date, rp.payment_status, rp.payment_proof,
             t.tenant_id, t.nic_number, u.full_name
      FROM rent_payments rp
      JOIN tenants t ON rp.tenant_id = t.tenant_id
      JOIN users u ON t.user_id = u.user_id
      ORDER BY rp.due_date DESC
    `;
    
    const [rows] = await db.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Server error while fetching payments.', error: error.message });
  }
};

// Create a new rent invoice
const createInvoice = async (req, res) => {
  const { tenant_id, billing_month, rent_amount, due_date } = req.body;

  if (!tenant_id || !billing_month || !rent_amount || !due_date) {
    return res.status(400).json({ message: 'All fields are required to generate an invoice.' });
  }

  try {
    // Check if an invoice already exists for this tenant and month
    const [existing] = await db.query(
      'SELECT payment_id FROM rent_payments WHERE tenant_id = ? AND billing_month = ?',
      [tenant_id, billing_month]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'An invoice for this billing month already exists for the selected tenant.' });
    }

    await db.query(
      `INSERT INTO rent_payments (tenant_id, billing_month, rent_amount, due_date, payment_status) 
       VALUES (?, ?, ?, ?, 'unpaid')`,
      [tenant_id, billing_month, rent_amount, due_date]
    );

    res.status(201).json({ message: 'Rent invoice generated successfully.' });
  } catch (error) {
    console.error('Invoice generation error:', error);
    res.status(500).json({ message: 'Server error generating invoice.', error: error.message });
  }
};

// Update payment status (e.g., mark as paid)
const updatePaymentStatus = async (req, res) => {
  const { payment_id } = req.params;
  const { payment_status } = req.body;

  if (!payment_status) {
    return res.status(400).json({ message: 'Payment status is required.' });
  }

  try {
    // If marking as paid, we can set payment_date to today
    let updateQuery = 'UPDATE rent_payments SET payment_status = ? WHERE payment_id = ?';
    let queryParams = [payment_status, payment_id];

    if (payment_status === 'paid') {
      updateQuery = 'UPDATE rent_payments SET payment_status = ?, payment_date = CURRENT_DATE WHERE payment_id = ?';
    }

    const [result] = await db.query(updateQuery, queryParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Payment record not found.' });
    }

    res.status(200).json({ message: 'Payment status updated successfully.' });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error updating payment status.', error: error.message });
  }
};

// Get all payments for the logged in tenant
const getMyPayments = async (req, res) => {
  const user_id = req.user.user_id;
  try {
    const query = `
      SELECT rp.payment_id, rp.billing_month, rp.rent_amount, rp.due_date, 
             rp.payment_date, rp.payment_status
      FROM rent_payments rp
      JOIN tenants t ON rp.tenant_id = t.tenant_id
      WHERE t.user_id = ?
      ORDER BY rp.due_date DESC
    `;
    const [rows] = await db.query(query, [user_id]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching my payments:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Simulate paying rent (dummy pay now button)
const payMyRent = async (req, res) => {
  const user_id = req.user.user_id;
  const { payment_id } = req.params;
  
  try {
    // Verify payment belongs to tenant
    const [paymentRows] = await db.query(
      `SELECT rp.payment_id FROM rent_payments rp
       JOIN tenants t ON rp.tenant_id = t.tenant_id
       WHERE rp.payment_id = ? AND t.user_id = ?`,
       [payment_id, user_id]
    );

    if (paymentRows.length === 0) {
      return res.status(404).json({ message: 'Payment record not found or unauthorized.' });
    }

    await db.query(
      'UPDATE rent_payments SET payment_status = ?, payment_date = CURRENT_DATE WHERE payment_id = ?',
      ['paid', payment_id]
    );

    res.status(200).json({ message: 'Rent paid successfully.' });
  } catch (error) {
    console.error('Error paying rent:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

module.exports = { getAllPayments, createInvoice, updatePaymentStatus, getMyPayments, payMyRent };
