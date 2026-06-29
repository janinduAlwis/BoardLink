const express = require('express');
const router = express.Router();
const { getAnnouncements, createAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// All roles can view
router.get('/', getAnnouncements);

// Only Admin can create/delete
router.post('/', authorizeRoles('Admin'), createAnnouncement);
router.delete('/:id', authorizeRoles('Admin'), deleteAnnouncement);

module.exports = router;
