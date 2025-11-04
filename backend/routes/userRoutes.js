const express = require('express');
const router = express.Router();
const { signup, login, getAllUsers, forgetPassword, resetPassword, updateUser } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (no auth needed)
router.post('/', signup);
router.post('/login', login);

// Protected route (auth needed)
router.get('/', authMiddleware, getAllUsers);  // GET /api/user
router.post('/forgot-password', forgetPassword); 
router.post('/reset-password', authMiddleware, resetPassword); 
router.patch('/update-profile', authMiddleware, updateUser);

module.exports = router;
