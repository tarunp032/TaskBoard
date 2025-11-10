import React, { useState, useEffect } from "react";
import api from "../utils/api";
import TaskCard from "../components/TaskCard";
import AddTaskModal from "../components/AddTaskModal";
import EditTaskModal from "../components/EditTaskModal";
import DeleteConfirm from "../components/DeleteConfirm";

const TasksByMe = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [expandedTaskId, setExpandedTaskId] = useState(null); // Added

  // Fetch tasks
  const fetchTasks = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const response = await api.get("/task/assigned-by-me");
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

  // Edit & Delete handlers
  const handleEdit = (taskId) => {
    setSelectedTaskId(taskId);
    setShowEditModal(true);
  };

  const handleDelete = (taskId) => {
    setSelectedTaskId(taskId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/task/${selectedTaskId}`);
      alert("Task deleted!");
      fetchTasks(false);
      setShowDeleteConfirm(false);
      setSelectedTaskId(null);
    } catch (error) {
      alert("Failed to delete task: " + error.message);
    }
  };

  // Filtering & grouping
  const searchTerm = search.trim().toLowerCase();
  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === "all" || task.status === filterStatus;
    const titleMatch = (task.taskname || "").toLowerCase().includes(searchTerm);
    const userMatch = (task.assignTo?.name || "").toLowerCase().includes(searchTerm);
    const searchMatch = !searchTerm || titleMatch || userMatch;
    return statusMatch && searchMatch;
  });

  const groupedTasks = {};
  filteredTasks.forEach(task => {
    const userId = task.assignTo._id;
    if (!groupedTasks[userId]) {
      groupedTasks[userId] = { user: task.assignTo, tasks: [] };
    }
    groupedTasks[userId].tasks.push(task);
  });

  if (loading)
    return (
      <div className="tasks-by-me-loading-light">
        <div className="loading-spinner-light"></div>
        <p className="loading-text-light">Loading your tasks...</p>
      </div>
    );

  return (
    <div className="tasks-by-me-container-light">
      {/* Animated Background */}
      <div className="tasks-by-me-bg-light">
        <div className="gradient-orb-light orb-1-light"></div>
        <div className="gradient-orb-light orb-2-light"></div>
        <div className="gradient-orb-light orb-3-light"></div>
      </div>

      <div className="tasks-by-me-content-light">
        {/* Header Row */}
        <div className="tasks-by-me-topbar">
          <div className="tasks-by-me-titlebar">
            <span className="title-icon-light">📤</span>
            <span className="tasks-by-me-title-light">
              Tasks <span className="title-highlight-light">BY Me</span>
            </span>
          </div>
          <div className="topbar-actions">
            <input
              type="text"
              placeholder="Search tasks or user..."
              className="task-search-input-light"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              onClick={() => setShowAddModal(true)}
              className="add-task-btn-light"
            >
              <span className="add-icon-light">+</span>
              Add New Task
            </button>
          </div>
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
              className={`filter-btn-light ${filterStatus === filter.value ? "filter-btn-active-light" : ""}`}
            >
              <span className="filter-emoji-light">{filter.emoji}</span>
              {filter.label}
            </button>
          ))}
        </div>

        {/* Trello style horizontal user blocks */}
        <div className="trello-board-container">
          {Object.keys(groupedTasks).length === 0 ? (
            <div className="empty-state-light">
              <div className="empty-icon-light">📭</div>
              <h3 className="empty-title-light">No tasks found</h3>
              <p className="empty-text-light">
                Create your first task to get started! ✨
              </p>
            </div>
          ) : (
            <div className="horizontal-user-boards">
              {Object.values(groupedTasks).map((group) => (
                <div key={group.user._id} className="user-task-column">
                  <div className="user-task-col-header">
                    <div className="user-avatar-board">
                      {group.user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="user-task-board-name">{group.user.name}</span>
                    <span className="user-task-board-taskcount">
                      {group.tasks.length} {group.tasks.length === 1 ? "task" : "tasks"}
                    </span>
                  </div>
                  <div className="user-task-cards">
                    {group.tasks.map((task) => (
                      <div key={task._id} className="task-accordion">
                        <div
                          className={
                            "task-title-accordion" +
                            (expandedTaskId === task._id ? " task-active" : "")
                          }
                          onClick={() =>
                            setExpandedTaskId(expandedTaskId === task._id ? null : task._id)
                          }
                        >
                          {task.taskname}
                        </div>
                        {expandedTaskId === task._id && (
                          <TaskCard
                            task={task}
                            from={task.createdBy?.name || "Unknown"}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            isInbox={false}
                            onParentRefresh={fetchTasks}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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

      {/* Modals */}
      {showAddModal && (
        <AddTaskModal
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchTasks}
        />
      )}
      {showEditModal && (
        <EditTaskModal
          taskId={selectedTaskId}
          onClose={() => setShowEditModal(false)}
          onSuccess={fetchTasks}
        />
      )}
      {showDeleteConfirm && (
        <DeleteConfirm
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {/* CSS Styles */}
      <style>{`
        .tasks-by-me-container-light {
          min-height: 100vh;
          background: #fff;
          position: relative;
          overflow-x: hidden;
          padding: 60px 0 0 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .tasks-by-me-content-light {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
        }
        .tasks-by-me-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 18px;
          margin-bottom: 18px;
        }
        .tasks-by-me-titlebar {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 36px;
          font-weight: 900;
        }
        .title-icon-light {
          font-size: 40px;
        }
        .title-highlight-light {
          background: linear-gradient(135deg, #f472b6, #fb923c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .task-search-input-light {
          padding: 12px 18px;
          border-radius: 12px;
          border: 1.5px solid #a78bfa;
          font-size: 16px;
          font-weight: 500;
          background: #fafaff;
          box-shadow: 0 2px 14px rgba(167,139,250,0.05);
          outline: none;
          transition: border 0.3s;
        }
        .task-search-input-light:focus {
          border-color: #7b2ff7;
          background: #fff;
        }
        .filter-container-light {
          display: flex;
          justify-content: flex-start;
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
          transition: box-shadow 0.3s, transform 0.2s, background 0.3s, color 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
          user-select: none;
          box-shadow: 0 2px 10px rgba(123, 47, 247, 0.07);
        }
        .filter-btn-light:hover {
          background: rgba(123, 47, 247, 0.17);
          border-color: #7b2ff7;
          color: #7b2ff7;
          box-shadow: 0 6px 16px rgba(123, 47, 247, 0.15);
          transform: scale(1.04);
        }
        .filter-btn-active-light {
          background: linear-gradient(135deg, #7b2ff7, #f107a3);
          border-color: transparent;
          color: white;
          box-shadow: 0 7px 22px rgba(241, 7, 163, 0.18);
          transform: scale(1.06);
        }
        .filter-emoji-light {
          font-size: 18px;
        }
        .add-task-btn-light {
          padding: 16px 32px;
          background: linear-gradient(135deg, #10b981, #059669);
          border: none;
          border-radius: 16px;
          color: white;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 12px 32px rgba(16, 185, 129, 0.21);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .add-task-btn-light:hover {
          box-shadow: 0 15px 40px rgba(16, 185, 129, 0.3);
          transform: scale(1.04) translateY(-3px);
        }
        .add-icon-light {
          font-size: 24px;
          font-weight: 700;
        }
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
          box-shadow: 0 4px 18px rgba(123, 47, 247, 0.18);
          transition: box-shadow 0.3s, transform 0.2s, background 0.3s;
          user-select: none;
        }
        .refresh-btn-light:hover {
          box-shadow: 0 10px 40px rgba(241, 7, 163, 0.30);
          transform: scale(1.05) translateY(-3px);
          background: linear-gradient(135deg, #8b5cf6, #f107a3);
        }
        .refresh-icon-light {
          font-size: 20px;
          animation: rotate 3s linear infinite;
        }
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        /* Trello style user boards */
        .trello-board-container {
          padding: 10px 0;
        }
        .horizontal-user-boards {
          display: flex;
          gap: 28px;
          overflow-x: auto;
          padding-bottom: 24px;
          align-items: flex-start; /* Fix: columns grow independently */
        }
        .user-task-column {
          min-width: 310px;
          max-width: 340px;
          background: #f6f6fa;
          border-radius: 22px;
          box-shadow: 0 7px 22px rgba(123,47,247,0.13);
          padding: 22px 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .user-task-col-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 8px;
        }
        .user-avatar-board {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg,#7b2ff7,#a4508b);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 700;
        }
        .user-task-board-name {
          font-size: 18px;
          font-weight: 700;
          color: #222;
        }
        .user-task-board-taskcount {
          font-size: 13px;
          color: #7b2ff7;
          background: #ede9fe;
          padding: 2px 10px;
          border-radius: 12px;
        }
        .user-task-cards {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        /* Accordion task UI */
        .task-accordion {
          margin-bottom: 8px;
          background: none;
        }
        .task-title-accordion {
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          background: #ede9fe;
          color: #7b2ff7;
          padding: 10px 20px;
          margin-bottom: 3px;
          border-radius: 12px;
          transition: 0.2s;
          user-select: none;
          border: none;
          outline: none;
        }
        .task-title-accordion:hover,
        .task-active {
          background: linear-gradient(90deg,#e0c3fc,#fbc2eb);
          color: #3c1361;
          box-shadow: 0 2px 14px #7b2ff740;
        }
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
        .tasks-by-me-loading-light {
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
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
          to { transform: rotate(360deg); }
        }
        .loading-text-light {
          font-size: 18px;
          color: #7b2ff7;
          font-weight: 700;
        }
        @media (max-width: 950px) {
          .horizontal-user-boards { gap: 14px; }
          .user-task-column { min-width: 94vw; max-width: none; }
        }
        @media (max-width: 650px) {
          .tasks-by-me-content-light { padding: 0 8px; }
          .tasks-by-me-topbar, .topbar-actions { flex-direction: column; gap: 12px; align-items: flex-start; }
          .user-task-column { min-width: 99vw; }
          .tasks-by-me-titlebar { font-size: 26px; }
        }
      `}</style>
    </div>
  );
};

export default TasksByMe;
