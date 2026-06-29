const express = require('express');
const router = express.Router();
const { submitMaintenanceRequest, getAllMaintenanceRequests, assignStaff, getAllStaff, updateMaintenanceStatus } = require('../controllers/maintenanceController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// Tenant routes
router.post('/', authorizeRoles('Tenant'), submitMaintenanceRequest);

// Admin routes
router.get('/', authorizeRoles('Admin'), getAllMaintenanceRequests);
router.put('/:id/assign', authorizeRoles('Admin'), assignStaff);
router.put('/:id/status', authorizeRoles('Admin'), updateMaintenanceStatus);
router.get('/staff', authorizeRoles('Admin'), getAllStaff); // Fetch staff list

module.exports = router;
