import { OpenAI } from 'openai';
import { getVectorStore } from './vector.service';
import { EmailCategory } from '../Category/categorizer';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function suggestReply(subject: string, body: string): Promise<string> {
  const vectorStore = await getVectorStore();

  const query = `${subject} ${body}`;
  const results = await vectorStore.similaritySearch(query, 3);

  const retrievedContext = results.map(r => r.pageContent).join('\n\n');

  const prompt = `
You are an AI assistant helping write email replies.

Here is some context about our outreach agenda:
${retrievedContext}

Now, write a polite and professional reply to the following email:

Subject: ${subject}

Body:
${body}

Make sure the reply is:
- Respectful and context-aware
- Aligned with the agenda
- Includes booking link if the lead is interested

Reply:
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a helpful AI email assistant.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.5,
  });

  const reply = completion.choices[0].message.content?.trim() ?? '';
  return reply;
}
