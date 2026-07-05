const sequelize = require('../config/database');
const User = require('./User');
const Task = require('./Task');
const Notification = require('./Notification');

// Associations
User.hasMany(Task, { foreignKey: 'assignedToId', as: 'assignedTasks' });
User.hasMany(Task, { foreignKey: 'assignedById', as: 'createdTasks' });
Task.belongsTo(User, { foreignKey: 'assignedToId', as: 'assignedTo' });
Task.belongsTo(User, { foreignKey: 'assignedById', as: 'assignedBy' });

User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

Task.hasMany(Notification, { foreignKey: 'taskId' });
Notification.belongsTo(Task, { foreignKey: 'taskId' });

module.exports = {
  sequelize,
  User,
  Task,
  Notification
};