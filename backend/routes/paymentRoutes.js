const express = require('express');
const router = express.Router();
const { getAllPayments, createInvoice, updatePaymentStatus } = require('../controllers/paymentController');

// Route to get all payments (Admin view)
router.get('/', getAllPayments);

// Route to create a new invoice
router.post('/', createInvoice);

// Route to update payment status
router.put('/:payment_id/status', updatePaymentStatus);

module.exports = router;
