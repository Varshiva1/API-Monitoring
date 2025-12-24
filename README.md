# API Monitoring System

A comprehensive backend system for monitoring APIs, tracking uptime, managing incidents, and sending email alerts. Built with **Node.js ES6 Modules**, Express, MongoDB, and following MVC architecture pattern.

## 🚀 Features

- ✅ **Real-time API Monitoring** - Automated health checks at custom intervals
- ✅ **Uptime Tracking** - Calculate and display uptime percentages
- ✅ **Incident Management** - Automatic incident creation and resolution
- ✅ **Email Alerts** - Email notifications for API failures
- ✅ **Response Time Tracking** - Monitor API performance
- ✅ **JWT Authentication** - Secure user authentication
- ✅ **Role-Based Access Control** - Admin and user roles with different permissions
- ✅ **RESTful API** - Clean and well-documented endpoints
- ✅ **MVC Architecture** - Organized and maintainable code structure
- ✅ **ES6 Modules** - Modern JavaScript with import/export
- ✅ **Input Validation** - Request validation with express-validator
- ✅ **Error Handling** - Comprehensive error handling middleware

## 📋 Prerequisites

- Node.js (v14 or higher) - **Supports ES6 modules**
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd API-Monitoring
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/api-monitor
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@apimonitor.com

# Alert Configuration
ALERT_EMAIL=alerts@yourdomain.com

# CORS (Optional)
CORS_ORIGIN=*

NODE_ENV=development
```

### 3. Start MongoDB
```bash
# Using MongoDB locally
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Run the Application
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:4000`

## 📚 API Documentation

### Base URL
```
http://localhost:4000/api
```

### Health Check
```http
GET /health
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Update Password
```http
POST /api/auth/updatepassword
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

#### Delete User (Self)
```http
DELETE /api/auth/delete
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "password123"
}
```

### Monitor Endpoints

#### Create Monitor
```http
POST /api/monitors
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My API",
  "url": "https://api.example.com/health",
  "method": "GET",
  "interval": 5,
  "timeout": 30,
  "expectedStatusCode": 200,
  "alertChannels": {
    "email": true
  }
}
```

#### Get All Monitors
```http
GET /api/monitors?status=up&isActive=true
Authorization: Bearer <token>
```

#### Get Monitor by ID
```http
GET /api/monitors/:id
Authorization: Bearer <token>
```

#### Update Monitor
```http
POST /api/monitors/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Monitor Name",
  "interval": 10
}
```

#### Delete Monitor
```http
DELETE /api/monitors/:id
Authorization: Bearer <token>
```

#### Delete All Monitors
```http
POST /api/monitors/delete-all
Authorization: Bearer <token>
```

#### Toggle Monitor (Pause/Resume)
```http
POST /api/monitors/:id/toggle
Authorization: Bearer <token>
```

### Incident Endpoints

#### Get All Incidents
```http
GET /api/incidents?status=open&days=7&limit=50
Authorization: Bearer <token>
```

#### Get Incident by ID
```http
GET /api/incidents/:id
Authorization: Bearer <token>
```

#### Acknowledge Incident
```http
POST /api/incidents/:id/acknowledge
Authorization: Bearer <token>
```

#### Resolve Incident
```http
POST /api/incidents/:id/resolve
Authorization: Bearer <token>
```

### Admin Endpoints

All admin endpoints require admin role.

#### Create User
```http
POST /api/admin/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "user"
}
```

#### Get All Users
```http
GET /api/admin/users
Authorization: Bearer <admin_token>
```

#### Get User by Email
```http
GET /api/admin/users/:email
Authorization: Bearer <admin_token>
```

#### Update User Role
```http
POST /api/admin/users/:email/role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role": "admin"
}
```

#### Delete User by Email
```http
DELETE /api/admin/users/:email
Authorization: Bearer <admin_token>
```

#### Delete All Users
```http
POST /api/admin/users/delete-all
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "confirm": "DELETE_ALL_USERS",
  "excludeAdmins": true
}
```

#### Get All Monitors (All Users)
```http
GET /api/admin/monitors?status=up&isActive=true&userId=xxx
Authorization: Bearer <admin_token>
```

#### Get All Incidents (All Users)
```http
GET /api/admin/incidents?status=open&monitorId=xxx&userId=xxx&limit=100
Authorization: Bearer <admin_token>
```

#### Get Admin Stats
```http
GET /api/admin/stats
Authorization: Bearer <admin_token>
```

## 📧 Email Setup (Gmail)

1. Enable 2-Factor Authentication on your Google Account
2. Generate App Password:
   - Go to Google Account → Security → 2-Step Verification
   - Scroll to App Passwords
   - Generate new password for "Mail"
3. Update `.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password
ALERT_EMAIL=your-email@gmail.com
```

## 🔐 Admin Setup

### Creating the First Admin

Since no admin exists initially, you need to manually create the first admin:

**Option 1: MongoDB Compass**
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Select database: `api-monitor`
4. Open `users` collection
5. Find your user and update `role` field to `"admin"`

**Option 2: MongoDB Shell**
```bash
mongosh api-monitor
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

