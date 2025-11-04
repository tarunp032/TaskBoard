const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 1. Signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword 
    });
    
    // Generate token
    const token = jwt.sign({ _id: user._id }, "process.env.JWT_SECRET", { 
      expiresIn: '7d' 
    });
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token
      },
      
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign({ _id: user._id }, "process.env.JWT_SECRET", { 
      expiresIn: '7d' 
    });
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token
      },
      
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Get All Users (for dropdown)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('name email');
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// FORGET PASSWORD - ask for email, respond with message, not password
exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    // If user exists, "pretend" to send reset
    const user = await User.findOne({ email });
    if (!user) {
      // Never reveal user existence!
      return res.json({ success: true, message: 'If that email exists, reset instructions sent' });
    }
    // In real app: send email here!
    res.json({ success: true, message: 'If that email exists, reset instructions sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RESET PASSWORD (must be logged in)
exports.resetPassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old and new password required.' });
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

// UPDATE USER PROFILE (name/email/update)
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
    // duplicate email
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};