const NotificationDao = require('../daos/notificationDao');
const BaseRepository = require('./baseRepository');

/**
 * Notification Repository
 * Provides business-specific operations for Notification entity
 */
class NotificationRepository extends BaseRepository {
  constructor() {
    super(NotificationDao);
    this.notificationDao = NotificationDao;
  }

  /**
   * Create a notification
   */
  async createNotification(userId, taskId, message, type) {
    return await this.notificationDao.create({
      userId,
      taskId,
      message,
      type,
      isRead: false
    });
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, { isRead = null, limit = 50, offset = 0 } = {}) {
    const { Task } = require('../models');

    const result = await this.notificationDao.findByUser(userId, {
      isRead,
      limit,
      offset,
      include: [
        {
          model: Task,
          attributes: ['id', 'title', 'status', 'priority', 'dueDate']
        }
      ]
    });

    return {
      notifications: result.rows,
      total: result.count,
      limit,
      offset
    };
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId) {
    return await this.notificationDao.getUnreadCount(userId);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    const result = await this.notificationDao.markAsRead(notificationId, userId);
    if (result[0] === 0) {
      throw new Error('Notification not found');
    }
    return { message: 'Notification marked as read' };
  }

  /**
   * Mark all as read
   */
  async markAllAsRead(userId) {
    const count = await this.notificationDao.markAllAsRead(userId);
    return { 
      message: 'All notifications marked as read',
      count 
    };
  }

  /**
   * Delete old notifications
   */
  async deleteOldNotifications(daysOld = 30) {
    const count = await this.notificationDao.deleteOld(daysOld);
    return { 
      message: `Deleted ${count} old notifications`,
      count 
    };
  }

  /**
   * Get notifications by type
   */
  async getByType(userId, type) {
    const { Task } = require('../models');

    return await this.notificationDao.findByType(userId, type, [
      {
        model: Task,
        attributes: ['id', 'title']
      }
    ]);
  }

  /**
   * Check if notification exists for task
   */
  async existsForTask(taskId, type = null) {
    return await this.notificationDao.existsForTask(taskId, type);
  }

  /**
   * Get recent notifications
   */
  async getRecent(userId, limit = 5) {
    const { Task } = require('../models');

    return await this.notificationDao.getRecent(userId, limit, [
      {
        model: Task,
        attributes: ['id', 'title']
      }
    ]);
  }

  /**
   * Get notification statistics
   */
  async getStats(userId) {
    return await this.notificationDao.getStats(userId);
  }

  /**
   * Bulk delete notifications
   */
  async bulkDelete(notificationIds, userId) {
    const count = await this.notificationDao.bulkDelete(notificationIds, userId);
    return { 
      message: `Deleted ${count} notifications`,
      count 
    };
  }

  /**
   * Create task assignment notification
   */
  async createTaskAssignedNotification(task) {
    const message = `Task "${task.title}" has been assigned to you by ${task.assignedBy?.fullName || 'Admin'}`;
    
    return await this.createNotification(
      task.assignedToId,
      task.id,
      message,
      'task_assigned'
    );
  }

  /**
   * Create task completion notification
   */
  async createTaskCompletedNotification(task) {
    const message = `Task "${task.title}" has been marked as completed`;
    
    return await this.createNotification(
      task.assignedToId,
      task.id,
      message,
      'task_completed'
    );
  }

  /**
   * Create task due notification
   */
  async createTaskDueNotification(task, daysOverdue = 0) {
    let message;
    if (daysOverdue > 0) {
      message = `Task "${task.title}" is overdue by ${daysOverdue} day${daysOverdue > 1 ? 's' : ''}!`;
    } else {
      message = `Task "${task.title}" is due within 1 day!`;
    }
    
    return await this.createNotification(
      task.assignedToId,
      task.id,
      message,
      'task_due'
    );
  }
}

module.exports = new NotificationRepository();