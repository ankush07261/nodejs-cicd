const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Public route: Login
router.post('/login', authController.login);

// Protected route: Current user details
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
