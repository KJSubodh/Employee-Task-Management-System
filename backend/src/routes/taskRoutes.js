const express = require('express');
const { body } = require('express-validator');
const { protect, adminOnly } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
} = require('../controllers/taskController');

const router = express.Router();

router.use(protect);

router.get('/stats', getTaskStats);
router.get('/', getTasks);
router.get('/:id', getTaskById);

// FIXED: only admins can create/assign tasks. Previously any logged-in
// employee could hit this endpoint directly (e.g. via Postman) and assign
// tasks to themselves or others, since only `protect` (auth check) was
// applied, not a role check.
router.post('/', adminOnly, [
  upload.single('fileAttachment'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional(),
  body('priority').isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('status').optional().isIn(['pending', 'in_progress', 'completed']),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('assignedToId').notEmpty().withMessage('Assigned employee is required')
], createTask);

// NOTE: PUT is intentionally left open to both roles. Employees are allowed
// to update their own task's status (e.g. mark in_progress/completed).
// Field-level restriction (employees can only change `status`, not
// reassign/retitle/reschedule) is enforced in taskRepository.updateTask.
router.put('/:id', [
  upload.single('fileAttachment'),
  body('title').optional(),
  body('description').optional(),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('status').optional().isIn(['pending', 'in_progress', 'completed']),
  body('startDate').optional().isISO8601(),
  body('dueDate').optional().isISO8601(),
  body('assignedToId').optional()
], updateTask);

// Deletion stays admin-only in spirit; taskRepository.deleteTask already
// checks (userRole !== 'admin' && task.assignedById !== userId), so a
// creator-admin or any admin can delete. Employees cannot.
router.delete('/:id', deleteTask);

module.exports = router;