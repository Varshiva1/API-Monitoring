const config = {
    port: process.env.PORT || 4000,
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpire: process.env.JWT_EXPIRE || '7d',
    
    // Monitoring intervals (in minutes)
    checkInterval: 5,
    
    // Alert thresholds
    responseTimeThreshold: 5000, // 5 seconds
    downtimeThreshold: 3, // 3 failed checks before incident
    
    // Email configuration
    email: {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASSWORD,
      from: process.env.EMAIL_FROM,
    },
    
    alertEmail: process.env.ALERT_EMAIL,
    slackWebhook: process.env.SLACK_WEBHOOK_URL,
    
    // // Environment
    // isDevelopment: process.env.NODE_ENV === 'development',
    // isProduction: process.env.NODE_ENV === 'production',
  };
  
  export default config;