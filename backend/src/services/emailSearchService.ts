import { client } from '../utils/esClient';

export const searchEmailsByAccount = async (email: string) => {
  const result = await client.search({
    index: 'emails',
    body: {
      query: {
        match: { accountEmail: email }
      }
    },
    size: 100
  });

  return result.hits.hits.map((hit: any) => hit._source);
};