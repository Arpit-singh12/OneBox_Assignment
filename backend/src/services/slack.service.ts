import axios from 'axios';

const SlackWebhook_URL = process.env.SlackWebhook_URL || '';

// Confirmation..
export async function notifySlack(emailData: {
  subject: string;
  from: string;
  to: string;
  date: string;
}) {
  if (!SlackWebhook_URL) {
    console.warn('Slack webhook URL not set.');
    return;
  }

  const message = {
    text: ` *New Interested Email*\n*Subject:* ${emailData.subject}\n*From:* ${emailData.from}\n*To:* ${emailData.to}\n*Date:* ${emailData.date}`,
  };

  try {
    await axios.post(SlackWebhook_URL, message);
    console.log('Slack notification sent.');
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
  }
}
