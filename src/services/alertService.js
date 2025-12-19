import * as emailService from './emailService.js';
import axios from 'axios';
import config from '../config/config.js';

// Send alert for new incident
export const sendAlert = async (monitor, incident) => {
  const promises = [];

  // Send email alert
  if (monitor.alertChannels.email) {
    promises.push(sendEmailAlert(monitor, incident));
  }

  // Send Slack alert
  if (monitor.alertChannels.slack && config.slackWebhook) {
    promises.push(sendSlackAlert(monitor, incident));
  }

  try {
    await Promise.allSettled(promises);
  } catch (error) {
    console.error('Error sending alerts:', error);
  }
};

// Send recovery notification
export const sendRecoveryAlert = async (monitor, incident) => {
  const promises = [];

  if (monitor.alertChannels.email) {
    promises.push(sendEmailRecovery(monitor, incident));
  }

  if (monitor.alertChannels.slack && config.slackWebhook) {
    promises.push(sendSlackRecovery(monitor, incident));
  }

  try {
    await Promise.allSettled(promises);
  } catch (error) {
    console.error('Error sending recovery alerts:', error);
  }
};

// Send email alert
const sendEmailAlert = async (monitor, incident) => {
  const subject = `🚨 Monitor Down: ${monitor.name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e74c3c;">⚠️ Monitor Alert</h2>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
        <p><strong>Monitor:</strong> ${monitor.name}</p>
        <p><strong>URL:</strong> <a href="${monitor.url}">${monitor.url}</a></p>
        <p><strong>Status:</strong> <span style="color: #e74c3c;">${monitor.status}</span></p>
        <p><strong>Incident Type:</strong> ${incident.type.replace('_', ' ').toUpperCase()}</p>
        <p><strong>Time:</strong> ${new Date(incident.startTime).toLocaleString()}</p>
        ${incident.details.errorMessage ? `<p><strong>Error:</strong> ${incident.details.errorMessage}</p>` : ''}
        ${incident.details.statusCode ? `<p><strong>Status Code:</strong> ${incident.details.statusCode}</p>` : ''}
        ${incident.details.responseTime ? `<p><strong>Response Time:</strong> ${incident.details.responseTime}ms</p>` : ''}
      </div>
    </div>
  `;

  try {
    await emailService.sendEmail({
      to: config.alertEmail,
      subject,
      html,
    });

    // Record notification
    incident.notifications.push({
      channel: 'email',
      sentAt: new Date(),
      success: true,
    });
    await incident.save();
  } catch (error) {
    console.error('Failed to send email alert:', error);
    incident.notifications.push({
      channel: 'email',
      sentAt: new Date(),
      success: false,
    });
    await incident.save();
  }
};

// Send Slack alert
const sendSlackAlert = async (monitor, incident) => {
  const message = {
    text: `🚨 Monitor Down: ${monitor.name}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🚨 Monitor Alert',
        },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Monitor:*\n${monitor.name}` },
          { type: 'mrkdwn', text: `*Status:*\n${monitor.status}` },
          { type: 'mrkdwn', text: `*URL:*\n${monitor.url}` },
          { type: 'mrkdwn', text: `*Type:*\n${incident.type}` },
        ],
      },
    ],
  };

  try {
    await axios.post(config.slackWebhook, message);

    incident.notifications.push({
      channel: 'slack',
      sentAt: new Date(),
      success: true,
    });
    await incident.save();
  } catch (error) {
    console.error('Failed to send Slack alert:', error);
    incident.notifications.push({
      channel: 'slack',
      sentAt: new Date(),
      success: false,
    });
    await incident.save();
  }
};

// Send email recovery notification
const sendEmailRecovery = async (monitor, incident) => {
  const subject = `✅ Monitor Recovered: ${monitor.name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #27ae60;">✅ Monitor Recovered</h2>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
        <p><strong>Monitor:</strong> ${monitor.name}</p>
        <p><strong>URL:</strong> <a href="${monitor.url}">${monitor.url}</a></p>
        <p><strong>Status:</strong> <span style="color: #27ae60;">UP</span></p>
        <p><strong>Downtime Duration:</strong> ${incident.getDurationString()}</p>
        <p><strong>Recovered At:</strong> ${new Date(incident.endTime).toLocaleString()}</p>
      </div>
    </div>
  `;

  try {
    await emailService.sendEmail({
      to: config.alertEmail,
      subject,
      html,
    });
  } catch (error) {
    console.error('Failed to send email recovery:', error);
  }
};

// Send Slack recovery notification
// const sendSlackRecovery = async (monitor, incident) => {
//   const message = {
//     text: `✅ Monitor Recovered: ${monitor.name}`,
//     blocks: [
//       {
//         type: 'header',
//         text: {
//           type: 'plain_text',
//           text: '✅ Monitor Recovered',
//         },
//       },
//       {
//         type: 'section',
//         fields: [
//           { type: 'mrkdwn', text: `*Monitor:*\n${monitor.name}` },
//           { type: 'mrkdwn', text: `*Status:*\nUP` },
//           { type: 'mrkdwn', text: `*URL:*\n${monitor.url}` },
//           { type: 'mrkdwn', text: `*Downtime:*\n${incident.getDurationString()}` },
//         ],
//       },
//     ],
//   };

//   try {
//     await axios.post(config.slackWebhook, message);
//   } catch (error) {
//     console.error('Failed to send Slack recovery:', error);
//   }
// };