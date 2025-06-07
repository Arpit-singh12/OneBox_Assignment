import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from 'langchain/document';
import { Chroma } from '@langchain/community/vectorstores/chroma';

import * as path from 'path';

const trainingData = [
  {
    text: `I am applying for a job position. If the lead is interested, share the meeting booking link: https://cal.com/example`
  },
  {
    text: `If someone wants more information, politely respond and ask them to book a meeting or reply with questions.`
  },
  {
    text: `If someone says 'let's connect later', acknowledge and say you'll follow up soon.`
  },
  {
    text: `For shortlisted candidates, thank them and offer available slots using: https://cal.com/example`
  },
  {
    text: `If it's an out-of-office reply, no need to take action.`
  }
];

// Optional: can make this configurable
const CHROMA_COLLECTION_NAME = 'onebox-replies';

let vectorStore: Chroma | null = null;

export async function getVectorStore(): Promise<Chroma> {
  if (vectorStore) return vectorStore;

  const docs = trainingData.map(
    (item, i) =>
      new Document({
        pageContent: item.text,
        metadata: { id: i },
      })
  );

  vectorStore = await Chroma.fromDocuments(docs, new OpenAIEmbeddings(), {
    collectionName: CHROMA_COLLECTION_NAME,
    url: 'http://localhost:8000', // if you're running a local Chroma instance (optional)
    collectionMetadata: {
      type: 'job-replies',
    },
  });

  console.log('✅ Vector store initialized and trained');

  return vectorStore;
}
