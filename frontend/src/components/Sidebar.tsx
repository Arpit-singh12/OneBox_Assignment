import React from 'react';
import type { EmailAccount } from '../types/email';
import { 
  Inbox, 
  Send, 
  FileText, 
  Archive, 
  Trash2, 
  Settings,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';

interface SidebarProps {
  accounts: EmailAccount[];
  selectedFolder: string;
  onFolderSelect: (folder: string) => void;
}

const folders = [
  { id: 'INBOX', name: 'Inbox', icon: Inbox, count: 12 },
  { id: 'SENT', name: 'Sent', icon: Send, count: 0 },
  { id: 'DRAFT', name: 'Drafts', icon: FileText, count: 3 },
  { id: 'ARCHIVE', name: 'Archive', icon: Archive, count: 0 },
  { id: 'TRASH', name: 'Trash', icon: Trash2, count: 0 },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  accounts, 
  selectedFolder, 
  onFolderSelect 
}) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">OneBox</h1>
        <p className="text-sm text-gray-600">AI-Powered Email Management</p>
      </div>

      {/* Folders */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Folders
          </h2>
          <nav className="space-y-1">
            {folders.map((folder) => {
              const Icon = folder.icon;
              return (
                <button
                  key={folder.id}
                  onClick={() => onFolderSelect(folder.id)}
                  className={clsx(
                    'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors',
                    selectedFolder === folder.id
                      ? 'bg-blue-100 text-blue-900 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <div className="flex items-center">
                    <Icon className="w-4 h-4 mr-3" />
                    {folder.name}
                  </div>
                  {folder.count > 0 && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {folder.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Accounts */}
        <div className="p-4 border-t border-gray-200">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Connected Accounts
          </h2>
          <div className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center min-w-0 flex-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                    {account.name.charAt(0)}
                  </div>
                  <div className="ml-3 min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {account.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {account.email}
                    </div>
                    <div className="text-xs text-gray-400">
                      {account.totalEmails} emails
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {account.isConnected ? (
                    <Wifi className="w-4 h-4 text-green-500\" title="Connected" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500\" title="Disconnected" />
                  )}
                  <button
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title={`Last sync: ${formatDistanceToNow(new Date(account.lastSync), { addSuffix: true })}`}
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Settings className="w-4 h-4 mr-3" />
          Settings
        </button>
      </div>
    </div>
  );
};