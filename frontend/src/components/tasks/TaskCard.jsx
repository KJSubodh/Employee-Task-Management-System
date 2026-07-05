import React from 'react';
import { FaEdit, FaTrash, FaCalendar, FaUser, FaFlag, FaPaperclip } from 'react-icons/fa';
import { formatUTCDate } from '../../utils/dateUtils';

const TaskCard = ({ task, onEdit, onDelete, onView, userRole }) => {
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

  const isOverdue = task.status !== 'completed' && new Date(task.dueDate) < new Date();

  return (
    <div
      onClick={onView}
      className="group bg-white rounded-xl border border-[#eef2f6] p-5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-200 hover:border-[#d1d5db] cursor-pointer"
    >
      {/* Header */}
      <div className="flex justify-between items-start gap-3 mb-3">
        <h3 className="text-base font-semibold text-[#0a0a0a] leading-tight line-clamp-2 flex-1">
          {task.title}
        </h3>
        <div className="flex items-center gap-1 flex-shrink-0">
          {userRole === 'admin' && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#0a0a0a] hover:bg-[#f1f5f9] transition-colors"
              aria-label="Edit task"
            >
              <FaEdit className="w-3.5 h-3.5" />
            </button>
          )}
          {userRole === 'admin' && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fee2e2] transition-colors"
              aria-label="Delete task"
            >
              <FaTrash className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-[#64748b] mb-4 line-clamp-2 leading-relaxed">
        {task.description || 'No description provided'}
      </p>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
          <FaFlag className="w-3 h-3" />
          {task.priority}
        </span>
        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
          {task.status.replace('_', ' ')}
        </span>
        {isOverdue && (
          <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-[#fee2e2] text-[#991b1b]">
            Overdue
          </span>
        )}
        {task.fileAttachment && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-[#f1f5f9] text-[#475569]">
            <FaPaperclip className="w-3 h-3" />
            Attached
          </span>
        )}
      </div>

      {/* Meta Info */}
      <div className="space-y-1.5 text-sm text-[#64748b]">
        <div className="flex items-center gap-2">
          <FaUser className="w-3.5 h-3.5 text-[#94a3b8]" />
          <span className="truncate">{task.assignedTo?.fullName || 'Unassigned'}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaCalendar className="w-3.5 h-3.5 text-[#94a3b8]" />
          <span>Due {formatUTCDate(task.dueDate, 'MMM dd, yyyy')}</span>
        </div>
      </div>

      {/* Attachment Link */}
      {task.fileAttachment && (
        <div className="mt-3 pt-3 border-t border-[#eef2f6]">
          <a
            onClick={(e) => e.stopPropagation()}
            href={`${import.meta.env.VITE_API_URL}/uploads/${task.fileAttachment}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0a0a0a] hover:text-[#2563eb] transition-colors"
          >
            <FaPaperclip className="w-3 h-3" />
            View Attachment
          </a>
        </div>
      )}
    </div>
  );
};

export default TaskCard;