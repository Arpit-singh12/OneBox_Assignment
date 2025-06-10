import { connectAndSync } from "./iClient";


// defining elements to store in the array....
type ConnectedAccount = {
  id: string;
  email: string;
  provider: string;
  status: 'connected';
  lastSync: string;
  totalEmails: number;
};

const connectedAccounts: Record<string, boolean> = {};

// Storing connected account in memory as array....
const listAccount: ConnectedAccount[] = [];

// Setting fields for the identification of the user....
export async function addImapAccount(account: {
  email: string;
  password: string;
  host: string;
  port: number;
  secure: boolean;
}) {
  if (connectedAccounts[account.email]) {
    console.log(`Account ${account.email} is already connected.`);
    return;
  }

  try {
    await connectAndSync(account);
    connectedAccounts[account.email] = true;
    
    // checking for duplicate email...
    const existing = listAccount.find(acc => acc.email === account.email);

    if (!existing){
      listAccount.push({
      id: Date.now().toString(),
      email: account.email,
      provider: 'IMAP',
      status: 'connected',
      lastSync: new Date().toISOString(),
      totalEmails: 30,
    });
  }
    
    console.log(`connected to ${account.email}`);
  }catch (error){
    console.log(`Connection failed to ${account.email}:`, error);
  }
}

// retreving all the connected accounts...

// Extracting values from the account obeject and returning to the new array...
export function getConnectedAccounts(){
  return listAccount;
}