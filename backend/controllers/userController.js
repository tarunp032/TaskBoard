const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

// Helper: Generate 6-digit OTP as string
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 1. Signup - creates unverified user, sends OTP email
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Input validation (basic)
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      otp,
      otpExpiry,
    });

    await sendEmail({
      to: email,
      subject: "Verify your email - OTP",
      text: `Your profile was created successfully! OTP: ${otp}. OTP will expire in 2 minutes. Please verify to continue.`,
    });

    res.status(201).json({
      success: true,
      message: "Signup successful! OTP sent to your email. Please verify.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Login - only for verified users
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!user.isVerified) {
      return res.status(401).json({ message: "Email not verified. Please verify OTP sent to your email." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Get all users (for dropdown)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('name email');
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Forget password - accept email, respond generically
exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: true, message: 'If that email exists, reset instructions sent' });
    }
    
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail({
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    });

    res.json({ success: true, message: 'If that email exists, reset instructions sent' });
  } catch (error) {
    console.error("ForgotPassword error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 5. Reset password (user must be logged in)
exports.resetPassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: 'Password reset success' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. Update user profile (name/email)
exports.updateUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email } = req.body;

    const updateObj = {};
    if (name) updateObj.name = name;
    if (email) updateObj.email = email;

    const user = await User.findByIdAndUpdate(userId, updateObj, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ success: true, message: 'Profile updated', data: { name: user.name, email: user.email } });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

// 7. OTP verification
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required." });
  }
  const user = await User.findOne({ email, otp });
  if (!user) {
    return res.status(400).json({ message: "Invalid OTP or email." });
  }
  if (!user.otpExpiry || user.otpExpiry < new Date()) {
    return res.status(400).json({ message: "OTP expired. Please request a new one." });
  }
  // Always mark as verified, clear OTP
  user.isVerified = true;
  user.otp = null;
  user.otpExpiry = null;
  await user.save();
  res.json({ success: true, message: "Email verified! You can now login." });
};


// 8. Resend OTP
exports.resendOtp = async (req, res) => {
  console.log("resendOtp req.body:", req.body); // For debugging
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + 2 * 60 * 1000);
  await user.save();
  await sendEmail({
    to: user.email,
    subject: "Your New OTP Code",
    text: `Your new OTP is ${otp}. It expires in 2 minutes.`,
  });
  res.json({ success: true, message: 'OTP resent to email' });
};

//9. reset-password-forgot
exports.resetPasswordForgot = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword)
      return res.status(400).json({ message: "Email, OTP, and new password are required" });

    if (newPassword.length < 6)
      return res.status(400).json({ message: "New password must be at least 6 characters" });

    // Search user by email and otp (not resetOtp)
    const user = await User.findOne({ email, otp });
    if (!user)
      return res.status(400).json({ message: "Invalid email or OTP" });

    if (!user.otpExpiry || user.otpExpiry < new Date())
      return res.status(400).json({ message: "OTP expired. Please request a new one." });

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
