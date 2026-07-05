const TaskRepository = require('../repositories/taskRepository');
const UserRepository = require('../repositories/userRepository');
const ExcelJS = require('exceljs');
const { format } = require('fast-csv');
const { PassThrough } = require('stream');

class ReportService {
  constructor() {
    this.taskRepository = TaskRepository;
    this.userRepository = UserRepository;
  }

  async generateReport(type, format = 'json') {
    let data;
    let filename;

    switch(type) {
      case 'completed':
        data = await this.getCompletedTasksReport();
        filename = 'completed_tasks';
        break;
      case 'pending':
        data = await this.getPendingTasksReport();
        filename = 'pending_tasks';
        break;
      case 'employee-wise':
        data = await this.getEmployeeWiseReport();
        filename = 'employee_wise_tasks';
        break;
      default:
        throw new Error('Invalid report type');
    }

    if (format === 'excel') {
      return await this.exportToExcel(data, filename);
    } else if (format === 'csv') {
      return await this.exportToCSV(data, filename);
    } else {
      return data;
    }
  }

  async getCompletedTasksReport() {
    const tasks = await this.taskRepository.getTasks({
      status: 'completed',
      limit: 1000 // Get all completed tasks
    });

    return tasks.tasks.map(task => ({
      'Task Title': task.title,
      'Description': task.description || 'N/A',
      'Priority': task.priority.toUpperCase(),
      'Assigned To': task.assignedTo?.fullName || 'N/A',
      'Employee Email': task.assignedTo?.email || 'N/A',
      'Department': task.assignedTo?.department || 'N/A',
      'Assigned By': task.assignedBy?.fullName || 'N/A',
      'Start Date': new Date(task.startDate).toLocaleDateString(),
      'Due Date': new Date(task.dueDate).toLocaleDateString(),
      'Completed Date': new Date(task.updatedAt).toLocaleDateString(),
      'Days to Complete': Math.ceil((new Date(task.updatedAt) - new Date(task.startDate)) / (1000 * 60 * 60 * 24))
    }));
  }

  async getPendingTasksReport() {
    const tasks = await this.taskRepository.getTasks({
      status: ['pending', 'in_progress', 'overdue'],
      limit: 1000
    });

    return tasks.tasks.map(task => {
      const now = new Date();
      const dueDate = new Date(task.dueDate);
      const daysOverdue = Math.max(0, Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24)));
      
      return {
        'Task Title': task.title,
        'Description': task.description || 'N/A',
        'Priority': task.priority.toUpperCase(),
        'Status': task.status.toUpperCase().replace('_', ' '),
        'Assigned To': task.assignedTo?.fullName || 'N/A',
        'Employee Email': task.assignedTo?.email || 'N/A',
        'Department': task.assignedTo?.department || 'N/A',
        'Assigned By': task.assignedBy?.fullName || 'N/A',
        'Start Date': new Date(task.startDate).toLocaleDateString(),
        'Due Date': new Date(task.dueDate).toLocaleDateString(),
        'Days Overdue': daysOverdue,
        'Is Urgent': daysOverdue > 0 ? 'Yes' : 'No'
      };
    });
  }

  async getEmployeeWiseReport() {
    const employees = await this.userRepository.getEmployeesWithTaskCounts();
    
    return employees.map(emp => {
      // FIXED: was emp.taskSummary (doesn't exist -> always fell back to zeros).
      // userDao.findUsersWithTaskCounts attaches the stats as `taskStats`.
      const stats = emp.taskStats || { total: 0, completed: 0, pending: 0, completionRate: 0 };
      
      return {
        'Employee Name': emp.fullName,
        'Email': emp.email,
        'Department': emp.department || 'N/A',
        'Designation': emp.designation || 'N/A',
        'Status': emp.isActive ? 'Active' : 'Inactive',
        'Total Tasks': stats.total,
        'Completed Tasks': stats.completed,
        'Pending Tasks': stats.pending,
        'Completion Rate': `${Math.round(stats.completionRate || 0)}%`
      };
    });
  }

  async exportToExcel(data, filename) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');

    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      const headerRow = worksheet.addRow(headers);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4CAF50' }
      };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

      worksheet.columns.forEach((column, index) => {
        let maxLength = headers[index].length + 2;
        column.eachCell({ includeEmpty: true }, cell => {
          const cellValue = cell.value ? cell.value.toString() : '';
          maxLength = Math.max(maxLength, cellValue.length + 2);
        });
        column.width = Math.min(maxLength, 50);
        column.alignment = { horizontal: 'left', vertical: 'middle' };
      });
    }

    data.forEach((item, index) => {
      const row = worksheet.addRow(Object.values(item));
      if (index % 2 === 0) {
        row.eachCell(cell => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF5F5F5' }
          };
        });
      }
    });

    const summaryRow = worksheet.addRow(['', '', '', '', '', '', '', '']);
    summaryRow.getCell(1).value = 'Generated on:';
    summaryRow.getCell(2).value = new Date().toLocaleString();
    summaryRow.getCell(1).font = { bold: true };

    // FIXED: reportController.js checks `result.workbook` to decide whether
    // to stream an Excel file (`if (format === 'excel' && result.workbook)`).
    // This used to return the bare `workbook` object, so `result.workbook`
    // was always undefined, the excel branch never ran, and the raw
    // ExcelJS.Workbook (which has circular internal refs) fell through to
    // `res.json(...)`, throwing "Converting circular structure to JSON" and
    // surfacing as a 400 error instead of a download.
    return { workbook };
  }

  async exportToCSV(data, filename) {
    return new Promise((resolve, reject) => {
      try {
        const passThrough = new PassThrough();
        const csvStream = format({ headers: true });
        
        csvStream.pipe(passThrough);
        data.forEach(item => csvStream.write(item));
        csvStream.end();

        resolve(passThrough);
      } catch (error) {
        reject(error);
      }
    });
  }

  async getTaskAnalytics(userId = null, userRole = null) {
    const stats = await this.taskRepository.getTaskStats(userId, userRole);
    const statusCounts = await this.taskRepository.getCountByStatus(userId);
    const priorityCounts = await this.taskRepository.getCountByPriority(userId);
    const monthlyTrends = await this.taskRepository.getMonthlyTrends(userId, 6);

    return {
      stats,
      statusCounts,
      priorityCounts,
      monthlyTrends
    };
  }
}

module.exports = new ReportService();