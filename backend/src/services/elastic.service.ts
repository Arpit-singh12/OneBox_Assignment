import { Client } from '@elastic/elasticsearch';

const client = new Client({
  node: 'http://localhost:9200',     // Hosting of the ES service to validates credentials...
  headers: {
    'accept': 'application/vnd.elasticsearch+json; compatible-with=8',
    'content-type': 'application/vnd.elasticsearch+json; compatible-with=8'
  }
});

const INDEX = 'emails';



// validating and adding index...
export async function EmailIndex() {
  try {
    console.log("Checking if index exists..");

    const exists = await client.indices.exists({ index: INDEX });

    if (!exists) {
      console.log("Index is not available. Creating one..");

      await client.indices.create({
        index: INDEX,
        mappings: {
          properties: {
            subject: { type: 'text' },
            from: { type: 'text' },
            to: { type: 'text' },
            date: { type: 'date' },
            text: { type: 'text' },
            html: { type: 'text' },
            folder: { type: 'text' },
            account: { type: 'text' },
            category: { type: 'keyword' } 
          },
        },
      });
      console.log(`Index '${INDEX}' created`);
    } else {
      console.log(`Index '${INDEX}' already exists`);
    }

  } catch (error) {
    console.log("! Error in EmailIndex", error);
  }
}

// storing mails in the ES..
export async function EsStoreEmail(email: any, folder: string, account: string, category?: string) {
  try {
    await client.index({
      index: INDEX,
      document: {
        subject: email.subject || '',
        from: email.from?.text || '',
        to: email.to?.text || '',
        date: email.date || '',
        text: email.text || '',
        html: email.html || '',
        folder,
        account,
        category: category || 'Uncategorized' 
      },
    });

    console.log(`Email stored for ${account} in folder '${folder}'`);
  } catch (error) {
    console.log('❗ Error storing email:', error);
  }
}

// searching mails using ES search...

export async function searchEmails(query: string, account: string, folder: string) {
  const must: any[] = [];

  if (account) must.push({ match: { account } });
  if (folder) must.push({ match: { folder } });
  if (query) must.push({ match: { subject: query } }); 

  const esQuery = {
    index: INDEX,
    query: {
      bool: {
        must
      }
    }
  };

  console.log("ES query sent successfully:\n", JSON.stringify(esQuery, null, 2));

  try {
    const response = await client.search(esQuery);
    console.log("ES raw response:\n", JSON.stringify(response.hits.hits, null, 2));

    const results = response.hits.hits.map(hit => hit._source);
    return results;
  } catch (error) {
    console.error("Error searching emails in Elasticsearch:", error);
    return [];
  }
}
