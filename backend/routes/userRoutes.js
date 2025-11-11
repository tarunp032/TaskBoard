const express = require('express');
const router = express.Router();

const {
  signup,
  verifyOtp,
  login,
  resendOtp,
  forgetPassword,
  resetPasswordForgot,
  sendOtpForResetPassword,
  resetPasswordWithOtp,
  resetPassword,
  getAllUsers,
  updateUser
} = require('../controllers/userController');

const authMiddleware = require('../middleware/authMiddleware');

// === PUBLIC ROUTES (NO AUTH NEEDED) ===
router.post('/', signup);                       // Step 1: Signup
router.post('/verify-otp', verifyOtp);          // Step 2: Verify OTP (signup, forgot, settings)
router.post('/login', login);                   // Step 3: Login (user must be verified)
router.post('/resend-otp', resendOtp);          // Resend OTP (signup/forgot/settings)
router.post('/forgot-password', forgetPassword);// Forgot password (sends OTP if user exists)
router.post('/reset-password-forgot', resetPasswordForgot); // Forgot password reset (email+otp+newPassword)

// === PROTECTED ROUTES (AUTH REQUIRED) ===
router.get('/', authMiddleware, getAllUsers);      // Get all users (dropdown, admin)
router.patch('/update-profile', authMiddleware, updateUser); // Update name/email

router.post('/send-otp-reset-password', authMiddleware, sendOtpForResetPassword); // Profile: send OTP for password change
router.post('/reset-password-with-otp', authMiddleware, resetPasswordWithOtp);    // Profile: reset password with OTP (current+new)
router.post('/reset-password', authMiddleware, resetPassword);                    // Profile: reset password simple (without OTP, legacy/optional)

module.exports = router;
