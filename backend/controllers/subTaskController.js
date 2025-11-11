const Task = require('../models/taskModel');
const SubTask = require('../models/subTaskModel');
const sendEmail = require('../utils/sendEmail');

// 1. Create Sub-task with email notification
exports.createSubTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, deadline } = req.body;
    const userId = req.user._id;

    // Find parent task
    const task = await Task.findById(taskId).populate('assignTo', 'name email');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Only assignBy can add sub-tasks
    if (task.assignBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only add sub-tasks to your own tasks' });
    }

    // Create sub-task (default status: "pending")
    const subTask = await SubTask.create({ task: taskId, title, deadline });

    // Push to parent task
    task.subTasks.push(subTask._id);

    // If parent task was completed, reset to pending
    if (task.status === 'completed') {
      task.status = 'pending';
    }
    await task.save();

    // Send email notification about new sub-task
    await sendEmail({
      to: task.assignTo.email,
      subject: `New Sub-task Added to Task "${task.taskname}"`,
      text: `Hello ${task.assignTo.name},\n\nA new sub-task has been added to your task "${task.taskname}".\n\nSub-task: ${title}\nDeadline: ${deadline}\n\nPlease check your dashboard to view details.`,
    });

    res.status(201).json({
      success: true,
      message: 'Sub-task created successfully',
      data: subTask,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Get all sub-tasks for a task 
exports.getSubTasks = async (req, res) => {
  try {
    const { taskId } = req.params;
    const subTasks = await SubTask.find({ task: taskId }).sort({ createdAt: 1 });
    res.json({
      success: true,
      data: subTasks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Update Sub-task with email notification
exports.updateSubTask = async (req, res) => {
  try {
    const { subTaskId } = req.params;
    const { title, deadline, status } = req.body;
    const userId = req.user._id;

    const subTask = await SubTask.findById(subTaskId)
  .populate({
    path: 'task',
    populate: { path: 'assignTo', select: 'name email' }
  });
    if (!subTask) return res.status(404).json({ message: 'Sub-task not found' });

    // Only assignBy of parent task can edit
    if (subTask.task.assignBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this sub-task' });
    }

    if (title) subTask.title = title;
    if (deadline) subTask.deadline = deadline;
    if (status) subTask.status = status;

    await subTask.save();

    // Email notification on sub-task update
    await sendEmail({
      to: subTask.task.assignTo.email,
      subject: `Sub-task Updated in Task "${subTask.task.taskname}"`,
      text: `Hello ${subTask.task.assignTo.name},\n\nA sub-task in your task "${subTask.task.taskname}" has been updated.\n\nSub-task: ${subTask.title}\nDeadline: ${subTask.deadline}\nStatus: ${subTask.status.toUpperCase()}\n\nPlease check your dashboard for details.`,
    });

    res.json({
      success: true,
      message: 'Sub-task updated successfully',
      data: subTask,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Update sub-task status with email notification 
exports.updateSubTaskStatus = async (req, res) => {
  try {
    const { subTaskId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    // Nested populate: task + assignTo
    const subTask = await SubTask.findById(subTaskId)
      .populate({
        path: 'task',
        populate: { path: 'assignTo', select: 'name email' },
      });

    if (!subTask) return res.status(404).json({ message: 'Sub-task not found' });

    // Allow assignBy or assignTo to update status
    const allowed = [subTask.task.assignTo._id.toString(), subTask.task.assignBy.toString()].includes(userId.toString());
    if (!allowed) return res.status(403).json({ message: 'Not authorized to change this sub-task status' });

    subTask.status = status;
    await subTask.save();

    // Check all sub-tasks to determine parent status
    const allSubTasks = await SubTask.find({ task: subTask.task._id });
    const allCompleted = allSubTasks.length > 0 && allSubTasks.every(st => st.status === 'completed');

    if (allCompleted) {
      subTask.task.status = 'completed';
      await subTask.task.save();
    } else if (subTask.task.status === 'completed') {
      subTask.task.status = 'pending';
      await subTask.task.save();
    }

    // Send email about subtask status change
    await sendEmail({
      to: subTask.task.assignTo.email,
      subject: `Sub-task Status Updated in Task "${subTask.task.taskname}"`,
      text: `Hello ${subTask.task.assignTo.name},\n\nThe status of a sub-task in your task "${subTask.task.taskname}" has been updated to "${status.toUpperCase()}".\n\nPlease check your dashboard for updated information.`,
    });

    res.json({
      success: true,
      message: 'Sub-task status updated successfully',
      data: subTask,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 5. Delete sub-task 
exports.deleteSubTask = async (req, res) => {
  try {
    const { subTaskId } = req.params;
    const userId = req.user._id;

    const subTask = await SubTask.findById(subTaskId).populate('task');
    if (!subTask) return res.status(404).json({ message: 'Sub-task not found' });

    if (subTask.task.assignBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this sub-task' });
    }

    await SubTask.findByIdAndDelete(subTaskId);

    await Task.findByIdAndUpdate(subTask.task._id, { $pull: { subTasks: subTaskId } });

    res.json({
      success: true,
      message: 'Sub-task deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
