const { Task } = require('../models');
const { Op } = require('sequelize');
const BaseDao = require('./baseDao');

class TaskDao extends BaseDao {
  constructor() {
    super(Task);
  }

  async findWithFilters({
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
    assignedToId = null,
    assignedById = null,
    include = []
  }) {
    const offset = (page - 1) * limit;
    const where = {};

    if (userRole === 'employee' && userId) {
      where.assignedToId = userId;
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = assignedToId;
    if (assignedById) where.assignedById = assignedById;
    
    if (startDate) {
      where.startDate = { [Op.gte]: new Date(startDate) };
    }
    if (dueDate) {
      where.dueDate = { [Op.lte]: new Date(dueDate) };
    }

    // MySQL uses LIKE instead of iLike
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    return await this.model.findAndCountAll({
      where,
      include,
      order: [[sortBy, sortOrder]],
      limit,
      offset
    });
  }

  async findByEmployee(employeeId, status = null) {
    const where = { assignedToId: employeeId };
    if (status) where.status = status;

    return await this.model.findAll({
      where,
      order: [['dueDate', 'ASC']]
    });
  }

  async findByCreator(userId) {
    return await this.model.findAll({
      where: { assignedById: userId },
      order: [['createdAt', 'DESC']]
    });
  }

  async findDueSoon(days = 1, excludeCompleted = true) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const where = {
      dueDate: {
        [Op.between]: [now, futureDate]
      }
    };

    if (excludeCompleted) {
      where.status = { [Op.ne]: 'completed' };
    }

    return await this.model.findAll({ where });
  }

  async findOverdue(excludeCompleted = true) {
    const where = {
      dueDate: { [Op.lt]: new Date() }
    };

    if (excludeCompleted) {
      where.status = { [Op.ne]: 'completed' };
    }

    return await this.model.findAll({ where });
  }

  async getStats(userId = null) {
    const where = {};
    if (userId) where.assignedToId = userId;

    const total = await this.model.count({ where });
    const completed = await this.model.count({ 
      where: { ...where, status: 'completed' }
    });
    const pending = await this.model.count({ 
      where: { ...where, status: { [Op.in]: ['pending', 'in_progress'] } }
    });
    const overdue = await this.model.count({ 
      where: { ...where, status: 'overdue' }
    });

    return { total, completed, pending, overdue };
  }

  async countByStatus(userId = null) {
    const where = {};
    if (userId) where.assignedToId = userId;

    const counts = await this.model.findAll({
      where,
      attributes: [
        'status',
        [this.model.sequelize.fn('COUNT', this.model.sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    return counts.reduce((acc, curr) => {
      acc[curr.status] = parseInt(curr.dataValues.count);
      return acc;
    }, {});
  }

  async countByPriority(userId = null) {
    const where = {};
    if (userId) where.assignedToId = userId;

    const counts = await this.model.findAll({
      where,
      attributes: [
        'priority',
        [this.model.sequelize.fn('COUNT', this.model.sequelize.col('id')), 'count']
      ],
      group: ['priority']
    });

    return counts.reduce((acc, curr) => {
      acc[curr.priority] = parseInt(curr.dataValues.count);
      return acc;
    }, {});
  }

  async getMonthlyTrends(userId = null, months = 6) {
    const where = {};
    if (userId) where.assignedToId = userId;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const sequelize = this.model.sequelize;
    const trends = await this.model.findAll({
      where: {
        ...where,
        createdAt: { [Op.gte]: startDate }
      },
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m')],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'ASC']]
    });

    return trends.map(item => {
      const [year, month] = item.dataValues.month.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count: parseInt(item.dataValues.count)
      };
    });
  }

  async markOverdue() {
    const [affectedCount] = await this.model.update(
      { status: 'overdue' },
      {
        where: {
          status: { [Op.ne]: 'completed' },
          dueDate: { [Op.lt]: new Date() }
        }
      }
    );

    return affectedCount;
  }

  async findWithAttachments() {
    return await this.model.findAll({
      where: {
        fileAttachment: { [Op.ne]: null }
      },
      attributes: ['id', 'title', 'fileAttachment', 'createdAt']
    });
  }

  async getCompletionRate(startDate, endDate, userId = null) {
    const where = {
      createdAt: {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      }
    };

    if (userId) {
      where.assignedToId = userId;
    }

    const total = await this.model.count({ where });
    const completed = await this.model.count({
      where: { ...where, status: 'completed' }
    });

    return {
      total,
      completed,
      rate: total > 0 ? (completed / total) * 100 : 0
    };
  }

  async findUpcoming(employeeId, days = 3, limit = 10) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return await this.model.findAll({
      where: {
        assignedToId: employeeId,
        status: { [Op.ne]: 'completed' },
        dueDate: {
          [Op.between]: [new Date(), futureDate]
        }
      },
      order: [['dueDate', 'ASC']],
      limit
    });
  }

  async findByDateRange(startDate, endDate, userId = null, include = []) {
    const where = {
      dueDate: {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      }
    };

    if (userId) {
      where.assignedToId = userId;
    }

    return await this.model.findAll({
      where,
      include,
      order: [['dueDate', 'ASC']]
    });
  }

  async bulkUpdateStatus(taskIds, status) {
    return await this.model.update(
      { status },
      { where: { id: taskIds } }
    );
  }
}

module.exports = new TaskDao();