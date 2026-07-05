const UserDao = require('../daos/userDao');
const BaseRepository = require('./baseRepository');
const { Op } = require('sequelize');

/**
 * User Repository
 * Provides business-specific operations for User entity
 */
class UserRepository extends BaseRepository {
  constructor() {
    super(UserDao);
    this.userDao = UserDao;
  }

  /**
   * Find user by email
   */
  async findByEmail(email) {
    return await this.userDao.findByEmail(email);
  }

  /**
   * Find user by email with password (for authentication)
   */
  async findByEmailWithPassword(email) {
    return await this.userDao.findByEmailWithPassword(email);
  }

  /**
   * Get all employees with pagination and filters
   */
  async getEmployees({
    page = 1,
    limit = 10,
    search = '',
    sortBy = 'fullName',
    sortOrder = 'ASC',
    isActive = null
  }) {
    const { Task } = require('../models');
    
    const result = await this.userDao.findWithFilters({
      role: 'employee',
      search,
      isActive,
      page,
      limit,
      sortBy,
      sortOrder,
      include: [
        {
          model: Task,
          as: 'assignedTasks',
          attributes: ['id', 'title', 'status', 'priority', 'dueDate']
        }
      ]
    });

    // Enhance with task statistics
    const employees = result.rows.map(emp => {
      const tasks = emp.assignedTasks || [];
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'completed').length;
      const pending = tasks.filter(t => t.status !== 'completed').length;
      const overdue = tasks.filter(t => 
        t.status !== 'completed' && new Date(t.dueDate) < new Date()
      ).length;

      const empData = emp.toJSON();
      delete empData.assignedTasks;

      return {
        ...empData,
        taskStats: { total, completed, pending, overdue }
      };
    });

    return {
      employees,
      total: result.count,
      page,
      totalPages: Math.ceil(result.count / limit)
    };
  }

  /**
   * Get employee by ID with task statistics
   */
  async getEmployeeById(id) {
    const { Task } = require('../models');
    
    const employee = await this.userDao.findById(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Task,
          as: 'assignedTasks',
          attributes: ['id', 'title', 'status', 'priority', 'startDate', 'dueDate']
        }
      ]
    });

    if (!employee || employee.role !== 'employee') {
      return null;
    }

    return employee;
  }

  /**
   * Create a new employee
   */
  async createEmployee(employeeData) {
    const { fullName, email, password, department, designation } = employeeData;

    // Check if email exists
    const existingUser = await this.userDao.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const employee = await this.userDao.create({
      fullName,
      email,
      password,
      role: 'employee',
      department,
      designation,
      isActive: true
    });

    return employee;
  }

  /**
   * Update employee details
   */
  async updateEmployee(id, updateData) {
    const employee = await this.userDao.findById(id);
    if (!employee || employee.role !== 'employee') {
      throw new Error('Employee not found');
    }

    const { fullName, email, department, designation, isActive } = updateData;

    // Check if email is taken by another user
    if (email && email !== employee.email) {
      const existingUser = await this.userDao.findByEmail(email);
      if (existingUser) {
        throw new Error('Email already in use');
      }
    }

    await this.userDao.update(employee, {
      fullName: fullName || employee.fullName,
      email: email || employee.email,
      department: department || employee.department,
      designation: designation || employee.designation,
      isActive: isActive !== undefined ? isActive : employee.isActive
    });

    return employee;
  }

  /**
   * Delete employee
   */
  async deleteEmployee(id) {
    const employee = await this.userDao.findById(id);
    if (!employee || employee.role !== 'employee') {
      throw new Error('Employee not found');
    }

    // Check if employee has assigned tasks
    const { Task } = require('../models');
    const taskCount = await Task.count({ where: { assignedToId: id } });
    if (taskCount > 0) {
      throw new Error('Cannot delete employee with assigned tasks. Reassign or delete tasks first.');
    }

    await this.userDao.delete(employee);
    return { message: 'Employee deleted successfully' };
  }

  /**
   * Get active employees for task assignment
   */
  async getActiveEmployees() {
    return await this.userDao.getActiveEmployees();
  }

  /**
   * Get employee task statistics
   */
  async getEmployeeTaskStats(id) {
    const employee = await this.userDao.findById(id, {
      include: [
        {
          model: require('../models').Task,
          as: 'assignedTasks',
          attributes: ['status', 'dueDate']
        }
      ]
    });

    if (!employee || employee.role !== 'employee') {
      return null;
    }

    const tasks = employee.assignedTasks || [];
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status !== 'completed').length;
    const overdue = tasks.filter(t => 
      t.status !== 'completed' && new Date(t.dueDate) < new Date()
    ).length;

    return { total, completed, pending, overdue };
  }

  /**
   * Get employees with task counts
   */
  async getEmployeesWithTaskCounts() {
    return await this.userDao.findUsersWithTaskCounts('employee');
  }

  /**
   * Search employees
   */
  async searchEmployees(query) {
    return await this.userDao.search(query, 'employee');
  }

  /**
   * Get user statistics
   */
  async getStats() {
    return await this.userDao.getStats();
  }

  /**
   * Update user password
   */
  async updatePassword(userId, hashedPassword) {
    return await this.userDao.updatePassword(userId, hashedPassword);
  }

  /**
   * Get users by role
   */
  async getByRole(role) {
    return await this.userDao.findByRole(role);
  }

  /**
   * Check if user has assigned tasks
   */
  async hasAssignedTasks(userId) {
    const { Task } = require('../models');
    const count = await Task.count({ where: { assignedToId: userId } });
    return count > 0;
  }
}

module.exports = new UserRepository();