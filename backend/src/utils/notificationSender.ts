import axios from 'axios';
import { SlackWebhook_URL, INTERESTED_WEBHOOK_URL } from '../config/notification';

export async function sendSlackNotification(message: string) {
  if (!SlackWebhook_URL) {
    console.warn('Slack webhook URL is not configured.');
    return;
  }

  try {
    await axios.post(SlackWebhook_URL, {
      text: message,
    });
    console.log('Slack notification sent.');
  } catch (error) {
    console.error('Error sending Slack notification:', error);
  }
}


// Dealing with external hooks
export async function triggerExternalWebhook(payload: any) {
  if (!INTERESTED_WEBHOOK_URL) {
    console.warn('External webhook URL is not configured.');
    return;
  }

  try {
    await axios.post(INTERESTED_WEBHOOK_URL, payload);
    console.log('External webhook triggered.');
  } catch (error) {
    console.error('Error triggering external webhook:', error);
  }
}