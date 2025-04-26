import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, User, Tag, AlertTriangle, CheckCircle, Clock, Eye, Pencil, Send } from 'lucide-react';
import { Message, MessageStatus, MessageType } from './types';
import { getFutureMessages } from '@/services/tankService';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function TankMessageDetail() {
  const { id } = useParams<{ id: string }>();
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadMessage = async () => {
      try {
        const messages = await getFutureMessages();
        const foundMessage = messages.find(msg => msg.id === id);
        
        if (foundMessage) {
          setMessage({
            id: foundMessage.id,
            type: foundMessage.message_type as MessageType,
            title: foundMessage.title || 'Untitled Message',
            recipient: foundMessage.recipient_name || 'No recipient',
            deliveryDate: foundMessage.delivery_date,
            status: foundMessage.status as MessageStatus,
            preview: foundMessage.preview || '',
            category: foundMessage.category || 'letter',
            messageUrl: foundMessage.message_url
          });
        } else {
          toast({
            title: "Message not found",
            description: "The requested message could not be found.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error loading message:', error);
        toast({
          title: "Error",
          description: "An error occurred while loading the message.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      loadMessage();
    }
  }, [id, toast]);

  const getStatusColor = (status: MessageStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-200 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'verified': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const getTypeIcon = (type: MessageType) => {
    switch (type) {
      case 'letter': return <Pencil size={18} />;
      case 'video': return <Eye size={18} />;
      case 'audio': return <Send size={18} />;
      case 'document': return <CheckCircle size={18} />;
      default: return <AlertTriangle size={18} />;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/tank')} 
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Messages
          </Button>
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/4 mb-8" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!message) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-8 px-4 text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/tank')} 
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Messages
          </Button>
          <Card className="p-8">
            <CardContent className="flex flex-col items-center">
              <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Message Not Found</h2>
              <p className="text-gray-600 mb-6">
                The message you are looking for cannot be found or may have been deleted.
              </p>
              <Button onClick={() => navigate('/tank')}>
                Return to Messages
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/tank')} 
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Messages
        </Button>

        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{message?.title}</h1>
            <div className="flex items-center">
              <Badge className={getStatusColor(message?.status || 'draft') + " mr-2"}>
                {message?.status}
              </Badge>
              <span className="flex items-center text-sm text-gray-600">
                {getTypeIcon(message?.type || 'letter')}
                <span className="ml-1 capitalize">{message?.type}</span>
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => navigate(`/tank/edit/${message?.id}`)}
            >
              Edit Message
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium flex items-center mb-2">
                  <Calendar className="h-4 w-4 mr-2 text-willtank-600" />
                  Delivery Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm mb-2">
                    <span className="font-medium">Delivery Date:</span>{' '}
                    {new Date(message.deliveryDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm mb-2">
                    <span className="font-medium">Time:</span>{' '}
                    {new Date(message.deliveryDate).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-xs text-gray-500">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {message.status === 'scheduled' ? (
                      'Scheduled for delivery'
                    ) : message.status === 'delivered' ? (
                      'Successfully delivered'
                    ) : message.status === 'draft' ? (
                      'Not yet scheduled'
                    ) : (
                      'Verified and awaiting delivery'
                    )}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium flex items-center mb-2">
                  <User className="h-4 w-4 mr-2 text-willtank-600" />
                  Recipient Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm mb-2">
                    <span className="font-medium">Name:</span>{' '}
                    {message.recipient}
                  </p>
                  <p className="text-sm mb-2">
                    <span className="font-medium">Category:</span>{' '}
                    <span className="capitalize">{message.category}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    <Tag className="h-3 w-3 inline mr-1" />
                    {message.type === 'video' ? 'Video message' :
                     message.type === 'audio' ? 'Audio recording' :
                     message.category === 'letter' ? 'Personal letter' : 
                     message.category === 'story' ? 'Story or legacy content' : 
                     'Document package'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Message Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-6">
              {message.preview ? (
                <div className="prose max-w-none">
                  <p>{message.preview}</p>
                </div>
              ) : (
                <p className="text-gray-500 italic">No preview available</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button 
              variant="outline"
              onClick={() => navigate('/tank')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Messages
            </Button>
            
            {message.status === 'draft' && (
              <Button 
                onClick={() => navigate(`/tank/edit/${message.id}`)}
              >
                Continue Editing
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
