import React from 'react';
import { FaEdit, FaTrash, FaEnvelope, FaBriefcase, FaBuilding, FaUserCheck, FaCalendarAlt } from 'react-icons/fa';
import { format } from 'date-fns';

const EmployeeCard = ({ employee, onEdit, onDelete }) => {
  return (
    <div className="group bg-white rounded-xl border border-[#eef2f6] overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-[#d1d5db] transition-all duration-300">
      {/* Top accent bar - black/neutral */}
      <div className={`h-1 ${employee.isActive ? 'bg-[#0a0a0a]' : 'bg-[#94a3b8]'}`}></div>
      
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-[#0a0a0a] flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                {employee.fullName?.charAt(0) || 'U'}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                employee.isActive ? 'bg-[#22c55e]' : 'bg-[#94a3b8]'
              }`}></div>
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-[#0a0a0a] truncate leading-tight">
                {employee.fullName}
              </h3>
              <div className="flex items-center gap-1.5 text-sm text-[#64748b]">
                <FaEnvelope className="w-3 h-3 text-[#94a3b8] flex-shrink-0" />
                <span className="truncate text-xs">{employee.email}</span>
              </div>
            </div>
          </div>
          
          {/* Action buttons - shown on hover */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={onEdit}
              className="p-2 rounded-lg text-[#94a3b8] hover:text-[#0a0a0a] hover:bg-[#f1f5f9] transition-colors"
              aria-label="Edit employee"
            >
              <FaEdit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-lg text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fee2e2] transition-colors"
              aria-label="Delete employee"
            >
              <FaTrash className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#f8fafc] rounded-lg px-3 py-2.5">
            <div className="flex items-center gap-2 text-xs text-[#94a3b8] mb-0.5">
              <FaBuilding className="w-3 h-3" />
              <span>Department</span>
            </div>
            <p className="text-sm font-medium text-[#0a0a0a] truncate">
              {employee.department || '—'}
            </p>
          </div>
          <div className="bg-[#f8fafc] rounded-lg px-3 py-2.5">
            <div className="flex items-center gap-2 text-xs text-[#94a3b8] mb-0.5">
              <FaBriefcase className="w-3 h-3" />
              <span>Designation</span>
            </div>
            <p className="text-sm font-medium text-[#0a0a0a] truncate">
              {employee.designation || '—'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#f1f5f9]">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
              employee.isActive 
                ? 'bg-[#f1f5f9] text-[#0a0a0a]' 
                : 'bg-[#f1f5f9] text-[#94a3b8]'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                employee.isActive ? 'bg-[#22c55e]' : 'bg-[#94a3b8]'
              }`}></span>
              {employee.isActive ? 'Active' : 'Inactive'}
            </span>
            {employee.createdAt && (
              <span className="text-xs text-[#94a3b8] flex items-center gap-1">
                <FaCalendarAlt className="w-3 h-3" />
                {format(new Date(employee.createdAt), 'MMM d, yyyy')}
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-[#94a3b8] bg-[#f8fafc] px-2 py-0.5 rounded">
            #{employee.id?.slice(0, 6) || 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;