const { sequelize } = require('../config/database');
const { User, Task, Notification } = require('../models');

// Sample data migration from localStorage format
const migrateLocalStorageData = async () => {
  try {
    console.log('🔄 Starting data migration...');

    // Sample users (replace with your localStorage data)
    const sampleUsers = [
      {
        id: 1,
        username: 'admin',
        email: 'admin@organizo.com',
        password: 'admin123',
        fullName: 'System Administrator',
        role: 'super-admin',
        isApproved: true,
        isActive: true
      },
      {
        id: 2,
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123',
        fullName: 'John Doe',
        role: 'user',
        isApproved: true,
        isActive: true
      },
      {
        id: 3,
        username: 'jane_admin',
        email: 'jane@example.com',
        password: 'admin123',
        fullName: 'Jane Smith',
        role: 'admin',
        isApproved: true,
        isActive: true
      }
    ];

    // Create users
    for (const userData of sampleUsers) {
      const [user, created] = await User.findOrCreate({
        where: { email: userData.email },
        defaults: userData
      });
      
      if (created) {
        console.log(`✅ Created user: ${user.fullName}`);
      } else {
        console.log(`⏭️  User already exists: ${user.fullName}`);
      }
    }

    // Sample tasks
    const sampleTasks = [
      {
        title: 'Setup Database Integration',
        description: 'Migrate from localStorage to PostgreSQL database',
        status: 'in-progress',
        priority: 'high',
        category: 'Development',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdById: 1,
        assignedToId: 2
      },
      {
        title: 'User Interface Testing',
        description: 'Test all components and ensure functionality',
        status: 'pending',
        priority: 'medium',
        category: 'Testing',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        createdById: 3,
        assignedToId: 2
      },
      {
        title: 'Documentation Update',
        description: 'Update project documentation with new features',
        status: 'pending',
        priority: 'low',
        category: 'Documentation',
        createdById: 1,
        assignedToId: 3
      }
    ];

    // Create tasks
    for (const taskData of sampleTasks) {
      const task = await Task.create(taskData);
      console.log(`✅ Created task: ${task.title}`);

      // Create assignment notification
      if (task.assignedToId && task.assignedToId !== task.createdById) {
        await Notification.create({
          type: 'task_assigned',
          title: 'New Task Assigned',
          message: `You have been assigned a new task: ${task.title}`,
          targetUserId: task.assignedToId,
          fromUserId: task.createdById,
          taskId: task.id
        });
      }
    }

    console.log('✅ Data migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

const runMigration = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Sync database
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Database synchronized.');

    // Run data migration
    await migrateLocalStorageData();

    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  runMigration();
}

module.exports = { migrateLocalStorageData, runMigration };
