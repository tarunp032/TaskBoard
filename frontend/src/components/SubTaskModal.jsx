import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";

const SubTaskModal = ({ taskId, onClose, onSuccess }) => {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Subtask title is required");
      return;
    }
    if (!deadline) {
      setError("Subtask deadline is required");
      return;
    }

    try {
      setLoading(true);
      // ✅ Send both title & deadline to backend
      await api.post(`/subtask/${taskId}`, { title, deadline });
      onSuccess(); // refresh parent task list
      onClose();   // close modal after success
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create subtask");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white/10 border border-white/20 rounded-2xl p-6 text-white shadow-2xl w-[380px]"
        >
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-300">
            Add Subtask
          </h2>

          {error && <p className="text-red-400 mb-3 text-center">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Enter subtask title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:ring-2 focus:ring-blue-500 outline-none"
            />

            {/* ✅ New Deadline Input */}
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 py-2 rounded-xl font-semibold shadow-md"
              >
                {loading ? "Adding..." : "Add Subtask"}
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

export default SubTaskModal;
