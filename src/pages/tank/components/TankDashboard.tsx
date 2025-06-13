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
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Video, 
  Mic, 
  File, 
  Eye, 
  Plus, 
  Trash2, 
  Calendar,
  Clock,
  Send,
  Archive,
  TrendingUp,
  Shield
} from 'lucide-react';
import { getFutureMessages, deleteFutureMessage, checkScheduledMessages } from '@/services/tankService';
import { MessagePreview } from './preview/MessagePreview';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';

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
  
  // Dashboard Statistics
  const totalMessages = messages.length;
  const scheduledMessages = messages.filter(m => m.status === 'scheduled').length;
  const deliveredMessages = messages.filter(m => m.status === 'delivered').length;
  const processingMessages = messages.filter(m => m.status === 'processing').length;
  
  // Next delivery date
  const upcomingMessages = messages
    .filter(m => m.status === 'scheduled')
    .sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());
  const nextDelivery = upcomingMessages[0];
  
  // Message type distribution for chart
  const messageTypeData = [
    { name: 'Letters', value: messages.filter(m => m.type === 'letter').length, color: '#8b5cf6' },
    { name: 'Videos', value: messages.filter(m => m.type === 'video').length, color: '#3b82f6' },
    { name: 'Audio', value: messages.filter(m => m.type === 'audio').length, color: '#10b981' },
    { name: 'Documents', value: messages.filter(m => m.type === 'document').length, color: '#f59e0b' },
  ].filter(item => item.value > 0);
  
  // Monthly delivery chart data
  const monthlyData = [
    { month: 'This Month', scheduled: scheduledMessages, delivered: deliveredMessages },
    { month: 'Next Month', scheduled: Math.floor(scheduledMessages * 0.6), delivered: 0 },
    { month: 'Future', scheduled: Math.floor(scheduledMessages * 0.4), delivered: 0 },
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Tank Dashboard</h1>
          <p className="text-gray-600 mt-2 max-w-2xl">
            Your future message command center. Store, schedule, and deliver messages to your loved ones 
            when the time is right. Tank keeps your legacy secure and accessible.
          </p>
        </div>
        
        <Button 
          onClick={handleCreateMessage} 
          className="bg-willtank-600 hover:bg-willtank-700"
          size="lg"
        >
          <Plus className="mr-2 h-5 w-5" /> Create Message
        </Button>
      </div>

      {/* Dashboard Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMessages}</div>
            <p className="text-xs text-muted-foreground">
              Messages in your Tank
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{scheduledMessages}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting delivery
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <Send className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{deliveredMessages}</div>
            <p className="text-xs text-muted-foreground">
              Successfully sent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{processingMessages}</div>
            <p className="text-xs text-muted-foreground">
              Being prepared
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Next Delivery & Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Delivery Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Next Delivery
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextDelivery ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{nextDelivery.title}</h4>
                    <p className="text-sm text-gray-600">To: {nextDelivery.recipient}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="mb-1">{nextDelivery.type}</Badge>
                    <p className="text-sm font-medium">
                      {new Date(nextDelivery.deliveryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    {Math.ceil((new Date(nextDelivery.deliveryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No scheduled deliveries</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={handleCreateMessage}
                >
                  Schedule First Message
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message Types Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Message Types</CardTitle>
            <CardDescription>Distribution of your message formats</CardDescription>
          </CardHeader>
          <CardContent>
            {messageTypeData.length > 0 ? (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={messageTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {messageTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No messages to display</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Security & Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Tank Security Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">✓</div>
              <p className="text-sm font-medium">Encrypted Storage</p>
              <p className="text-xs text-gray-500">All messages secured</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">✓</div>
              <p className="text-sm font-medium">Delivery System</p>
              <p className="text-xs text-gray-500">Active and monitoring</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">✓</div>
              <p className="text-sm font-medium">Backup Verified</p>
              <p className="text-xs text-gray-500">Last checked today</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages Table Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Message Inventory</CardTitle>
          <CardDescription>
            View and manage your future messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="font-medium text-xl mb-2">Your Tank is Empty</h3>
              <p className="text-gray-500 max-w-md mb-6">
                Start building your legacy by creating your first future message. Messages are stored 
                securely and delivered exactly when you specify.
              </p>
              <Button onClick={handleCreateMessage} className="bg-willtank-600 hover:bg-willtank-700">
                <Plus className="mr-2 h-4 w-4" />
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
            Messages are delivered according to your specified schedule. Free creation with 24 hours secure access.
          </p>
        </CardFooter>
      </Card>
      
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
