const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'overdue'),
    defaultValue: 'pending'
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  fileAttachment: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  assignedToId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  assignedById: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  validate: {
    dueDateNotBeforeStartDate() {
      if (this.dueDate && this.startDate && this.dueDate < this.startDate) {
        throw new Error('Due date must not be earlier than start date');
      }
    }
  }
});

module.exports = Task;