import React, { useState, useEffect } from 'react';
import { Search, Mail, Inbox, Send, Archive, Trash2, Star, Filter, User, Settings, Folder, ChevronDown, ChevronRight, Tag, Plus, X, Eye, EyeOff } from 'lucide-react';

// API Configuration
const API_BASE = 'http://localhost:5000/api';

// Generic helper for fetch + JSON parsing + error handling
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  // Check if the URL is correct and backend is running
  const res = await fetch(url, options);
  if (!res.ok) {
    const errorText = await res.text();
    // Log the error for easier debugging
    console.error(`Error fetching ${url}: ${res.status} ${res.statusText} - ${errorText}`);
    throw new Error(`Error fetching ${url}: ${res.status} ${res.statusText} - ${errorText}`);
  }
  return res.json();
}

// Types - Updated to match your backend
interface Email {
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

interface Account {
  id: string;
  name: string;
}

interface Folder {
  id: string;
  name: string;
  accountId: string;
  count: number;
}

interface NewAccountData {
  email: string;
  password: string;
  name: string;
  host: string;
  port: number;
  secure: boolean;
  provider: string;
}

// API Functions
async function fetchAccounts(): Promise<Account[]> {
  const accounts = await fetchJson<any[]>(`${API_BASE}/accounts`);
  // Map _id to id if necessary
  return accounts.map(acc => ({
    id: acc.id || acc._id,
    name: acc.name,
  }));
}

async function fetchFolders(accountId: string): Promise<Folder[]> {
  return fetchJson<Folder[]>(`${API_BASE}/accounts/${accountId}/folders`);
}

async function fetchEmails(folderName: string): Promise<Email[]> {
  return fetchJson<Email[]>(`${API_BASE}/emails?folder=${encodeURIComponent(folderName)}`);
}

async function performEmailAction(emailId: string, action: 'star' | 'archive' | 'delete'): Promise<void> {
  await fetchJson<void>(`${API_BASE}/emails/${emailId}/${action}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

async function addEmailAccount(accountData: NewAccountData): Promise<Account> {
  const acc = await fetchJson<unknown>(`${API_BASE}/accounts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(accountData),
  });
  // Map _id to id if necessary
  const typedAcc = acc as { id?: string; _id?: string; name: string };
  return {
    id: typedAcc.id || typedAcc._id || '',
    name: typedAcc.name,
  };
}

async function searchEmails(query: string): Promise<Email[]> {
  return fetchJson<Email[]>(`${API_BASE}/emails/search?q=${encodeURIComponent(query)}`);
}

// Mock data - Remove this once backend is fully integrated
const mockEmails: Email[] = [];

