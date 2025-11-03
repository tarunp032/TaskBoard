import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import {
  BarChart3,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertTriangle,
  UserCheck,
} from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get("/task/dashboard-stats");
      setStats(response.data.data);
    } catch (error) {
      alert("Failed to fetch stats: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-[60vh] text-lg text-gray-700">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-blue-600" size={30} />
          <span>Loading Dashboard...</span>
        </div>
      </div>
    );

  if (!stats)
    return (
      <div className="text-center mt-10 text-lg text-red-600">
        ❌ Failed to load stats
      </div>
    );

  const cardMotion = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, type: "spring", stiffness: 150 },
    }),
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-800">
          Welcome back,{" "}
          <span className="text-blue-600">{user?.name || "User"} 👋</span>
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Here’s your task summary at a glance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tasks To Me */}
        <motion.div
          custom={0}
          variants={cardMotion}
          initial="hidden"
          animate="visible"
          className="relative overflow-hidden rounded-2xl border border-blue-400/30 bg-gradient-to-br from-blue-50/70 via-white/50 to-indigo-50/40 backdrop-blur-md p-7 shadow-xl hover:shadow-blue-300/50 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-300/10 blur-3xl opacity-40 pointer-events-none" />
          <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-2">
            <BarChart3 /> Tasks TO Me
          </h2>

          <div className="space-y-4 text-gray-700 font-medium">
            <div className="flex justify-between text-lg">
              <span>Total:</span>
              <span className="font-bold text-gray-800">
                {stats.tasksToMe.total}
              </span>
            </div>

            <div className="flex justify-between text-lg">
              <span>Pending:</span>
              <span className="font-bold text-yellow-600 flex items-center gap-1">
                <Clock size={18} /> {stats.tasksToMe.pending}
              </span>
            </div>

            <div className="flex justify-between text-lg">
              <span>Completed:</span>
              <span className="font-bold text-green-600 flex items-center gap-1">
                <CheckCircle size={18} /> {stats.tasksToMe.completed}
              </span>
            </div>

            <div className="flex justify-between text-lg">
              <span>Overdue:</span>
              <span className="font-bold text-red-600 flex items-center gap-1">
                <AlertTriangle size={18} /> {stats.tasksToMe.overdue}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Tasks By Me */}
        <motion.div
          custom={1}
          variants={cardMotion}
          initial="hidden"
          animate="visible"
          className="relative overflow-hidden rounded-2xl border border-green-400/30 bg-gradient-to-br from-green-50/70 via-white/50 to-emerald-50/40 backdrop-blur-md p-7 shadow-xl hover:shadow-green-300/50 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-lime-300/10 blur-3xl opacity-40 pointer-events-none" />
          <h2 className="text-2xl font-bold text-green-700 mb-6 flex items-center gap-2">
            <UserCheck /> Tasks BY Me
          </h2>

          <div className="space-y-4 text-gray-700 font-medium">
            <div className="flex justify-between text-lg">
              <span>Total:</span>
              <span className="font-bold text-gray-800">
                {stats.tasksByMe.total}
              </span>
            </div>

            <div className="flex justify-between text-lg">
              <span>Pending:</span>
              <span className="font-bold text-yellow-600 flex items-center gap-1">
                <Clock size={18} /> {stats.tasksByMe.pending}
              </span>
            </div>

            <div className="flex justify-between text-lg">
              <span>Completed:</span>
              <span className="font-bold text-green-600 flex items-center gap-1">
                <CheckCircle size={18} /> {stats.tasksByMe.completed}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Refresh Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-12 text-center"
      >
        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-indigo-400/40 transition-all duration-300 hover:scale-105"
        >
          <RefreshCw size={20} /> Refresh Stats
        </button>
      </motion.div>
    </div>
  );
};

export default Dashboard;
