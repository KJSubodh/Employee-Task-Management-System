const { Notification } = require('../models');
const { Op } = require('sequelize');
const BaseDao = require('./baseDao');

/**
 * Notification Data Access Object
 * Handles all low-level database operations for Notification model
 */
class NotificationDao extends BaseDao {
  constructor() {
    super(Notification);
  }

  /**
   * Find notifications for a user with pagination
   */
  async findByUser(userId, { isRead = null, limit = 50, offset = 0, include = [] }) {
    const where = { userId };

    if (isRead !== null && isRead !== undefined) {
      where.isRead = isRead;
    }

    return await this.model.findAndCountAll({
      where,
      include,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId) {
    return await this.model.count({
      where: { userId, isRead: false }
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    return await this.model.update(
      { isRead: true },
      { where: { id: notificationId, userId } }
    );
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    return await this.model.update(
      { isRead: true },
      { where: { userId, isRead: false } }
    );
  }

  /**
   * Delete old notifications
   */
  async deleteOld(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return await this.model.destroy({
      where: {
        createdAt: { [Op.lt]: cutoffDate },
        isRead: true
      }
    });
  }

  /**
   * Find notifications by type
   */
  async findByType(userId, type) {
    return await this.model.findAll({
      where: { userId, type },
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Check if notification exists for a task
   */
  async existsForTask(taskId, type = null) {
    const where = { taskId };
    if (type) where.type = type;

    const count = await this.model.count({ where });
    return count > 0;
  }

  /**
   * Get recent notifications for dashboard
   */
  async getRecent(userId, limit = 5) {
    return await this.model.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit
    });
  }

  /**
   * Get notification statistics
   */
  async getStats(userId) {
    const total = await this.model.count({ where: { userId } });
    const unread = await this.model.count({ where: { userId, isRead: false } });
    const read = await this.model.count({ where: { userId, isRead: true } });

    return { total, unread, read };
  }

  /**
   * Get notifications by date range
   */
  async findByDateRange(userId, startDate, endDate) {
    return await this.model.findAll({
      where: {
        userId,
        createdAt: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      },
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Bulk delete notifications
   */
  async bulkDelete(notificationIds, userId) {
    return await this.model.destroy({
      where: { 
        id: notificationIds,
        userId
      }
    });
  }
}

module.exports = new NotificationDao();