import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import { formatDateForInput } from "../utils/dateHelpers";

const EditTaskModal = ({ taskId, onClose, onSuccess }) => {
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
    try {
      const response = await api.get("/task/assigned-by-me");
      const task = response.data.data.find((t) => t._id === taskId);

      if (task) {
        setDeadline(formatDateForInput(task.deadline));
        setStatus(task.status);
      } else {
        setError("Task not found");
      }
    } catch (err) {
      setError("Failed to fetch task");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!deadline) {
      setError("Deadline is required");
      return;
    }

    try {
      await api.patch(`/task/${taskId}`, { deadline, status });
      alert("Task updated successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update task";
      setError(message);
      alert(message);
    }
  };

  if (loading)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 text-white text-lg font-semibold">
        Loading...
      </div>
    );

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-blue-900/70 to-indigo-900/70 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative bg-white/10 border border-white/20 backdrop-blur-2xl shadow-2xl rounded-2xl p-8 w-[420px] text-white"
        >
          {/* Title */}
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 via-teal-300 to-purple-400 text-transparent bg-clip-text">
            Edit Task
          </h2>

          {/* Error */}
          {error && (
            <p className="text-red-400 font-semibold mb-4 text-center bg-red-900/30 rounded-lg py-2">
              {error}
            </p>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Deadline */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-200 tracking-wide">
                Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300"
                required
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-200 tracking-wide">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 text-white border border-white/20 focus:border-teal-400 focus:ring-2 focus:ring-teal-500 outline-none transition-all duration-300"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-6">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-500 via-teal-400 to-green-400 text-white py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-blue-500/40 transition-all duration-300"
              >
                Update Task
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={onClose}
                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-700 text-white py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-gray-500/40 transition-all duration-300"
              >
                Cancel
              </motion.button>
            </div>
          </form>

          {/* Decorative Glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-teal-500 to-purple-500 opacity-30 blur-3xl rounded-2xl -z-10"></div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditTaskModal;