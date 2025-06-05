import { OpenAI } from 'openai';
import { notifySlack, triggerInterestedWebhook } from '../services/webhook.service';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


//Required Categories..
export const EmailCategories = [
  'Interested',
  'Action required',
  'Social',
  'Meeting Booked',
  'Not Interested',
  'Spam',
  'Out of Office',
] as const;


//Passing AI prompt to categories emails...based on subject, sender, account...
export type EmailCategory = (typeof EmailCategories)[number];

/**
 * Prompts the AI to categorize the email content.
 * @param subject Subject of the email
 * @param body Body text of the email
 * @returns Predicted category as a string
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
- Meeting Booked
- Not Interested
- Spam
- Out of Office
- Action Required

Only reply with one of the above categories. Do not include any explanation.

Email Subject: ${subject}
Email Body: ${body}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
    });

    const category = response.choices[0].message.content?.trim() ?? '';

    if (EmailCategories.includes(category as EmailCategory)) {
      
      // On getting Interested Category Slack and Webhook URL triggered...
      if (category === 'Interested' && fullEmail) {
        await Promise.all([
          notifySlack(fullEmail),
          triggerInterestedWebhook(fullEmail),
        ]);
      }

      return category as EmailCategory;
    }

    return null;
  } catch (error) {
    console.error('AI categorization failed:', error);
    return null;
  }
}
