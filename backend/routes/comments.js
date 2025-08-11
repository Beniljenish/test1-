const express = require('express');
const { body, validationResult } = require('express-validator');
const { Comment, User, Task, Notification } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get comments for a task
router.get('/task/:taskId', auth, async (req, res) => {
  try {
    const { taskId } = req.params;
    
    // Check if user has access to this task
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check permissions
    if (req.user.role === 'user' && 
        task.createdById !== req.user.id && 
        task.assignedToId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const comments = await Comment.findAll({
      where: { taskId },
      include: [
        { 
          model: User, 
          as: 'user', 
          attributes: ['id', 'fullName', 'username', 'avatar'] 
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add comment to task
router.post('/', [
  auth,
  body('content').isLength({ min: 1, max: 1000 }).trim(),
  body('taskId').isInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, taskId } = req.body;

    // Check if task exists and user has access
    const task = await Task.findByPk(taskId, {
      include: [
        { model: User, as: 'creator' },
        { model: User, as: 'assignee' }
      ]
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check permissions
    if (req.user.role === 'user' && 
        task.createdById !== req.user.id && 
        task.assignedToId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Create comment
    const comment = await Comment.create({
      content,
      taskId,
      userId: req.user.id
    });

    // Load comment with user data
    const fullComment = await Comment.findByPk(comment.id, {
      include: [
        { 
          model: User, 
          as: 'user', 
          attributes: ['id', 'fullName', 'username', 'avatar'] 
        }
      ]
    });

    // Create notifications for relevant users (excluding the commenter)
    const notificationTargets = [];
    
    // Notify task creator if they're not the commenter
    if (task.createdById && task.createdById !== req.user.id) {
      notificationTargets.push(task.createdById);
    }
    
    // Notify assigned user if they're not the commenter and not already notified
    if (task.assignedToId && 
        task.assignedToId !== req.user.id && 
        !notificationTargets.includes(task.assignedToId)) {
      notificationTargets.push(task.assignedToId);
    }

    // Create notifications
    for (const targetUserId of notificationTargets) {
      await Notification.create({
        type: 'comment_added',
        title: 'New Comment Added',
        message: `${req.user.fullName} added a comment to task: ${task.title}`,
        targetUserId,
        fromUserId: req.user.id,
        taskId: task.id,
        metadata: { commentId: comment.id }
      });

      // Emit real-time notification
      const io = req.app.get('io');
      io.to(`user-${targetUserId}`).emit('new-notification', {
        type: 'comment_added',
        title: 'New Comment Added',
        message: `${req.user.fullName} added a comment to task: ${task.title}`,
        taskId: task.id
      });
    }

    res.status(201).json(fullComment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update comment
router.put('/:id', [
  auth,
  body('content').isLength({ min: 1, max: 1000 }).trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const comment = await Comment.findByPk(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Only comment author can edit
    if (comment.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await comment.update({
      content: req.body.content,
      isEdited: true,
      editedAt: new Date()
    });

    // Load updated comment with user data
    const updatedComment = await Comment.findByPk(comment.id, {
      include: [
        { 
          model: User, 
          as: 'user', 
          attributes: ['id', 'fullName', 'username', 'avatar'] 
        }
      ]
    });

    res.json(updatedComment);
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete comment
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Only comment author or admins can delete
    if (comment.userId !== req.user.id && 
        req.user.role !== 'admin' && 
        req.user.role !== 'super-admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await comment.destroy();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
