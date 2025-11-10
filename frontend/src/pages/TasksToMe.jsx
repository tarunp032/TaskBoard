import React, { useState, useEffect } from "react";
import api from "../utils/api";
import TaskCard from "../components/TaskCard";

const TasksToMe = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedUsers, setExpandedUsers] = useState({});

  const fetchTasks = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const response = await api.get("/task/assigned-to-me");
      setTasks(response.data.data);
    } catch (error) {
      alert("Failed to fetch tasks: " + error.message);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(true);
  }, []);

  const handleStatusToggle = async (taskId, currentStatus) => {
    const newStatus = currentStatus === "pending" ? "completed" : "pending";
    try {
      await api.patch(`/task/${taskId}/status`, { status: newStatus });
      alert("Status updated!");
      fetchTasks(false);
    } catch (error) {
      alert("Failed to update status: " + error.message);
    }
  };

  const groupedTasks = tasks.reduce((groups, task) => {
    if (filterStatus !== "all" && task.status !== filterStatus) return groups;
    const userId = task.assignBy._id;
    if (!groups[userId]) {
      groups[userId] = {
        user: task.assignBy,
        tasks: [],
      };
    }
    groups[userId].tasks.push(task);
    return groups;
  }, {});

  if (loading)
    return (
      <div className="tasks-to-me-loading-light">
        <div className="loading-spinner-light"></div>
        <p className="loading-text-light">Loading your tasks...</p>
      </div>
    );

  return (
    <div className="tasks-to-me-container-light">
      {/* Animated Background */}
      <div className="tasks-to-me-bg-light">
        <div className="gradient-orb-light orb-1-light"></div>
        <div className="gradient-orb-light orb-2-light"></div>
        <div className="gradient-orb-light orb-3-light"></div>
      </div>

      <div className="tasks-to-me-content-light">
        {/* Header */}
        <div className="tasks-to-me-header-light">
          <h1 className="tasks-to-me-title-light">
            <span className="title-icon-light">📥</span>
            Tasks <span className="title-highlight-light">TO Me</span>
          </h1>
          <p className="tasks-to-me-subtitle-light">
            Your inbox of assigned tasks
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="filter-container-light">
          {[
            { label: "All Tasks", value: "all", emoji: "📋" },
            { label: "Pending", value: "pending", emoji: "⏳" },
            { label: "Completed", value: "completed", emoji: "✅" },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setFilterStatus(filter.value)}
              className={`filter-btn-light ${
                filterStatus === filter.value ? "filter-btn-active-light" : ""
              }`}
            >
              <span className="filter-emoji-light">{filter.emoji}</span>
              {filter.label}
            </button>
          ))}
        </div>

        {/* Grouped Tasks List */}
        {Object.keys(groupedTasks).length === 0 ? (
          <div className="empty-state-light">
            <div className="empty-icon-light">📭</div>
            <h3 className="empty-title-light">No tasks found</h3>
            <p className="empty-text-light">
              Your inbox is empty. Time to relax! ✨
            </p>
          </div>
        ) : (
          <div className="groups-container-light">
            {Object.values(groupedTasks).map((group) => (
              <div key={group.user._id} className="group-card-light">
                <div className="group-header-light">
                  <div className="group-user-light">
                    <div className="user-avatar-light">
                      {group.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info-light">
                      <span className="user-name-light">{group.user.name}</span>
                      <span className="user-email-light">
                        {group.user.email}
                      </span>
                    </div>
                  </div>
                  <div className="task-count-light">
                    {group.tasks.length}{" "}
                    {group.tasks.length === 1 ? "task" : "tasks"}
                  </div>
                </div>

                <button
                  className="expand-btn-light"
                  onClick={() =>
                    setExpandedUsers((prev) => ({
                      ...prev,
                      [group.user._id]: !prev[group.user._id],
                    }))
                  }
                >
                  {expandedUsers[group.user._id]
                    ? "▲ Hide Tasks"
                    : "▼ Show Tasks"}
                </button>

                {expandedUsers[group.user._id] && (
                  <div className="tasks-list-light">
                    {group.tasks.map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        onStatusToggle={handleStatusToggle}
                        isInbox={true}
                        onParentRefresh={fetchTasks}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        <div className="refresh-container-light">
          <button
            onClick={() => fetchTasks(true)}
            className="refresh-btn-light"
          >
            <span className="refresh-icon-light">🔄</span>
            Refresh Tasks
          </button>
        </div>
      </div>

      <style>{`
        .tasks-to-me-container-light {
          min-height: 100vh;
          background: #fcfcfe;
          position: relative;
          overflow-x: hidden;
          padding: 60px 32px;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        }

        /* Background orbs */
        .tasks-to-me-bg-light {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: visible;
        }

        .gradient-orb-light {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          opacity: 0.15;
          animation: float 20s ease-in-out infinite;
        }
        .orb-1-light {
          width: 480px;
          height: 480px;
          background: #c4b5fd;
          top: -120px;
          left: -100px;
        }
        .orb-2-light {
          width: 400px;
          height: 400px;
          background: #7dd3fc;
          bottom: -120px;
          right: -120px;
          animation-delay: -6s;
        }
        .orb-3-light {
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

        /* Content */
        .tasks-to-me-content-light {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Header */
        .tasks-to-me-header-light {
          text-align: center;
          margin-bottom: 48px;
        }

        .tasks-to-me-title-light {
          font-size: 48px;
          font-weight: 900;
          color: #222;
          margin: 0 0 12px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .title-icon-light {
          font-size: 52px;
        }

        .title-highlight-light {
          background: linear-gradient(135deg, #7b2ff7, #f107a3);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .tasks-to-me-subtitle-light {
          font-size: 18px;
          color: #555;
          margin: 0;
          font-weight: 600;
        }

        /* Filter Buttons */
        .filter-container-light {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }

        .filter-btn-light {
          padding: 14px 28px;
          background: rgba(123, 47, 247, 0.1);
          border: 1.5px solid transparent;
          border-radius: 16px;
          color: rgba(123, 47, 247, 0.75);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 8px;
          user-select: none;
        }

        .filter-btn-light:hover {
          background: rgba(123, 47, 247, 0.15);
          border-color: #7b2ff7;
          color: #7b2ff7;
          box-shadow: 0 8px 24px rgba(123, 47, 247, 0.2);
          transform: translateY(-2px);
        }

        .filter-btn-active-light {
          background: linear-gradient(135deg, #7b2ff7, #f107a3);
          border-color: transparent;
          color: white;
          box-shadow: 0 4px 12px rgba(241, 7, 163, 0.4);
        }

        .filter-emoji-light {
          font-size: 18px;
        }

        /* Groups Container */
        .groups-container-light {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .group-card-light {
          background: white;
          border-radius: 24px;
          padding: 28px;
          box-shadow: 0 12px 40px rgba(123, 47, 247, 0.07);
          transition: all 0.4s ease;
          user-select: none;
        }

        .group-card-light:hover {
          box-shadow: 0 20px 58px rgba(123, 47, 247, 0.16);
          transform: translateY(-6px);
        }

        /* Group Header */
        .group-header-light {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .group-user-light {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .user-avatar-light {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, #7b2ff7, #a4508b);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: 700;
          box-shadow: 0 8px 24px rgba(123, 47, 247, 0.3);
        }

        .user-info-light {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .user-name-light {
          font-size: 20px;
          font-weight: 700;
          color: #222;
        }

        .user-email-light {
          font-size: 14px;
          color: #777;
        }

        .task-count-light {
          padding: 10px 20px;
          background: #f7ebff;
          border-radius: 16px;
          color: #7b2ff7;
          font-size: 14px;
          font-weight: 700;
          user-select: none;
        }

        /* Expand Button */
        .expand-btn-light {
          width: 100%;
          padding: 14px 24px;
          background: #f4e8ff;
          border: 1.5px solid #d1b3ff;
          border-radius: 18px;
          color: #7b2ff7;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          user-select: none;
        }

        .expand-btn-light:hover {
          background: #e1caff;
          border-color: #a78bfa;
          box-shadow: 0 6px 18px rgba(167, 139, 250, 0.25);
          transform: translateY(-2px);
        }

        /* Tasks List */
        .tasks-list-light {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* Empty State */
        .empty-state-light {
          text-align: center;
          padding: 80px 20px;
          background: #f9f5ff;
          border-radius: 24px;
          box-shadow: 0 10px 30px rgba(167, 139, 250, 0.15);
          user-select: none;
        }

        .empty-icon-light {
          font-size: 80px;
          margin-bottom: 24px;
          color: #a78bfa;
        }

        .empty-title-light {
          font-size: 28px;
          font-weight: 700;
          color: #5b21b6;
          margin: 0 0 12px 0;
        }

        .empty-text-light {
          font-size: 16px;
          color: #7c3aed;
          margin: 0;
        }

        /* Refresh Button */
        .refresh-container-light {
          margin-top: 48px;
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

        .refresh-icon-light {
          font-size: 20px;
          animation: rotate 3s linear infinite;
        }

        @keyframes rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        /* Loading State */
        .tasks-to-me-loading-light {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #fff;
          gap: 28px;
          color: #555;
          font-weight: 600;
          font-size: 20px;
          user-select: none;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        }

        .loading-spinner-light {
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

        .loading-text-light {
          font-size: 18px;
          color: #7b2ff7;
          font-weight: 700;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .tasks-to-me-title-light {
            font-size: 36px;
          }

          .user-avatar-light {
            width: 48px;
            height: 48px;
            font-size: 20px;
          }

          .user-name-light {
            font-size: 18px;
          }

          .filter-btn-light {
            padding: 12px 20px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default TasksToMe;
