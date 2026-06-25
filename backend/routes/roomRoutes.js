const express = require('express');
const router = express.Router();
const {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
} = require('../controllers/roomController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Authenticated Routes (All roles can view rooms)
router.get('/', authenticateToken, getAllRooms);
router.get('/:id', authenticateToken, getRoomById);

// Admin Only Routes
router.post('/', authenticateToken, authorizeRoles('Admin'), createRoom);
router.put('/:id', authenticateToken, authorizeRoles('Admin'), updateRoom);
router.delete('/:id', authenticateToken, authorizeRoles('Admin'), deleteRoom);

module.exports = router;
