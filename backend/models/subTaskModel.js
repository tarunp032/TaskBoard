const mongoose = require('mongoose');

const subTaskSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: [true, 'Parent task is required']
  },
  title: {
    type: String,
    required: [true, 'Sub-task title is required'],
    trim: true,
    minlength: [3, 'Sub-task title must be at least 3 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  deadline: {
    type: Date,
    required: [true, 'Sub-task deadline is required']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SubTask', subTaskSchema);
