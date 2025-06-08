import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

import { getRelevantProductContext } from './vector.service';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

/**
 * Suggests a reply based on the email + context using Gemini
 * @param subject Email subject
 * @param body Email body
 * @param emailAddress Email recipient
 * @returns AI suggested reply as string
 */

export async function suggestReply(
  subject: string,
  body: string,
  emailAddress: string
): Promise<string> {
  try {

    // Taking out relevant/trained text from vector...
    const context = await getRelevantProductContext(subject + ' ' + body);

    const prompt = `
You are an AI assistant helping a user craft professional email replies.

Based on the context and the received email, suggest a concise and polite reply.

Context (Product or Outreach Agenda):
${context}

---

Email Received:
Subject: ${subject}
Body: ${body}

---

Now write a reply (no intro or explanation, just the response):
    `.trim();

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Failed to generate Auto reply:', error);
    return 'Sorry, No available responses...';
  }
}
