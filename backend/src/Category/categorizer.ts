import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

// List of supported email categories.


export const EmailCategories = [
  'Interested',
  'Action required',
  'Social',
  'Meeting Booked',
  'Not Interested',
  'Spam',
  'Out of Office',
] as const;

export type EmailCategory = (typeof EmailCategories)[number];

/**
 * Prompts the AI to categorize the email content.
 * @param subject Subject of the email
 * @param body Body text of the email
 * @returns Predicted category as a string
 */
export async function categorizeEmail(subject: string, body: string): Promise<EmailCategory | null> {
  try {
    const prompt = `
You are an assistant that categorizes email content into one of the following categories:
- Interested
- Meeting Booked
- Not Interested
- Spam
- Out of Office

Only reply with one of the above categories. Do not include any explanation.

Email Subject: ${subject}
Email Body: ${body}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4', // Use gpt-4 or gpt-3.5-turbo
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
    });

    const category = response.choices[0].message.content?.trim() ?? '';

    if (EmailCategories.includes(category as EmailCategory)) {
      return category as EmailCategory;
    }

    return null;
  } catch (error) {
    console.error('AI categorization failed:', error);
    return null;
  }
}
