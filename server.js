import dotenv from 'dotenv';
import connectDB from "./src/config/database.js";
import app from "./src/app.js";
import { startMonitoring } from "./src/services/monitoringService.js";

// Load environment variables
dotenv.config();

// Connect to database
connectDB();



const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Start monitoring service
  startMonitoring();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('❌ UNHANDLED REJECTION! Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });
  
  // Handle SIGTERM
  process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('✅ Process terminated');
    });
  });
