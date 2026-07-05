const TaskDao = require('../daos/taskDao');
const BaseRepository = require('./baseRepository');
const { Op } = require('sequelize');

/**
 * Task Repository
 * Provides business-specific operations for Task entity
 */
class TaskRepository extends BaseRepository {
  constructor() {
    super(TaskDao);
    this.taskDao = TaskDao;
  }

  /**
   * Get tasks with filters and pagination
   */
  async getTasks({
    userId = null,
    userRole = null,
    page = 1,
    limit = 10,
    status = null,
    priority = null,
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'DESC',
    startDate = null,
    dueDate = null,
    assignedToId = null
  }) {
    const { User } = require('../models');

    const result = await this.taskDao.findWithFilters({
      userId,
      userRole,
      page,
      limit,
      status,
      priority,
      search,
      sortBy,
      sortOrder,
      startDate,
      dueDate,
      assignedToId,
      include: [
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'fullName', 'email', 'department', 'designation']
        },
        {
          model: User,
          as: 'assignedBy',
          attributes: ['id', 'fullName', 'email']
        }
      ]
    });

    return {
      tasks: result.rows,
      total: result.count,
      page,
      totalPages: Math.ceil(result.count / limit)
    };
  }

  /**
   * Get task by ID with all associations
   */
  async getTaskById(id) {
    const { User } = require('../models');

    return await this.taskDao.findById(id, {
      include: [
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'fullName', 'email', 'department', 'designation']
        },
        {
          model: User,
          as: 'assignedBy',
          attributes: ['id', 'fullName', 'email']
        }
      ]
    });
  }

  /**
   * Create a new task
   */
  async createTask(taskData) {
    const { 
      title, 
      description, 
      priority, 
      status, 
      startDate, 
      dueDate, 
      assignedToId,
      assignedById,
      fileAttachment
    } = taskData;

    // Validate dates
    if (new Date(dueDate) < new Date(startDate)) {
      throw new Error('Due date must not be earlier than start date');
    }

    // Check if assigned employee exists
    const { User } = require('../models');
    const employee = await User.findByPk(assignedToId);
    if (!employee || employee.role !== 'employee') {
      throw new Error('Invalid assigned employee');
    }

    return await this.taskDao.create({
      title,
      description,
      priority: priority || 'medium',
      status: status || 'pending',
      startDate: new Date(startDate),
      dueDate: new Date(dueDate),
      assignedToId,
      assignedById,
      fileAttachment
    });
  }

  /**
   * Update a task
   */
  async updateTask(id, taskData, userId, userRole) {
    const task = await this.taskDao.findById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    // Check if task is completed
    if (task.status === 'completed') {
      throw new Error('Completed tasks cannot be edited');
    }

    const { 
      title, 
      description, 
      priority, 
      status, 
      startDate, 
      dueDate, 
      assignedToId,
      fileAttachment
    } = taskData;

    // FIXED: employees can only change `status` on their own task - they
    // cannot retitle, reschedule, reassign, or change priority/description.
    // Previously any field passed in taskData was accepted from any caller
    // that reached this method, relying entirely on the frontend to hide
    // those inputs (not real enforcement).
    if (userRole === 'employee') {
      if (task.assignedToId !== userId) {
        throw new Error('Unauthorized to update this task');
      }

      const attemptedOtherFieldChange =
        (title !== undefined && title !== task.title) ||
        (description !== undefined && description !== task.description) ||
        (priority !== undefined && priority !== task.priority) ||
        (startDate !== undefined && new Date(startDate).getTime() !== new Date(task.startDate).getTime()) ||
        (dueDate !== undefined && new Date(dueDate).getTime() !== new Date(task.dueDate).getTime()) ||
        (assignedToId !== undefined && assignedToId !== task.assignedToId);

      if (attemptedOtherFieldChange) {
        throw new Error('Employees can only update task status');
      }

      await task.update({
        status: status || task.status
      });

      return task;
    }

    // Admin path - full edit rights (existing behavior, unchanged)

    // Validate dates if provided
    if (startDate || dueDate) {
      const newStartDate = startDate ? new Date(startDate) : task.startDate;
      const newDueDate = dueDate ? new Date(dueDate) : task.dueDate;
      if (newDueDate < newStartDate) {
        throw new Error('Due date must not be earlier than start date');
      }
    }

    // Check assigned employee if changed
    if (assignedToId && assignedToId !== task.assignedToId) {
      const { User } = require('../models');
      const employee = await User.findByPk(assignedToId);
      if (!employee || employee.role !== 'employee') {
        throw new Error('Invalid assigned employee');
      }
    }

    // Update task
    await task.update({
      title: title || task.title,
      description: description !== undefined ? description : task.description,
      priority: priority || task.priority,
      status: status || task.status,
      startDate: startDate ? new Date(startDate) : task.startDate,
      dueDate: dueDate ? new Date(dueDate) : task.dueDate,
      assignedToId: assignedToId || task.assignedToId,
      fileAttachment: fileAttachment || task.fileAttachment
    });

    return task;
  }

  /**
   * Delete a task
   */
  async deleteTask(id, userId, userRole) {
    const task = await this.taskDao.findById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    // Authorization check
    if (userRole !== 'admin' && task.assignedById !== userId) {
      throw new Error('Unauthorized to delete this task');
    }

    await this.taskDao.delete(task);
    return { message: 'Task deleted successfully' };
  }

  /**
   * Get task statistics
   */
  async getTaskStats(userId = null, userRole = null) {
    const userIdFilter = userRole === 'employee' ? userId : null;
    return await this.taskDao.getStats(userIdFilter);
  }

  /**
   * Mark overdue tasks
   */
  async markOverdueTasks() {
    return await this.taskDao.markOverdue();
  }

  /**
   * Get tasks by employee
   */
  async getTasksByEmployee(employeeId, status = null) {
    return await this.taskDao.findByEmployee(employeeId, status);
  }

  /**
   * Get upcoming tasks
   */
  async getUpcomingTasks(userId, days = 3) {
    return await this.taskDao.findUpcoming(userId, days);
  }

  /**
   * Search tasks
   */
  async searchTasks(query, userId = null) {
    const { User } = require('../models');

    return await this.taskDao.findWithFilters({
      search: query,
      userId,
      userRole: userId ? 'employee' : null,
      limit: 20,
      include: [
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'fullName', 'email']
        }
      ]
    });
  }

  /**
   * Get task counts by status
   */
  async getCountByStatus(userId = null) {
    return await this.taskDao.countByStatus(userId);
  }

  /**
   * Get task counts by priority
   */
  async getCountByPriority(userId = null) {
    return await this.taskDao.countByPriority(userId);
  }

  /**
   * Get monthly trends
   */
  async getMonthlyTrends(userId = null, months = 6) {
    return await this.taskDao.getMonthlyTrends(userId, months);
  }

  /**
   * Get tasks with file attachments
   */
  async getTasksWithAttachments() {
    return await this.taskDao.findWithAttachments();
  }

  /**
   * Get completion rate
   */
  async getCompletionRate(startDate, endDate, userId = null) {
    return await this.taskDao.getCompletionRate(startDate, endDate, userId);
  }

  /**
   * Get tasks by date range
   */
  async getTasksByDateRange(startDate, endDate, userId = null) {
    const { User } = require('../models');

    return await this.taskDao.findByDateRange(startDate, endDate, userId, [
      {
        model: User,
        as: 'assignedTo',
        attributes: ['id', 'fullName']
      }
    ]);
  }

  /**
   * Bulk update task status
   */
  async bulkUpdateStatus(taskIds, status) {
    return await this.taskDao.bulkUpdateStatus(taskIds, status);
  }

  /**
   * Get task by ID with validation
   */
  async getTaskByIdWithValidation(id, userId, userRole) {
    const task = await this.getTaskById(id);
    
    if (!task) {
      throw new Error('Task not found');
    }

    // Check authorization
    if (userRole === 'employee' && task.assignedToId !== userId) {
      throw new Error('Unauthorized to view this task');
    }

    return task;
  }

  /**
   * Get tasks due soon
   */
  async getDueSoonTasks(days = 1) {
    const { User } = require('../models');

    return await this.taskDao.findDueSoon(days, [
      {
        model: User,
        as: 'assignedTo',
        attributes: ['id', 'fullName', 'email']
      }
    ]);
  }

  /**
   * Get overdue tasks
   */
  async getOverdueTasks() {
    const { User } = require('../models');

    return await this.taskDao.findOverdue([
      {
        model: User,
        as: 'assignedTo',
        attributes: ['id', 'fullName', 'email']
      }
    ]);
  }
}

module.exports = new TaskRepository();