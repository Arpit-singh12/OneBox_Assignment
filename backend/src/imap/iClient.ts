import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { format } from 'date-fns';
import { EsStoreEmail } from '../services/elastic.service';

export async function connectAndSync(account: {
  email: string;
  password: string;
  host: string;
  port: number;
  secure: boolean;
}) {
  const client = new ImapFlow({
    host: account.host,
    port: account.port,
    secure: account.secure,
    auth: {
      user: account.email,
      pass: account.password,
    },
  });

  await client.connect();
  console.log(`Connected to ${account.email}`);

  
  await client.mailboxOpen('INBOX');

  
  const since = format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'dd-MMM-yyyy');

  // Fetching last 30 days of emails from the server...
  for await (const msg of client.fetch({ since }, { uid: true, envelope: true, source: true })) {
    if (msg.source) {
      const parsed = await simpleParser(msg.source);
      console.log(`[${account.email}] Subject: ${parsed.subject}`);
      await EsStoreEmail(parsed, 'INBOX', account.email);
    } else {
      console.warn(`[${account.email}] No source found for message with UID: ${msg.uid}`);
    }
  }

  // Start IDLE to listen for new emails..
  client.on('exists', async () => {
    console.log(`New email received for ${account.email}`);
    const lock = await client.getMailboxLock('INBOX');
    try {
      const message = await client.fetchOne('*', { source: true });
      if (message?.source) {
        const parsed = await simpleParser(message.source);
        console.log(`[${account.email}] New: ${parsed.subject}`);
        await EsStoreEmail(parsed, 'INBOX', account.email);
      } else {
        console.warn(`[${account.email}] No source found for the new message.`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      lock.release();
    }
  });

  // To keep the connection alive...
  setInterval(() => {
    client.noop().catch(console.error);
  }, 10 * 60 * 1000); // every 10 minutes
}
