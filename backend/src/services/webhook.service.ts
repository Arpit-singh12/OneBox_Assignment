import axios from 'axios';
import { INTERESTED_WEBHOOK_URL, SlackWebhook_URL } from '../config/notification';

export async function triggerInterestedWebhook(email: any) {
  if (!INTERESTED_WEBHOOK_URL) {
    console.warn("INTERESTED_WEBHOOK_URL not set");
    return;
  }

  try {
    await axios.post(INTERESTED_WEBHOOK_URL, {
      subject: email.subject,
      from: email.from?.text,
      date: email.date,
      text: email.text,
      html: email.html
    });
    console.log("External webhook triggered for Interested email");
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to trigger external webhook:", error.message);
    } else {
      console.error("Failed to trigger external webhook:", error);
    }
  }
}

// validation checking for the SLACK URL...

export async function notifySlack(email: any) {
  if (!SlackWebhook_URL) {
    console.warn("SlackWebhook_URL not set");
    return;
  }

  const message = {
    text: ` *Interested Email Received*\n*From:* ${email.from?.text}\n*Subject:* ${email.subject}`,
  };

  try {
    await axios.post(SlackWebhook_URL, message);
    console.log("Slack notification sent for Interested email");
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to send Slack notification:", error.message);
    } else {
      console.error("Failed to send Slack notification:", error);
    }
  }
}
