const nodemailer = require('nodemailer');
const { Notification, Task, User } = require('../models');
const { Op } = require('sequelize');
const cron = require('node-cron');

class NotificationService {
  constructor() {
    this.transporter = null;
    this.setupTransporter();
    this.setupCronJobs();
  }

  setupTransporter() {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    } else {
      console.warn('Email credentials not configured. Email notifications disabled.');
    }
  }

  setupCronJobs() {
    // Check for due tasks every day at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
      console.log('Running daily due task check...');
      await this.checkAndNotifyDueTasks();
    });

    // Check for overdue tasks every 6 hours
    cron.schedule('0 */6 * * *', async () => {
      console.log('Running overdue task check...');
      await this.checkAndNotifyOverdueTasks();
    });
  }

  async createNotification(userId, taskId, message, type) {
    try {
      const notification = await Notification.create({
        message,
        type,
        userId,
        taskId,
        isRead: false
      });

      // Send real-time notification via WebSocket if available
      // This would be implemented with Socket.io or similar
      // this.sendRealTimeNotification(userId, notification);

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async createTaskAssignedNotification(taskId) {
    const task = await Task.findByPk(taskId, {
      include: [
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'fullName', 'email']
        },
        {
          model: User,
          as: 'assignedBy',
          attributes: ['fullName', 'email']
        }
      ]
    });

    if (!task) {
      throw new Error('Task not found');
    }

    const message = `Task "${task.title}" has been assigned to you by ${task.assignedBy?.fullName || 'Admin'}`;
    
    // Create in-app notification
    await this.createNotification(
      task.assignedToId,
      task.id,
      message,
      'task_assigned'
    );

    // Send email notification
    if (task.assignedTo?.email) {
      await this.sendEmail(
        task.assignedTo.email,
        'New Task Assigned',
        `You have been assigned a new task:\n\nTitle: ${task.title}\nDescription: ${task.description || 'No description'}\nPriority: ${task.priority}\nDue Date: ${new Date(task.dueDate).toLocaleDateString()}\n\nAssigned By: ${task.assignedBy?.fullName || 'Admin'}`,
        `<h3>New Task Assigned</h3>
         <p><strong>Title:</strong> ${task.title}</p>
         <p><strong>Description:</strong> ${task.description || 'No description'}</p>
         <p><strong>Priority:</strong> ${task.priority}</p>
         <p><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
         <p><strong>Assigned By:</strong> ${task.assignedBy?.fullName || 'Admin'}</p>`
      );
    }
  }

  async createTaskCompletedNotification(taskId) {
    const task = await Task.findByPk(taskId, {
      include: [
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'fullName', 'email']
        }
      ]
    });

    if (!task) {
      throw new Error('Task not found');
    }

    const message = `Task "${task.title}" has been marked as completed`;
    
    await this.createNotification(
      task.assignedToId,
      task.id,
      message,
      'task_completed'
    );

    if (task.assignedTo?.email) {
      await this.sendEmail(
        task.assignedTo.email,
        'Task Completed',
        `Your task "${task.title}" has been completed.\n\nGood work! 🎉`,
        `<h3>Task Completed 🎉</h3>
         <p><strong>Task:</strong> ${task.title}</p>
         <p><strong>Description:</strong> ${task.description || 'No description'}</p>
         <p>Great job on completing this task!</p>`
      );
    }
  }

  async checkAndNotifyDueTasks() {
    const oneDayFromNow = new Date();
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

    const dueTasks = await Task.findAll({
      where: {
        status: { [Op.ne]: 'completed' },
        dueDate: {
          [Op.between]: [new Date(), oneDayFromNow]
        }
      },
      include: [
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'email', 'fullName']
        }
      ]
    });

    for (const task of dueTasks) {
      const message = `Task "${task.title}" is due within 1 day! (Due: ${new Date(task.dueDate).toLocaleDateString()})`;
      
      await this.createNotification(
        task.assignedToId,
        task.id,
        message,
        'task_due'
      );

      if (task.assignedTo?.email) {
        await this.sendEmail(
          task.assignedTo.email,
          'Task Due Tomorrow',
          `Your task "${task.title}" is due tomorrow!\n\nDue Date: ${new Date(task.dueDate).toLocaleDateString()}\nPriority: ${task.priority}\n\nPlease complete it on time.`,
          `<h3>Task Due Tomorrow ⚠️</h3>
           <p><strong>Task:</strong> ${task.title}</p>
           <p><strong>Description:</strong> ${task.description || 'No description'}</p>
           <p><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
           <p><strong>Priority:</strong> ${task.priority}</p>
           <p style="color: orange;">Please complete this task on time.</p>`
        );
      }
    }

    return dueTasks.length;
  }

  async checkAndNotifyOverdueTasks() {
    const overdueTasks = await Task.findAll({
      where: {
        status: { [Op.ne]: 'completed' },
        dueDate: { [Op.lt]: new Date() }
      },
      include: [
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'email', 'fullName']
        }
      ]
    });

    for (const task of overdueTasks) {
      const daysOverdue = Math.ceil((new Date() - new Date(task.dueDate)) / (1000 * 60 * 60 * 24));
      const message = `Task "${task.title}" is overdue by ${daysOverdue} day${daysOverdue > 1 ? 's' : ''}!`;

      // Only create notification if not already notified (check if notification exists)
      const existingNotification = await Notification.findOne({
        where: {
          taskId: task.id,
          type: 'task_due',
          message: { [Op.like]: `%overdue%` }
        }
      });

      if (!existingNotification) {
        await this.createNotification(
          task.assignedToId,
          task.id,
          message,
          'task_due'
        );

        if (task.assignedTo?.email) {
          await this.sendEmail(
            task.assignedTo.email,
            `Task Overdue - ${daysOverdue} Days Late`,
            `Your task "${task.title}" is overdue by ${daysOverdue} day${daysOverdue > 1 ? 's' : ''}!\n\nOriginal Due Date: ${new Date(task.dueDate).toLocaleDateString()}\nPriority: ${task.priority}\n\nPlease complete this task urgently.`,
            `<h3>Task Overdue! 🔴</h3>
             <p><strong>Task:</strong> ${task.title}</p>
             <p><strong>Description:</strong> ${task.description || 'No description'}</p>
             <p><strong>Original Due Date:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
             <p><strong>Overdue By:</strong> ${daysOverdue} day${daysOverdue > 1 ? 's' : ''}</p>
             <p><strong>Priority:</strong> ${task.priority}</p>
             <p style="color: red;">Please complete this task as soon as possible!</p>`
          );
        }
      }
    }

    return overdueTasks.length;
  }

  async getNotifications(userId, isRead = null) {
    const where = { userId };
    if (isRead !== null) {
      where.isRead = isRead;
    }

    const notifications = await Notification.findAll({
      where,
      include: [
        {
          model: Task,
          attributes: ['id', 'title', 'status', 'priority', 'dueDate']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return notifications;
  }

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      where: { id: notificationId, userId }
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await notification.update({ isRead: true });
    return notification;
  }

  async markAllAsRead(userId) {
    await Notification.update(
      { isRead: true },
      { where: { userId, isRead: false } }
    );

    return { message: 'All notifications marked as read' };
  }

  async getUnreadCount(userId) {
    const count = await Notification.count({
      where: { userId, isRead: false }
    });

    return { count };
  }

  async sendEmail(to, subject, text, html) {
    if (!this.transporter) {
      console.log('Email not sent (transporter not configured):', { to, subject });
      return;
    }

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html
      });
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error('Email sending failed:', error);
      // Don't throw error to prevent disruption
    }
  }

  async sendBulkEmail(recipients, subject, text, html) {
    if (!this.transporter) {
      console.log('Bulk email not sent (transporter not configured)');
      return;
    }

    const failed = [];
    const succeeded = [];

    for (const recipient of recipients) {
      try {
        await this.transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: recipient,
          subject,
          text,
          html
        });
        succeeded.push(recipient);
      } catch (error) {
        console.error(`Failed to send email to ${recipient}:`, error);
        failed.push(recipient);
      }
    }

    return { succeeded, failed };
  }
}

module.exports = new NotificationService();