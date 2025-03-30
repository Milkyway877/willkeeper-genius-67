import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageType } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Video, FileAudio, File, Calendar, Clock, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { FutureMessage } from '@/services/tankService';

const COLORS = ['#0088FE', '#FF4F59', '#9061F9', '#48BB78'];

type MessageTypeCount = {
  name: string;
  value: number;
  color: string;
};

type DeliveryTimelineData = {
  name: string;
  letters: number;
  videos: number;
  audio: number;
  documents: number;
};

type SecurityEvent = {
  id: number | string;
  event: string;
  date: string;
  status: 'success' | 'warning' | 'error';
};

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

const handleCreateMessage = (type: MessageType) => {
  // implementation details
};

export const TankAnalytics: React.FC = () => {
  const [messageTypeData, setMessageTypeData] = useState<MessageTypeCount[]>([]);
  const [deliveryTimelineData, setDeliveryTimelineData] = useState<DeliveryTimelineData[]>([]);
  const [upcomingDeliveries, setUpcomingDeliveries] = useState<FutureMessage[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all future messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('future_messages')
          .select('*')
          .order('delivery_date', { ascending: true });
          
        if (messagesError) throw messagesError;
        
        if (messagesData) {
          // Process message type data for pie chart
          const typeCounts: Record<string, number> = {
            'letter': 0,
            'video': 0,
            'audio': 0,
            'document': 0
          };
          
          messagesData.forEach(message => {
            const type = message.message_type || 'letter';
            if (typeCounts[type] !== undefined) {
              typeCounts[type]++;
            } else {
              typeCounts['letter']++; // Default to letter if type is unknown
            }
          });
          
          const typeData: MessageTypeCount[] = [
            { name: 'Letters', value: typeCounts['letter'], color: '#0088FE' },
            { name: 'Videos', value: typeCounts['video'], color: '#FF4F59' },
            { name: 'Audio', value: typeCounts['audio'], color: '#9061F9' },
            { name: 'Documents', value: typeCounts['document'], color: '#48BB78' }
          ].filter(item => item.value > 0); // Only show types that have messages
          
          setMessageTypeData(typeData.length ? typeData : [
            { name: 'No Data', value: 1, color: '#CCCCCC' }
          ]);
          
          // Process delivery timeline data for bar chart
          const currentYear = new Date().getFullYear();
          const years = [currentYear, currentYear + 1, currentYear + 2, `${currentYear + 3}+`];
          
          const timelineData = years.map(year => {
            const yearStr = year.toString();
            const isYearPlus = yearStr.includes('+');
            const yearNumber = parseInt(yearStr.replace('+', ''), 10);
            
            // Filter messages for this year
            const yearMessages = messagesData.filter(message => {
              const messageYear = new Date(message.delivery_date).getFullYear();
              return isYearPlus 
                ? messageYear >= yearNumber 
                : messageYear === yearNumber;
            });
            
            // Count by type
            const letters = yearMessages.filter(m => !m.message_type || m.message_type === 'letter').length;
            const videos = yearMessages.filter(m => m.message_type === 'video').length;
            const audio = yearMessages.filter(m => m.message_type === 'audio').length;
            const documents = yearMessages.filter(m => m.message_type === 'document').length;
            
            return {
              name: yearStr,
              letters,
              videos,
              audio,
              documents
            };
          });
          
          setDeliveryTimelineData(timelineData);
          
          // Get upcoming deliveries (next 3 by delivery date)
          const upcoming = messagesData
            .filter(m => m.status === 'Scheduled' || m.status === 'scheduled')
            .sort((a, b) => 
              new Date(a.delivery_date).getTime() - new Date(b.delivery_date).getTime()
            )
            .slice(0, 3);
            
          setUpcomingDeliveries(upcoming);
          
          // Fetch security events 
          // (This is placeholder - in a real app, you'd fetch from an actual security events table)
          // For now, we'll create some static security events
          const securityEventsData: SecurityEvent[] = [
            { 
              id: 1, 
              event: 'Message encryption updated', 
              date: new Date().toLocaleString(), 
              status: 'success' 
            },
            { 
              id: 2, 
              event: 'Verification check completed', 
              date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleString(), 
              status: 'success' 
            },
            { 
              id: 3, 
              event: 'Delivery system test', 
              date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toLocaleString(), 
              status: 'warning' 
            }
          ];
          
          setSecurityEvents(securityEventsData);
        }
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-willtank-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-800 mb-6">
        <h3 className="text-lg font-medium mb-2">Error Loading Analytics</h3>
        <p>{error}</p>
      </div>
    );
  }

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
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {messageTypeData.length === 1 && messageTypeData[0].name === 'No Data' && (
              <p className="text-center text-gray-500 mt-4">No messages found. Add messages to see analytics.</p>
            )}
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
            {!deliveryTimelineData.some(d => d.letters || d.videos || d.audio || d.documents) && (
              <p className="text-center text-gray-500 mt-4">No scheduled deliveries. Add messages to see timeline.</p>
            )}
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
              {upcomingDeliveries.length > 0 ? (
                <div className="space-y-4">
                  {upcomingDeliveries.map((delivery) => (
                    <div key={delivery.id} className="flex items-center p-3 border rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4 flex-shrink-0">
                        {getTypeIcon((delivery.message_type as MessageType) || 'letter')}
                      </div>
                      
                      <div className="flex-grow">
                        <h4 className="font-medium">{delivery.title || 'Untitled Message'}</h4>
                        <div className="text-sm text-gray-600">To: {delivery.recipient_name}</div>
                      </div>
                      
                      <div className="text-sm text-gray-600 flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {new Date(delivery.delivery_date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No upcoming deliveries scheduled.</p>
                </div>
              )}
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
