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
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

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
http://localhost:5000/api
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
    "email": true,
    "slack": false
  }
}
```

#### Get All Monitors
```http
GET /api/monitors
Authorization: Bearer <token>
```

#### Get Monitor Statistics
```http
GET /api/monitors/:id/stats
Authorization: Bearer <token>
```

#### Toggle Monitor (Pause/Resume)
```http
PATCH /api/monitors/:id/toggle
Authorization: Bearer <token>
```

### Incident Endpoints

#### Get All Incidents
```http
GET /api/incidents
Authorization: Bearer <token>
```

#### Acknowledge Incident
```http
PUT /api/incidents/:id/acknowledge
Authorization: Bearer <token>
```

#### Resolve Incident
```http
PUT /api/incidents/:id/resolve
Authorization: Bearer <token>
```

#### Get Incident Statistics
```http
GET /api/incidents/stats
Authorization: Bearer <token>
```

## 🧪 Testing with cURL
```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# 2. Login (save the token)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 3. Create Monitor (replace YOUR_TOKEN)
curl -X POST http://localhost:5000/api/monitors \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"JSONPlaceholder API",
    "url":"https://jsonplaceholder.typicode.com/posts",
    "method":"GET",
    "interval":5,
    "expectedStatusCode":200
  }'

# 4. Get All Monitors
curl -X GET http://localhost:5000/api/monitors \
  -H "Authorization: Bearer YOUR_TOKEN"

# 5. Get Monitor Stats
curl -X GET http://localhost:5000/api/monitors/MONITOR_ID/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
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

## 💬 Slack Setup

1. Create Incoming Webhook at https://api.slack.com/messaging/webhooks
2. Copy webhook URL
3. Update `.env`:
```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

## 🚀 Deployment

### Deploy to AWS EC2
```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Clone repository
git clone your-repo-url
cd api-monitoring-system
npm install

# Setup environment
nano .env
# (paste your configuration)

# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name api-monitor
pm2 startup
pm2 save

# View logs
pm2 logs api-monitor
```

### Deploy to Heroku
```bash
heroku login
heroku create your-app-name
heroku addons:create mongolab:sandbox
heroku config:set JWT_SECRET=your-secret
heroku config:set NODE_ENV=production
git push heroku main
heroku logs --tail
```

## 🏗️ Project Structure
```
api-monitoring-system/
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
│   │   ├── monitorController.js  # Monitor CRUD
│   │   └── incidentController.js # Incident management
│   ├── routes/
│   │   ├── authRoutes.js         # Auth routes
│   │   ├── monitorRoutes.js      # Monitor routes
│   │   └── incidentRoutes.js     # Incident routes
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication
│   │   ├── errorHandler.js       # Error handling
│   │   └── validator.js          # Request validation
│   ├── services/
│   │   ├── monitoringService.js  # Core monitoring logic
│   │   ├── alertService.js       # Alert notifications
│   │   └── emailService.js       # Email sending
│   ├── utils/
│   │   ├── logger.js             # Logging utility
│   │   └── helpers.js            # Helper functions
│   └── app.js                    # Express app setup
├── .env                          # Environment variables
├── .gitignore                    # Git ignore file
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
**GitHub:** [github.com/Varshiva1](https://github.com/Varshiva1)  
**LinkedIn:** [linkedin.com/in/shivamvarun75](https://linkedin.com/in/shivamvarun75)