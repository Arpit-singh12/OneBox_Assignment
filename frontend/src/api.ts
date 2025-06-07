// src/api.ts

// Define your data types based on your backend response shape
export interface Account {
  id: string;
  name: string;
}

export interface Folder {
  id: string;
  name: string;
  accountId: string;
  count: number;
}

export interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  aiCategory?: string;
  aiCategoryConfidence?: number;
  attachments?: string[];
}

const API_BASE = 'http://localhost:5000/api';

// Generic helper for fetch + JSON parsing + error handling
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error fetching ${url}: ${errorText}`);
  }
  return res.json();
}

// API calls

export async function fetchAccounts(): Promise<Account[]> {
  return fetchJson<Account[]>(`${API_BASE}/accounts`);
}

export async function fetchFolders(accountId: string): Promise<Folder[]> {
  return fetchJson<Folder[]>(`${API_BASE}/accounts/${accountId}/folders`);
}

export async function fetchEmails(folderName: string): Promise<Email[]> {
  return fetchJson<Email[]>(`${API_BASE}/emails?folder=${encodeURIComponent(folderName)}`);
}

export async function performEmailAction(emailId: string, action: 'star' | 'archive' | 'delete'): Promise<void> {
  await fetchJson<void>(`${API_BASE}/emails/${emailId}/${action}`, {
    method: 'POST',
  });
}
