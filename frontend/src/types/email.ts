export interface Email {
  id: string;
  messageId: string;
  subject: string;
  from: {
    name: string;
    address: string;
  };
  to: {
    name: string;
    address: string;
  }[];
  cc?: {
    name: string;
    address: string;
  }[];
  date: string;
  body: {
    text?: string;
    html?: string;
  };
  folder: string;
  account: string;
  category: EmailCategory;
  isRead: boolean;
  hasAttachments: boolean;
  priority: 'high' | 'normal' | 'low';
}

export type EmailCategory = 
  | 'interested' 
  | 'action_required'
  | 'meeting_booked' 
  | 'not_interested' 
  | 'spam' 
  | 'out_of_office' 
  | 'uncategorized';

export interface EmailAccount {
  id: string;
  name: string;
  email: string;
  provider: string;
  isConnected: boolean;
  lastSync: string;
  totalEmails: number;
}

export interface SearchFilters {
  query: string;
  account: string;
  folder: string;
  category: EmailCategory | 'all';
  dateRange: {
    from?: string;
    to?: string;
  };
}

export interface SuggestedReply {
  id: string;
  emailId: string;
  suggestion: string;
  confidence: number;
  context: string[];
}