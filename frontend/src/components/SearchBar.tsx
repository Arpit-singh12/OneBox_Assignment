import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import type { SearchFilters, EmailAccount } from '../types/email';
import { clsx } from 'clsx';

interface SearchBarProps {
  filters: SearchFilters;
  accounts: EmailAccount[];
  onSearch: (filters: SearchFilters) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ filters, accounts, onSearch }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      query: '',
      account: 'all',
      folder: 'all',
      category: 'all' as const,
      dateRange: {}
    };
    setLocalFilters(clearedFilters);
    onSearch(clearedFilters);
  };

  const hasActiveFilters = localFilters.account !== 'all' || 
                          localFilters.folder !== 'all' || 
                          localFilters.category !== 'all';

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <form onSubmit={handleSearch} className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search emails by subject, sender, or content..."
            value={localFilters.query}
            onChange={(e) => setLocalFilters({ ...localFilters, query: e.target.value })}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md transition-colors',
              showFilters || hasActiveFilters
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-400 hover:text-gray-600'
            )}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account
              </label>
              <select
                value={localFilters.account}
                onChange={(e) => setLocalFilters({ ...localFilters, account: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Accounts</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.email}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Folder
              </label>
              <select
                value={localFilters.folder}
                onChange={(e) => setLocalFilters({ ...localFilters, folder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Folders</option>
                <option value="INBOX">Inbox</option>
                <option value="SENT">Sent</option>
                <option value="DRAFT">Drafts</option>
                <option value="SPAM">Spam</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={localFilters.category}
                onChange={(e) => setLocalFilters({ ...localFilters, category: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="interested">Interested</option>
                <option value="meeting_booked">Meeting Booked</option>
                <option value="not_interested">Not Interested</option>
                <option value="spam">Spam</option>
                <option value="out_of_office">Out of Office</option>
                <option value="uncategorized">Uncategorized</option>
              </select>
            </div>

            <div className="flex items-end space-x-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  title="Clear filters"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};