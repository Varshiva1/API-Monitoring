# API Monitoring & Status Page System (ES6)

A comprehensive backend system for monitoring APIs, tracking uptime, managing incidents, and sending alerts. Built with **Node.js ES6 Modules**, Express, MongoDB, and following MVC architecture pattern.

## 🚀 Features

- ✅ **Real-time API Monitoring** - Automated health checks at custom intervals
- ✅ **Uptime Tracking** - Calculate and display uptime percentages
- ✅ **Incident Management** - Automatic incident creation and resolution
- ✅ **Multi-channel Alerts** - Email and Slack notifications
- ✅ **Response Time Tracking** - Monitor API performance
- ✅ **JWT Authentication** - Secure user authentication
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

### 1. Clone Repository (or create new project)
```bash
mkdir api-monitoring-system
cd api-monitoring-system
npm init -y
```

### 2. Install Dependencies
```bash
npm install express mongoose dotenv bcryptjs jsonwebtoken axios node-cron nodemailer express-validator cors
npm install --save-dev nodemon
```

### 3. Update package.json

Add these to your `package.json`:
```json
{
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### 4. Create Project Structure
```bash
mkdir -p src/{config,models,controllers,routes,middleware,services,utils}
```

### 5. Environment Setup

Create a `.env` file in the root directory:
```env
PORT=5000
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

### 6. Start MongoDB
```bash
# Using MongoDB locally
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 7. Run the Application
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

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

## 📝 Resume Talking Points

1. **Modern JavaScript** - Built with ES6 modules and latest features
2. **Cron Jobs** - Automated API health checks every 5 minutes
3. **Incident Management** - Open → Acknowledged → Resolved lifecycle
4. **Multi-channel Alerts** - Email and Slack notifications
5. **Performance** - Batch processing, database indexes
6. **Architecture** - Clean MVC with services layer
7. **Security** - JWT auth, bcrypt, input validation
8. **Error Handling** - Comprehensive middleware
9. **Production Ready** - PM2, graceful shutdown, logging

## 🤝 Contributing

Fork the project and submit pull requests!

## 📄 License

MIT License

---

**Built with ❤️ using Modern ES6 JavaScript**

**Author:** Shivam Varun  
**GitHub:** (https://github.com/Varshiva1)  
**LinkedIn:** (https://linkedin.com/in/shivamvarun75)
