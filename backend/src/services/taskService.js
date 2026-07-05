const TaskRepository = require('../repositories/taskRepository');
const UserRepository = require('../repositories/userRepository');
const NotificationRepository = require('../repositories/notificationRepository');
const notificationService = require('./notificationService'); // FIXED: was destructured { sendEmailNotification }, which doesn't exist on this export

class TaskService {
  constructor() {
    this.taskRepository = TaskRepository;
    this.userRepository = UserRepository;
    this.notificationRepository = NotificationRepository;
  }

  async getTasks(params) {
    return await this.taskRepository.getTasks(params);
  }

  async getTaskById(id, userId, userRole) {
    return await this.taskRepository.getTaskByIdWithValidation(id, userId, userRole);
  }

  async createTask(taskData, userId, file) {
    const { assignedToId } = taskData;

    // Check if assigned employee exists and is active
    const employee = await this.userRepository.findById(assignedToId);
    if (!employee || employee.role !== 'employee' || !employee.isActive) {
      throw new Error('Invalid assigned employee');
    }

    // Create task
    const task = await this.taskRepository.createTask({
      ...taskData,
      assignedById: userId,
      fileAttachment: file ? file.filename : null
    });

    // Create notification
    await this.notificationRepository.createTaskAssignedNotification(task);

    // Send email notification
    // FIXED: sendEmailNotification -> notificationService.sendEmail
    await notificationService.sendEmail(
      employee.email,
      'New Task Assigned',
      `You have been assigned a new task: ${taskData.title}`,
      `<h3>New Task Assigned</h3>
       <p><strong>Title:</strong> ${taskData.title}</p>
       <p><strong>Due Date:</strong> ${new Date(taskData.dueDate).toLocaleDateString()}</p>`
    );

    return task;
  }

  async updateTask(id, taskData, userId, userRole, file) {
    const { assignedToId, status } = taskData;
    const isCompleting = status === 'completed';

    // Update task
    const updatedTask = await this.taskRepository.updateTask(id, {
      ...taskData,
      fileAttachment: file ? file.filename : null
    }, userId, userRole);

    // If task is marked as completed
    if (isCompleting && updatedTask.status === 'completed') {
      await this.notificationRepository.createTaskCompletedNotification(updatedTask);
      
      const assignedUser = await this.userRepository.findById(updatedTask.assignedToId);
      if (assignedUser) {
        // FIXED: sendEmailNotification -> notificationService.sendEmail
        await notificationService.sendEmail(
          assignedUser.email,
          'Task Completed',
          `Your task "${updatedTask.title}" has been completed`,
          `<h3>Task Completed 🎉</h3>
           <p><strong>Task:</strong> ${updatedTask.title}</p>`
        );
      }
    }

    // If task is reassigned
    if (assignedToId && assignedToId !== updatedTask.assignedToId) {
      await this.notificationRepository.createTaskAssignedNotification(updatedTask);
      
      const newAssignee = await this.userRepository.findById(assignedToId);
      if (newAssignee) {
        // FIXED: sendEmailNotification -> notificationService.sendEmail
        await notificationService.sendEmail(
          newAssignee.email,
          'Task Reassigned',
          `Task "${updatedTask.title}" has been reassigned to you`,
          `<h3>Task Reassigned</h3>
           <p><strong>Task:</strong> ${updatedTask.title}</p>`
        );
      }
    }

    return updatedTask;
  }

  async deleteTask(id, userId, userRole) {
    return await this.taskRepository.deleteTask(id, userId, userRole);
  }

  async getTaskStats(userId, userRole) {
    // Auto-mark overdue tasks
    await this.taskRepository.markOverdueTasks();
    
    return await this.taskRepository.getTaskStats(userId, userRole);
  }

  async markOverdueTasks() {
    return await this.taskRepository.markOverdueTasks();
  }

  async getTasksByEmployee(employeeId, status = null) {
    return await this.taskRepository.getTasksByEmployee(employeeId, status);
  }

  async getUpcomingTasks(userId, days = 3) {
    return await this.taskRepository.getUpcomingTasks(userId, days);
  }

  async searchTasks(userId, userRole, query) {
    const userIdFilter = userRole === 'employee' ? userId : null;
    const result = await this.taskRepository.searchTasks(query, userIdFilter);
    return result.tasks || result.rows;
  }

  async getCountByStatus(userId = null) {
    return await this.taskRepository.getCountByStatus(userId);
  }

  async getMonthlyTrends(userId = null, months = 6) {
    return await this.taskRepository.getMonthlyTrends(userId, months);
  }

  async getCompletionRate(startDate, endDate, userId = null) {
    return await this.taskRepository.getCompletionRate(startDate, endDate, userId);
  }

  async getTasksByDateRange(startDate, endDate, userId = null) {
    return await this.taskRepository.getTasksByDateRange(startDate, endDate, userId);
  }

  async bulkUpdateStatus(taskIds, status) {
    return await this.taskRepository.bulkUpdateStatus(taskIds, status);
  }
}

module.exports = new TaskService();