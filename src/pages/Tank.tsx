
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Mail, Clock, Check, X, Edit, Trash2, Eye, FileText, Video, AlarmClock, Calendar, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FutureMessage {
  id: string;
  title: string;
  preview?: string;
  status: string;
  message_url?: string;
  message_type?: string;
  recipient_email: string;
  recipient_name: string;
  delivery_date: string;
  created_at: string;
}

export default function Tank() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<FutureMessage[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchMessages();
  }, []);
  
  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.warn('No authenticated user found when fetching messages');
        return;
      }
      
      const { data, error } = await supabase
        .from('future_messages')
        .select('*')
        .eq('user_id', session.user.id)
        .order('delivery_date', { ascending: true });
        
      if (error) {
        throw error;
      }
      
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateMessage = () => {
    navigate('/future-message');
  };
  
  const getMessageTypeIcon = (type?: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-5 w-5 text-blue-500" />;
      case 'video':
        return <Video className="h-5 w-5 text-purple-500" />;
      case 'document':
        return <FileText className="h-5 w-5 text-orange-500" />;
      default:
        return <Mail className="h-5 w-5 text-blue-500" />;
    }
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-amber-100 text-amber-800';
      case 'Sent':
        return 'bg-green-100 text-green-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      case 'Canceled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  const formatDeliveryDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'PPP');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">WillTank</h1>
            <p className="text-gray-600">Securely store and schedule future messages for your loved ones.</p>
          </div>
          
          <Button onClick={handleCreateMessage}>
            <Mail className="mr-2 h-4 w-4" />
            Create New Message
          </Button>
        </div>
        
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Loader2 className="h-10 w-10 text-willtank-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Mail className="h-20 w-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-medium text-gray-700 mb-2">No Future Messages</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven't created any future messages yet. Create your first message to be delivered to a loved one in the future.
            </p>
            <Button size="lg" onClick={handleCreateMessage}>
              <Mail className="mr-2 h-5 w-5" />
              Create Your First Message
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-willtank-100 flex items-center justify-center mr-3">
                      {getMessageTypeIcon(message.message_type)}
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{message.title}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        Delivery: {formatDeliveryDate(message.delivery_date)}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(message.status)}`}>
                    {message.status}
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    To: {message.recipient_name} ({message.recipient_email})
                  </p>
                </div>
                
                {message.preview && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700 line-clamp-3">{message.preview}</p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-gray-100">
                  <Button 
                    variant="outline" 
                    size="sm"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Preview
                  </Button>
                  
                  {message.status === 'Scheduled' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                      >
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
