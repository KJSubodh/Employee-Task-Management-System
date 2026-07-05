const { User } = require('../models');
const { Op } = require('sequelize');
const BaseDao = require('./baseDao');

class UserDao extends BaseDao {
  constructor() {
    super(User);
  }

  async findByEmail(email, includePassword = false) {
    const attributes = includePassword 
      ? undefined 
      : { exclude: ['password'] };
    
    return await this.model.findOne({
      where: { email },
      attributes
    });
  }

  async findByEmailWithPassword(email) {
    return await this.model.findOne({
      where: { email },
      attributes: { include: ['password'] }
    });
  }

  async findByIdWithPassword(id) {
    return await this.model.findByPk(id, {
      attributes: { include: ['password'] }
    });
  }

  async findByRole(role, options = {}) {
    const { attributes = { exclude: ['password'] }, ...rest } = options;
    return await this.model.findAll({
      where: { role },
      attributes,
      ...rest
    });
  }

  async findWithFilters({
    role = null,
    search = '',
    isActive = null,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'DESC',
    attributes = { exclude: ['password'] },
    include = []
  }) {
    const offset = (page - 1) * limit;
    const where = {};

    if (role) {
      where.role = role;
    }

    // MySQL uses LIKE instead of iLike
    if (search) {
      where[Op.or] = [
        { fullName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { department: { [Op.like]: `%${search}%` } },
        { designation: { [Op.like]: `%${search}%` } }
      ];
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive;
    }

    return await this.model.findAndCountAll({
      where,
      attributes,
      include,
      order: [[sortBy, sortOrder]],
      limit,
      offset
    });
  }

  async search(query, role = null, limit = 20) {
    const where = {
      [Op.or]: [
        { fullName: { [Op.like]: `%${query}%` } },
        { email: { [Op.like]: `%${query}%` } }
      ]
    };

    if (role) {
      where.role = role;
    }

    return await this.model.findAll({
      where,
      attributes: { exclude: ['password'] },
      limit
    });
  }

  async getStats() {
    const total = await this.model.count();
    const admins = await this.model.count({ where: { role: 'admin' } });
    const employees = await this.model.count({ where: { role: 'employee' } });
    const active = await this.model.count({ where: { isActive: true } });
    const inactive = await this.model.count({ where: { isActive: false } });

    return {
      total,
      admins,
      employees,
      active,
      inactive
    };
  }

  async findUsersWithTaskCounts(role = 'employee') {
    const { Task } = require('../models');
    
    const users = await this.model.findAll({
      where: { role },
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Task,
          as: 'assignedTasks',
          attributes: ['status']
        }
      ]
    });

    return users.map(user => {
      const tasks = user.assignedTasks || [];
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'completed').length;
      const pending = tasks.filter(t => t.status !== 'completed').length;
      
      return {
        ...user.toJSON(),
        taskStats: {
          total,
          completed,
          pending,
          completionRate: total > 0 ? (completed / total) * 100 : 0
        }
      };
    });
  }

  async getActiveEmployees() {
    return await this.model.findAll({
      where: { 
        role: 'employee',
        isActive: true
      },
      attributes: ['id', 'fullName', 'email', 'department', 'designation'],
      order: [['fullName', 'ASC']]
    });
  }

  async updatePassword(userId, hashedPassword) {
    return await this.model.update(
      { password: hashedPassword },
      { where: { id: userId } }
    );
  }

  async findByDepartment(department) {
    return await this.model.findAll({
      where: { 
        department,
        role: 'employee'
      },
      attributes: { exclude: ['password'] }
    });
  }

  async findByEmailWithTaskCount(email) {
    const { Task } = require('../models');
    
    const user = await this.model.findOne({
      where: { email },
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Task,
          as: 'assignedTasks',
          attributes: ['status']
        }
      ]
    });

    if (!user) return null;

    const tasks = user.assignedTasks || [];
    return {
      ...user.toJSON(),
      taskStats: {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        pending: tasks.filter(t => t.status !== 'completed').length
      }
    };
  }

  async batchUpdateStatus(userIds, isActive) {
    return await this.model.update(
      { isActive },
      { where: { id: userIds } }
    );
  }
}

module.exports = new UserDao();