import { connectAndSync } from "./iClient";

const connectedAccounts: Record<string, boolean> = {};

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
    console.log(`Successfully connected to ${account.email}`);
  } catch (error) {
    console.error(`Failed to connect to ${account.email}:`, error);
  }
}