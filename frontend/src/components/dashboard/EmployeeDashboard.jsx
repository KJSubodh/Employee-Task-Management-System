import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTaskStats, fetchTasks } from '../../store/slices/taskSlice';
import { 
  FaTasks, 
  FaCheckCircle, 
  FaClock, 
  FaExclamationTriangle,
  FaCalendarCheck
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { formatUTCDate } from '../../utils/dateUtils';
import PageTitle from '../common/PageTitle';
import TaskDetail from '../tasks/TaskDetail'; // Import TaskDetail

const EmployeeDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { stats, isLoading, tasks } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  const [selectedTask, setSelectedTask] = useState(null); // State for selected task

  useEffect(() => {
    dispatch(fetchTaskStats());
    dispatch(fetchTasks({ limit: 5, sortBy: 'dueDate', sortOrder: 'ASC' }));
  }, [dispatch]);

  const statCards = [
    {
      title: 'My Tasks',
      value: stats.total || 0,
      icon: FaTasks,
      color: 'bg-[#2563eb]',
      action: () => navigate('/tasks')
    },
    {
      title: 'Completed',
      value: stats.completed || 0,
      icon: FaCheckCircle,
      color: 'bg-[#16a34a]',
      action: () => navigate('/tasks?status=completed')
    },
    {
      title: 'Pending',
      value: stats.pending || 0,
      icon: FaClock,
      color: 'bg-[#eab308]',
      action: () => navigate('/tasks?status=pending')
    },
    {
      title: 'Overdue',
      value: stats.overdue || 0,
      icon: FaExclamationTriangle,
      color: 'bg-[#dc2626]',
      action: () => navigate('/tasks?status=overdue')
    }
  ];

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-[#dcfce7] text-[#166534]',
      medium: 'bg-[#fef3c7] text-[#92400e]',
      high: 'bg-[#fee2e2] text-[#991b1b]'
    };
    return colors[priority] || 'bg-[#f1f5f9] text-[#475569]';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-[#fef3c7] text-[#92400e]',
      in_progress: 'bg-[#dbeafe] text-[#1e40af]',
      completed: 'bg-[#dcfce7] text-[#166534]',
      overdue: 'bg-[#fee2e2] text-[#991b1b]'
    };
    return colors[status] || 'bg-[#f1f5f9] text-[#475569]';
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleCloseDetail = () => {
    setSelectedTask(null);
    // Refresh tasks to reflect any changes
    dispatch(fetchTaskStats());
    dispatch(fetchTasks({ limit: 5, sortBy: 'dueDate', sortOrder: 'ASC' }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0a0a0a]/10 border-t-[#0a0a0a]"></div>
      </div>
    );
  }

  return (
    <>
      <PageTitle title="Employee Dashboard" />
      <div>
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0a0a0a]">
            My Dashboard 👋
          </h1>
          <p className="text-[#64748b] mt-1">
            Welcome back, {user?.fullName}! Here's your task overview
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              onClick={stat.action}
              className="bg-white rounded-xl border border-[#eef2f6] p-6 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#64748b] font-medium">{stat.title}</p>
                  <p className="text-2xl md:text-3xl font-bold text-[#0a0a0a] mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="text-white text-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-xl border border-[#eef2f6] p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[#0a0a0a]">My Recent Tasks</h2>
            <button
              onClick={() => navigate('/tasks')}
              className="text-[#0a0a0a] hover:text-[#1a1a1a] text-sm font-medium"
            >
              View All →
            </button>
          </div>
          
          {tasks.length === 0 ? (
            <p className="text-[#64748b] text-center py-8">No tasks assigned to you yet</p>
          ) : (
            <div className="space-y-4">
              {tasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="border border-[#eef2f6] rounded-lg p-4 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:border-[#d1d5db] transition-all duration-200 cursor-pointer"
                  onClick={() => handleTaskClick(task)} // ✅ Opens TaskDetail
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#0a0a0a]">{task.title}</h3>
                      <p className="text-sm text-[#64748b] line-clamp-1">{task.description || 'No description'}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-[#f1f5f9] text-[#475569]">
                        <FaCalendarCheck className="mr-1" />
                        {formatUTCDate(task.dueDate, 'MMM dd')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6">
          <button
            onClick={() => navigate('/tasks')}
            className="w-full btn-primary py-3 text-center"
          >
            <FaTasks className="inline mr-2" />
            View All My Tasks
          </button>
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          userRole={user?.role}
          currentUserId={user?.id}
          onClose={handleCloseDetail}
        />
      )}
    </>
  );
};

export default EmployeeDashboard;