
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useNotificationManager } from '@/hooks/use-notification-manager';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Video, Mic, File, Eye, Plus, Trash2 } from 'lucide-react';
import { getFutureMessages, deleteFutureMessage, checkScheduledMessages } from '@/services/tankService';
import { MessagePreview } from './preview/MessagePreview';

interface Message {
  id: string;
  type: string;
  title: string;
  recipient: string;
  deliveryDate: string;
  status: string;
  preview: string;
  category?: string;
  messageUrl?: string;
}

export const TankDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewMessage, setPreviewMessage] = useState<Message | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { toast } = useToast();
  const { notifyInfo, notifySuccess, notifyWarning } = useNotificationManager();
  
  useEffect(() => {
    fetchMessages();
  }, []);
  
  useEffect(() => {
    const checkForScheduledMessages = async () => {
      try {
        const result = await checkScheduledMessages();
        if (result && result.processed > 0) {
          toast({
            title: 'Message Delivery Check',
            description: `Checked ${result.processed} messages: ${result.successful} delivered, ${result.failed} failed.`,
          });
          
          if (result.successful > 0) {
            notifySuccess(
              "Messages Delivered", 
              `${result.successful} messages have been successfully delivered.`,
              "high"
            );
          }
          
          fetchMessages();
        }
      } catch (error) {
        console.error('Error checking scheduled messages:', error);
      }
    };
    
    checkForScheduledMessages();
  }, [toast, notifySuccess]);
  
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await getFutureMessages();
      const formattedMessages = data.map(msg => ({
        id: msg.id,
        type: msg.message_type || 'letter',
        title: msg.title || 'Untitled',
        recipient: msg.recipient_name,
        deliveryDate: msg.delivery_date,
        status: msg.status,
        preview: msg.preview || 'No preview available',
        category: msg.category || undefined,
        messageUrl: msg.message_url || undefined
      }));
      
      console.log('Formatted messages with URLs:', formattedMessages);
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Remove all subscription barriers - allow free Tank message creation
  const handleCreateMessage = () => {
    navigate('/tank/create');
  };
  
  const handleViewMessage = (id: string) => {
    navigate(`/tank/message/${id}`);
  };
  
  const handlePreviewMessage = (message: Message) => {
    console.log('Previewing message:', message);
    setPreviewMessage(message);
    setPreviewOpen(true);
  };
  
  const handleDeleteMessage = async (messageId: string) => {
    try {
      const success = await deleteFutureMessage(messageId);
      if (success) {
        toast({
          title: "Message Deleted",
          description: "The message has been successfully deleted.",
        });
        
        notifyInfo(
          "Message Deleted", 
          "Your future message has been successfully deleted.",
          "medium"
        );
        
        fetchMessages();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete the message. Please try again.",
          variant: "destructive",
        });
        
        notifyWarning(
          "Delete Operation Failed", 
          "There was an issue deleting your message. Please try again.",
          "medium"
        );
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the message.",
        variant: "destructive",
      });
    }
  };
  
  const getMessageIcon = (type: string) => {
    switch(type) {
      case 'video': return <Video className="h-4 w-4 text-blue-500" />;
      case 'audio': return <Mic className="h-4 w-4 text-green-500" />;
      case 'document': return <File className="h-4 w-4 text-amber-500" />;
      default: return <FileText className="h-4 w-4 text-purple-500" />;
    }
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
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Your Future Messages</h1>
          <p className="text-sm text-gray-600 mt-1">
            Create your first message free - 24 hours secure access included
          </p>
        </div>
        
        <Button 
          onClick={handleCreateMessage} 
          className="bg-willtank-600 hover:bg-willtank-700"
        >
          <Plus className="mr-2 h-4 w-4" /> Create New Message
        </Button>
      </div>
      
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Message Inventory</CardTitle>
            <CardDescription>
              View and manage your future messages
            </CardDescription>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mb-3" />
                <h3 className="font-medium text-lg mb-1">No Messages Yet</h3>
                <p className="text-gray-500 max-w-md mb-4">
                  You haven't created any future messages yet. Create your first message to get started.
                </p>
                <Button onClick={handleCreateMessage} className="bg-willtank-600 hover:bg-willtank-700">
                  Create Your First Message
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Delivery Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell className="font-medium">{message.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getMessageIcon(message.type)}
                            <span className="capitalize">{message.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>{message.recipient}</TableCell>
                        <TableCell>{new Date(message.deliveryDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(message.status)} text-white`}>
                            {message.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handlePreviewMessage(message)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewMessage(message.id)}
                            >
                              Details
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Message</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this message? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteMessage(message.id)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">
              Messages will be delivered according to your specified schedule. Free creation with 24 hours secure access.
            </p>
          </CardFooter>
        </Card>
      )}
      
      {previewMessage && (
        <MessagePreview
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          messageType={previewMessage.type as any}
          title={previewMessage.title}
          content={previewMessage.preview}
          messageUrl={previewMessage.messageUrl}
        />
      )}
    </div>
  );
};
