const express = require('express');
const router = express.Router();
const { getAllUtilityBills, createUtilityBill, updateUtilityStatus, getMyUtilityBills, payMyUtilityBill } = require('../controllers/utilityController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Route to get all utility bills
router.get('/', getAllUtilityBills);

// Route to create a new utility bill
router.post('/', createUtilityBill);

// Route to update a utility bill's status
router.put('/:bill_id/status', updateUtilityStatus);

// Route for a tenant to get their own bills
router.get('/my-bills', authenticateToken, getMyUtilityBills);

// Route for a tenant to pay their utility bill
router.put('/my-bills/:bill_id/pay', authenticateToken, payMyUtilityBill);

module.exports = router;
