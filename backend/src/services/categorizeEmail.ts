import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
  const prompt = `You are an AI email assistant. Categorize the following email into one of the categories: ${CATEGORY_OPTIONS.join(", ")}.

Subject: ${subject}

Body: ${body}

Reply with only the category.`;

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4o',
    });

    const category = completion.choices[0].message.content?.trim();

    if (CATEGORY_OPTIONS.includes(category || '')) {
      return category as string;
    }

    return 'Uncategorized';
  } catch (err) {
    console.error('Error categorizing email:', err);
    return 'Uncategorized';
  }
}