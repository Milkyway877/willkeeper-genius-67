import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Clock, Send, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { Message, MessageStatus, MessageType, MessageCategory } from '../types';
import { getFutureMessages, deleteFutureMessage } from '@/services/tankService';
import { MessagePreview } from './preview/MessagePreview';
import { useToast } from '@/hooks/use-toast';

export const TankDashboard: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewMessage, setPreviewMessage] = useState<Message | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const fetchedMessages = await getFutureMessages();
        const formattedMessages = fetchedMessages.map(msg => ({
          id: msg.id,
          type: msg.message_type as MessageType,
          title: msg.title || 'Untitled Message',
          recipient: msg.recipient_name || 'No recipient',
          deliveryDate: msg.delivery_date,
          status: msg.status as MessageStatus,
          preview: msg.preview || '',
          category: (msg.category as MessageCategory) || 'letter',
          messageUrl: msg.message_url
        }));
        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadMessages();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      const success = await deleteFutureMessage(id);
      if (success) {
        setMessages(messages.filter(message => message.id !== id));
        toast({
          title: "Message deleted",
          description: "Your message has been successfully deleted.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete the message. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

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
      case 'letter': return <Pencil size={16} />;
      case 'video': return <Eye size={16} />;
      case 'audio': return <Send size={16} />;
      case 'document': return <CheckCircle size={16} />;
      default: return <AlertTriangle size={16} />;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading messages...</div>;
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-lg mb-4">You haven't created any messages yet.</p>
        <Button onClick={() => navigate('/tank/create')}>Create Your First Message</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {messages.map((message) => (
          <Card key={message.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-lg">{message.title}</h3>
                  <Badge className={getStatusColor(message.status)}>{message.status}</Badge>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <span className="flex items-center mr-4">
                    {getTypeIcon(message.type)}
                    <span className="ml-1 capitalize">{message.type}</span>
                  </span>
                  
                  <span className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    {new Date(message.deliveryDate).toLocaleDateString()}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600">To: {message.recipient}</p>
                
                {message.preview && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{message.preview}</p>
                )}
                
                <div className="mt-4 flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPreviewMessage(message)}
                    className="text-xs"
                  >
                    Preview
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/tank/message/${message.id}`)}
                    className="text-xs"
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(message.id)}
                    disabled={deletingId === message.id}
                  >
                    {deletingId === message.id ? (
                      <span className="flex items-center">Deleting...</span>
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {previewMessage && (
        <MessagePreview
          open={!!previewMessage}
          onClose={() => setPreviewMessage(null)}
          messageType={previewMessage.type}
          title={previewMessage.title}
          content={previewMessage.preview || ''}
          messageUrl={previewMessage.messageUrl}
        />
      )}
    </div>
  );
};
