import { useState, useEffect } from 'react';
import type { Email, EmailAccount, SearchFilters, SuggestedReply } from '../types/email';

// Mock data for demonstration - replace with actual API calls
const mockEmails: Email[] = [
  {
    id: '1',
    messageId: 'msg-001',
    subject: 'Job Application Follow-up - Frontend Developer Position',
    from: { name: 'Arpit Singh', address: 'Arpit@techcorp.com' },
    to: [{ name: 'You', address: 'user@example.com' }],
    date: new Date().toISOString(),
    body: {
      text: 'Hi, Thank you for your application. We would like to schedule a technical interview. When would be a good time for you?',
      html: '<p>Hi,</p><p>Thank you for your application. We would like to schedule a technical interview. When would be a good time for you?</p>'
    },
    folder: 'INBOX',
    account: 'Account1@example.com',
    category: 'interested',
    isRead: false,
    hasAttachments: false,
    priority: 'high'
  },
  {
    id: '2',
    messageId: 'msg-002',
    subject: 'Meeting Confirmation - Product Demo',
    from: { name: 'Kartik singh', address: 'Kartik@startup.io' },
    to: [{ name: 'You', address: 'you@example.com' }],
    date: new Date(Date.now() - 3600000).toISOString(),
    body: {
      text: 'Great! I have booked our meeting for tomorrow at 2 PM. Looking forward to the demo.',
      html: '<p>Great! I have booked our meeting for tomorrow at 2 PM. Looking forward to the demo.</p>'
    },
    folder: 'INBOX',
    account: 'Account1@example.com',
    category: 'meeting_booked',
    isRead: true,
    hasAttachments: false,
    priority: 'normal'
  },
  {
    id: '3',
    messageId: 'msg-003',
    subject: 'Out of Office - Vacation',
    from: { name: 'Neha', address: 'Neha@company.com' },
    to: [{ name: 'You', address: 'you@example.com' }],
    date: new Date(Date.now() - 7200000).toISOString(),
    body: {
      text: 'I am currently out of office until next Monday. I will respond to your email when I return.',
      html: '<p>I am currently out of office until next Monday. I will respond to your email when I return.</p>'
    },
    folder: 'INBOX',
    account: 'Account@gmail.com',
    category: 'out_of_office',
    isRead: true,
    hasAttachments: false,
    priority: 'low'
  }
];

const mockAccounts: EmailAccount[] = [
  {
    id: '1',
    name: 'User Email',
    email: 'Account@example.com',
    provider: 'Gmail',
    isConnected: true,
    lastSync: new Date().toISOString(),
    totalEmails: 1247
  },
  {
    id: '2',
    name: 'My Gmail',
    email: 'Account2@gmail.com',
    provider: 'Gmail',
    isConnected: true,
    lastSync: new Date(Date.now() - 300000).toISOString(),
    totalEmails: 892
  }
];

export const useEmails = () => {
  const [emails, setEmails] = useState<Email[]>(mockEmails);
  const [accounts, setAccounts] = useState<EmailAccount[]>(mockAccounts);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    account: 'all',
    folder: 'all',
    category: 'all',
    dateRange: {}
  });

  const filteredEmails = emails.filter(email => {
    if (filters.query && !email.subject.toLowerCase().includes(filters.query.toLowerCase()) && 
        !email.from.name.toLowerCase().includes(filters.query.toLowerCase())) {
      return false;
    }
    if (filters.account !== 'all' && email.account !== filters.account) {
      return false;
    }
    if (filters.folder !== 'all' && email.folder !== filters.folder) {
      return false;
    }
    if (filters.category !== 'all' && email.category !== filters.category) {
      return false;
    }
    return true;
  });

  const searchEmails = async (searchFilters: SearchFilters) => {
    setLoading(true);
    setFilters(searchFilters);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const getSuggestedReply = async (emailId: string): Promise<SuggestedReply | null> => {
    // Mock suggested reply - replace with actual RAG API call
    const email = emails.find(e => e.id === emailId);
    if (!email || email.category !== 'interested') return null;

    return {
      id: `reply-${emailId}`,
      emailId,
      suggestion: "Thank you for your interest! I'm excited about this opportunity. You can book a convenient time slot for the technical interview here: https://cal.com/example. Looking forward to discussing my qualifications further.",
      confidence: 0.92,
      context: ['job application', 'technical interview', 'meeting booking']
    };
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new email arrival
      if (Math.random() > 0.95) {
        const newEmail: Email = {
          id: `new-${Date.now()}`,
          messageId: `msg-${Date.now()}`,
          subject: 'New Incoming Email',
          from: { name: 'New Sender', address: 'sender@example.com' },
          to: [{ name: 'You', address: 'you@example.com' }],
          date: new Date().toISOString(),
          body: { text: 'This is a new email that just arrived!' },
          folder: 'INBOX',
          account: 'work@example.com',
          category: 'uncategorized',
          isRead: false,
          hasAttachments: false,
          priority: 'normal'
        };
        setEmails(prev => [newEmail, ...prev]);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return {
    emails: filteredEmails,
    accounts,
    loading,
    filters,
    searchEmails,
    getSuggestedReply
  };
};