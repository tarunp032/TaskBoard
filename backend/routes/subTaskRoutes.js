  const express = require('express');
  const router = express.Router();
  const authMiddleware = require('../middleware/authMiddleware');
  const {
    createSubTask,
    getSubTasks,
    updateSubTask,
    updateSubTaskStatus,
    deleteSubTask
  } = require('../controllers/subTaskController');

  // Create sub-task
  router.post('/:taskId', authMiddleware, createSubTask);

  // Get all sub-tasks for a task
  router.get('/:taskId', authMiddleware, getSubTasks);

  // Update sub-task (title, deadline, status)
  router.patch('/edit/:subTaskId', authMiddleware, updateSubTask);

  // Update only status (for assignTo user)
  router.patch('/status/:subTaskId', authMiddleware, updateSubTaskStatus);

  // Delete sub-task
  router.delete('/:subTaskId', authMiddleware, deleteSubTask);

  module.exports = router;
