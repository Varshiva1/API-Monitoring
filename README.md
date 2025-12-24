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

## 🧪 Testing

Import the Postman collection (`API-Monitoring-Complete.postman_collection.json`) for easy API testing.

## 📄 License

MIT License

---

**Built with ❤️ using Modern ES6 JavaScript**

**Author:** Shivam Varun  
**GitHub:** [github.com/Varshiva1](https://github.com/Varshiva1)  
**LinkedIn:** [linkedin.com/in/shivamvarun75](https://linkedin.com/in/shivamvarun75)
