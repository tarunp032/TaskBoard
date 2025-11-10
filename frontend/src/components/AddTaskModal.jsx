import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";

const AddTaskModal = ({ onClose, onSuccess }) => {
  const [taskname, setTaskname] = useState("");
  const [assignTo, setAssignTo] = useState("");
  const [deadline, setDeadline] = useState("");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await api.get("/user");
      setUsers(response.data.data || []);
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!taskname || !assignTo || !deadline) {
      setError("All fields are required");
      return;
    }

    try {
      await api.post("/task", { taskname, assignTo, deadline });
      alert("Task created successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to create task";
      setError(message);
      alert(message);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-gradient-to-br from-blue-900/60 via-black/70 to-purple-900/60 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ y: 60, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl p-8 w-[420px] relative text-white"
        >
          {/* Header */}
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-pink-400 via-purple-300 to-blue-400 text-transparent bg-clip-text">
            Add New Task
          </h2>

          {error && (
            <p className="text-red-400 font-semibold mb-4 text-center bg-red-950/30 rounded-lg py-2">
              {error}
            </p>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Task Name */}
            <div>
              <label className="block text-sm font-semibold mb-2 tracking-wide text-gray-200">
                Task Name
              </label>
              <input
                type="text"
                value={taskname}
                onChange={(e) => setTaskname(e.target.value)}
                placeholder="Enter task name"
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300"
              />
            </div>

            {/* Assign To */}
            <div>
              <label className="block text-sm font-semibold mb-2 tracking-wide text-gray-200">
                Assign To
              </label>
              {loadingUsers ? (
                <p className="text-gray-400 italic">Loading users...</p>
              ) : (
                <select
                  value={assignTo}
                  onChange={(e) => setAssignTo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 text-white border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300"
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option
                      key={user._id}
                      value={user._id}
                      className="text-gray-900"
                    >
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-semibold mb-2 tracking-wide text-gray-200">
                Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 text-white border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-500 to-teal-400 text-white py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-teal-500/40 transition-all duration-300"
              >
                Create Task
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={onClose}
                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-700 text-white py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-gray-500/40 transition-all duration-300"
              >
                Cancel
              </motion.button>
            </div>
          </form>

          {/* Decorative Glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-30 blur-3xl rounded-2xl -z-10"></div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddTaskModal;