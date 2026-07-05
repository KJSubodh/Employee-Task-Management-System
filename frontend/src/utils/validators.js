/**
 * Email validation
 */
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Password validation
 * Must be at least 8 characters, contain uppercase, lowercase, and number
 */
export const validatePassword = (password) => {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return {
    isValid: hasMinLength && hasUppercase && hasLowercase && hasNumber,
    errors: {
      minLength: !hasMinLength,
      uppercase: !hasUppercase,
      lowercase: !hasLowercase,
      number: !hasNumber
    }
  };
};

/**
 * Task date validation
 */
export const validateTaskDates = (startDate, dueDate) => {
  const start = new Date(startDate);
  const due = new Date(dueDate);
  
  return {
    isValid: due >= start,
    message: due < start ? 'Due date must not be earlier than start date' : null
  };
};

/**
 * Phone number validation (optional)
 */
export const validatePhone = (phone) => {
  const re = /^[0-9]{10}$/;
  return re.test(phone);
};

/**
 * URL validation
 */
export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * File validation
 * Check file type and size
 */
export const validateFile = (file, allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'], maxSize = 5 * 1024 * 1024) => {
  const errors = [];
  
  if (!file) {
    errors.push('No file selected');
    return { isValid: false, errors };
  }
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type not allowed. Allowed: ${allowedTypes.join(', ')}`);
  }
  
  if (file.size > maxSize) {
    errors.push(`File size too large. Max: ${maxSize / (1024 * 1024)}MB`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Required field validation
 */
export const validateRequired = (value, fieldName) => {
  if (!value || value.trim() === '') {
    return { isValid: false, message: `${fieldName} is required` };
  }
  return { isValid: true };
};

/**
 * Min/Max length validation
 */
export const validateLength = (value, min, max, fieldName) => {
  if (value.length < min) {
    return { isValid: false, message: `${fieldName} must be at least ${min} characters` };
  }
  if (value.length > max) {
    return { isValid: false, message: `${fieldName} must be at most ${max} characters` };
  }
  return { isValid: true };
};

/**
 * Date validation
 */
export const validateDate = (date, fieldName) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return { isValid: false, message: `${fieldName} is not a valid date` };
  }
  return { isValid: true };
};

/**
 * Future date validation
 */
export const validateFutureDate = (date, fieldName) => {
  const d = new Date(date);
  const now = new Date();
  if (d < now) {
    return { isValid: false, message: `${fieldName} must be in the future` };
  }
  return { isValid: true };
};

/**
 * Past date validation
 */
export const validatePastDate = (date, fieldName) => {
  const d = new Date(date);
  const now = new Date();
  if (d > now) {
    return { isValid: false, message: `${fieldName} must be in the past` };
  }
  return { isValid: true };
};

/**
 * Validate entire form data
 */
export const validateForm = (data, rules) => {
  const errors = {};
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];
    
    for (const rule of fieldRules) {
      const result = rule(value);
      if (!result.isValid) {
        errors[field] = result.message;
        break;
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  validateEmail,
  validatePassword,
  validateTaskDates,
  validatePhone,
  validateUrl,
  validateFile,
  validateRequired,
  validateLength,
  validateDate,
  validateFutureDate,
  validatePastDate,
  validateForm
};