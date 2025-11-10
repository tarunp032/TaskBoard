import React from "react";
import { motion } from "framer-motion";
import api from "../utils/api";

const SubTaskList = ({ subTasks, onUpdate }) => {
  // Toggle subtask status
  const toggleStatus = async (id, status) => {
    try {
      await api.patch(`/subtask/status/${id}`, {
        status: status === "pending" ? "completed" : "pending",
      });
      await onUpdate(); // Refresh both subtasks and main tasks
    } catch (error) {
      alert("Failed to update subtask");
    }
  };

  // Delete subtask
  const deleteSubTask = async (id) => {
    if (!window.confirm("Delete this subtask?")) return;
    try {
      await api.delete(`/subtask/${id}`);
      await onUpdate(); // Refresh both subtasks and main tasks
    } catch (error) {
      alert("Failed to delete subtask");
    }
  };

  // Format deadline date (if available)
  const formatDate = (dateStr) => {
    if (!dateStr) return "No deadline";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Format created at date (if available)
  const formatCreated = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  if (!subTasks.length)
    return <p className="text-sm text-gray-500">No subtasks yet.</p>;

  return (
    <div className="mt-3 border-t border-gray-200 pt-3">
      <h4 className="font-semibold text-gray-700 mb-2">Subtasks:</h4>
      <ul className="space-y-2">
        {subTasks.map((sub) => (
          <li
            key={sub._id}
            className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white/30 px-3 py-2 rounded-xl shadow-sm text-gray-800"
          >
            {/* Subtask info */}
            <div className="flex flex-col">
              <span
                className={`text-sm font-medium ${
                  sub.status === "completed"
                    ? "line-through text-green-600"
                    : "text-gray-800"
                }`}
              >
                {sub.title}
              </span>
              {/* Deadline */}
              <span className="text-xs text-gray-500">
                Deadline: {formatDate(sub.deadline)}
              </span>
              {/* Created at */}
              <span className="text-xs text-gray-500 font-light">
                Created: {formatCreated(sub.createdAt)}
              </span>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 mt-2 sm:mt-0">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleStatus(sub._id, sub.status)}
                className={`px-3 py-1 text-sm rounded-lg text-white ${
                  sub.status === "pending"
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {sub.status === "pending" ? "Mark Done" : "Undo"}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => deleteSubTask(sub._id)}
                className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg"
              >
                Delete
              </motion.button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SubTaskList;