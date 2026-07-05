import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployees, deleteEmployee, setPage } from '../../store/slices/employeeSlice';
import EmployeeCard from './EmployeeCard';
import EmployeeForm from './EmployeeForm';
import { 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaTimes, 
  FaSortAmountDown, 
  FaSortAmountUp,
  FaUsers,
  FaUserCheck,
  FaUserTimes
} from 'react-icons/fa';

const EmployeeList = () => {
  const dispatch = useDispatch();
  const { employees, total, currentPage, totalPages, isLoading } = useSelector((state) => state.employees);
  const { user } = useSelector((state) => state.auth);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    isActive: '',
    sortBy: 'fullName',
    sortOrder: 'ASC'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEmployeesList();
  }, [currentPage, filters]);

  const fetchEmployeesList = () => {
    const params = {
      page: currentPage,
      limit: 10,
      search: filters.search,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder
    };
    if (filters.isActive !== '') params.isActive = filters.isActive === 'true';
    
    dispatch(fetchEmployees(params));
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      await dispatch(deleteEmployee(id));
      fetchEmployeesList();
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
      isActive: '',
      sortBy: 'fullName',
      sortOrder: 'ASC'
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

  const openCreateForm = () => {
    setEditingEmployee(null);
    setShowForm(true);
  };

  // Count active/inactive
  const activeCount = employees.filter(e => e.isActive).length;
  const inactiveCount = employees.filter(e => !e.isActive).length;

  if (isLoading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0a0a0a]/10 border-t-[#0a0a0a]"></div>
      </div>
    );
  }

  const hasActiveFilters = filters.search || filters.isActive !== '';

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0a0a0a] tracking-tight flex items-center gap-2">
            <FaUsers className="w-5 h-5 text-[#0a0a0a]" />
            Employees
          </h1>
          <p className="text-[#64748b] text-sm mt-0.5">
            Manage your team members and their roles
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 w-full sm:w-auto justify-center px-5 py-2.5 text-sm font-medium text-white bg-[#0a0a0a] hover:bg-[#1a1a1a] rounded-lg transition-colors"
        >
          <FaPlus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Stats Summary */}
      {employees.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-[#eef2f6]">
            <span className="font-medium text-[#0a0a0a]">{total}</span>
            <span className="text-[#94a3b8]">Total</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f8fafc] rounded-lg border border-[#eef2f6]">
            <FaUserCheck className="w-3.5 h-3.5 text-[#22c55e]" />
            <span className="font-medium text-[#0a0a0a]">{activeCount}</span>
            <span className="text-[#94a3b8]">Active</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f8fafc] rounded-lg border border-[#eef2f6]">
            <FaUserTimes className="w-3.5 h-3.5 text-[#94a3b8]" />
            <span className="font-medium text-[#0a0a0a]">{inactiveCount}</span>
            <span className="text-[#94a3b8]">Inactive</span>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-[#eef2f6] p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, email, department..."
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
              <span className="hidden sm:inline">{filters.sortOrder === 'ASC' ? 'A→Z' : 'Z→A'}</span>
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
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#eef2f6]">
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1.5">Status</label>
              <select
                value={filters.isActive}
                onChange={(e) => handleFilterChange('isActive', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#eef2f6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/5 focus:border-[#0a0a0a]/20 text-sm"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1.5">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#eef2f6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/5 focus:border-[#0a0a0a]/20 text-sm"
              >
                <option value="fullName">Name</option>
                <option value="email">Email</option>
                <option value="department">Department</option>
                <option value="designation">Designation</option>
                <option value="createdAt">Join Date</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Employee Cards Grid */}
      {employees.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-[#eef2f6]">
          <div className="text-5xl mb-4">👥</div>
          <p className="text-[#64748b] text-lg font-medium">No employees found</p>
          <p className="text-[#94a3b8] text-sm mt-1">Add your first team member to get started</p>
          <button
            onClick={openCreateForm}
            className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-[#0a0a0a] hover:bg-[#1a1a1a] rounded-lg transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {employees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={() => {
                setEditingEmployee(employee);
                setShowForm(true);
              }}
              onDelete={() => handleDelete(employee.id, employee.fullName)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl border border-[#eef2f6] px-5 py-3">
          <p className="text-sm text-[#64748b]">
            Showing <span className="font-medium text-[#0a0a0a]">{((currentPage - 1) * 10) + 1}</span> to{' '}
            <span className="font-medium text-[#0a0a0a]">{Math.min(currentPage * 10, total)}</span> of{' '}
            <span className="font-medium text-[#0a0a0a]">{total}</span> employees
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-[#eef2f6] hover:bg-[#f8fafc] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium text-[#64748b]"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm font-medium text-[#0a0a0a]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-[#eef2f6] hover:bg-[#f8fafc] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium text-[#64748b]"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Employee Form Modal */}
      {showForm && (
        <EmployeeForm
          employee={editingEmployee}
          onClose={() => {
            setShowForm(false);
            setEditingEmployee(null);
          }}
          onSuccess={fetchEmployeesList}
        />
      )}
    </div>
  );
};

export default EmployeeList;