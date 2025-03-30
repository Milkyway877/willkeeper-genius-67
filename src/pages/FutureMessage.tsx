
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Send, Save, Clock, UserCircle, Mail, Loader2 } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/contexts/NotificationsContext';

export default function FutureMessage() {
  const [title, setTitle] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { createNotification } = useNotifications();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your message.",
        variant: "destructive"
      });
      return;
    }
    
    if (!recipientName.trim()) {
      toast({
        title: "Recipient Name Required",
        description: "Please enter the recipient's name.",
        variant: "destructive"
      });
      return;
    }
    
    if (!recipientEmail.trim()) {
      toast({
        title: "Recipient Email Required",
        description: "Please enter the recipient's email address.",
        variant: "destructive"
      });
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }
    
    if (!messageContent.trim()) {
      toast({
        title: "Message Content Required",
        description: "Please enter your message content.",
        variant: "destructive"
      });
      return;
    }
    
    if (!deliveryDate) {
      toast({
        title: "Delivery Date Required",
        description: "Please select when you want this message to be delivered.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Get the current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create a future message.",
          variant: "destructive"
        });
        return;
      }
      
      // Create the message in the database
      const { data, error } = await supabase
        .from('future_messages')
        .insert({
          title: title,
          recipient_name: recipientName,
          recipient_email: recipientEmail,
          preview: messageContent.substring(0, 100) + (messageContent.length > 100 ? '...' : ''),
          message_url: messageContent, // In a real app, you'd store this securely
          delivery_date: deliveryDate.toISOString(),
          message_type: 'text',
          status: 'Scheduled',
          user_id: session.user.id
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating future message:', error);
        throw new Error('Failed to create message');
      }
      
      // Create a notification
      await createNotification('success', {
        title: "Future Message Created",
        description: `Your message "${title}" has been scheduled for delivery on ${format(deliveryDate, 'PPP')}.`
      });
      
      toast({
        title: "Message Scheduled",
        description: "Your future message has been saved and scheduled for delivery.",
      });
      
      // Navigate back to the tank page
      navigate('/tank');
    } catch (error) {
      console.error('Error creating future message:', error);
      toast({
        title: "Error",
        description: "There was a problem creating your future message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Create Future Message</h1>
          <p className="text-gray-600">
            Schedule a message to be delivered at a future date. This could be a special birthday message, important information, or final wishes.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium mb-4">Message Details</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Message Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g., Birthday Wishes, Important Information"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="recipient-name">Recipient Name</Label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="recipient-name" 
                      className="pl-9"
                      placeholder="John Smith"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="recipient-email">Recipient Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="recipient-email" 
                      type="email"
                      className="pl-9"
                      placeholder="john@example.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="delivery-date">Delivery Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !deliveryDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deliveryDate ? format(deliveryDate, "PPP") : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={deliveryDate}
                      onSelect={setDeliveryDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-gray-500 mt-1">
                  Select the date when this message should be delivered to the recipient.
                </p>
              </div>
              
              <div>
                <Label htmlFor="message-content">Message Content</Label>
                <Textarea 
                  id="message-content" 
                  placeholder="Write your message here..."
                  className="min-h-[200px]"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="bg-willtank-50 rounded-xl border border-willtank-100 p-6">
            <h3 className="flex items-center text-lg font-medium mb-3">
              <Clock className="mr-2 h-5 w-5 text-willtank-600" />
              How Future Messages Work
            </h3>
            
            <div className="space-y-3 text-gray-600">
              <p>
                Future messages are stored securely and will only be delivered on or after the specified date.
              </p>
              <p>
                Before delivery, we'll perform verification checks to confirm that delivery is appropriate. 
                This is part of our death verification protocols.
              </p>
              <p>
                You can edit or cancel this message at any time before delivery from your Future Messages dashboard.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate('/tank')}
            >
              Cancel
            </Button>
            
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save and Schedule
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
