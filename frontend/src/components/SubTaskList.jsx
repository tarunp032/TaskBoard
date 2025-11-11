import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";

// Edit Subtask Modal Component
const EditSubTaskModal = ({ subTask, onClose, onUpdated }) => {
  const [title, setTitle] = useState(subTask.title);
  const [deadline, setDeadline] = useState(subTask.deadline?.substr(0,10) || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title required");
      return;
    }
    if (!deadline) {
      setError("Deadline required");
      return;
    }
    try {
      setLoading(true);
      await api.patch(`/subtask/edit/${subTask._id}`, { title, deadline });
      onUpdated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white/10 border border-white/20 rounded-2xl p-6 text-white shadow-2xl w-[380px]"
        >
          <h3 className="text-xl font-bold mb-3 text-center text-blue-300">Edit Subtask</h3>
          {error && <p className="text-red-400 mb-2 text-center">{error}</p>}
          <form onSubmit={handleUpdate} className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 py-2 rounded-xl font-semibold shadow-md"
              >
                {loading ? "Updating..." : "Update"}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={onClose}
                className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 py-2 rounded-xl font-semibold shadow-md"
              >
                Cancel
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const SubTaskList = ({ subTasks, onUpdate }) => {
  const [edit, setEdit] = useState(null);

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/subtask/status/${id}`, {
        status: currentStatus === "pending" ? "completed" : "pending",
      });
      await onUpdate();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to update subtask (check backend logs for details)"
      );
    }
  };

  const deleteSubTask = async (id) => {
    if (!window.confirm("Delete this subtask?")) return;
    try {
      await api.delete(`/subtask/${id}`);
      await onUpdate();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete subtask (check backend logs for details)"
      );
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "No deadline";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCreated = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  if (!subTasks.length) {
    return <p className="text-sm text-gray-500">No subtasks yet.</p>;
  }

  return (
    <div className="mt-3 border-t border-gray-200 pt-3">
      {edit && (
        <EditSubTaskModal
          subTask={edit}
          onClose={() => setEdit(null)}
          onUpdated={onUpdate}
        />
      )}
      <h4 className="font-semibold text-gray-700 mb-2">Subtasks:</h4>
      <ul className="space-y-2">
        {subTasks.map((sub) => (
          <li
            key={sub._id}
            className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white/30 px-3 py-2 rounded-xl shadow-sm text-gray-800"
          >
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
              <span className="text-xs text-gray-500">
                Deadline: {formatDate(sub.deadline)}
              </span>
              <span className="text-xs text-gray-500 font-light">
                Created: {formatCreated(sub.createdAt)}
              </span>
            </div>
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
                onClick={() => setEdit(sub)}
                className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
              >
                Edit
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
