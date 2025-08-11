# Organizo Backend API

A robust Node.js + Express + PostgreSQL backend for the Organizo Task Management System.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (user/admin/super-admin)
- **Task Management**: Complete CRUD operations with status tracking and assignments
- **Real-time Notifications**: Socket.io integration for instant updates
- **Comment System**: Task-based commenting with notifications
- **Profile Management**: User profile updates with admin approval workflow
- **File Handling**: Attachment support with secure file uploads
- **Database**: PostgreSQL with Sequelize ORM
- **Security**: Helmet, rate limiting, input validation, and secure practices

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🛠️ Installation

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Database Setup
Make sure PostgreSQL is running and create a database:
```sql
CREATE DATABASE organizo_db;
CREATE USER organizo_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE organizo_db TO organizo_user;
```

### 3. Environment Configuration
Copy the example environment file and configure:
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=organizo_db
DB_USER=organizo_user
DB_PASSWORD=your_password

# JWT Secret (generate a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Server Configuration
PORT=5000
NODE_ENV=development

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### 4. Database Migration
Run the migration script to create tables and seed initial data:
```bash
npm run migrate
```

### 5. Start the Server
```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile (requires approval)
- `POST /api/users/approve-profile/:userId` - Approve profile changes (admin)
- `POST /api/users/reject-profile/:userId` - Reject profile changes (admin)
- `GET /api/users/pending-approvals` - Get pending approvals (admin)

### Tasks
- `GET /api/tasks` - Get tasks (filtered by role)
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete notification
- `DELETE /api/notifications/read` - Delete all read notifications

### Comments
- `GET /api/comments/task/:taskId` - Get task comments
- `POST /api/comments` - Add comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 👥 User Roles

- **user**: Can manage own tasks and assigned tasks
- **admin**: Can manage all tasks and approve profile changes
- **super-admin**: Full system access with all admin privileges

## 🔔 Real-time Features

The server uses Socket.io for real-time notifications. Connect to the socket and join your user room:
```javascript
const socket = io('http://localhost:5000');
socket.emit('join-user-room', userId);

socket.on('new-notification', (notification) => {
  // Handle new notification
});
```

## 📊 Database Schema

### Users Table
- id, username, email, password, fullName
- role, avatar, isApproved, pendingProfileData
- lastLogin, isActive, timestamps

### Tasks Table
- id, title, description, status, priority
- category, dueDate, completedAt, estimatedHours, actualHours
- attachments, tags, createdById, assignedToId, timestamps

### Notifications Table
- id, type, title, message, isRead
- taskId, targetUserId, fromUserId, metadata, timestamps

### Comments Table
- id, content, taskId, userId
- isEdited, editedAt, timestamps

## 🚀 Production Deployment

### Environment Variables
Set `NODE_ENV=production` and configure production database settings.

### Database
- Use connection pooling
- Set up database backups
- Configure SSL connections

### Security
- Use strong JWT secrets
- Set up HTTPS
- Configure firewall rules
- Enable rate limiting

### Monitoring
- Set up logging (Winston, Morgan)
- Configure error tracking (Sentry)
- Monitor database performance

## 🔧 Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run migrate` - Run database migration
- `npm run seed` - Seed database with sample data

### Code Structure
```
backend/
├── config/          # Database configuration
├── middleware/      # Auth and validation middleware
├── models/          # Sequelize models
├── routes/          # API route handlers
├── scripts/         # Migration and utility scripts
├── uploads/         # File upload directory
└── server.js        # Main server file
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify database credentials in .env
   - Ensure database exists

2. **JWT Token Invalid**
   - Check JWT_SECRET in .env
   - Verify token format in requests

3. **Socket.io Connection Issues**
   - Check CORS configuration
   - Verify frontend URL in .env

### Logs
Check server logs for detailed error information. In development mode, errors are logged to console with full stack traces.

## 📄 License

MIT License - see LICENSE file for details.
