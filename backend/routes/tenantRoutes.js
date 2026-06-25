const express = require('express');
const router = express.Router();
const { getAllTenants, allocateRoom, deallocateRoom } = require('../controllers/tenantController');
// Assuming authMiddleware is available to protect routes
// const { protect, adminOnly } = require('../middleware/authMiddleware');

// Route to get all tenants (Admin only usually, but let's keep it simple for now)
router.get('/', getAllTenants);

// Route to allocate a tenant to a room
router.post('/allocate', allocateRoom);

// Route to deallocate a tenant
router.post('/deallocate/:allocation_id', deallocateRoom);

module.exports = router;
