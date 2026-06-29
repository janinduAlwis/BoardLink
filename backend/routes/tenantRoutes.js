const express = require('express');
const router = express.Router();
const { getAllTenants, allocateRoom, deallocateRoom, getMyAllocation } = require('../controllers/tenantController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Route to get all tenants (Admin only usually, but let's keep it simple for now)
router.get('/', getAllTenants);

// Route to allocate a tenant to a room
router.post('/allocate', allocateRoom);

// Route to deallocate a tenant
router.post('/deallocate/:allocation_id', deallocateRoom);

// Route for a tenant to get their own allocation
router.get('/my-allocation', authenticateToken, getMyAllocation);

module.exports = router;
