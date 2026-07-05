const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
  deleteAttachment // ✅ Import new function
} = require('../controllers/taskController');

const router = express.Router();

router.use(protect);

router.get('/stats', getTaskStats);
router.get('/', getTasks);
router.get('/:id', getTaskById);

router.post('/', [
  upload.single('fileAttachment'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional(),
  body('priority').isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('status').optional().isIn(['pending', 'in_progress', 'completed']),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('assignedToId').notEmpty().withMessage('Assigned employee is required')
], createTask);

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

router.delete('/:id', deleteTask);

// ✅ NEW: Delete attachment route
router.delete('/:id/attachment', deleteAttachment);

module.exports = router;