import React from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { createEmployee, updateEmployee } from '../../store/slices/employeeSlice';
import { FaTimes, FaUser, FaEnvelope, FaLock, FaBuilding, FaBriefcase, FaUserCheck } from 'react-icons/fa';

const schema = yup.object().shape({
  fullName: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string()
    .when('isEdit', {
      is: false,
      // FIXED: yup v1's .when() requires then/otherwise to be FUNCTIONS
      // that receive and return a schema, not bare schema instances.
      // The old (schema) form is yup v0.32 syntax and throws
      // "branch is not a function" on yup v1.
      then: (schema) => schema
        .min(8, 'Password must be at least 8 characters')
        .matches(/[A-Z]/, 'Password must contain an uppercase letter')
        .matches(/[a-z]/, 'Password must contain a lowercase letter')
        .matches(/\d/, 'Password must contain a number')
        .required('Password is required'),
      otherwise: (schema) => schema
    }),
  department: yup.string(),
  designation: yup.string(),
  isActive: yup.boolean()
});

const EmployeeForm = ({ employee, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const isEdit = !!employee;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: employee?.fullName || '',
      email: employee?.email || '',
      department: employee?.department || '',
      designation: employee?.designation || '',
      isActive: employee?.isActive ?? true,
      isEdit
    }
  });

  const onSubmit = async (data) => {
    const { isEdit, ...formData } = data;
    
    if (isEdit) {
      await dispatch(updateEmployee({ id: employee.id, data: formData }));
    } else {
      await dispatch(createEmployee(formData));
    }
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0a]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-[#eef2f6] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0a0a0a] flex items-center justify-center text-white">
              {isEdit ? <FaUserCheck className="w-4 h-4" /> : <FaUser className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#0a0a0a]">
                {isEdit ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <p className="text-xs text-[#94a3b8]">
                {isEdit ? 'Update employee information' : 'Add a new team member'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#f1f5f9] transition-colors text-[#94a3b8] hover:text-[#0a0a0a]"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-[#0a0a0a] mb-1.5">
              Full Name <span className="text-[#dc2626]">*</span>
            </label>
            <div className="relative">
              <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] w-4 h-4" />
              <input
                type="text"
                {...register('fullName')}
                className={`w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                  errors.fullName 
                    ? 'border-[#dc2626] focus:ring-[#dc2626]/10 focus:border-[#dc2626]' 
                    : 'border-[#eef2f6] focus:ring-[#0a0a0a]/5 focus:border-[#0a0a0a]/20 focus:bg-white'
                }`}
                placeholder="Enter full name"
              />
            </div>
            {errors.fullName && (
              <p className="text-[#dc2626] text-xs mt-1.5">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#0a0a0a] mb-1.5">
              Email Address <span className="text-[#dc2626]">*</span>
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] w-4 h-4" />
              <input
                type="email"
                {...register('email')}
                className={`w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                  errors.email 
                    ? 'border-[#dc2626] focus:ring-[#dc2626]/10 focus:border-[#dc2626]' 
                    : 'border-[#eef2f6] focus:ring-[#0a0a0a]/5 focus:border-[#0a0a0a]/20 focus:bg-white'
                }`}
                placeholder="john@example.com"
              />
            </div>
            {errors.email && (
              <p className="text-[#dc2626] text-xs mt-1.5">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-[#0a0a0a] mb-1.5">
                Password <span className="text-[#dc2626]">*</span>
              </label>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] w-4 h-4" />
                <input
                  type="password"
                  {...register('password')}
                  className={`w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                    errors.password 
                      ? 'border-[#dc2626] focus:ring-[#dc2626]/10 focus:border-[#dc2626]' 
                      : 'border-[#eef2f6] focus:ring-[#0a0a0a]/5 focus:border-[#0a0a0a]/20 focus:bg-white'
                  }`}
                  placeholder="Create a strong password"
                />
              </div>
              {errors.password && (
                <p className="text-[#dc2626] text-xs mt-1.5">{errors.password.message}</p>
              )}
              <p className="text-xs text-[#94a3b8] mt-1.5">
                Must be 8+ chars with uppercase, lowercase & number
              </p>
            </div>
          )}

          {/* Department & Designation */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0a0a0a] mb-1.5">
                Department
              </label>
              <div className="relative">
                <FaBuilding className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] w-4 h-4" />
                <input
                  type="text"
                  {...register('department')}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-[#eef2f6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/5 focus:border-[#0a0a0a]/20 focus:bg-white transition-all duration-200 text-sm"
                  placeholder="Engineering"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0a0a0a] mb-1.5">
                Designation
              </label>
              <div className="relative">
                <FaBriefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] w-4 h-4" />
                <input
                  type="text"
                  {...register('designation')}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-[#eef2f6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/5 focus:border-[#0a0a0a]/20 focus:bg-white transition-all duration-200 text-sm"
                  placeholder="Senior Developer"
                />
              </div>
            </div>
          </div>

          {/* Status (Edit only) */}
          {isEdit && (
            <div>
              <label className="block text-sm font-medium text-[#0a0a0a] mb-1.5">
                Status
              </label>
              <div className="relative">
                <FaUserCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] w-4 h-4" />
                <select
                  {...register('isActive')}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-[#eef2f6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/5 focus:border-[#0a0a0a]/20 focus:bg-white transition-all duration-200 text-sm appearance-none"
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-[#eef2f6]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-[#64748b] hover:text-[#0a0a0a] hover:bg-[#f1f5f9] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-medium text-white bg-[#0a0a0a] hover:bg-[#1a1a1a] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  Saving...
                </>
              ) : (
                isEdit ? 'Update Employee' : 'Create Employee'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;