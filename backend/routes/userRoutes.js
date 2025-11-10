const express = require('express');
const router = express.Router();

const {
  signup,
  login,
  getAllUsers,
  forgetPassword,
  resetPassword,
  updateUser,
  verifyOtp,
  resendOtp,
  resetPasswordForgot
} = require('../controllers/userController');

const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/', signup);               // Signup
router.post('/login', login);           // Login
router.post('/forgot-password', forgetPassword);  // Public
router.post('/reset-password-forgot', resetPasswordForgot);  // Public

// OTP verification and resend should be public (no auth required)
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);

// Protected routes (require auth)
router.get('/', authMiddleware, getAllUsers);    // Get all users
router.post('/reset-password', authMiddleware, resetPassword);
router.patch('/update-profile', authMiddleware, updateUser);

module.exports = router;
