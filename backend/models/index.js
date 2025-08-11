const User = require('./User');
const Task = require('./Task');
const Notification = require('./Notification');
const Comment = require('./Comment');

// Define associations
User.hasMany(Task, { 
  foreignKey: 'createdById', 
  as: 'createdTasks' 
});
User.hasMany(Task, { 
  foreignKey: 'assignedToId', 
  as: 'assignedTasks' 
});

Task.belongsTo(User, { 
  foreignKey: 'createdById', 
  as: 'creator' 
});
Task.belongsTo(User, { 
  foreignKey: 'assignedToId', 
  as: 'assignee' 
});

User.hasMany(Notification, { 
  foreignKey: 'targetUserId', 
  as: 'receivedNotifications' 
});
User.hasMany(Notification, { 
  foreignKey: 'fromUserId', 
  as: 'sentNotifications' 
});

Notification.belongsTo(User, { 
  foreignKey: 'targetUserId', 
  as: 'targetUser' 
});
Notification.belongsTo(User, { 
  foreignKey: 'fromUserId', 
  as: 'fromUser' 
});
Notification.belongsTo(Task, { 
  foreignKey: 'taskId', 
  as: 'task' 
});

Task.hasMany(Notification, { 
  foreignKey: 'taskId', 
  as: 'notifications' 
});

User.hasMany(Comment, { 
  foreignKey: 'userId', 
  as: 'comments' 
});
Task.hasMany(Comment, { 
  foreignKey: 'taskId', 
  as: 'comments' 
});

Comment.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});
Comment.belongsTo(Task, { 
  foreignKey: 'taskId', 
  as: 'task' 
});

module.exports = {
  User,
  Task,
  Notification,
  Comment
};
