import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { format } from 'date-fns';
import { updateTask, deleteAttachment } from '../../store/slices/taskSlice';
import {
  FaTimes,
  FaUser,
  FaUserTie,
  FaCalendar,
  FaFlag,
  FaPaperclip,
  FaFilePdf,
  FaExternalLinkAlt,
  FaEdit,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaImage,
  FaFile,
  FaTrash,
  FaUpload
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

const formatLocalDate = (dateStr, formatStr = 'EEEE, MMMM d, yyyy') => {
  if (!dateStr) return 'N/A';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return format(date, formatStr);
  }
  return format(new Date(dateStr), formatStr);
};

const getFileExt = (filename = '') => filename.split('.').pop().toLowerCase();
const isImageFile = (filename) => ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(getFileExt(filename));
const isPDFFile = (filename) => getFileExt(filename) === 'pdf';

const TaskDetail = ({ task, userRole, currentUserId, onClose }) => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState(task.status);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingAttachment, setIsDeletingAttachment] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const isOverdue = task.status !== 'completed' && new Date(task.dueDate) < new Date();
  const isOwnTask = task.assignedTo?.id === currentUserId || task.assignedToId === currentUserId;
  const canChangeStatus = userRole === 'employee' && isOwnTask && task.status !== 'completed';
  const canManageAttachments = userRole === 'admin' || isOwnTask;

  const getFileUrl = () => {
    if (!task.fileAttachment) return null;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${baseUrl}/uploads/${task.fileAttachment}`;
  };

  const fileUrl = getFileUrl();

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

  // ✅ NEW: Handle delete attachment
  const handleDeleteAttachment = async () => {
    if (!window.confirm('Are you sure you want to delete this attachment?')) return;
    
    setIsDeletingAttachment(true);
    try {
      const result = await dispatch(deleteAttachment(task.id));
      if (deleteAttachment.fulfilled.match(result)) {
        // Update the task in the UI
        task.fileAttachment = null;
        onClose();
      }
    } finally {
      setIsDeletingAttachment(false);
    }
  };

  // ✅ NEW: Handle replace/upload attachment
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      handleUploadAttachment(file);
    }
  };

  const handleUploadAttachment = async (file) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('fileAttachment', file);
      
      // Use updateTask with just the file
      await dispatch(updateTask({ id: task.id, data: { fileAttachment: file } }));
      onClose();
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <FaClock className="w-4 h-4" />;
      case 'completed': return <FaCheckCircle className="w-4 h-4" />;
      case 'overdue': return <FaExclamationTriangle className="w-4 h-4" />;
      default: return <FaClock className="w-4 h-4" />;
    }
  };

  const renderFilePreview = () => {
    if (!task.fileAttachment || !fileUrl) return null;

    const fileExt = getFileExt(task.fileAttachment);

    if (isImageFile(task.fileAttachment)) {
      return (
        <div className="bg-white rounded-lg border border-[#eef2f6] p-4 relative">
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="block group">
            <img
              src={fileUrl}
              alt="Task attachment"
              className="w-full max-h-96 object-contain rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <span className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-[#0a0a0a] group-hover:text-[#2563eb] transition-colors">
              <FaExternalLinkAlt className="w-3.5 h-3.5" />
              Open full size
            </span>
          </a>
        </div>
      );
    }

    if (isPDFFile(task.fileAttachment)) {
      return (
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
      );
    }

    return (
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 p-4 bg-white border border-[#eef2f6] rounded-lg hover:border-[#0a0a0a]/30 transition-colors"
      >
        <div className="p-3 bg-gray-100 rounded-xl text-gray-600">
          <FaFile className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#0a0a0a] truncate">
            {task.fileAttachment}
          </p>
          <p className="text-xs text-[#94a3b8]">Click to download</p>
        </div>
        <FaExternalLinkAlt className="w-4 h-4 text-[#94a3b8] flex-shrink-0" />
      </a>
    );
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
                  {formatLocalDate(task.startDate, 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
              <div className="bg-[#f8fafc] rounded-xl px-5 py-4">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">
                  <FaCalendar className="w-3.5 h-3.5" />
                  <span>Due Date</span>
                </div>
                <p className={`text-base font-medium ${isOverdue ? 'text-[#dc2626]' : 'text-[#0a0a0a]'}`}>
                  {formatLocalDate(task.dueDate, 'EEEE, MMMM d, yyyy')}
                  {isOverdue && (
                    <span className="ml-2 text-sm font-normal text-[#dc2626]">
                      (Overdue)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Attachment with Management */}
          {task.fileAttachment && (
            <div className="bg-[#f8fafc] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                  Attachment
                </h3>
                {canManageAttachments && (
                  <div className="flex items-center gap-2">
                    {/* ✅ Replace/Upload button */}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={isUploading}
                      />
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#0a0a0a] bg-white border border-[#eef2f6] rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <FaUpload className="w-3 h-3" />
                        {isUploading ? 'Uploading...' : 'Replace'}
                      </span>
                    </label>
                    {/* ✅ Delete button */}
                    <button
                      onClick={handleDeleteAttachment}
                      disabled={isDeletingAttachment}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <FaTrash className="w-3 h-3" />
                      {isDeletingAttachment ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                )}
              </div>
              {renderFilePreview()}
            </div>
          )}

          {/* ✅ Show upload option when no attachment */}
          {!task.fileAttachment && canManageAttachments && (
            <div className="bg-[#f8fafc] rounded-xl p-6 border-2 border-dashed border-[#e2e8f0]">
              <div className="flex flex-col items-center justify-center py-4">
                <FaUpload className="w-8 h-8 text-[#94a3b8] mb-2" />
                <p className="text-sm text-[#64748b]">No attachment</p>
                <label className="mt-2 cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#0a0a0a] rounded-lg hover:bg-[#1a1a1a] transition-colors cursor-pointer">
                    <FaUpload className="w-4 h-4" />
                    {isUploading ? 'Uploading...' : 'Upload Attachment'}
                  </span>
                </label>
                <p className="text-xs text-[#94a3b8] mt-2">PDF, JPG, PNG • Max 5MB</p>
              </div>
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