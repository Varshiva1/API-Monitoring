import nodemailer from 'nodemailer';
import config from '../config/config.js';

// Create reusable transporter
const createTransporter = () => {
  if (!config.email.host || !config.email.user) {
    console.warn('⚠️  Email configuration not set. Email alerts will not be sent.');
    return null;
  }

  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465, // true for 465, false for other ports
    auth: {
      user: config.email.user,
      pass: config.email.password,
    },
  });
};

// Send email
export const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    throw new Error('Email service not configured');
  }

  const mailOptions = {
    from: config.email.from || `API Monitor <${config.email.user}>`,
    to,
    subject,
    html,
    text: text || '', // Plain text version
  };

  const info = await transporter.sendMail(mailOptions);
  
  console.log('📧 Email sent:', info.messageId);
  
  return info;
};

// Send bulk emails
export const sendBulkEmails = async (emails) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    throw new Error('Email service not configured');
  }

  const promises = emails.map(email => 
    transporter.sendMail({
      from: config.email.from || `API Monitor <${config.email.user}>`,
      ...email,
    })
  );

  const results = await Promise.allSettled(promises);
  
  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  
  console.log(`📧 Bulk email sent: ${successful} successful, ${failed} failed`);
  
  return results;
};