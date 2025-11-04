import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import TaskCard from '../components/TaskCard';
import AddTaskModal from '../components/AddTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import DeleteConfirm from '../components/DeleteConfirm';

const TasksByMe = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedUsers, setExpandedUsers] = useState({});

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // Fetch tasks (with loader only for full page)
  const fetchTasks = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const response = await api.get('/task/assigned-by-me');
      setTasks(response.data.data);
    } catch (error) {
      alert('Failed to fetch tasks: ' + error.message);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(true);
  }, []);

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
      alert('Task deleted!');
      fetchTasks(false);
      setShowDeleteConfirm(false);
      setSelectedTaskId(null);
    } catch (error) {
      alert('Failed to delete task: ' + error.message);
    }
  };

  // Group tasks by assignTo user
  const groupedTasks = tasks.reduce((groups, task) => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return groups;
    const userId = task.assignTo._id;
    if (!groups[userId]) {
      groups[userId] = {
        user: task.assignTo,
        tasks: []
      };
    }
    groups[userId].tasks.push(task);
    return groups;
  }, {});

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-white text-xl animate-pulse">
        Loading your tasks...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 text-white py-12 px-6">
      <div className="max-w-5xl mx-auto backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-10">
        <h1 className="text-4xl font-extrabold mb-8 text-center tracking-wide">
          📤 Tasks <span className="text-pink-300">BY Me</span> (Outbox)
        </h1>
        {/* Add Task Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-2.5 rounded-lg font-semibold text-white shadow-lg hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300"
          >
            + Add New Task
          </button>
        </div>
        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {[
            { label: 'All', value: 'all', color: 'blue' },
            { label: 'Pending', value: 'pending', color: 'orange' },
            { label: 'Completed', value: 'completed', color: 'green' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setFilterStatus(filter.value)}
              className={`px-5 py-2 rounded-full font-semibold border transition-all duration-300
                ${filterStatus === filter.value
                  ? `bg-${filter.color}-500 text-white border-${filter.color}-400 shadow-lg scale-105`
                  : `bg-white/10 border-white/30 text-white/80 hover:bg-white/20`
                }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        {/* Grouped List */}
        {Object.keys(groupedTasks).length === 0 ? (
          <div className="text-center text-white/80 text-lg py-8">
            No tasks found ✨
          </div>
        ) : (
          <div className="space-y-8">
            {Object.values(groupedTasks).map((group) => (
              <div key={group.user._id} className="bg-white/10 border border-white/20 rounded-xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-lg text-pink-100">
                    {group.user.name}
                  </span>
                  <span className="font-semibold bg-gray-500/30 px-4 py-1 rounded-full text-white/90">
                    {group.tasks.length} task{group.tasks.length > 1 ? 's' : ''}
                  </span>
                </div>
                <button
                  className="mt-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:from-blue-600 hover:to-purple-700 transition-colors duration-300"
                  onClick={() =>
                    setExpandedUsers((prev) => ({
                      ...prev,
                      [group.user._id]: !prev[group.user._id]
                    }))
                  }
                >
                  {expandedUsers[group.user._id] ? 'Hide Tasks' : 'Show Tasks'}
                </button>
                {expandedUsers[group.user._id] && (
                  <div className="space-y-4 mt-5">
                    {group.tasks.map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isInbox={false}
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
        <div className="mt-10 text-center">
          <button
            onClick={() => fetchTasks(true)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-2.5 rounded-lg font-semibold shadow-lg hover:from-indigo-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300"
          >
            🔄 Refresh Tasks
          </button>
        </div>
      </div>
      {/* Modals */}
      {showAddModal && (
        <AddTaskModal onClose={() => setShowAddModal(false)} onSuccess={fetchTasks} />
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
    </div>
  );
};

export default TasksByMe;
