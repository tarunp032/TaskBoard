import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { formatDate, isOverdue } from "../utils/dateHelpers";
import api from "../utils/api";
import SubTaskList from "./SubTaskList";
import SubTaskModal from "./SubTaskModal";

const TaskCard = ({ task, onStatusToggle, onEdit, onDelete, isInbox, onParentRefresh }) => {
  const overdue = isOverdue(task.deadline, task.status);
  const [subTasks, setSubTasks] = useState([]);
  const [showSubModal, setShowSubModal] = useState(false);

  // Fetch subtasks only, no global loader!
  const fetchSubTasks = async () => {
    try {
      const res = await api.get(`/subtask/${task._id}`);
      setSubTasks(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch subtasks", error);
    }
  };

  useEffect(() => {
    fetchSubTasks();
  }, [task._id]);

  // Local subtasks update AND call parent refresh for main status update
  const handleSubTaskChanged = async () => {
    await fetchSubTasks();
    if (typeof onParentRefresh === "function") {
      onParentRefresh(false); // Pass false to avoid loader blink
    }
  };

  const handleSubTaskAdded = async () => {
    await fetchSubTasks();
    if (typeof onParentRefresh === "function") {
      onParentRefresh(false);
    }
    setShowSubModal(false);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -3 }}
      transition={{ type: "spring", stiffness: 200 }}
      className={`relative rounded-2xl p-5 mb-6 border backdrop-blur-md shadow-xl transition-all duration-300 ${
        overdue
          ? "border-red-400 bg-gradient-to-br from-red-50/60 via-white/40 to-red-100/40"
          : "border-gray-200/40 bg-gradient-to-br from-white/60 via-blue-50/40 to-white/30"
      }`}
    >
      {/* Task Main Info */}
      <div className="relative z-10">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {task.taskname}
        </h3>
        {/* Show Created Date */}
        <p className="text-xs text-gray-500 mb-2">
          Created: {task.createdAt ? new Date(task.createdAt).toLocaleString() : "N/A"}
        </p>
        <div className="text-sm text-gray-600 mb-4 space-y-1">
          <p>
            <strong>From:</strong> {isInbox ? task.assignBy.name : task.assignTo.name}
          </p>
          <p>
            <strong>Deadline:</strong>{" "}
            <span className={overdue ? "text-red-600 font-medium" : "text-gray-700"}>
              {formatDate(task.deadline)}
            </span>
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span
              className={`font-medium ${
                task.status === "pending" ? "text-yellow-600" : "text-green-600"
              }`}
            >
              {task.status === "pending" ? "⏳ Pending" : "✅ Completed"}
            </span>
          </p>
        </div>
        {/* Buttons */}
        <div className="flex flex-wrap gap-3 mb-4">
          {isInbox ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onStatusToggle(task._id, task.status)}
              className={`px-4 py-2 rounded-lg font-semibold text-white shadow-md ${
                task.status === "pending"
                  ? "bg-gradient-to-r from-green-500 to-emerald-600"
                  : "bg-gradient-to-r from-gray-500 to-gray-700"
              }`}
            >
              {task.status === "pending" ? "Mark Complete ✅" : "Mark Pending 🔄"}
            </motion.button>
          ) : (
            <>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onEdit(task._id)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold shadow-md"
              >
                ✏️ Edit
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onDelete(task._id)}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg font-semibold shadow-md"
              >
                🗑 Delete
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSubModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold shadow-md"
              >
                ➕ Add Subtask
              </motion.button>
            </>
          )}
        </div>
        {/* Subtasks List */}
        <SubTaskList subTasks={subTasks} onUpdate={handleSubTaskChanged} />
      </div>
      {showSubModal && (
        <SubTaskModal taskId={task._id} onClose={() => setShowSubModal(false)} onSuccess={handleSubTaskAdded} />
      )}
    </motion.div>
  );
};

export default TaskCard;
