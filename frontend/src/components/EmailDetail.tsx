import React, { useState, useEffect } from 'react';
import type { Email, SuggestedReply } from '../types/email';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  ArrowLeft, 
  Reply, 
  Forward, 
  Archive, 
  Trash2, 
  Star,
  Paperclip,
  ExternalLink,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';
import { clsx } from 'clsx';

interface EmailDetailProps {
  email: Email;
  onBack: () => void;
  getSuggestedReply: (emailId: string) => Promise<SuggestedReply | null>;
}

export const EmailDetail: React.FC<EmailDetailProps> = ({ 
  email, 
  onBack, 
  getSuggestedReply 
}) => {
  const [suggestedReply, setSuggestedReply] = useState<SuggestedReply | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (email.category === 'interested') {
      setLoadingSuggestion(true);
      getSuggestedReply(email.id).then(reply => {
        setSuggestedReply(reply);
        setLoadingSuggestion(false);
      });
    }
  }, [email.id, email.category, getSuggestedReply]);

  const handleCopyReply = async () => {
    if (suggestedReply) {
      await navigator.clipboard.writeText(suggestedReply.suggestion);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(email.date), { addSuffix: true });
  const fullDate = format(new Date(email.date), 'PPpp');

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to inbox
          </button>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Star className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Archive className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-xl font-semibold text-gray-900">{email.subject}</h1>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                {email.from.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-gray-900">{email.from.name}</div>
                <div className="text-sm text-gray-600">{email.from.address}</div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-900" title={fullDate}>{timeAgo}</div>
              <div className="text-xs text-gray-500">{email.account}</div>
            </div>
          </div>

          {email.hasAttachments && (
            <div className="flex items-center text-sm text-gray-600">
              <Paperclip className="w-4 h-4 mr-1" />
              Has attachments
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="prose max-w-none">
          {email.body.html ? (
            <div dangerouslySetInnerHTML={{ __html: email.body.html }} />
          ) : (
            <div className="whitespace-pre-wrap text-gray-900">
              {email.body.text}
            </div>
          )}
        </div>

        {/* AI Suggested Reply */}
        {email.category === 'interested' && (
          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
              <div className="flex items-center mb-4">
                <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">AI Suggested Reply</h3>
                {suggestedReply && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {Math.round(suggestedReply.confidence * 100)}% confidence
                  </span>
                )}
              </div>

              {loadingSuggestion ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : suggestedReply ? (
                <div>
                  <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                    <p className="text-gray-900 leading-relaxed">
                      {suggestedReply.suggestion}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {suggestedReply.context.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <button
                      onClick={handleCopyReply}
                      className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Reply
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">No suggestion available for this email.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Reply className="w-4 h-4 mr-2" />
            Reply
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Forward className="w-4 h-4 mr-2" />
            Forward
          </button>
          {email.category === 'interested' && (
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <ExternalLink className="w-4 h-4 mr-2" />
              Send to Slack
            </button>
          )}
        </div>
      </div>
    </div>
  );
};