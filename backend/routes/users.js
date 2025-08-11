const express = require('express');
const { body, validationResult } = require('express-validator');
const { User, Notification } = require('../models');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const users = await User.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', [
  auth,
  body('fullName').optional().isLength({ min: 2, max: 50 }).trim(),
  body('email').optional().isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, email } = req.body;
    const user = await User.findByPk(req.user.id);

    // Store pending profile data for admin approval
    const pendingData = {};
    if (fullName && fullName !== user.fullName) {
      pendingData.fullName = fullName;
    }
    if (email && email !== user.email) {
      pendingData.email = email;
    }

    if (Object.keys(pendingData).length > 0) {
      await user.update({ pendingProfileData: pendingData });

      // Create notification for admins
      const admins = await User.findAll({
        where: { role: ['admin', 'super-admin'] }
      });

      for (const admin of admins) {
        await Notification.create({
          type: 'profile_approval_request',
          title: 'Profile Update Request',
          message: `${user.fullName} has requested to update their profile`,
          targetUserId: admin.id,
          fromUserId: user.id,
          metadata: { pendingData }
        });
      }

      // Emit real-time notification
      const io = req.app.get('io');
      for (const admin of admins) {
        io.to(`user-${admin.id}`).emit('new-notification', {
          type: 'profile_approval_request',
          title: 'Profile Update Request',
          message: `${user.fullName} has requested to update their profile`
        });
      }

      res.json({ 
        message: 'Profile update request submitted for admin approval',
        pendingData 
      });
    } else {
      res.json({ message: 'No changes detected' });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve profile change (admin only)
router.post('/approve-profile/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);

    if (!user || !user.pendingProfileData) {
      return res.status(404).json({ error: 'No pending profile changes found' });
    }

    // Apply the pending changes
    await user.update({
      ...user.pendingProfileData,
      pendingProfileData: null,
      isApproved: true
    });

    // Create approval notification
    await Notification.create({
      type: 'profile_approved',
      title: 'Profile Update Approved',
      message: 'Your profile changes have been approved by an admin',
      targetUserId: user.id,
      fromUserId: req.user.id
    });

    // Emit real-time notification
    const io = req.app.get('io');
    io.to(`user-${user.id}`).emit('new-notification', {
      type: 'profile_approved',
      title: 'Profile Update Approved',
      message: 'Your profile changes have been approved'
    });

    res.json({ message: 'Profile changes approved', user });
  } catch (error) {
    console.error('Approve profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reject profile change (admin only)
router.post('/reject-profile/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const user = await User.findByPk(userId);

    if (!user || !user.pendingProfileData) {
      return res.status(404).json({ error: 'No pending profile changes found' });
    }

    // Clear pending changes
    await user.update({ pendingProfileData: null });

    // Create rejection notification
    await Notification.create({
      type: 'profile_rejected',
      title: 'Profile Update Rejected',
      message: `Your profile changes have been rejected. Reason: ${reason || 'No reason provided'}`,
      targetUserId: user.id,
      fromUserId: req.user.id,
      metadata: { reason }
    });

    // Emit real-time notification
    const io = req.app.get('io');
    io.to(`user-${user.id}`).emit('new-notification', {
      type: 'profile_rejected',
      title: 'Profile Update Rejected',
      message: 'Your profile changes have been rejected'
    });

    res.json({ message: 'Profile changes rejected' });
  } catch (error) {
    console.error('Reject profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get users with pending profile changes (admin only)
router.get('/pending-approvals', adminAuth, async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        pendingProfileData: { [require('sequelize').Op.ne]: null }
      },
      order: [['updatedAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
