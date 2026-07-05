const EmployeeService = require('../services/employeeService');
const { validationResult } = require('express-validator');

const getEmployees = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'fullName',
      sortOrder = 'ASC',
      isActive
    } = req.query;

    const result = await EmployeeService.getEmployees({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      sortBy,
      sortOrder,
      isActive: isActive !== undefined ? isActive === 'true' : null
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const employee = await EmployeeService.getEmployeeById(req.params.id);
    res.json(employee);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const createEmployee = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const employee = await EmployeeService.createEmployee(req.body);

    res.status(201).json({
      message: 'Employee created successfully',
      employee
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const employee = await EmployeeService.updateEmployee(
      req.params.id,
      req.body
    );

    res.json({
      message: 'Employee updated successfully',
      employee
    });
  } catch (error) {
    const status = error.message === 'Employee not found' ? 404 : 400;
    res.status(status).json({ message: error.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const result = await EmployeeService.deleteEmployee(req.params.id);
    res.json(result);
  } catch (error) {
    const status = error.message === 'Employee not found' ? 404 : 400;
    res.status(status).json({ message: error.message });
  }
};

const getEmployeeTaskStats = async (req, res) => {
  try {
    const stats = await EmployeeService.getEmployeeTaskStats(req.params.id);
    res.json(stats);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getActiveEmployees = async (req, res) => {
  try {
    const employees = await EmployeeService.getActiveEmployees();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchEmployees = async (req, res) => {
  try {
    const { query } = req.query;
    const employees = await EmployeeService.searchEmployees(query);
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeTaskStats,
  getActiveEmployees,
  searchEmployees
};