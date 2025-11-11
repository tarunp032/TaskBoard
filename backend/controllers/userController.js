const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

// Helper: Generate 6-digit OTP as string
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 1. Signup - Step 1: new user, OTP email, not verified
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }
    const existingUser = await User.findOne({ email: email.trim() });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 2 * 60 * 1000); // 2 min
    await User.create({
      name,
      email: email.trim(),
      password: hashedPassword,
      isVerified: false,
      otp,
      otpExpiry,
    });
    await sendEmail({
      to: email.trim(),
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

// 2. Email OTP verify (signup/forgot/reset): "public"
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required." });
  }
  // Always trim both!
  const user = await User.findOne({ email: email.trim(), otp: otp.trim() });
  if (!user) {
    return res.status(400).json({ message: "Invalid OTP or email." });
  }
  if (!user.otpExpiry || user.otpExpiry < new Date()) {
    return res.status(400).json({ message: "OTP expired. Please request a new one." });
  }
  // For signup verification only, mark as verified
  if (!user.isVerified) {
    user.isVerified = true;
  }
  // Always clear OTP fields
  user.otp = null;
  user.otpExpiry = null;
  await user.save();
  res.json({ success: true, message: "OTP verified!" });
};

// 3. Login (only verified)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
    const user = await User.findOne({ email: email.trim() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.isVerified) {
      return res.status(401).json({
        message: "Email not verified. Please verify OTP sent to your email.",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({
      success: true,
      message: "Login successful",
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

// 4. Get all users (dropdown)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("name email");
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Resend OTP (for email, forgot, or password reset)
exports.resendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }
  const user = await User.findOne({ email: email.trim() });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const otp = generateOTP();
  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + 2 * 60 * 1000); // 2 min
  await user.save();
  await sendEmail({
    to: user.email,
    subject: "Your New OTP Code",
    text: `Your new OTP is ${otp}. It expires in 2 minutes.`,
  });
  res.json({ success: true, message: "OTP resent to email" });
};

// 6. Forget password (start): sends OTP if email exists (responds same always)
exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.trim() });
    // Always respond generic!
    if (!user) {
      return res.json({
        success: true,
        message: "If that email exists, reset instructions sent",
      });
    }
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();
    await sendEmail({
      to: email.trim(),
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    });
    res.json({
      success: true,
      message: "If that email exists, reset instructions sent",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 7. Reset password using OTP (forgot flow, not logged in)
// POST: { email, otp, newPassword }
exports.resetPasswordForgot = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }
    const user = await User.findOne({ email: email.trim(), otp: otp.trim() });
    if (!user) return res.status(400).json({ message: "Invalid email or OTP" });
    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    await sendEmail({
      to: user.email,
      subject: "Password Reset Successfully",
      text: `Hello ${user.name},\n\nYour password has been reset successfully using OTP verification. If you did not perform this action, please contact support immediately.`,
    });
    res.json({ success: true, message: "Password reset successfully and email sent." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 8. Send OTP for logged-in user's password reset (profile/settings)
exports.sendOtpForResetPassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();
    await sendEmail({
      to: user.email,
      subject: "OTP for Password Reset",
      text: `Your OTP for password reset is ${otp}. It expires in 10 minutes.`,
    });
    return res.json({ success: true, message: "OTP sent to your email for password reset" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 9. Reset password with OTP (logged in: profile)
exports.resetPasswordWithOtp = async (req, res) => {
  try {
    const userId = req.user._id;
    let { email, otp, oldPassword, newPassword } = req.body;
    if (!email || !otp || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, old password and new password are required." });
    }
    email = email.trim();
    otp = otp.trim();
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters." });
    }
    const user = await User.findOne({ _id: userId, email, otp });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or OTP." });
    }
    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect." });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    await sendEmail({
      to: user.email,
      subject: "Password Changed Successfully",
      text: `Hello ${user.name},\n\nYour password has been changed successfully. If you did not perform this action, please contact support immediately.`,
    });
    return res.json({ success: true, message: "Password reset successfully and email sent." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 10. Direct password reset for logged in (without OTP, fallback/optional)
exports.resetPassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old and new password are required." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters." });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.isVerified) {
      return res.status(401).json({
        message: "Email not verified. Reset password only allowed after verification.",
      });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    await sendEmail({
      to: user.email,
      subject: "Password Changed Successfully",
      text: `Hello ${user.name},\n\nYour password has been successfully changed. If you did not perform this action, please contact support immediately.`,
    });
    res.json({ success: true, message: "Password reset success and email sent." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 11. Update user profile (profile page, can change email/name)
exports.updateUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email } = req.body;
    const userBeforeUpdate = await User.findById(userId);
    if (!userBeforeUpdate) return res.status(404).json({ message: "User not found" });
    const updateObj = {};
    if (name) updateObj.name = name;
    if (email) updateObj.email = email;
    const user = await User.findByIdAndUpdate(userId, updateObj, {
      new: true,
      runValidators: true,
    });
    let changes = [];
    if (name && name !== userBeforeUpdate.name) changes.push("Name updated");
    if (email && email !== userBeforeUpdate.email) changes.push("Email updated");
    const changeMessage = changes.length > 0 ? changes.join(" and ") : "No changes made";
    await sendEmail({
      to: user.email,
      subject: "Profile Updated Successfully",
      text: `Hello ${user.name},\n\n${changeMessage} for your profile.\nIf you did not perform this update, please contact support immediately.`,
    });
    res.json({
      success: true,
      message: "Profile updated and email notification sent.",
      data: { name: user.name, email: user.email },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};