const EmailClient: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newAccountData, setNewAccountData] = useState<NewAccountData>({
    email: '',
    password: '',
    name: '',
    host: '',
    port: 993,
    secure: true,
    provider: 'IMAP'
  });

  // 🔌 BACKEND INTEGRATION: Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch accounts
        const accountsData = await fetchAccounts();
        setAccounts(accountsData);
        
        // Auto-expand all accounts
        setExpandedAccounts(new Set(accountsData.map(acc => acc.id)));
        
        // Fetch folders for all accounts
        const allFolders: Folder[] = [];
        for (const account of accountsData) {
          try {
            const accountFolders = await fetchFolders(account.id);
            allFolders.push(...accountFolders);
          } catch (err) {
            console.warn(`Failed to fetch folders for account ${account.id}:`, err);
          }
        }
        setFolders(allFolders);
        
      } catch (err) {
        console.error('Failed to load initial data:', err);
        setError('Failed to load accounts and folders');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // 🔌 BACKEND INTEGRATION: Load emails when folder/account changes
  useEffect(() => {
    const loadEmails = async () => {
      if (selectedFolder === 'all') {
        setEmails([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const emailsData = await fetchEmails(selectedFolder);
        setEmails(emailsData);
        
      } catch (err) {
        console.error('Failed to fetch emails:', err);
        setError(`Failed to load emails from ${selectedFolder}`);
        setEmails([]);
      } finally {
        setLoading(false);
      }
    };

    loadEmails();
  }, [selectedFolder]);

  // 🔌 BACKEND INTEGRATION: Search functionality
  useEffect(() => {
    const performSearch = async () => {
      let filtered = emails;

      if (searchQuery.trim()) {
        try {
          setLoading(true);
          // Use backend search API
          const searchResults = await searchEmails(searchQuery.trim());
          filtered = searchResults;
        } catch (err) {
          console.error('Search failed:', err);
          // Fallback to client-side search
          filtered = emails.filter(email =>
            email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
            email.body.toLowerCase().includes(searchQuery.toLowerCase())
          );
        } finally {
          setLoading(false);
        }
      }

      // Filter by account (client-side for now)
      if (selectedAccount !== 'all') {
        // Note: You may need to adjust this based on how account filtering works in your backend
        filtered = filtered.filter(email => {
          // This assumes emails have some account identifier
          // You may need to modify this based on your email structure
          return true; // Placeholder - implement account filtering logic
        });
      }

      // Filter by AI category (client-side)
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(email => email.aiCategory === selectedCategory);
      }

      setFilteredEmails(filtered);
    };

    performSearch();
  }, [emails, searchQuery, selectedAccount, selectedCategory]);

  // 🔌 BACKEND INTEGRATION: Email actions
  const handleEmailAction = async (emailId: string, action: string) => {
    try {
      setLoading(true);
      
      if (action === 'markRead') {
        // TODO: Implement mark as read API if available
        console.log('Mark as read not implemented in backend API');
      } else if (['star', 'archive', 'delete'].includes(action)) {
        await performEmailAction(emailId, action as 'star' | 'archive' | 'delete');
        
        // Update local state based on action
        if (action === 'delete' || action === 'archive') {
          setEmails(prev => prev.filter(email => email.id !== emailId));
          setFilteredEmails(prev => prev.filter(email => email.id !== emailId));
          if (selectedEmail?.id === emailId) {
            setSelectedEmail(null);
          }
        } else if (action === 'star') {
          setEmails(prev => prev.map(email => 
            email.id === emailId ? { ...email, isStarred: !email.isStarred } : email
          ));
          setFilteredEmails(prev => prev.map(email => 
            email.id === emailId ? { ...email, isStarred: !email.isStarred } : email
          ));
          if (selectedEmail?.id === emailId) {
            setSelectedEmail(prev => prev ? { ...prev, isStarred: !prev.isStarred } : null);
          }
        }
      }
    } catch (err) {
      console.error(`Failed to ${action} email:`, err);
      setError(`Failed to ${action} email`);
    } finally {
      setLoading(false);
    }
  };

  // 🔌 BACKEND INTEGRATION: Add new email account
  const handleAddAccount = async (accountData: NewAccountData) => {
    try {
      setLoading(true);
      setError(null);
      
      const newAccount = await addEmailAccount(accountData);
      setAccounts(prev => [...prev, newAccount]);
      
      // Fetch folders for the new account
      try {
        const newAccountFolders = await fetchFolders(newAccount.id);
        setFolders(prev => [...prev, ...newAccountFolders]);
        
        // Expand the new account
        setExpandedAccounts(prev => new Set([...prev, newAccount.id]));
      } catch (err) {
        console.warn(`Failed to fetch folders for new account ${newAccount.id}:`, err);
      }
      
      setShowAddAccountModal(false);
      resetAccountForm();
      
    } catch (err) {
      console.error('Failed to add account:', err);
      setError('Failed to add email account. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const resetAccountForm = () => {
    setNewAccountData({
      email: '',
      password: '',
      name: '',
      host: '',
      port: 993,
      secure: true,
      provider: 'IMAP'
    });
    setShowPassword(false);
  };

  const handleAccountFormChange = (field: keyof NewAccountData, value: string | number | boolean) => {
    setNewAccountData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getCommonEmailSettings = (email: string) => {
    const domain = email.split('@')[1]?.toLowerCase();
    const commonSettings: { [key: string]: { host: string; port: number; provider: string } } = {
      'gmail.com': { host: 'imap.gmail.com', port: 993, provider: 'Gmail' },
      'outlook.com': { host: 'outlook.office365.com', port: 993, provider: 'Outlook' },
      'hotmail.com': { host: 'outlook.office365.com', port: 993, provider: 'Outlook' },
      'yahoo.com': { host: 'imap.mail.yahoo.com', port: 993, provider: 'Yahoo' },
      'icloud.com': { host: 'imap.mail.me.com', port: 993, provider: 'iCloud' },
    };
    
    if (domain && commonSettings[domain]) {
      const settings = commonSettings[domain];
      setNewAccountData(prev => ({
        ...prev,
        host: settings.host,
        port: settings.port,
        provider: settings.provider,
        name: prev.name || email
      }));
    }
  };

  // Get available accounts for dropdown
  const getAccountOptions = () => {
    return accounts.map(account => ({
      value: account.id,
      label: account.name
    }));
  };

  const toggleAccountExpansion = (accountId: string) => {
    const newExpanded = new Set(expandedAccounts);
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId);
    } else {
      newExpanded.add(accountId);
    }
    setExpandedAccounts(newExpanded);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Business': 'bg-blue-100 text-blue-800',
      'Personal': 'bg-green-100 text-green-800',
      'Meeting': 'bg-purple-100 text-purple-800',
      'Newsletter': 'bg-orange-100 text-orange-800',
      'Promotion': 'bg-red-100 text-red-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const uniqueCategories = Array.from(new Set(emails.map(e => e.aiCategory).filter(Boolean)));

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Mail className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">Mail Client</h1>
          </div>
          {error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {error}
            </div>
          )}

        
        </div>
        

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        

        {/* Filters */}
        <div className="px-4 pb-4">
          <div className="space-y-3">
            {/* Account Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Account</label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Accounts</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>{account.name}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">AI Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Accounts and Folders */}
        <div className="flex-1 overflow-y-auto">
          {/* Add Account Button */}
          <div className="px-4 pb-2">
            <button
              onClick={() => setShowAddAccountModal(true)}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Account</span>
            </button>
          </div>

          {accounts.map(account => (
            <div key={account.id} className="mb-2">
              <button
                onClick={() => toggleAccountExpansion(account.id)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span className="truncate">{account.name}</span>
                </div>
                {expandedAccounts.has(account.id) ? 
                  <ChevronDown className="w-4 h-4" /> : 
                  <ChevronRight className="w-4 h-4" />
                }
              </button>
              
              {expandedAccounts.has(account.id) && (
                <div className="ml-4">
                  {folders
                    .filter(folder => folder.accountId === account.id)
                    .map(folder => (
                      <button
                        key={folder.id}
                        onClick={() => setSelectedFolder(folder.name)}
                        className={`w-full flex items-center justify-between px-4 py-1.5 text-sm hover:bg-gray-50 ${
                          selectedFolder === folder.name ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Folder className="w-3 h-3" />
                          <span>{folder.name}</span>
                        </div>
                        <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
                          {folder.count}
                        </span>
                      </button>
                    ))
                  }
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Well-formatted Email Data Section */}
<div className="p-4 bg-gray-50 border-t border-gray-200">
  <h2 className="text-lg font-semibold mb-2 text-gray-800">All Email Data (Detailed View)</h2>
  <div className="space-y-4 max-h-96 overflow-y-auto">
    {filteredEmails.map(email => (
      <div key={email.id} className="bg-white rounded-lg shadow p-4 border border-gray-100">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <div className="font-semibold text-gray-700">ID:</div>
          <div className="text-gray-900">{email.id}</div>
          <div className="font-semibold text-gray-700">From:</div>
          <div className="text-gray-900">{email.from}</div>
          <div className="font-semibold text-gray-700">To:</div>
          <div className="text-gray-900">{email.to}</div>
          <div className="font-semibold text-gray-700">Subject:</div>
          <div className="text-gray-900">{email.subject}</div>
          <div className="font-semibold text-gray-700">Body:</div>
          <div className="text-gray-900 whitespace-pre-wrap">{email.body}</div>
          <div className="font-semibold text-gray-700">Timestamp:</div>
          <div className="text-gray-900">{formatTimestamp(email.timestamp)}</div>
          <div className="font-semibold text-gray-700">Read:</div>
          <div className="text-gray-900">{email.isRead ? 'Yes' : 'No'}</div>
          <div className="font-semibold text-gray-700">Starred:</div>
          <div className="text-gray-900">{email.isStarred ? 'Yes' : 'No'}</div>
          {email.aiCategory && (
            <>
              <div className="font-semibold text-gray-700">AI Category:</div>
              <div className="text-gray-900">{email.aiCategory}</div>
            </>
          )}
          {email.aiCategoryConfidence !== undefined && (
            <>
              <div className="font-semibold text-gray-700">AI Confidence:</div>
              <div className="text-gray-900">{Math.round(email.aiCategoryConfidence * 100)}%</div>
            </>
          )}
          {email.attachments && email.attachments.length > 0 && (
            <>
              <div className="font-semibold text-gray-700">Attachments:</div>
              <div className="text-gray-900">{email.attachments.join(', ')}</div>
            </>
          )}
        </div>
      </div>
    ))}
    {filteredEmails.length === 0 && (
      <div className="text-gray-500 text-sm">No emails to display.</div>
    )}
  </div>
</div>

      {/* Email List */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {filteredEmails.length} emails
            </h2>
            <div className="flex items-center space-x-2">
              <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
                <Filter className="w-4 h-4" />
              </button>
              <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              Loading...
            </div>
          )}
          
          {!loading && filteredEmails.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              {searchQuery ? 'No emails found matching your search' : 'No emails in this folder'}
            </div>
          )}
          
          {!loading && filteredEmails.map(email => (
            <div
              key={email.id}
              onClick={() => setSelectedEmail(email)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedEmail?.id === email.id ? 'bg-blue-50 border-blue-200' : ''
              } ${!email.isRead ? 'bg-blue-25' : ''}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`text-sm font-medium ${!email.isRead ? 'text-gray-900' : 'text-gray-700'} truncate`}>
                      {email.from}
                    </span>
                    {email.isStarred && <Star className="w-3 h-3 text-yellow-400 fill-current" />}
                  </div>
                  <h3 className={`text-sm ${!email.isRead ? 'font-semibold text-gray-900' : 'text-gray-800'} truncate`}>
                    {email.subject}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {email.body}
                  </p>
                </div>
                <div className="ml-3 flex flex-col items-end space-y-1">
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(email.timestamp)}
                  </span>
                  {!email.isRead && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </div>
              </div>
              
              {/* AI Category Badge */}
              {email.aiCategory && (
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(email.aiCategory)}`}>
                    <Tag className="w-3 h-3 mr-1" />
                    {email.aiCategory}
                  </span>
                  {email.aiCategoryConfidence && (
                    <span className="text-xs text-gray-400">
                      {Math.round(email.aiCategoryConfidence * 100)}%
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Email Detail */}
      <div className="flex-1 flex flex-col">
        {selectedEmail ? (
          <>
            {/* Email Header */}
            <div className="p-6 border-b border-gray-200 bg-white">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedEmail.subject}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span><strong>From:</strong> {selectedEmail.from}</span>
                    <span><strong>To:</strong> {selectedEmail.to}</span>
                    <span>{formatTimestamp(selectedEmail.timestamp)}</span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEmailAction(selectedEmail.id, 'star')}
                    className={`p-2 rounded-lg hover:bg-gray-100 ${
                      selectedEmail.isStarred ? 'text-yellow-500' : 'text-gray-400'
                    }`}
                  >
                    <Star className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleEmailAction(selectedEmail.id, 'archive')}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"
                  >
                    <Archive className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleEmailAction(selectedEmail.id, 'delete')}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* AI Category and Confidence */}
              {selectedEmail.aiCategory && (
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedEmail.aiCategory)}`}>
                    <Tag className="w-4 h-4 mr-1" />
                    AI Category: {selectedEmail.aiCategory}
                  </span>
                  {selectedEmail.aiCategoryConfidence && (
                    <span className="text-sm text-gray-500">
                      Confidence: {Math.round(selectedEmail.aiCategoryConfidence * 100)}%
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Email Body */}
            <div className="flex-1 p-6 bg-white overflow-y-auto">
              <div className="prose max-w-none">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {selectedEmail.body}
                </p>
              </div>

              {/* Attachments */}
              {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Attachments</h3>
                  <div className="space-y-2">
                    {selectedEmail.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                        <Archive className="w-4 h-4" />
                        <span>{attachment}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reply/Forward Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex space-x-3">
                <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                  Reply
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300">
                  Reply All
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300">
                  Forward
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select an email to view</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Account Modal */}
      {showAddAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add Email Account</h2>
              <button
                onClick={() => {
                  setShowAddAccountModal(false);
                  resetAccountForm();
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddAccount(newAccountData);
              }}
              className="p-6 space-y-4"
            >
              {/* Email Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newAccountData.email}
                  onChange={(e) => {
                    handleAccountFormChange('email', e.target.value);
                    if (e.target.value.includes('@')) {
                      getCommonEmailSettings(e.target.value);
                    }
                  }}
                  placeholder="your.email@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newAccountData.password}
                    onChange={(e) => handleAccountFormChange('password', e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Account Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  value={newAccountData.name}
                  onChange={(e) => handleAccountFormChange('name', e.target.value)}
                  placeholder="My Work Email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Optional: Display name for this account</p>
              </div>

              {/* Provider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider
                </label>
                <select
                  value={newAccountData.provider}
                  onChange={(e) => handleAccountFormChange('provider', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="IMAP">IMAP</option>
                  <option value="Gmail">Gmail</option>
                  <option value="Outlook">Outlook</option>
                  <option value="Yahoo">Yahoo</option>
                  <option value="iCloud">iCloud</option>
                </select>
              </div>

              {/* Advanced Settings */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Advanced Settings</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* Host */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Host *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAccountData.host}
                      onChange={(e) => handleAccountFormChange('host', e.target.value)}
                      placeholder="imap.example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Port */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Port *
                    </label>
                    <input
                      type="number"
                      required
                      value={newAccountData.port}
                      onChange={(e) => handleAccountFormChange('port', parseInt(e.target.value))}
                      placeholder="993"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Secure Connection */}
                <div className="mt-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newAccountData.secure}
                      onChange={(e) => handleAccountFormChange('secure', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Use secure connection (SSL/TLS)</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Recommended for security</p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddAccountModal(false);
                    resetAccountForm();
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newAccountData.email || !newAccountData.password || !newAccountData.host || loading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Adding...' : 'Add Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailClient;