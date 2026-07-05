const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password) => {
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

const validateTaskDates = (startDate, dueDate) => {
  const start = new Date(startDate);
  const due = new Date(dueDate);
  
  return {
    isValid: due >= start,
    message: due < start ? 'Due date must not be earlier than start date' : null
  };
};

module.exports = {
  validateEmail,
  validatePassword,
  validateTaskDates
};