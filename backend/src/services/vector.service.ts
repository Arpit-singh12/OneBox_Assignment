import { Document } from 'langchain/document';
import { OpenAIEmbeddings } from '@langchain/openai';
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

const CHROMA_COLLECTION_NAME = 'onebox-replies';

let vectorStore: Chroma | null = null;

//Accessing vector store for data...
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
    url: 'http://localhost:8000', // optional local Chroma instance
    collectionMetadata: {
      type: 'job-replies',
    },
  });

  console.log('Vector store initialized and trained');

  return vectorStore;
}

/**
 * RAG: Fetches the most relevant training content based on a query (email text).
 * @param query Text from incoming email
 * @returns Best matched product context string
 */

export async function getRelevantProductContext(query: string): Promise<string> {
  try {
    const store = await getVectorStore();
    const results = await store.similaritySearch(query, 1);

    if (results.length > 0) {
      return results[0].pageContent;
    } else {
      return 'This product automates email replies using AI and booking links.';
    }
  } catch (error) {
    console.error('Failed to fetch vector context:', error);
    return 'Default AI reply assistant context.';
  }
}
