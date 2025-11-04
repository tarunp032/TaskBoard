const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasksToMe,
  getTasksByMe,
  updateTaskStatus,
  updateTask,
  deleteTask,
  getDashboardStats
} = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');


// Create task
router.post('/', authMiddleware, createTask);

// Get tasks assigned TO me
router.get('/assigned-to-me', authMiddleware, getTasksToMe);

// Get tasks assigned BY me
router.get('/assigned-by-me', authMiddleware, getTasksByMe);

// Get dashboard statistics
router.get('/dashboard-stats', authMiddleware, getDashboardStats);

// Update task status (toggle pending/completed)
router.patch('/:taskId/status', authMiddleware, updateTaskStatus);

// Update task (edit deadline/status)
router.patch('/:taskId', authMiddleware, updateTask);

// Delete task
router.delete('/:taskId', authMiddleware, deleteTask);

module.exports = router;
