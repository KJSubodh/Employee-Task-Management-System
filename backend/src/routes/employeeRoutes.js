const express = require('express');
const { body } = require('express-validator');
const { protect, adminOnly } = require('../middlewares/auth');
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');

const router = express.Router();

// All employee routes require authentication and admin role
router.use(protect, adminOnly);

router.get('/', getEmployees);
router.get('/:id', getEmployeeById);

router.post('/', [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/\d/).withMessage('Password must contain a number'),
  body('department').optional(),
  body('designation').optional()
], createEmployee);

router.put('/:id', [
  body('fullName').optional(),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('department').optional(),
  body('designation').optional(),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
], updateEmployee);

router.delete('/:id', deleteEmployee);

module.exports = router;