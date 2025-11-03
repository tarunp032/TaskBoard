import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import TaskCard from '../components/TaskCard';

const TasksToMe = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/task/assigned-to-me');
      setTasks(response.data.data);
    } catch (error) {
      alert('Failed to fetch tasks: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    try {
      await api.patch(`/task/${taskId}/status`, { status: newStatus });
      alert('Status updated!');
      fetchTasks();
    } catch (error) {
      alert('Failed to update status: ' + error.message);
    }
  };

  const filteredTasks =
    filterStatus === 'all' ? tasks : tasks.filter((t) => t.status === filterStatus);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-white text-xl animate-pulse">
        Loading your tasks...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-700 text-white py-12 px-6">
      <div className="max-w-5xl mx-auto backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-10">
        <h1 className="text-4xl font-extrabold mb-8 text-center tracking-wide">
          📥 Tasks <span className="text-blue-300">TO Me</span> (Inbox)
        </h1>

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
                ${
                  filterStatus === filter.value
                    ? `bg-${filter.color}-500 text-white border-${filter.color}-400 shadow-lg scale-105`
                    : `bg-white/10 border-white/30 text-white/80 hover:bg-white/20`
                }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <div className="text-center text-white/80 text-lg py-8">
            No tasks found ✨
          </div>
        ) : (
          <div className="space-y-6">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onStatusToggle={handleStatusToggle}
                isInbox={true}
              />
            ))}
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-10 text-center">
          <button
            onClick={fetchTasks}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-2.5 rounded-lg 
                       font-semibold shadow-lg hover:from-indigo-600 hover:to-purple-700 transform hover:scale-105 
                       transition-all duration-300"
          >
            🔄 Refresh Tasks
          </button>
        </div>
      </div>
    </div>
  );
};

export default TasksToMe;
