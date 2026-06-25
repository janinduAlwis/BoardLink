const express = require('express');
const router = express.Router();
const { getAllUtilityBills, createUtilityBill, updateUtilityStatus } = require('../controllers/utilityController');

// Route to get all utility bills
router.get('/', getAllUtilityBills);

// Route to create a new utility bill
router.post('/', createUtilityBill);

// Route to update a utility bill's status
router.put('/:bill_id/status', updateUtilityStatus);

module.exports = router;
