import { Client } from '@elastic/elasticsearch';


const client = new Client({
  node: 'http://localhost:9200',
  headers: {
    'accept': 'application/vnd.elasticsearch+json; compatible-with=8',
    'content-type': 'application/vnd.elasticsearch+json; compatible-with=8'
  }
});

const INDEX = 'emails';

export async function EmailIndex() {
    try {
        console.log("Checking if index exists..");

        const exists = await client.indices.exists({ index: INDEX});

        if (!exists){
            console.log("Index is not available. Creating one..");

            await client.indices.create({
                index: INDEX,
                mappings: {
                    properties: {
                        subjects: {type: 'text'},
                        from: {type: 'text'},
                        to: {type: 'text'},
                        date: {type: 'date'},
                        text: {type: 'text'},
                        html: {type: 'text'},
                        folder: {type: 'text'},
                        account: {type: 'text'},
                    },
                },
            });
            console.log(`Index '${INDEX}' created`);
        }else {
            console.log(`Index '${INDEX}' already exists`);
        }

    } catch (error) {
        console.log("! Error in EmailIndex" , error);
    }
}

export async function EsStoreEmail(email: any, folder: string, account: string) {
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
            },
        });

        console.log(`Email stored for ${account} in folder '${folder}'`);
    } catch (error) {
        console.log('❗ Error storing email:', error)
    }
}