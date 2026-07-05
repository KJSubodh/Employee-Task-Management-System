import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { format } from 'date-fns';
import { formatUTCDate } from '../../utils/dateUtils';
import { updateTask } from '../../store/slices/taskSlice';
import {
  FaTimes,
  FaUser,
  FaUserTie,
  FaCalendar,
  FaFlag,
  FaPaperclip,
  FaFilePdf,
  FaFileImage,
  FaExternalLinkAlt,
  FaEdit,
  FaTrash,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

const priorityColor = (priority) => ({
  low: 'bg-[#dcfce7] text-[#166534]',
  medium: 'bg-[#fef3c7] text-[#92400e]',
  high: 'bg-[#fee2e2] text-[#991b1b]'
}[priority] || 'bg-[#f1f5f9] text-[#475569]');

const statusColor = (status) => ({
  pending: 'bg-[#fef3c7] text-[#92400e]',
  in_progress: 'bg-[#dbeafe] text-[#1e40af]',
  completed: 'bg-[#dcfce7] text-[#166534]',
  overdue: 'bg-[#fee2e2] text-[#991b1b]'
}[status] || 'bg-[#f1f5f9] text-[#475569]');

const getFileExt = (filename = '') => filename.split('.').pop().toLowerCase();
const isImageFile = (filename) => ['jpg', 'jpeg', 'png'].includes(getFileExt(filename));

const TaskDetail = ({ task, userRole, currentUserId, onClose }) => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState(task.status);
  const [isSaving, setIsSaving] = useState(false);

  const isOverdue = task.status !== 'completed' && new Date(task.dueDate) < new Date();
  const isOwnTask = task.assignedTo?.id === currentUserId || task.assignedToId === currentUserId;
  const canChangeStatus = userRole === 'employee' && isOwnTask && task.status !== 'completed';

  const fileUrl = task.fileAttachment
    ? `${import.meta.env.VITE_API_URL}/uploads/${task.fileAttachment}`
    : null;

  const handleStatusSave = async () => {
    if (status === task.status) return;
    setIsSaving(true);
    try {
      await dispatch(updateTask({ id: task.id, data: { status } }));
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <FaClock className="w-4 h-4" />;
      case 'completed': return <FaCheckCircle className="w-4 h-4" />;
      case 'overdue': return <FaExclamationTriangle className="w-4 h-4" />;
      default: return <FaClock className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0a]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto animate-fadeIn">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-[#eef2f6] px-8 py-6">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-[#f1f5f9]">
                  {getStatusIcon(task.status)}
                </div>
                <div className="min-w-0">
                  <h2 className="text-2xl font-bold text-[#0a0a0a] leading-tight break-words">
                    {task.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full ${priorityColor(task.priority)}`}>
                      <FaFlag className="w-3.5 h-3.5" />
                      {task.priority}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full ${statusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    {isOverdue && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-[#fee2e2] text-[#991b1b]">
                        <FaExclamationTriangle className="w-3.5 h-3.5" />
                        Overdue
                      </span>
                    )}
                    {task.fileAttachment && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-[#f1f5f9] text-[#475569]">
                        <FaPaperclip className="w-3.5 h-3.5" />
                        Attached
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={onClose}
                className="p-2.5 rounded-xl hover:bg-[#f1f5f9] transition-colors text-[#94a3b8] hover:text-[#0a0a0a]"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-8">
          {/* Description */}
          <div className="bg-[#f8fafc] rounded-xl p-6">
            <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">
              Description
            </h3>
            <p className="text-base text-[#1a1a1a] leading-relaxed whitespace-pre-wrap">
              {task.description || 'No description provided.'}
            </p>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-[#f8fafc] rounded-xl px-5 py-4">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">
                  <FaUser className="w-3.5 h-3.5" />
                  <span>Assigned To</span>
                </div>
                <p className="text-base font-medium text-[#0a0a0a]">
                  {task.assignedTo?.fullName || 'Unassigned'}
                </p>
                {task.assignedTo?.email && (
                  <p className="text-sm text-[#94a3b8] mt-0.5">{task.assignedTo.email}</p>
                )}
              </div>
              <div className="bg-[#f8fafc] rounded-xl px-5 py-4">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">
                  <FaUserTie className="w-3.5 h-3.5" />
                  <span>Assigned By</span>
                </div>
                <p className="text-base font-medium text-[#0a0a0a]">
                  {task.assignedBy?.fullName || 'N/A'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#f8fafc] rounded-xl px-5 py-4">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">
                  <FaCalendar className="w-3.5 h-3.5" />
                  <span>Start Date</span>
                </div>
                <p className="text-base font-medium text-[#0a0a0a]">
                  {formatUTCDate(task.startDate, 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
              <div className="bg-[#f8fafc] rounded-xl px-5 py-4">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">
                  <FaCalendar className="w-3.5 h-3.5" />
                  <span>Due Date</span>
                </div>
                <p className={`text-base font-medium ${isOverdue ? 'text-[#dc2626]' : 'text-[#0a0a0a]'}`}>
                  {formatUTCDate(task.dueDate, 'EEEE, MMMM d, yyyy')}
                  {isOverdue && (
                    <span className="ml-2 text-sm font-normal text-[#dc2626]">
                      (Overdue)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Attachment */}
          {task.fileAttachment && (
            <div className="bg-[#f8fafc] rounded-xl p-6">
              <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-4">
                Attachment
              </h3>
              {isImageFile(task.fileAttachment) ? (
                <div className="bg-white rounded-lg border border-[#eef2f6] p-4">
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="block group">
                    <img
                      src={fileUrl}
                      alt="Task attachment"
                      className="w-full max-h-96 object-contain rounded-lg"
                    />
                    <span className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-[#0a0a0a] group-hover:text-[#2563eb] transition-colors">
                      <FaExternalLinkAlt className="w-3.5 h-3.5" />
                      Open full size
                    </span>
                  </a>
                </div>
              ) : (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-white border border-[#eef2f6] rounded-lg hover:border-[#0a0a0a]/30 transition-colors"
                >
                  <div className="p-3 bg-[#fee2e2] rounded-xl text-[#dc2626]">
                    <FaFilePdf className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0a0a0a] truncate">
                      {task.fileAttachment}
                    </p>
                    <p className="text-xs text-[#94a3b8]">Click to open PDF in new tab</p>
                  </div>
                  <FaExternalLinkAlt className="w-4 h-4 text-[#94a3b8] flex-shrink-0" />
                </a>
              )}
            </div>
          )}

          {/* Status Update */}
          {canChangeStatus && (
            <div className="bg-[#f8fafc] rounded-xl p-6 border-2 border-dashed border-[#e2e8f0]">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">
                <FaEdit className="w-3.5 h-3.5" />
                <span>Update Status</span>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="flex-1 w-full px-4 py-3 bg-white border border-[#eef2f6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/5 focus:border-[#0a0a0a]/20 text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <button
                  onClick={handleStatusSave}
                  disabled={isSaving || status === task.status}
                  className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-white bg-[#0a0a0a] hover:bg-[#1a1a1a] rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                      Saving...
                    </span>
                  ) : (
                    'Save Status'
                  )}
                </button>
              </div>
              <p className="text-xs text-[#94a3b8] mt-2">
                {task.status === 'completed' 
                  ? 'This task is already completed and cannot be modified.' 
                  : 'Update the progress of this task.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;