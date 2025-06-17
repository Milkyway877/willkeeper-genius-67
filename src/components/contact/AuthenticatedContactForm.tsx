
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { sendEmail } from '@/services/emailService';
import { useToast } from '@/hooks/use-toast';
import { Send, Loader2, CheckCircle, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export function AuthenticatedContactForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      const emailContent = `
        <h2>New Support Request from WillTank</h2>
        <p><strong>From:</strong> ${formData.firstName} ${formData.lastName} (${user.email})</p>
        <p><strong>Subject:</strong> ${formData.subject}</p>
        <p><strong>User ID:</strong> ${user.id}</p>
        
        <h3>Message:</h3>
        <p>${formData.message.replace(/\n/g, '<br>')}</p>
        
        <hr>
        <p><em>This message was sent via the WillTank support form.</em></p>
      `;

      const result = await sendEmail({
        to: 'support@willtank.com',
        subject: `Support Request: ${formData.subject}`,
        htmlContent: emailContent,
        priority: 'high'
      });

      if (result.success) {
        setIsSubmitted(true);
        toast({
          title: "Message sent successfully!",
          description: "Our support team will respond within 24 hours.",
        });
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending support message:', error);
      toast({
        title: "Error sending message",
        description: "Please try again or contact us directly at support@willtank.com",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent Successfully!</h3>
        <p className="text-gray-600 mb-4">
          Thank you for contacting us. Our support team will respond to your inquiry within 24 hours.
        </p>
        <Button
          onClick={() => {
            setIsSubmitted(false);
            setFormData({ firstName: '', lastName: '', subject: '', message: '' });
          }}
          variant="outline"
        >
          Send Another Message
        </Button>
      </motion.div>
    );
  }

  return (
    <Card className="p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 bg-willtank-100 rounded-full flex items-center justify-center">
          <Mail className="h-5 w-5 text-willtank-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Send Us a Message</h2>
          <p className="text-gray-600">We're here to help with any questions or concerns</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <Input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
              className="focus:ring-willtank-500 focus:border-willtank-500"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <Input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
              className="focus:ring-willtank-500 focus:border-willtank-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            value={user?.email || ''}
            disabled
            className="bg-gray-50 text-gray-600"
          />
          <p className="text-xs text-gray-500 mt-1">Using your account email address</p>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
            Subject
          </label>
          <Select onValueChange={(value) => setFormData({ ...formData, subject: value })}>
            <SelectTrigger className="focus:ring-willtank-500 focus:border-willtank-500">
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General Inquiry</SelectItem>
              <SelectItem value="technical">Technical Support</SelectItem>
              <SelectItem value="billing">Billing Question</SelectItem>
              <SelectItem value="account">Account Issues</SelectItem>
              <SelectItem value="will-creation">Will Creation Help</SelectItem>
              <SelectItem value="executor-access">Executor Access</SelectItem>
              <SelectItem value="feedback">Feedback</SelectItem>
              <SelectItem value="bug-report">Bug Report</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <Textarea
            id="message"
            rows={6}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Please describe your question or issue in detail..."
            required
            className="focus:ring-willtank-500 focus:border-willtank-500"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !formData.subject || !formData.message.trim()}
          className="w-full bg-willtank-500 hover:bg-willtank-600 text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending Message...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Message
            </>
          )}
        </Button>

        <div className="text-center text-sm text-gray-500">
          <p>You can also reach us directly at{' '}
            <a href="mailto:support@willtank.com" className="text-willtank-600 hover:text-willtank-700">
              support@willtank.com
            </a>
          </p>
        </div>
      </form>
    </Card>
  );
}
