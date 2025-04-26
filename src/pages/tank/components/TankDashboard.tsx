
import React, { useState, useEffect } from 'react';
import { Search, Filter, FileText, Video, FileAudio, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Message, MessageStatus, MessageType } from '../types';
import { getFutureMessages } from '@/services/tankService';

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

const getStatusBadge = (status: MessageStatus) => {
  switch (status) {
    case 'scheduled':
      return <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">Scheduled</Badge>;
    case 'draft':
      return <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">Draft</Badge>;
    case 'delivered':
      return <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">Delivered</Badge>;
    case 'verified':
      return <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">Verified</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

export const TankDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadMessages();
  }, []);
  
  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const data = await getFutureMessages();
      setMessages(data.map(msg => ({
        id: msg.id,
        type: (msg.message_type || 'letter') as MessageType,
        title: msg.title || 'Untitled Message',
        recipient: msg.recipient_name,
        deliveryDate: msg.delivery_date,
        status: msg.status.toLowerCase() as MessageStatus,
        preview: msg.preview || undefined
      })));
    } catch (err) {
      console.error('Error loading messages:', err);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredMessages = messages.filter(message => 
    message.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.recipient.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search messages..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex-shrink-0">
          <Filter size={16} className="mr-2" />
          Filter
        </Button>
      </div>
      
      <div className="space-y-4">
        {filteredMessages.map((message) => (
          <Card key={message.id} className="p-4">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                {getTypeIcon(message.type)}
              </div>
              
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{message.title}</h3>
                  {getStatusBadge(message.status)}
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  For: {message.recipient}
                </p>
                
                {message.preview && (
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {message.preview}
                  </p>
                )}
                
                <div className="mt-4 text-sm text-gray-500">
                  Delivery: {new Date(message.deliveryDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </Card>
        ))}
        
        {filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No messages found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? 
                "No messages match your search criteria." : 
                "Create your first future message to get started."
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => navigate('/tank/create')}>
                Create Message
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
