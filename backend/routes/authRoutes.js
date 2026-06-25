const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public Routes
router.post('/register', register);
router.post('/login', login);

// Protected Routes
router.get('/me', authenticateToken, getMe);

module.exports = router;
