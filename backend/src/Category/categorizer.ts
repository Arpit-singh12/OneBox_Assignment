import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

import { notifySlack, triggerInterestedWebhook } from '../services/webhook.service';

// Gemini Setup...

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// General categories...

export const EmailCategories = [
  'Interested',
  'Action required',
  'Meeting Booked',
  'Not Interested',
  'Spam',
  'Out of Office',
  'Action Required',
] as const;

export type EmailCategory = (typeof EmailCategories)[number];

/**
 * Uses Gemini to categorize an email into a predefined category.
 * @param subject Email subject
 * @param body Email plain text content
 * @param fullEmail (Optional) original parsed email used for webhooks
 */


export async function categorizeEmail(
  subject: string,
  body: string,
  fullEmail?: any
): Promise<EmailCategory | null> {
  try {
    const prompt = `
You are an assistant that categorizes email content into one of the following categories:
- Interested
- Action required
- Meeting Booked
- Not Interested
- Spam
- Out of Office
- Action Required

Only reply with the exact category name from the above list. Do not add any explanation.

Email Subject: ${subject}
Email Body: ${body}
    `.trim();

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const response = await result.response;
    const category = response.text().trim();

    if (EmailCategories.includes(category as EmailCategory)) {
      if (category === 'Interested' && fullEmail) {
        await Promise.all([
          notifySlack(fullEmail),
          triggerInterestedWebhook(fullEmail),
        ]);
      }

      return category as EmailCategory;
    } else {
      console.warn('unknown category Found:', category);           // Gemini replied with unknown category...
    }

    return null;
  } catch (error) {
    console.error('categorization failed:', error);
    return null;
  }
}
