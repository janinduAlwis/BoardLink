const express = require('express');
const router = express.Router();
const { getMyMaintenanceTasks, updateTaskStatus, getTodayVisitors } = require('../controllers/staffController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Protect all routes under this module
router.use(authenticateToken);
router.use(authorizeRoles('Staff', 'Admin')); // allow Admin as well if needed, but let's restrict to Staff

// Maintenance tasks routes
router.get('/my-tasks', getMyMaintenanceTasks);
router.put('/my-tasks/:request_id/status', updateTaskStatus);

// Visitors routes
router.get('/visitors/today', getTodayVisitors);

module.exports = router;
