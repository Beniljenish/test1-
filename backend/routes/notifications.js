const express = require('express');
const { Notification, User, Task } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get notifications for current user
router.get('/', auth, async (req, res) => {
  try {
    const { limit = 20, offset = 0, unread } = req.query;
    
    let whereClause = { targetUserId: req.user.id };
    if (unread === 'true') {
      whereClause.isRead = false;
    }

    const notifications = await Notification.findAll({
      where: whereClause,
      include: [
        { 
          model: User, 
          as: 'fromUser', 
          attributes: ['id', 'fullName', 'username'] 
        },
        { 
          model: Task, 
          as: 'task', 
          attributes: ['id', 'title', 'status'] 
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const unreadCount = await Notification.count({
      where: { 
        targetUserId: req.user.id, 
        isRead: false 
      }
    });

    res.json({ 
      notifications, 
      unreadCount 
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { 
        id: req.params.id, 
        targetUserId: req.user.id 
      }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.update({ isRead: true });
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark all notifications as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { 
        where: { 
          targetUserId: req.user.id, 
          isRead: false 
        } 
      }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { 
        id: req.params.id, 
        targetUserId: req.user.id 
      }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.destroy();
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete all read notifications
router.delete('/read', auth, async (req, res) => {
  try {
    await Notification.destroy({
      where: { 
        targetUserId: req.user.id, 
        isRead: true 
      }
    });

    res.json({ message: 'All read notifications deleted' });
  } catch (error) {
    console.error('Delete read notifications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
