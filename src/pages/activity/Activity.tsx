
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity as ActivityIcon, FileText, Users, Shield, Clock, CheckCircle2 } from 'lucide-react';

export default function Activity() {
  const activities = [
    {
      id: 1,
      type: 'will_updated',
      title: 'Will Updated',
      description: 'Your last will and testament was updated',
      timestamp: '2 hours ago',
      icon: FileText,
      status: 'completed'
    },
    {
      id: 2,
      type: 'message_scheduled',
      title: 'Message Scheduled',
      description: 'A future message was scheduled for delivery',
      timestamp: '1 day ago',
      icon: Clock,
      status: 'scheduled'
    },
    {
      id: 3,
      type: 'contact_added',
      title: 'Contact Added',
      description: 'New trusted contact was added to your account',
      timestamp: '3 days ago',
      icon: Users,
      status: 'completed'
    },
    {
      id: 4,
      type: 'security_update',
      title: 'Security Settings Updated',
      description: 'Two-factor authentication was enabled',
      timestamp: '5 days ago',
      icon: Shield,
      status: 'completed'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout forceAuthenticated={true}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center mb-8">
            <ActivityIcon className="h-8 w-8 text-willtank-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your account activity and important events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="p-2 bg-willtank-100 rounded-lg">
                      <activity.icon className="h-5 w-5 text-willtank-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">{activity.title}</h3>
                        <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-2">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