After creating the first admin, you can promote other users via the API:
```http
POST /api/admin/users/:email/role
Authorization: Bearer <admin_token>
{
  "role": "admin"
}
```

## 🏗️ Project Structure
```
API-Monitoring/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── config.js             # App configuration
│   ├── models/
│   │   ├── User.js               # User model
│   │   ├── Monitor.js            # Monitor model
│   │   └── Incident.js           # Incident model
│   ├── controllers/
│   │   ├── authController.js     # Auth logic
│   │   ├── monitorController.js   # Monitor CRUD
│   │   ├── incidentController.js # Incident management
│   │   └── adminController.js     # Admin operations
│   ├── routes/
│   │   ├── authRoutes.js         # Auth routes
│   │   ├── monitorRoutes.js      # Monitor routes
│   │   ├── incidentRoutes.js    # Incident routes
│   │   └── adminRoutes.js        # Admin routes
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication
│   │   ├── errorHandler.js       # Error handling
│   │   └── validator.js          # Request validation
│   ├── services/
│   │   ├── monitoringService.js  # Core monitoring logic
│   │   └── emailService.js       # Email sending
│   └── app.js                    # Express app setup
├── .env                          # Environment variables
├── package.json                  # Dependencies
├── README.md                     # Documentation
└── server.js                     # Entry point
```

## 🔄 ES6 Features Used

- ✅ ES6 Modules (`import/export`)
- ✅ Arrow Functions
- ✅ Template Literals
- ✅ Destructuring
- ✅ Async/Await
- ✅ Spread Operator
- ✅ Optional Chaining (`?.`)
- ✅ Nullish Coalescing (`??`)
- ✅ Enhanced Object Literals
- ✅ Default Parameters
- ✅ Promise.allSettled()
- ✅ Array Methods (map, filter, reduce)

## 📝 Key Features

1. **Modern JavaScript** - Built with ES6 modules and latest features
2. **Automated Monitoring** - Cron jobs for API health checks
3. **Incident Management** - Open → Acknowledged → Resolved lifecycle
4. **Email Alerts** - Automatic notifications for API failures
5. **Role-Based Access** - Admin and user roles with different permissions
6. **Performance** - Batch processing, database indexes
7. **Architecture** - Clean MVC with services layer
8. **Security** - JWT auth, bcrypt, input validation
9. **Error Handling** - Comprehensive middleware

## 📄 License

MIT License

---

**Built with ❤️ using Modern ES6 JavaScript**

**Author:** Shivam Varun  
**GitHub:** [github.com/Varshiva1](https://github.com/Varshiva1)  
**LinkedIn:** [linkedin.com/in/shivamvarun75](https://linkedin.com/in/shivamvarun75)
