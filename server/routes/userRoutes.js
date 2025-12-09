const express = require('express');
const router = express.Router();
const { register, login, getUserProfile } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected route
router.get('/profile', authMiddleware, getUserProfile);

module.exports = router;
