const express = require('express');
const router = express.Router();
const { registerVisitor, getAllVisitors, updateVisitorStatus } = require('../controllers/visitorController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// Tenant routes
router.post('/', authorizeRoles('Tenant'), registerVisitor);

// Admin routes
router.get('/', authorizeRoles('Admin'), getAllVisitors);
router.put('/:id/status', authorizeRoles('Admin'), updateVisitorStatus);

module.exports = router;
