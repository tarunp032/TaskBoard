const Task = require('../models/taskModel');

// 1. Create Task- Self-assignment block
exports.createTask = async (req, res) => {
  try {
    const { taskname, assignTo, deadline } = req.body;
    const assignBy = req.user._id; // JWT se mila
    
    // Self-assignment check
    if (assignBy.toString() === assignTo) {
      return res.status(403).json({ 
        message: 'Cannot assign task to yourself' 
      });
    }
    
    // Create task
    const task = await Task.create({
      taskname,
      assignBy,
      assignTo,
      deadline,
      status: 'pending'
    });
    
    // Populate assignTo details
    await task.populate('assignTo', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Get Tasks Assigned TO Me getTasksToMe — Simple filter + populate
exports.getTasksToMe = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const userId = req.user._id;
    
    // Build filter
    const filter = { assignTo: userId };
    
    // Date range filter
    if (startDate || endDate) {
      filter.deadline = {};
      if (startDate) filter.deadline.$gte = new Date(startDate);
      if (endDate) filter.deadline.$lte = new Date(endDate);
    }
    
    // Status filter
    if (status) filter.status = status;
    
    // Fetch tasks
    const tasks = await Task.find(filter)
      .populate('assignBy', 'name email')
      .sort({ deadline: 1 }); // Ascending order
    
    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Get Tasks Assigned BY Me -etTasksByMe — Opposite filter
exports.getTasksByMe = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const userId = req.user._id;
    
    // Build filter
    const filter = { assignBy: userId };
    
    // Date range filter
    if (startDate || endDate) {
      filter.deadline = {};
      if (startDate) filter.deadline.$gte = new Date(startDate);
      if (endDate) filter.deadline.$lte = new Date(endDate);
    }
    
    // Status filter
    if (status) filter.status = status;
    
    // Fetch tasks
    const tasks = await Task.find(filter)
      .populate('assignTo', 'name email')
      .sort({ deadline: 1 });
    
    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Update Task Status (for Tasks TO Me page)
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;
    
    // Find task
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check ownership - Only assignTo can update status
    if (task.assignTo.toString() !== userId.toString()) {
      return res.status(403).json({ 
        message: 'You can only update tasks assigned to you' 
      });
    }
    
    // Update status
    task.status = status;
    await task.save();
    
    res.json({
      success: true,
      message: 'Status updated successfully',
      data: task
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Update Task (for Tasks BY Me page - edit deadline/status)
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { deadline, status } = req.body;
    const userId = req.user._id;
    
    // Find task
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check ownership - Only assignBy can edit
    if (task.assignBy.toString() !== userId.toString()) {
      return res.status(403).json({ 
        message: 'You can only edit tasks you assigned' 
      });
    }
    
    // Update allowed fields only
    if (deadline) task.deadline = deadline;
    if (status) task.status = status;
    
    await task.save();
    
    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. Delete Task (for Tasks BY Me page)
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;
    
    // Find task
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check ownership - Only assignBy can delete
    if (task.assignBy.toString() !== userId.toString()) {
      return res.status(403).json({ 
        message: 'You can only delete tasks you assigned' 
      });
    }
    
    // Delete task
    await Task.findByIdAndDelete(taskId);
    
    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 7. Get Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Tasks TO Me counts
    const tasksToMeTotal = await Task.countDocuments({ assignTo: userId });
    const tasksToMePending = await Task.countDocuments({ 
      assignTo: userId, 
      status: 'pending' 
    });
    const tasksToMeCompleted = await Task.countDocuments({ 
      assignTo: userId, 
      status: 'completed' 
    });
    const tasksToMeOverdue = await Task.countDocuments({
      assignTo: userId,
      status: 'pending',
      deadline: { $lt: today }
    });
    
    // Tasks BY Me counts
    const tasksByMeTotal = await Task.countDocuments({ assignBy: userId });
    const tasksByMePending = await Task.countDocuments({ 
      assignBy: userId, 
      status: 'pending' 
    });
    const tasksByMeCompleted = await Task.countDocuments({ 
      assignBy: userId, 
      status: 'completed' 
    });
    
    res.json({
      success: true,
      data: {
        tasksToMe: {
          total: tasksToMeTotal,
          pending: tasksToMePending,
          completed: tasksToMeCompleted,
          overdue: tasksToMeOverdue
        },
        tasksByMe: {
          total: tasksByMeTotal,
          pending: tasksByMePending,
          completed: tasksByMeCompleted
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
