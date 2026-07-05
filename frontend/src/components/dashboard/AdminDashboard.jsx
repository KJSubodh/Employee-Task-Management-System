import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTaskStats } from '../../store/slices/taskSlice';
import { fetchEmployees } from '../../store/slices/employeeSlice';
import { 
  FaUsers, 
  FaTasks, 
  FaCheckCircle, 
  FaClock, 
  FaExclamationTriangle,
  FaUserPlus,
  FaPlusCircle
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import PageTitle from '../common/PageTitle';
import TaskDetail from '../tasks/TaskDetail'; // Import TaskDetail

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { stats, isLoading } = useSelector((state) => state.tasks);
  const { employees, total: totalEmployees } = useSelector((state) => state.employees);
  const { user } = useSelector((state) => state.auth);
  const [selectedTask, setSelectedTask] = useState(null); // State for selected task

  useEffect(() => {
    dispatch(fetchTaskStats());
    dispatch(fetchEmployees({ limit: 5 }));
  }, [dispatch]);

  const statCards = [
    {
      title: 'Total Employees',
      value: totalEmployees || 0,
      icon: FaUsers,
      color: 'bg-purple-500',
      action: () => navigate('/employees')
    },
    {
      title: 'Total Tasks',
      value: stats.total || 0,
      icon: FaTasks,
      color: 'bg-blue-500',
      action: () => navigate('/tasks')
    },
    {
      title: 'Completed Tasks',
      value: stats.completed || 0,
      icon: FaCheckCircle,
      color: 'bg-green-500',
      action: () => navigate('/tasks?status=completed')
    },
    {
      title: 'Pending Tasks',
      value: stats.pending || 0,
      icon: FaClock,
      color: 'bg-yellow-500',
      action: () => navigate('/tasks?status=pending')
    },
    {
      title: 'Overdue Tasks',
      value: stats.overdue || 0,
      icon: FaExclamationTriangle,
      color: 'bg-red-500',
      action: () => navigate('/tasks?status=overdue')
    }
  ];

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleCloseDetail = () => {
    setSelectedTask(null);
    dispatch(fetchTaskStats());
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
      <PageTitle title="Admin Dashboard" />
      <div>
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0a0a0a]">
            Admin Dashboard 👋
          </h1>
          <p className="text-[#64748b] mt-1">
            Welcome back, {user?.fullName}! Here's your organization overview
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 mb-8">
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-[#eef2f6] p-6">
            <h2 className="text-lg font-semibold text-[#0a0a0a] mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/employees')}
                className="w-full btn-primary text-left flex items-center justify-between"
              >
                <span className="flex items-center">
                  <FaUserPlus className="mr-2" />
                  Add New Employee
                </span>
                <span>→</span>
              </button>
              <button
                onClick={() => navigate('/tasks')}
                className="w-full btn-secondary text-left flex items-center justify-between"
              >
                <span className="flex items-center">
                  <FaPlusCircle className="mr-2" />
                  Create New Task
                </span>
                <span>→</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#eef2f6] p-6">
            <h2 className="text-lg font-semibold text-[#0a0a0a] mb-4">Recent Employees</h2>
            {employees.length === 0 ? (
              <p className="text-[#64748b] text-sm">No employees added yet</p>
            ) : (
              <ul className="divide-y divide-[#eef2f6]">
                {employees.slice(0, 5).map((emp) => (
                  <li key={emp.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#0a0a0a]">{emp.fullName}</p>
                      <p className="text-sm text-[#64748b]">{emp.email}</p>
                    </div>
                    <span className={`badge ${emp.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {emp.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {employees.length > 0 && (
              <button
                onClick={() => navigate('/employees')}
                className="mt-4 text-[#0a0a0a] hover:text-[#1a1a1a] text-sm font-medium"
              >
                View All Employees →
              </button>
            )}
          </div>
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

export default AdminDashboard;