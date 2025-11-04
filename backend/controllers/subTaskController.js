const Task = require('../models/taskModel');
const SubTask = require('../models/subTaskModel');

// Create Sub-task
exports.createSubTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, deadline } = req.body;
    const userId = req.user._id;

    // Find parent task
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Only assignBy can add sub-tasks
    if (task.assignBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only add sub-tasks to your own tasks' });
    }

    // Create sub-task (by default status: "pending")
    const subTask = await SubTask.create({ task: taskId, title, deadline });

    // Push to parent task
    task.subTasks.push(subTask._id);

    // 👉 If parent was completed, set it to pending (since new subtask needs completion)
    if (task.status === 'completed') {
      task.status = 'pending';
    }
    await task.save();

    res.status(201).json({
      success: true,
      message: 'Sub-task created successfully',
      data: subTask
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get all sub-tasks for a specific task
exports.getSubTasks = async (req, res) => {
  try {
    const { taskId } = req.params;

    const subTasks = await SubTask.find({ task: taskId }).sort({ createdAt: 1 });

    res.json({
      success: true,
      data: subTasks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update sub-task (title, deadline, status)
exports.updateSubTask = async (req, res) => {
  try {
    const { subTaskId } = req.params;
    const { title, deadline, status } = req.body;
    const userId = req.user._id;

    const subTask = await SubTask.findById(subTaskId).populate('task');
    if (!subTask) return res.status(404).json({ message: 'Sub-task not found' });

    // Only assignBy of parent task can edit
    if (subTask.task.assignBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this sub-task' });
    }

    if (title) subTask.title = title;
    if (deadline) subTask.deadline = deadline;
    if (status) subTask.status = status;

    await subTask.save();

    res.json({
      success: true,
      message: 'Sub-task updated successfully',
      data: subTask
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Sub-task status by assignTo user (auto-complete task if all done)
exports.updateSubTaskStatus = async (req, res) => {
  try {
    const { subTaskId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    const subTask = await SubTask.findById(subTaskId).populate('task');
    if (!subTask) return res.status(404).json({ message: 'Sub-task not found' });

    // ✅ Allow assignBy or assignTo both to update
    const isAllowed =
      subTask.task.assignTo.toString() === userId.toString() ||
      subTask.task.assignBy.toString() === userId.toString();

    if (!isAllowed)
      return res.status(403).json({ message: 'Not authorized to change this sub-task status' });

    // ✅ Update subtask status
    subTask.status = status;
    await subTask.save();

    // ✅ Check all sub-tasks of this task
    const allSubTasks = await SubTask.find({ task: subTask.task._id });

    const allCompleted = allSubTasks.length > 0 && allSubTasks.every(st => st.status === 'completed');

    if (allCompleted) {
      subTask.task.status = 'completed';
      await subTask.task.save();
    } else {
      // If any subtask pending, mark task pending again
      if (subTask.task.status === 'completed') {
        subTask.task.status = 'pending';
        await subTask.task.save();
      }
    }

    res.json({
      success: true,
      message: 'Sub-task status updated successfully',
      data: subTask
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Delete sub-task
exports.deleteSubTask = async (req, res) => {
  try {
    const { subTaskId } = req.params;
    const userId = req.user._id;

    const subTask = await SubTask.findById(subTaskId).populate('task');
    if (!subTask) return res.status(404).json({ message: 'Sub-task not found' });

    // Only assignBy can delete
    if (subTask.task.assignBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this sub-task' });
    }

    await SubTask.findByIdAndDelete(subTaskId);

    // Remove from parent task
    await Task.findByIdAndUpdate(subTask.task._id, { $pull: { subTasks: subTaskId } });

    res.json({
      success: true,
      message: 'Sub-task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
