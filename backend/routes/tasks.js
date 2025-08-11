const express = require('express');
const { body, validationResult } = require('express-validator');
const { Task, User, Notification } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get tasks based on user role
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, assigned } = req.query;
    let whereClause = {};
    let includeClause = [
      { model: User, as: 'creator', attributes: ['id', 'fullName', 'username'] },
      { model: User, as: 'assignee', attributes: ['id', 'fullName', 'username'] }
    ];

    // Role-based filtering
    if (req.user.role === 'user') {
      whereClause = {
        $or: [
          { createdById: req.user.id },
          { assignedToId: req.user.id }
        ]
      };
    }
    // Admins and super-admins can see all tasks

    // Apply filters
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (assigned === 'me') whereClause.assignedToId = req.user.id;

    const tasks = await Task.findAll({
      where: whereClause,
      include: includeClause,
      order: [['createdAt', 'DESC']]
    });

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single task
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'fullName', 'username'] },
        { model: User, as: 'assignee', attributes: ['id', 'fullName', 'username'] }
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

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create task
router.post('/', [
  auth,
  body('title').isLength({ min: 1, max: 200 }).trim(),
  body('description').optional().isLength({ max: 1000 }),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('category').optional().isLength({ max: 50 }),
  body('dueDate').optional().isISO8601(),
  body('assignedToId').optional().isInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const taskData = {
      ...req.body,
      createdById: req.user.id
    };

    const task = await Task.create(taskData);

    // Load the task with associations
    const fullTask = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'fullName', 'username'] },
        { model: User, as: 'assignee', attributes: ['id', 'fullName', 'username'] }
      ]
    });

    // Create notification if task is assigned
    if (task.assignedToId && task.assignedToId !== req.user.id) {
      await Notification.create({
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `You have been assigned a new task: ${task.title}`,
        targetUserId: task.assignedToId,
        fromUserId: req.user.id,
        taskId: task.id
      });

      // Emit real-time notification
      const io = req.app.get('io');
      io.to(`user-${task.assignedToId}`).emit('new-notification', {
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `You have been assigned a new task: ${task.title}`,
        taskId: task.id
      });
    }

    res.status(201).json(fullTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update task
router.put('/:id', [
  auth,
  body('title').optional().isLength({ min: 1, max: 200 }).trim(),
  body('description').optional().isLength({ max: 1000 }),
  body('status').optional().isIn(['pending', 'in-progress', 'completed', 'cancelled']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('dueDate').optional().isISO8601(),
  body('assignedToId').optional().isInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check permissions
    if (req.user.role === 'user' && 
        task.createdById !== req.user.id && 
        task.assignedToId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const oldStatus = task.status;
    const oldAssignedToId = task.assignedToId;

    // Update completed timestamp if status changed to completed
    if (req.body.status === 'completed' && oldStatus !== 'completed') {
      req.body.completedAt = new Date();
    }

    await task.update(req.body);

    // Load updated task with associations
    const updatedTask = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'fullName', 'username'] },
        { model: User, as: 'assignee', attributes: ['id', 'fullName', 'username'] }
      ]
    });

    // Create notifications for status or assignment changes
    if (req.body.status === 'completed' && oldStatus !== 'completed') {
      // Notify task creator when completed
      if (task.createdById !== req.user.id) {
        await Notification.create({
          type: 'task_completed',
          title: 'Task Completed',
          message: `Task "${task.title}" has been marked as completed`,
          targetUserId: task.createdById,
          fromUserId: req.user.id,
          taskId: task.id
        });

        const io = req.app.get('io');
        io.to(`user-${task.createdById}`).emit('new-notification', {
          type: 'task_completed',
          title: 'Task Completed',
          message: `Task "${task.title}" has been completed`,
          taskId: task.id
        });
      }
    }

    // Handle assignment changes
    if (req.body.assignedToId && req.body.assignedToId !== oldAssignedToId) {
      await Notification.create({
        type: 'task_assigned',
        title: 'Task Assigned',
        message: `You have been assigned to task: ${task.title}`,
        targetUserId: req.body.assignedToId,
        fromUserId: req.user.id,
        taskId: task.id
      });

      const io = req.app.get('io');
      io.to(`user-${req.body.assignedToId}`).emit('new-notification', {
        type: 'task_assigned',
        title: 'Task Assigned',
        message: `You have been assigned to task: ${task.title}`,
        taskId: task.id
      });
    }

    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check permissions - only creator or admins can delete
    if (req.user.role === 'user' && task.createdById !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await task.destroy();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
