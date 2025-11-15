const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());

const allowedOrigins = [
  'https://taskboard-frontend-qyst.onrender.com',
  'http://localhost:5173'
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/user', require('./routes/userRoutes'));   // User routes
app.use('/api/task', require('./routes/taskRoutes'));   // Task routes
app.use('/api/subtask', require('./routes/subTaskRoutes')); // Sub-task routes added

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'TaskBoard API Server Running 🚀' });
});

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`⚡ Server running on port ${PORT}`));
