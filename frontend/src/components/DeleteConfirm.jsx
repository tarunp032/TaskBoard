import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const DeleteConfirm = ({ onConfirm, onCancel }) => {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-gradient-to-br from-black/70 via-gray-900/70 to-red-900/60 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 40 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative bg-white/10 border border-white/20 backdrop-blur-2xl shadow-2xl rounded-2xl p-8 w-[360px] text-center text-white"
        >
          {/* Header */}
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-red-400 via-pink-400 to-orange-400 text-transparent bg-clip-text">
            Delete Task?
          </h2>

          {/* Warning Message */}
          <p className="text-gray-300 mb-6 leading-relaxed">
            Are you sure you want to delete this task? <br />
            <span className="text-red-400 font-semibold">This action cannot be undone.</span>
          </p>

          {/* Buttons */}
          <div className="flex gap-4 mt-4">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onConfirm}
              className="flex-1 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-red-500/40 text-white transition-all duration-300"
            >
              Delete
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCancel}
              className="flex-1 bg-gradient-to-r from-gray-500 to-gray-700 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-gray-400/40 text-white transition-all duration-300"
            >
              Cancel
            </motion.button>
          </div>

          {/* Decorative Glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 opacity-30 blur-3xl rounded-2xl -z-10"></div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeleteConfirm;
