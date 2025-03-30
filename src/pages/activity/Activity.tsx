
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Clock, MapPin, Monitor } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getUserActivityLogs, ActivityLog } from '@/services/activityService';

export default function Activity() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      const logs = await getUserActivityLogs();
      setActivities(logs);
      setLoading(false);
    };
    
    fetchActivities();
  }, []);
  
  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'login':
        return <div className="bg-green-100 p-2 rounded-full text-green-600">🔑</div>;
      case 'logout':
        return <div className="bg-red-100 p-2 rounded-full text-red-600">🚪</div>;
      case 'profile_update':
        return <div className="bg-blue-100 p-2 rounded-full text-blue-600">👤</div>;
      case 'will_created':
      case 'will_updated':
        return <div className="bg-purple-100 p-2 rounded-full text-purple-600">📄</div>;
      default:
        return <div className="bg-gray-100 p-2 rounded-full text-gray-600">🔍</div>;
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Activity Log</h1>
          <p className="text-gray-600 mt-1">Monitor your account activity</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Track your recent account activities and login sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No activity recorded yet
              </div>
            ) : (
              <div className="space-y-6">
                {activities.map((activity, index) => (
                  <div key={activity.id}>
                    <div className="flex items-start gap-4">
                      {getActivityIcon(activity.action)}
                      
                      <div className="flex-1">
                        <div className="font-medium">
                          {activity.action.split('_').join(' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        
                        <div className="text-sm text-gray-500 mt-1 space-y-1">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                              {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          
                          {activity.device && (
                            <div className="flex items-center gap-1">
                              <Monitor className="h-3.5 w-3.5" />
                              <span>{activity.device}</span>
                            </div>
                          )}
                          
                          {activity.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{activity.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {index < activities.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
