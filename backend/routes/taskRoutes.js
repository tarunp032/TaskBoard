const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasksToMe,
  getTasksByMe,
  updateTaskStatus,
  updateTask,
  deleteTask,
  getDashboardStats,
  reassignTask,
} = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createTask);

router.get('/assigned-to-me', authMiddleware, getTasksToMe);

router.get('/assigned-by-me', authMiddleware, getTasksByMe);

router.get('/dashboard-stats', authMiddleware, getDashboardStats);

router.patch('/:taskId/assign', authMiddleware, reassignTask);

router.patch('/:taskId/status', authMiddleware, updateTaskStatus);

router.patch('/:taskId', authMiddleware, updateTask);

router.delete('/:taskId', authMiddleware, deleteTask);

module.exports = router;
