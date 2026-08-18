const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} = require('../controllers/comment.controller');

const router = express.Router();

router.get('/task/:taskId', protect, (req, res, next) => {
  req.query.taskId = req.params.taskId;
  return getComments(req, res, next);
});

router.get('/project/:projectId', protect, (req, res, next) => {
  req.query.projectId = req.params.projectId;
  return getComments(req, res, next);
});

router.get('/', protect, getComments);
router.post('/', protect, createComment);
router.patch('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);

module.exports = router;
