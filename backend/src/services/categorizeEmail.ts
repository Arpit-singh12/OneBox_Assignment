import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// categories for the ai API to specify mails..
const CATEGORY_OPTIONS = [
  'Interested',
  'Action required',
  'Social',
  'Meeting Booked',
  'Not Interested',
  'Spam',
  'Out of Office',
];

export async function categorizeEmail(subject: string, body: string): Promise<string> {
  const prompt = `
You are an AI email assistant. Categorize the following email into one of these categories:

${CATEGORY_OPTIONS.join(', ')}

Do not explain. Just reply with the exact category.

Subject: ${subject}
Body: ${body}
  `.trim();

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
        
    const response = await result.response;
    const category = response.text().trim();

    if (CATEGORY_OPTIONS.includes(category)) {
      return category;
    }

    return 'Uncategorized';
  } catch (error) {
    console.error('Error in categorizing email:', error);
    return 'Uncategorized';
  }
}
