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
