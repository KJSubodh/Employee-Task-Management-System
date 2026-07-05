const bcrypt = require('bcryptjs'); // FIXED: needed to hash new password before storing
const UserRepository = require('../repositories/userRepository');
const { generateToken } = require('../config/jwt');
const { validatePassword } = require('../utils/validation');

class AuthService {
  constructor() {
    this.userRepository = UserRepository;
  }

  async register(userData) {
    const { fullName, email, password, role, department, designation } = userData;

    // Check if user exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      const errors = [];
      if (passwordValidation.errors.minLength) errors.push('Password must be at least 8 characters');
      if (passwordValidation.errors.uppercase) errors.push('Password must contain an uppercase letter');
      if (passwordValidation.errors.lowercase) errors.push('Password must contain a lowercase letter');
      if (passwordValidation.errors.number) errors.push('Password must contain a number');
      throw new Error(errors.join(', '));
    }

    // Create user
    // NOTE: password is stored plaintext here on purpose - User model's
    // beforeCreate hook hashes it automatically since this goes through
    // Model.create() (instance hooks fire correctly here).
    const user = await this.userRepository.create({
      fullName,
      email,
      password,
      role: role || 'employee',
      department,
      designation
    });

    // Generate token
    const token = generateToken(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      },
      token
    };
  }

  async login(email, password, rememberMe = false) {
    // Find user with password
    const user = await this.userRepository.findByEmailWithPassword(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = generateToken(user.id, user.email, user.role, rememberMe);

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      },
      token
    };
  }

  async getCurrentUser(userId) {
    // FIXED: explicitly exclude password. findById() forwards options straight
    // to Sequelize's findByPk(), which returns ALL columns (including the
    // bcrypt hash) if no attributes filter is given.
    const user = await this.userRepository.findById(userId, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await this.userRepository.findByEmailWithPassword(
      (await this.userRepository.findById(userId)).email
    );
    if (!user) {
      throw new Error('User not found');
    }

    // Verify old password
    const isPasswordValid = await user.comparePassword(oldPassword);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      const errors = [];
      if (passwordValidation.errors.minLength) errors.push('Password must be at least 8 characters');
      if (passwordValidation.errors.uppercase) errors.push('Password must contain an uppercase letter');
      if (passwordValidation.errors.lowercase) errors.push('Password must contain a lowercase letter');
      if (passwordValidation.errors.number) errors.push('Password must contain a number');
      throw new Error(errors.join(', '));
    }

    // FIXED: hash the new password before storing it.
    // userRepository.updatePassword -> userDao.updatePassword uses a static
    // Model.update({...}, { where }) call, which does NOT run the model's
    // beforeUpdate hook (that hook only fires on instance.update(), not on
    // static bulk updates unless { individualHooks: true } is passed).
    // Without hashing here, the password would be saved in PLAINTEXT and
    // the user would be locked out on next login.
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.updatePassword(userId, hashedPassword);

    return { message: 'Password changed successfully' };
  }

  async logout(userId) {
    // In JWT-based auth, logout is handled client-side
    // But we could implement a token blacklist if needed
    return { message: 'Logged out successfully' };
  }
}

module.exports = new AuthService();