import React from "react";
import { motion } from "framer-motion";
import { formatDate, isOverdue } from "../utils/dateHelpers";

const TaskCard = ({ task, onStatusToggle, onEdit, onDelete, isInbox }) => {
  const overdue = isOverdue(task.deadline, task.status);

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -3 }}
      transition={{ type: "spring", stiffness: 200 }}
      className={`relative rounded-2xl p-5 mb-5 border backdrop-blur-md shadow-xl transition-all duration-300 
        ${
          overdue
            ? "border-red-400 bg-gradient-to-br from-red-50/60 via-white/40 to-red-100/40"
            : "border-gray-200/40 bg-gradient-to-br from-white/60 via-blue-50/40 to-white/30"
        }`}
    >
      {/* Decorative Gradient Border Glow */}
      <div
        className={`absolute inset-0 rounded-2xl pointer-events-none opacity-30 blur-xl transition-all duration-500 ${
          overdue
            ? "bg-gradient-to-r from-red-400 via-pink-400 to-orange-400"
            : "bg-gradient-to-r from-blue-400 via-teal-400 to-purple-400"
        }`}
      ></div>

      {/* Content Layer */}
      <div className="relative z-10">
        {/* Task Title */}
        <h3 className="text-xl font-semibold text-gray-800 mb-2 tracking-tight">
          {task.taskname}
        </h3>

        {/* Task Info */}
        <div className="text-sm text-gray-600 mb-4 space-y-1">
          <p>
            <strong className="text-gray-800">From:</strong>{" "}
            {isInbox ? task.assignBy.name : task.assignTo.name}
          </p>
          <p>
            <strong className="text-gray-800">Deadline:</strong>{" "}
            <span
              className={`${
                overdue ? "text-red-600 font-medium" : "text-gray-700"
              }`}
            >
              {formatDate(task.deadline)}
            </span>
          </p>
          <p>
            <strong className="text-gray-800">Status:</strong>{" "}
            <span
              className={`font-medium ${
                task.status === "pending"
                  ? "text-yellow-600"
                  : "text-green-600"
              }`}
            >
              {task.status === "pending" ? "⏳ Pending" : "✅ Completed"}
            </span>
          </p>
        </div>

        {/* Overdue Warning */}
        {overdue && (
          <div className="flex items-center gap-1 text-red-600 font-semibold mb-3 animate-pulse">
            ⚠️ <span>Overdue Task</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-wrap gap-3">
          {isInbox ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onStatusToggle(task._id, task.status)}
              className={`px-4 py-2 rounded-lg font-semibold text-white shadow-md transition-all duration-300
                ${
                  task.status === "pending"
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-green-500/40"
                    : "bg-gradient-to-r from-gray-500 to-gray-700 hover:shadow-gray-500/40"
                }`}
            >
              {task.status === "pending" ? "Mark Complete ✅" : "Mark Pending 🔄"}
            </motion.button>
          ) : (
            <>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onEdit(task._id)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold shadow-md hover:shadow-blue-500/40 transition-all duration-300"
              >
                ✏️ Edit
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onDelete(task._id)}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg font-semibold shadow-md hover:shadow-red-500/40 transition-all duration-300"
              >
                🗑 Delete
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;
