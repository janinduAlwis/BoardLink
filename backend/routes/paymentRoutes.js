const express = require('express');
const router = express.Router();
const { getAllPayments, createInvoice, updatePaymentStatus, getMyPayments, payMyRent } = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Route to get all payments (Admin view)
router.get('/', getAllPayments);

// Route to create a new invoice
router.post('/', createInvoice);

// Route to update payment status
router.put('/:payment_id/status', updatePaymentStatus);

// Route for a tenant to get their own payments
router.get('/my-payments', authenticateToken, getMyPayments);

// Route for a tenant to pay their rent
router.put('/my-payments/:payment_id/pay', authenticateToken, payMyRent);

module.exports = router;
