import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Inbox,
  RefreshCw,
  Send,
  TrendingUp,
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
      <div className="loading-container-light">
        <div className="spinner-light"></div>
        <p className="loading-text-light">Loading Dashboard...</p>
      </div>
    );

  if (!stats)
    return (
      <div className="error-container-light">
        <AlertTriangle size={48} className="error-icon-light" />
        <p>Failed to load dashboard stats</p>
      </div>
    );

  return (
    <div className="dashboard-container-light">
      {/* Background orbs */}
      <div className="background-orbs-light">
        <div className="orb orb-primary-light"></div>
        <div className="orb orb-secondary-light"></div>
        <div className="orb orb-tertiary-light"></div>
      </div>

      <div className="dashboard-content-light">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="dashboard-header-light"
        >
          <h1 className="dashboard-title-light">
            Welcome back,{" "}
            <span className="user-name-gradient-light">
              {user?.name || "User"}
            </span>
            <motion.span
              animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
              transition={{ duration: 1.5, delay: 0.5 }}
              style={{ display: "inline-block" }}
            >
              👋
            </motion.span>
          </h1>
          <p className="dashboard-subtitle-light">
            Here's your productivity overview at a glance
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="stats-grid-light">
          {/* Tasks TO Me Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="stats-card-light card-blue-light"
          >
            <div className="stats-card-header-light">
              <div className="icon-wrapper icon-blue-light">
                <Inbox size={28} />
              </div>
              <h2 className="stats-card-title-light">Tasks TO Me</h2>
            </div>

            <div className="stats-values-grid-light">
              <div className="stat-item-light">
                <div className="stat-label-light">
                  <TrendingUp size={18} />
                  Total
                </div>
                <div className="stat-value-light stat-total-light">
                  {stats.tasksToMe.total}
                </div>
              </div>

              <div className="stat-item-light">
                <div className="stat-label-light">
                  <Clock size={18} />
                  Pending
                </div>
                <div className="stat-value-light stat-pending-light">
                  {stats.tasksToMe.pending}
                </div>
              </div>

              <div className="stat-item-light">
                <div className="stat-label-light">
                  <CheckCircle size={18} />
                  Completed
                </div>
                <div className="stat-value-light stat-completed-light">
                  {stats.tasksToMe.completed}
                </div>
              </div>

              <div className="stat-item-light">
                <div className="stat-label-light">
                  <AlertTriangle size={18} />
                  Overdue
                </div>
                <div className="stat-value-light stat-overdue-light">
                  {stats.tasksToMe.overdue}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tasks BY Me Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="stats-card-light card-green-light"
          >
            <div className="stats-card-header-light">
              <div className="icon-wrapper icon-green-light">
                <Send size={28} />
              </div>
              <h2 className="stats-card-title-light">Tasks BY Me</h2>
            </div>

            <div className="stats-values-grid-light">
              <div className="stat-item-light">
                <div className="stat-label-light">
                  <TrendingUp size={18} />
                  Total
                </div>
                <div className="stat-value-light stat-total-light">
                  {stats.tasksByMe.total}
                </div>
              </div>

              <div className="stat-item-light">
                <div className="stat-label-light">
                  <Clock size={18} />
                  Pending
                </div>
                <div className="stat-value-light stat-pending-light">
                  {stats.tasksByMe.pending}
                </div>
              </div>

              <div className="stat-item-light">
                <div className="stat-label-light">
                  <CheckCircle size={18} />
                  Completed
                </div>
                <div className="stat-value-light stat-completed-light">
                  {stats.tasksByMe.completed}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Refresh Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="refresh-container-light"
        >
          <button onClick={fetchStats} className="refresh-btn-light">
            <RefreshCw size={20} />
            Refresh Dashboard
          </button>
        </motion.div>
      </div>

      <style>{`
        .dashboard-container-light {
          min-height: 100vh;
          background: #fff;
          position: relative;
          overflow-x: hidden;
          padding: 60px 32px;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        }

        /* Background orbs */
        .background-orbs-light {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: visible;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          opacity: 0.15;
          animation: float 20s ease-in-out infinite;
        }
        .orb-primary-light {
          width: 480px;
          height: 480px;
          background: #c4b5fd;
          top: -120px;
          left: -100px;
        }
        .orb-secondary-light {
          width: 400px;
          height: 400px;
          background: #7dd3fc;
          bottom: -120px;
          right: -120px;
          animation-delay: -6s;
        }
        .orb-tertiary-light {
          width: 440px;
          height: 440px;
          background: #fbb6ce;
          top: 50%;
          right: -150px;
          animation-delay: -11s;
        }
        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0);
          }
          33% {
            transform: translate(30px, -50px);
          }
          66% {
            transform: translate(-20px, 40px);
          }
        }

        .dashboard-content-light {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-header-light {
          text-align: center;
          margin-bottom: 64px;
        }

        .dashboard-title-light {
          font-size: 46px;
          font-weight: 900;
          color: #222;
          margin: 0 0 14px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .user-name-gradient-light {
          background: linear-gradient(135deg, #7b2ff7, #f107a3);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 900;
        }

        .dashboard-subtitle-light {
          font-size: 18px;
          color: #555;
          margin: 0;
          font-weight: 600;
        }

        .stats-grid-light {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(460px, 1fr));
          gap: 36px;
          margin-bottom: 52px;
        }

        .stats-card-light {
          background: #fff;
          border-radius: 30px;
          padding: 40px;
          box-shadow: 0 10px 40px rgba(123, 47, 247, 0.16);
          transition: all 0.4s ease;
          position: relative;
        }
        .stats-card-light:hover {
          box-shadow: 0 18px 58px rgba(123, 47, 247, 0.3);
          transform: translateY(-10px);
        }
        .card-blue-light {
          border: 1.5px solid #a78bfa;
        }
        .card-green-light {
          border: 1.5px solid #85e3c7;
        }

        .stats-card-header-light {
          display: flex;
          align-items: center;
          gap: 18px;
          margin-bottom: 34px;
        }

        .icon-wrapper {
          width: 70px;
          height: 70px;
          border-radius: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.1);
        }
        .icon-blue-light {
          background: linear-gradient(135deg, #7b2ff7, #a4508b);
        }
        .icon-green-light {
          background: linear-gradient(135deg, #14b8a6, #0f766e);
        }

        .stats-card-title-light {
          font-size: 28px;
          color: #222;
          font-weight: 900;
          margin: 0;
        }

        .stats-values-grid-light {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .stat-item-light {
          background: #f9f7ff;
          border-radius: 18px;
          padding: 24px 30px;
          box-shadow: 0 10px 28px rgba(123, 47, 247, 0.09);
          transition: all 0.3s ease;
          cursor: default;
        }
        .stat-item-light:hover {
          box-shadow: 0 14px 32px rgba(123, 47, 247, 0.15);
          transform: translateY(-3px);
        }

        .stat-label-light {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #7a7a8c;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 14px;
          user-select: none;
        }

        .stat-value-light {
          font-size: 38px;
          font-weight: 900;
          line-height: 1;
          color: #222;
        }

        .stat-total-light {
          color: #4a4a4a;
        }

        .stat-pending-light {
          color: #fbbf24;
        }

        .stat-completed-light {
          color: #34d399;
        }

        .stat-overdue-light {
          color: #f87171;
        }

        .refresh-container-light {
          text-align: center;
        }

        .refresh-btn-light {
          padding: 16px 42px;
          background: linear-gradient(135deg, #7b2ff7, #f107a3);
          border: none;
          border-radius: 20px;
          color: white;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 18px 48px rgba(241, 7, 163, 0.5);
          transition: all 0.4s ease;
          user-select: none;
        }
        .refresh-btn-light:hover {
          box-shadow: 0 22px 56px rgba(241, 7, 163, 0.7);
          transform: translateY(-4px);
        }
        .refresh-btn-light svg {
          animation: rotate 3s linear infinite;
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Loading */
        .loading-container-light {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 28px;
          background: #fff;
          color: #555;
          font-weight: 600;
          font-size: 20px;
          user-select: none;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        }
        .spinner-light {
          width: 64px;
          height: 64px;
          border: 5px solid #e0d7ff;
          border-top-color: #7b2ff7;
          border-radius: 50%;
          animation: spin 1.3s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Error */
        .error-container-light {
          min-height: 100vh;
          background: #ffebee;
          color: #b71c1c;
          font-weight: 700;
          font-size: 22px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 20px;
          user-select: none;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        }
        .error-icon-light {
          color: #b71c1c;
          filter: drop-shadow(0 0 6px rgba(183, 28, 28, 0.45));
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .stats-grid-light {
            grid-template-columns: 1fr;
          }
          .dashboard-title-light {
            font-size: 36px;
          }
          .stats-card-light {
            padding: 30px;
          }
          .stats-values-grid-light {
            grid-template-columns: 1fr;
          }
          .stat-value-light {
            font-size: 32px;
          }
          .icon-wrapper {
            width: 56px;
            height: 56px;
          }
        }

        @media (max-width: 520px) {
          .dashboard-container-light {
            padding: 40px 16px;
          }
          .stats-card-light {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;