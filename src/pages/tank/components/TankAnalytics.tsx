
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageType } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Video, FileAudio, File, Calendar, Clock, ShieldCheck } from 'lucide-react';

const COLORS = ['#0088FE', '#FF4F59', '#9061F9', '#48BB78'];

const messageTypeData = [
  { name: 'Letters', value: 5, color: '#0088FE' },
  { name: 'Videos', value: 3, color: '#FF4F59' },
  { name: 'Audio', value: 2, color: '#9061F9' },
  { name: 'Documents', value: 2, color: '#48BB78' }
];

const deliveryTimelineData = [
  { name: '2023', letters: 1, videos: 1, audio: 0, documents: 0 },
  { name: '2024', letters: 2, videos: 0, audio: 1, documents: 1 },
  { name: '2025', letters: 1, videos: 1, audio: 1, documents: 0 },
  { name: '2026+', letters: 1, videos: 1, audio: 0, documents: 1 }
];

const upcomingDeliveries = [
  { id: 1, title: 'Holiday Greetings', recipient: 'Family', date: '2023-12-25', type: 'video' as MessageType },
  { id: 2, title: 'Birthday Wishes', recipient: 'Sarah', date: '2024-02-15', type: 'letter' as MessageType },
  { id: 3, title: 'Graduation Message', recipient: 'Michael', date: '2024-06-10', type: 'audio' as MessageType }
];

const securityEvents = [
  { id: 1, event: 'Message encryption updated', date: '2023-10-15 10:24 AM', status: 'success' },
  { id: 2, event: 'Verification check completed', date: '2023-10-12 03:15 PM', status: 'success' },
  { id: 3, event: 'Delivery system test', date: '2023-10-05 11:30 AM', status: 'warning' }
];

const getTypeIcon = (type: MessageType) => {
  switch (type) {
    case 'letter':
      return <FileText size={16} className="text-blue-500" />;
    case 'video':
      return <Video size={16} className="text-red-500" />;
    case 'audio':
      return <FileAudio size={16} className="text-purple-500" />;
    case 'document':
      return <File size={16} className="text-green-500" />;
    default:
      return <FileText size={16} />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'success':
      return <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">Success</Badge>;
    case 'warning':
      return <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">Warning</Badge>;
    case 'error':
      return <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50">Error</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

export const TankAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <FileText className="mr-2 h-4 w-4 text-willtank-600" />
              Message Type Distribution
            </CardTitle>
            <CardDescription>Breakdown of your message types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={messageTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {messageTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-willtank-600" />
              Delivery Timeline
            </CardTitle>
            <CardDescription>When your messages are scheduled for delivery</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={deliveryTimelineData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="letters" name="Letters" fill="#0088FE" />
                  <Bar dataKey="videos" name="Videos" fill="#FF4F59" />
                  <Bar dataKey="audio" name="Audio" fill="#9061F9" />
                  <Bar dataKey="documents" name="Documents" fill="#48BB78" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Deliveries</TabsTrigger>
          <TabsTrigger value="security">Security & Verification</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Clock className="mr-2 h-4 w-4 text-willtank-600" />
                Upcoming Deliveries
              </CardTitle>
              <CardDescription>Messages scheduled for delivery soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingDeliveries.map((delivery) => (
                  <div key={delivery.id} className="flex items-center p-3 border rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4 flex-shrink-0">
                      {getTypeIcon(delivery.type)}
                    </div>
                    
                    <div className="flex-grow">
                      <h4 className="font-medium">{delivery.title}</h4>
                      <div className="text-sm text-gray-600">To: {delivery.recipient}</div>
                    </div>
                    
                    <div className="text-sm text-gray-600 flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {new Date(delivery.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <ShieldCheck className="mr-2 h-4 w-4 text-willtank-600" />
                Security Events
              </CardTitle>
              <CardDescription>Recent security and verification activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-grow">
                      <h4 className="font-medium">{event.event}</h4>
                      <div className="text-sm text-gray-600">{event.date}</div>
                    </div>
                    
                    {getStatusBadge(event.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
