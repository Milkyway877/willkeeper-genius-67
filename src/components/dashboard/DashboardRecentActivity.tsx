
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, Users, ArrowRight, FileText, Shield, Activity } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  timestamp: string;
}

interface DashboardRecentActivityProps {
  activities?: ActivityItem[];
  isLoading?: boolean;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'will_created':
    case 'will_updated':
      return CheckCircle2;
    case 'message_scheduled':
    case 'message_created':
      return Calendar;
    case 'contact_added':
    case 'contact_verified':
      return Users;
    case 'security_updated':
      return Shield;
    case 'document_uploaded':
      return FileText;
    default:
      return Activity;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'will_created':
    case 'will_updated':
      return 'text-green-500';
    case 'message_scheduled':
    case 'message_created':
      return 'text-blue-500';
    case 'contact_added':
    case 'contact_verified':
      return 'text-purple-500';
    case 'security_updated':
      return 'text-amber-500';
    case 'document_uploaded':
      return 'text-indigo-500';
    default:
      return 'text-gray-500';
  }
};

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diffInHours = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));
    return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
};

export function DashboardRecentActivity({ activities = [], isLoading = false }: DashboardRecentActivityProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50 animate-pulse">
                <div className="h-4 w-4 bg-gray-300 rounded"></div>
                <div className="flex-1 min-w-0">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-4">
            <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No recent activity</p>
            <p className="text-xs text-gray-400 mt-1">Start using WillTank to see your activity here</p>
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type);
            
            return (
              <div key={activity.id} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                <Icon className={`h-4 w-4 ${colorClass}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                </div>
              </div>
            );
          })
        )}
        <Button variant="ghost" size="sm" asChild className="w-full mt-3">
          <Link to="/activity">
            View All Activity
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
