import React from 'react';
import type { EmailAccount } from '../types/email';
import { 
  Mail, 
  Zap, 
  Calendar, 
  AlertTriangle, 
  TrendingUp,
  Activity,
  Clock,
  Users
} from 'lucide-react';

interface DashboardProps {
  accounts: EmailAccount[];
  totalEmails: number;
  categoryCounts: Record<string, number>;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  accounts, 
  totalEmails, 
  categoryCounts 
}) => {
  const stats = [
    {
      name: 'Total Emails',
      value: totalEmails,
      icon: Mail,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      name: 'Interested Leads',
      value: categoryCounts.interested || 0,
      icon: Zap,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      name: 'Meetings Booked',
      value: categoryCounts.meeting_booked || 0,
      icon: Calendar,
      color: 'bg-purple-500',
      change: '+15%'
    },
    {
      name: 'Pending Replies',
      value: categoryCounts.interested + categoryCounts.meeting_booked || 0,
      icon: Clock,
      color: 'bg-orange-500',
      change: '-3%'
    }
  ];

  const recentActivity = [
    {
      type: 'interested',
      message: 'New interested lead from Sarah Johnson',
      time: '2 minutes ago',
      icon: Zap,
      color: 'text-green-600'
    },
    {
      type: 'meeting',
      message: 'Meeting booked with Mike Chen',
      time: '1 hour ago',
      icon: Calendar,
      color: 'text-purple-600'
    },
    {
      type: 'sync',
      message: 'Synced 15 new emails from work@example.com',
      time: '2 hours ago',
      icon: Activity,
      color: 'text-blue-600'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your email management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                <span className="text-sm text-gray-500 ml-1">from last week</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Account Status</h2>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {accounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                    {account.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{account.name}</div>
                    <div className="text-xs text-gray-500">{account.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    account.isConnected 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {account.isConnected ? 'Connected' : 'Disconnected'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {account.totalEmails} emails
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Icon className={`w-5 h-5 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(categoryCounts).map(([category, count]) => (
            <div key={category} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600 capitalize">
                {category.replace('_', ' ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};