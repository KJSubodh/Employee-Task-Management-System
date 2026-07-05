import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, deleteTask, setPage } from '../../store/slices/taskSlice';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import TaskDetail from './TaskDetail';
import { FaPlus, FaSearch, FaFilter, FaTimes, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

const TaskList = () => {
  const dispatch = useDispatch();
  const { tasks, total, currentPage, totalPages, isLoading } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTasksList();
  }, [currentPage, filters]);

  const fetchTasksList = () => {
    const params = {
      page: currentPage,
      limit: 10,
      ...filters
    };
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.search) params.search = filters.search;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortOrder) params.sortOrder = filters.sortOrder;
    
    dispatch(fetchTasks(params));
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      await dispatch(deleteTask(id));
      fetchTasksList();
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      dispatch(setPage(newPage));
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    dispatch(setPage(1));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      priority: '',
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    });
    dispatch(setPage(1));
  };

  const toggleSortOrder = () => {
    setFilters(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === 'ASC' ? 'DESC' : 'ASC'
    }));
    dispatch(setPage(1));
  };

  const handleCloseDetail = () => {
    setSelectedTask(null);
    fetchTasksList();
  };

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0a0a0a]/10 border-t-[#0a0a0a]"></div>
      </div>
    );
  }

  const hasActiveFilters = filters.status || filters.priority || filters.search;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0a0a0a] tracking-tight">Tasks</h1>
          <p className="text-[#64748b] text-sm mt-0.5">
            {user?.role === 'admin' 
              ? 'Manage all tasks across your organization'
              : 'View and manage your assigned tasks'}
          </p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => {
              setEditingTask(null);
              setShowForm(true);
            }}
            className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center px-5"
          >
            <FaPlus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-[#eef2f6] p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] w-4 h-4" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-[#eef2f6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/5 focus:border-[#0a0a0a]/20 focus:bg-white transition-all duration-200 text-sm placeholder:text-[#94a3b8]"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all duration-200 text-sm font-medium ${
                showFilters 
                  ? 'border-[#0a0a0a] bg-[#f8fafc] text-[#0a0a0a]' 
                  : 'border-[#eef2f6] text-[#64748b] hover:bg-[#f8fafc]'
              }`}
            >
              <FaFilter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-[#0a0a0a] rounded-full"></span>
              )}
            </button>
            
            <button
              onClick={toggleSortOrder}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#eef2f6] text-[#64748b] hover:bg-[#f8fafc] transition-all duration-200 text-sm font-medium"
              title={`Sort ${filters.sortOrder === 'ASC' ? 'Ascending' : 'Descending'}`}
            >
              {filters.sortOrder === 'ASC' ? (
                <FaSortAmountUp className="w-3.5 h-3.5" />
              ) : (
                <FaSortAmountDown className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{filters.sortOrder === 'ASC' ? 'Asc' : 'Desc'}</span>
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-[#64748b] hover:text-[#0a0a0a] hover:bg-[#f8fafc] transition-all duration-200 text-sm"
              >
                <FaTimes className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#eef2f6]">
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1.5">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#eef2f6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/5 focus:border-[#0a0a0a]/20 text-sm"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1.5">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#eef2f6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/5 focus:border-[#0a0a0a]/20 text-sm"
              >
                <option value="">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1.5">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#eef2f6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/5 focus:border-[#0a0a0a]/20 text-sm"
              >
                <option value="createdAt">Created Date</option>
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Task Cards Grid */}
      {tasks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-[#eef2f6]">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-[#64748b] text-lg font-medium">No tasks found</p>
          <p className="text-[#94a3b8] text-sm mt-1">
            {user?.role === 'admin' 
              ? 'Create a new task to get started'
              : 'You have no tasks assigned to you'}
          </p>
          {user?.role === 'admin' && (
            <button
              onClick={() => {
                setEditingTask(null);
                setShowForm(true);
              }}
              className="btn-primary mt-4 inline-flex items-center gap-2"
            >
              <FaPlus className="w-4 h-4" />
              Create Task
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onView={() => setSelectedTask(task)}
              onEdit={() => {
                setEditingTask(task);
                setShowForm(true);
              }}
              onDelete={() => handleDelete(task.id, task.title)}
              userRole={user?.role}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl border border-[#eef2f6] px-4 py-3">
          <p className="text-sm text-[#64748b]">
            Showing <span className="font-medium text-[#0a0a0a]">{((currentPage - 1) * 10) + 1}</span> to{' '}
            <span className="font-medium text-[#0a0a0a]">{Math.min(currentPage * 10, total)}</span> of{' '}
            <span className="font-medium text-[#0a0a0a]">{total}</span> tasks
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-[#eef2f6] hover:bg-[#f8fafc] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium text-[#64748b] disabled:hover:bg-transparent"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm font-medium text-[#0a0a0a]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-[#eef2f6] hover:bg-[#f8fafc] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium text-[#64748b] disabled:hover:bg-transparent"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm
          task={editingTask}
          onClose={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
          onSuccess={fetchTasksList}
        />
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          userRole={user?.role}
          currentUserId={user?.id}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
};

export default TaskList;