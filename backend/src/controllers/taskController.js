const TaskService = require('../services/taskService');
const EmployeeService = require('../services/employeeService');
const { validationResult } = require('express-validator');

const getTasks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      startDate,
      dueDate,
      assignedToId
    } = req.query;

    const result = await TaskService.getTasks({
      userId: req.user.id,
      userRole: req.user.role,
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      priority,
      search,
      sortBy,
      sortOrder,
      startDate,
      dueDate,
      assignedToId
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await TaskService.getTaskById(
      req.params.id,
      req.user.id,
      req.user.role
    );
    res.json(task);
  } catch (error) {
    res.status(error.message === 'Task not found' ? 404 : 403)
       .json({ message: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await TaskService.createTask(
      req.body,
      req.user.id,
      req.file
    );

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await TaskService.updateTask(
      req.params.id,
      req.body,
      req.user.id,
      req.user.role,
      req.file
    );

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    const status = error.message === 'Task not found' ? 404 : 400;
    res.status(status).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const result = await TaskService.deleteTask(
      req.params.id,
      req.user.id,
      req.user.role
    );
    res.json(result);
  } catch (error) {
    const status = error.message === 'Task not found' ? 404 : 403;
    res.status(status).json({ message: error.message });
  }
};

const getTaskStats = async (req, res) => {
  try {
    const stats = await TaskService.getTaskStats(req.user.id, req.user.role);

    // FIXED: admin dashboard needs "Total Employees" alongside task stats
    // (per spec: "Admin view: total employees, total tasks, completed
    // tasks, and pending tasks"). Previously this endpoint only ever
    // returned { total, completed, pending, overdue } regardless of role,
    // so the frontend had no way to show an employee count without a
    // second round trip.
    if (req.user.role === 'admin') {
      const employeeStats = await EmployeeService.getEmployeeStatsSummary();
      return res.json({
        ...stats,
        totalEmployees: employeeStats.total
      });
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
};