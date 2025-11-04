const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    taskname: {
      type: String,
      required: [true, "Task name is required"],
      trim: true,
      minlength: [3, "Task name must be at least 3 characters"],
    },
    assignBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "AssignBy is required"],
    },
    assignTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "AssignTo is required"],
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    deadline: {
      type: Date,
      required: [true, "Deadline is required"],
    },
    subTasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubTask",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
taskSchema.index({ assignBy: 1 });
taskSchema.index({ assignTo: 1 });
taskSchema.index({ deadline: 1 });

module.exports = mongoose.model("Task", taskSchema);
