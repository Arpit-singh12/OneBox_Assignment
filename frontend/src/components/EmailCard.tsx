import React from 'react';
import type { Email } from '../types/email';
import { formatDistanceToNow } from 'date-fns';
import { 
  Mail, 
  MailOpen, 
  Paperclip, 
  AlertCircle, 
  Calendar, 
  X, 
  Zap,
  Clock
} from 'lucide-react';
import { clsx } from 'clsx';

interface EmailCardProps {
  email: Email;
  isSelected: boolean;
  onClick: () => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'interested':
      return <Zap className="w-4 h-4 text-green-500" />;
    case 'meeting_booked':
      return <Calendar className="w-4 h-4 text-blue-500" />;
    case 'not_interested':
      return <X className="w-4 h-4 text-red-500" />;
    case 'spam':
      return <AlertCircle className="w-4 h-4 text-orange-500" />;
    case 'out_of_office':
      return <Clock className="w-4 h-4 text-purple-500" />;
    default:
      return null;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'interested':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'meeting_booked':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'not_interested':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'spam':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'out_of_office':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const EmailCard: React.FC<EmailCardProps> = ({ email, isSelected, onClick }) => {
  const timeAgo = formatDistanceToNow(new Date(email.date), { addSuffix: true });

  return (
    <div
      className={clsx(
        'p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md',
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 bg-white hover:border-gray-300',
        !email.isRead && 'border-l-4 border-l-blue-500'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {email.isRead ? (
            <MailOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
          ) : (
            <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
          )}
          <span className={clsx(
            'font-medium truncate',
            !email.isRead ? 'text-gray-900' : 'text-gray-700'
          )}>
            {email.from.name || email.from.address}
          </span>
          <span className="text-xs text-gray-500 flex-shrink-0">{timeAgo}</span>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          {email.hasAttachments && (
            <Paperclip className="w-4 h-4 text-gray-400" />
          )}
          {email.priority === 'high' && (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
        </div>
      </div>

      <div className="mb-2">
        <h3 className={clsx(
          'text-sm truncate',
          !email.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
        )}>
          {email.subject}
        </h3>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={clsx(
            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
            getCategoryColor(email.category)
          )}>
            {getCategoryIcon(email.category)}
            <span className="ml-1 capitalize">
              {email.category.replace('_', ' ')}
            </span>
          </span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {email.account}
          </span>
        </div>
        
        <div className="text-xs text-gray-500">
          {email.folder}
        </div>
      </div>

      {!email.isRead && email.body.text && (
        <div className="mt-2 text-sm text-gray-600 line-clamp-2">
          {email.body.text.substring(0, 120)}...
        </div>
      )}
    </div>
  );
};