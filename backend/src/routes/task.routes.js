const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const {
  taskCreateSchema,
  taskUpdateSchema,
  taskStatusSchema,
} = require('../validators/task.validator');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
} = require('../controllers/task.controller');

const router = express.Router();

router.get('/project/:projectId', protect, (req, res, next) => {
  req.query.project = req.params.projectId;
  return getTasks(req, res, next);
});

router.get('/', protect, getTasks);
router.post('/', protect, validate(taskCreateSchema), createTask);
router.get('/:id', protect, getTask);
router.put('/:id', protect, validate(taskUpdateSchema), updateTask);
router.patch('/:id', protect, validate(taskUpdateSchema), updateTask);
router.patch('/:id/status', protect, validate(taskStatusSchema), updateTaskStatus);
router.delete('/:id', protect, deleteTask);

module.exports = router;
