import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  FileText, 
  Video, 
  FileAudio, 
  File, 
  MoreVertical, 
  Calendar, 
  Edit, 
  Trash2, 
  Play, 
  SendHorizonal,
  Shield,
  AlarmClock,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Message, MessageStatus, MessageType } from '../types';
import { getFutureMessages, deleteFutureMessage, updateFutureMessage } from '@/services/tankService';

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
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const data = await getFutureMessages();
        setMessages(data);
        setError(null);
      } catch (err) {
        console.error('Error loading messages:', err);
        setError('Failed to load messages. Please try again later.');
        setMessages([
          {
            id: 1,
            type: 'letter',
            title: 'Birthday Wishes for Sarah',
            recipient: 'Sarah Williams',
            deliveryDate: '2025-06-15',
            status: 'scheduled',
            preview: 'A heartfelt letter with birthday wishes and life advice for when...'
          },
          {
            id: 2,
            type: 'video',
            title: 'Wedding Day Message',
            recipient: 'Michael Johnson',
            deliveryDate: '2026-08-20',
            status: 'draft',
            preview: 'Video recording with special messages for Michael\'s wedding day...'
          },
          {
            id: 3,
            type: 'audio',
            title: 'Life Advice Recording',
            recipient: 'Emily Wilson',
            deliveryDate: '2024-12-25',
            status: 'scheduled',
            preview: 'Audio recording with life advice and special memories shared...'
          },
          {
            id: 4,
            type: 'document',
            title: 'Family History Documents',
            recipient: 'James Anderson',
            deliveryDate: '2027-03-10',
            status: 'scheduled',
            preview: 'Collection of important family history documents and photos...'
          },
          {
            id: 5,
            type: 'letter',
            title: 'Graduation Congratulations',
            recipient: 'Lisa Parker',
            deliveryDate: '2025-05-30',
            status: 'scheduled',
            preview: 'Congratulatory letter for Lisa\'s college graduation with advice...'
          },
          {
            id: 6,
            type: 'video',
            title: 'Anniversary Video',
            recipient: 'Robert & Emma',
            deliveryDate: '2023-11-05',
            status: 'delivered',
            preview: 'Special video message for Robert and Emma\'s 25th wedding anniversary...'
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMessages();
  }, []);
  
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  const filteredMessages = messages.filter(message => 
    message.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.recipient.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleEdit = (id: number | string) => {
    toast({
      title: "Edit message",
      description: `Opening message #${id} for editing.`
    });
  };
  
  const handleDelete = async (id: number | string) => {
    try {
      await deleteFutureMessage(id.toString());
      setMessages(messages.filter(message => message.id !== id));
      toast({
        title: "Message deleted",
        description: "The message has been permanently deleted."
      });
    } catch (err) {
      console.error('Error deleting message:', err);
      toast({
        title: "Error",
        description: "Failed to delete the message. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handlePreview = (id: number | string) => {
    toast({
      title: "Preview message",
      description: `Previewing message #${id}.`
    });
  };
  
  const handleVerify = async (id: number | string) => {
    try {
      await updateFutureMessage(id.toString(), { status: 'verified' });
      setMessages(messages.map(message => 
        message.id === id ? { ...message, status: 'verified' } : message
      ));
      
      toast({
        title: "Message verified",
        description: "The message has been verified for delivery."
      });
    } catch (err) {
      console.error('Error verifying message:', err);
      toast({
        title: "Error",
        description: "Failed to verify the message. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-willtank-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading your messages...</p>
      </div>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <FileText className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">Failed to load messages</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search messages by title or recipient..." 
            className="pl-10"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <Button variant="outline" className="flex-shrink-0">
          <Filter size={16} className="mr-2" />
          Filter
        </Button>
      </div>
      
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No messages found</h3>
            <p className="text-gray-500 mb-4">Create your first future message to get started.</p>
            <Button onClick={() => navigate('/tank/create')}>Create Message</Button>
          </div>
        ) : (
          filteredMessages.map((message) => (
            <Card key={message.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start p-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4 flex-shrink-0">
                  {getTypeIcon(message.type)}
                </div>
                
                <div className="flex-grow overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                    <h3 className="font-medium truncate mr-2">{message.title}</h3>
                    {getStatusBadge(message.status)}
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="flex items-center">
                      For: {message.recipient}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{message.preview}</p>
                  
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center px-2 py-1 rounded-full bg-gray-100">
                            <Calendar size={12} className="mr-1" />
                            <span>{new Date(message.deliveryDate).toLocaleDateString()}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Scheduled delivery date</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center px-2 py-1 rounded-full bg-gray-100">
                            <Shield size={12} className="mr-1" />
                            <span>Encrypted</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>End-to-end encrypted message</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    {message.status === 'scheduled' && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center px-2 py-1 rounded-full bg-gray-100">
                              <AlarmClock size={12} className="mr-1" />
                              <span>Auto-verify on</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Set to automatically verify before delivery</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
                
                <div className="ml-4 flex-shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handlePreview(message.id)}>
                        <Play size={14} className="mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(message.id)}>
                        <Edit size={14} className="mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleVerify(message.id)}>
                        <SendHorizonal size={14} className="mr-2" />
                        Verify
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(message.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 size={14} className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
