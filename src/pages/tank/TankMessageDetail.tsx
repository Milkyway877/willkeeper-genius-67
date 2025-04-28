
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileText, Video, Mic, File, Calendar, Mail, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getFutureMessages, FutureMessage } from '@/services/tankService';
import { MessagePreview } from './components/preview/MessagePreview';
import DeliverySystem from './components/DeliverySystem';

export default function TankMessageDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [message, setMessage] = useState<FutureMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);

  const fetchMessage = async () => {
    try {
      setLoading(true);
      const messages = await getFutureMessages();
      const foundMessage = messages.find(msg => msg.id === id);
      
      if (foundMessage) {
        console.log('Found message:', foundMessage);
        setMessage(foundMessage);
      }
    } catch (error) {
      console.error('Error fetching message:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchMessage();
    }
  }, [id]);

  const handleBack = () => {
    navigate('/tank');
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-amber-500';
      case 'delivered': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getIcon = () => {
    if (!message || !message.message_type) return <FileText />;
    
    switch (message.message_type) {
      case 'video': return <Video className="h-6 w-6 text-blue-500" />;
      case 'audio': return <Mic className="h-6 w-6 text-green-500" />;
      case 'document': return <File className="h-6 w-6 text-amber-500" />;
      default: return <FileText className="h-6 w-6 text-purple-500" />;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!message) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-4">Message Not Found</h1>
          <p className="text-gray-600 mb-6">This message may have been deleted or does not exist.</p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tank
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button onClick={handleBack} variant="outline" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tank
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
            <div className="flex items-center gap-2 mb-2 md:mb-0">
              {getIcon()}
              <h1 className="text-2xl md:text-3xl font-bold">{message.title}</h1>
            </div>
            <Badge 
              className={`${getStatusColor(message.status)} text-white capitalize px-3 py-1 text-sm`}
            >
              {message.status}
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-4">
            <Badge variant="outline" className="capitalize">
              {message.message_type}
            </Badge>
            {message.category && (
              <Badge variant="outline" className="capitalize">
                {message.category}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-2">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Message Preview</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{message.preview || message.content}</p>
                  </div>
                  
                  <div className="mt-4">
                    <Button onClick={handlePreview}>
                      View Full Message
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2">Delivery Details</h3>
                  <dl className="grid grid-cols-2 gap-2">
                    <dt className="text-gray-600">Recipient:</dt>
                    <dd>{message.recipient_name}</dd>
                    
                    <dt className="text-gray-600">Email:</dt>
                    <dd className="flex items-center">
                      <Mail className="h-4 w-4 mr-1 text-gray-500" />
                      {message.recipient_email}
                    </dd>
                    
                    <dt className="text-gray-600">Delivery Type:</dt>
                    <dd className="capitalize">{message.delivery_type}</dd>
                    
                    <dt className="text-gray-600">Date:</dt>
                    <dd className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                      {new Date(message.delivery_date).toLocaleDateString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <DeliverySystem message={message} onDeliveryComplete={() => {
              if (id) {
                fetchMessage();
              }
            }} />
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">Message Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="h-2 w-2 rounded-full bg-green-500 mt-2 mr-2"></div>
                    <div>
                      <p className="font-medium">Created</p>
                      <p className="text-sm text-gray-500">
                        {new Date(message.created_at || '').toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className={`h-2 w-2 rounded-full mt-2 mr-2 ${
                      message.status === 'delivered' ? 'bg-green-500' : 
                      message.status === 'processing' ? 'bg-blue-500' : 
                      message.status === 'failed' ? 'bg-red-500' : 'bg-gray-300'
                    }`}></div>
                    <div>
                      <p className="font-medium">Delivery Status</p>
                      <p className="text-sm text-gray-500 capitalize">
                        {message.status} 
                        {message.status === 'scheduled' && ' (pending)'}
                      </p>
                    </div>
                  </div>
                  
                  {message.updated_at && message.updated_at !== message.created_at && (
                    <div className="flex items-start">
                      <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 mr-2"></div>
                      <div>
                        <p className="font-medium">Last Updated</p>
                        <p className="text-sm text-gray-500">
                          {new Date(message.updated_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {message && (
        <MessagePreview
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          messageType={message.message_type as any || 'letter'}
          title={message.title || ''}
          content={message.content || ''}
          messageUrl={message.message_url || ''}
        />
      )}
    </Layout>
  );
}
