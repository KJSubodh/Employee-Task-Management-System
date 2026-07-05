import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { createTask, updateTask } from '../../store/slices/taskSlice';
import { fetchEmployees } from '../../store/slices/employeeSlice';
import { FaTimes, FaPaperclip, FaUpload } from 'react-icons/fa';

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  description: yup.string(),
  priority: yup.string().oneOf(['low', 'medium', 'high']).required('Priority is required'),
  status: yup.string().oneOf(['pending', 'in_progress', 'completed']),
  startDate: yup.date().required('Start date is required'),
  dueDate: yup.date()
    .required('Due date is required')
    .min(yup.ref('startDate'), 'Due date must be after start date'),
  assignedToId: yup.string().required('Please select an employee')
});

const TaskForm = ({ task, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { employees } = useSelector((state) => state.employees);
  const isEdit = !!task;
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      dispatch(fetchEmployees({ limit: 100 }));
    }
  }, [dispatch, user]);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'medium',
      status: task?.status || 'pending',
      startDate: task?.startDate ? new Date(task.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      assignedToId: task?.assignedToId || ''
    }
  });

  const onSubmit = async (data) => {
    // FIXED: previously this built a FormData object here AND taskSlice's
    // createTask/updateTask thunks tried to build ANOTHER FormData from
    // it via Object.keys(taskData). Object.keys() on a FormData instance
    // always returns [], so that second (real) FormData ended up
    // completely empty regardless of what was actually filled in - every
    // field showed up as "required" on the backend no matter what.
    //
    // Fix: pass the plain data object (+ file) straight through. The
    // thunks in taskSlice.js are the ONLY place FormData gets constructed.
    // yup.date() coerces startDate/dueDate into real Date objects, so we
    // convert them back to ISO strings here before sending - the backend
    // validator requires isISO8601().
    const payload = {
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      dueDate: new Date(data.dueDate).toISOString(),
      ...(file ? { fileAttachment: file } : {})
    };

    if (isEdit) {
      await dispatch(updateTask({ id: task.id, data: payload }));
    } else {
      await dispatch(createTask(payload));
    }
    onSuccess();
    onClose();
  };

  const startDate = watch('startDate');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0a]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eef2f6] sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-lg font-semibold text-[#0a0a0a]">
            {isEdit ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#f1f5f9] transition-colors text-[#94a3b8] hover:text-[#0a0a0a]"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="label-field text-sm font-medium text-[#0a0a0a]">
              Title <span className="text-[#dc2626]">*</span>
            </label>
            <input
              type="text"
              {...register('title')}
              className={`input-field ${errors.title ? 'border-[#dc2626] focus:ring-[#dc2626]/10' : ''}`}
              placeholder="Enter task title"
            />
            {errors.title && (
              <p className="text-[#dc2626] text-xs mt-1.5">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="label-field text-sm font-medium text-[#0a0a0a]">Description</label>
            <textarea
              {...register('description')}
              className="input-field resize-none"
              rows="3"
              placeholder="Enter task description (optional)"
            />
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field text-sm font-medium text-[#0a0a0a]">
                Priority <span className="text-[#dc2626]">*</span>
              </label>
              <select
                {...register('priority')}
                className={`input-field ${errors.priority ? 'border-[#dc2626] focus:ring-[#dc2626]/10' : ''}`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              {errors.priority && (
                <p className="text-[#dc2626] text-xs mt-1.5">{errors.priority.message}</p>
              )}
            </div>
            <div>
              <label className="label-field text-sm font-medium text-[#0a0a0a]">Status</label>
              <select
                {...register('status')}
                className="input-field"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field text-sm font-medium text-[#0a0a0a]">
                Start Date <span className="text-[#dc2626]">*</span>
              </label>
              <input
                type="date"
                {...register('startDate')}
                className={`input-field ${errors.startDate ? 'border-[#dc2626] focus:ring-[#dc2626]/10' : ''}`}
              />
              {errors.startDate && (
                <p className="text-[#dc2626] text-xs mt-1.5">{errors.startDate.message}</p>
              )}
            </div>
            <div>
              <label className="label-field text-sm font-medium text-[#0a0a0a]">
                Due Date <span className="text-[#dc2626]">*</span>
              </label>
              <input
                type="date"
                {...register('dueDate')}
                className={`input-field ${errors.dueDate ? 'border-[#dc2626] focus:ring-[#dc2626]/10' : ''}`}
                min={startDate}
              />
              {errors.dueDate && (
                <p className="text-[#dc2626] text-xs mt-1.5">{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          {/* Assign To */}
          <div>
            <label className="label-field text-sm font-medium text-[#0a0a0a]">
              Assign To <span className="text-[#dc2626]">*</span>
            </label>
            <select
              {...register('assignedToId')}
              className={`input-field ${errors.assignedToId ? 'border-[#dc2626] focus:ring-[#dc2626]/10' : ''}`}
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.email})
                </option>
              ))}
            </select>
            {errors.assignedToId && (
              <p className="text-[#dc2626] text-xs mt-1.5">{errors.assignedToId.message}</p>
            )}
          </div>

          {/* File Upload */}
          <div>
            <label className="label-field text-sm font-medium text-[#0a0a0a]">
              Attachment
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                id="file-upload"
              />
              <div className="flex items-center gap-3 p-3 bg-[#f8fafc] border-2 border-dashed border-[#e2e8f0] rounded-lg hover:border-[#0a0a0a]/30 transition-colors">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <FaUpload className="w-4 h-4 text-[#64748b]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0a0a0a] truncate">
                    {fileName || 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-[#94a3b8]">PDF, JPG, PNG • Max 5MB</p>
                </div>
                {fileName && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setFileName('');
                      document.getElementById('file-upload').value = '';
                    }}
                    className="p-1 rounded-lg hover:bg-[#f1f5f9] text-[#94a3b8] hover:text-[#dc2626] transition-colors z-20 relative"
                  >
                    <FaTimes className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            {task?.fileAttachment && !file && (
              <p className="text-xs text-[#64748b] mt-1.5">
                Current file: <span className="font-medium">{task.fileAttachment}</span>
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-[#eef2f6]">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary w-full sm:w-auto px-6 py-2.5 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full sm:w-auto px-6 py-2.5 text-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  Saving...
                </>
              ) : (
                isEdit ? 'Update Task' : 'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;