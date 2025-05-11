
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Plus, User, Mail, Trash2, Check, AlertTriangle, Info, RefreshCw, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  TrustedContact, 
  getTrustedContacts, 
  createTrustedContact, 
  sendContactInformation,
  deleteTrustedContact,
  resendInformation
} from '@/services/trustedContactsService';
import { supabase } from '@/integrations/supabase/client';

interface TrustedContactsProps {
  onContactsChange: () => void;
}

export function TrustedContacts({ onContactsChange }: TrustedContactsProps) {
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [newContact, setNewContact] = useState({
    name: '',
    email: ''
  });
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    // Initial fetch
    fetchTrustedContacts();
  }, []);
  
  const fetchTrustedContacts = async () => {
    try {
      setLoading(true);
      const fetchedContacts = await getTrustedContacts();
      setContacts(fetchedContacts);
    } catch (error) {
      console.error('Error fetching trusted contacts:', error);
      toast({
        title: "Error",
        description: "Failed to load trusted contacts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewContact(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  const createSystemNotificationFallback = async (
    type: 'success' | 'warning' | 'info' | 'security',
    title: string,
    description: string
  ) => {
    try {
      // Check if session exists
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.error('No authenticated user found');
        return;
      }
      
      // Direct insert as fallback since RPC might not be available yet
      await supabase
        .from('notifications')
        .insert({
          user_id: session.user.id,
          title,
          description,
          type,
          read: false
        });
      
      console.log('Notification created via fallback method');
    } catch (error) {
      console.error('Failed to create notification via fallback:', error);
    }
  };
  
  const handleAddContact = async () => {
    try {
      if (!newContact.name.trim()) {
        toast({
          title: "Missing Information",
          description: "Please enter a contact name",
          variant: "destructive"
        });
        return;
      }
      
      if (!newContact.email.trim() || !validateEmail(newContact.email)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address",
          variant: "destructive"
        });
        return;
      }
      
      setSubmitting(true);
      
      // Check if email already exists
      const existingContact = contacts.find(c => 
        c.email.toLowerCase() === newContact.email.toLowerCase()
      );
      
      if (existingContact) {
        toast({
          title: "Duplicate Contact",
          description: "This email address is already in your trusted contacts list",
          variant: "destructive"
        });
        setSubmitting(false);
        return;
      }
      
      const contact = await createTrustedContact({
        name: newContact.name.trim(),
        email: newContact.email.toLowerCase().trim()
      });
      
      if (!contact) {
        throw new Error("Failed to create trusted contact");
      }
      
      // Clear form and close dialog
      setNewContact({ name: '', email: '' });
      setFormOpen(false);
      
      // Refresh contacts list
      fetchTrustedContacts();
      onContactsChange();
      
      // Send informational email to the contact
      try {
        const success = await sendContactInformation(contact.id);
        
        if (success) {
          // Create notification via fallback method
          await createSystemNotificationFallback(
            'success',
            'Trusted Contact Added',
            `${contact.name} has been added to your trusted contacts list.`
          );
          
          toast({
            title: "Contact Added",
            description: `${newContact.name} has been added to your trusted contacts list and an informational email has been sent.`
          });
        } else {
          // User feedback for email sending failure
          toast({
            title: "Contact Added",
            description: `${contact.name} has been added, but we couldn't send the information email. You can resend it later.`,
            variant: "default"
          });
          
          // Create warning notification via fallback method
          await createSystemNotificationFallback(
            'warning',
            'Email Delivery Issue',
            `We couldn't send the information email to ${contact.name}. You can try resending it later.`
          );
        }
      } catch (emailError) {
        console.error('Error sending information email:', emailError);
        
        toast({
          title: "Contact Added",
          description: `${contact.name} has been added, but we couldn't send the information email. You can resend it later.`,
        });
        
        // Create warning notification via fallback method
        await createSystemNotificationFallback(
          'warning',
          'Email Delivery Issue',
          `We couldn't send the information email to ${contact.name}. You can try resending it later.`
        );
      }
    } catch (error) {
      console.error('Error adding trusted contact:', error);
      toast({
        title: "Error",
        description: "Failed to add trusted contact",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleResendInformation = async (contactId: string, name: string) => {
    try {
      toast({
        title: "Sending...",
        description: `Sending information email to ${name}`,
      });
      
      const success = await resendInformation(contactId);
      
      if (success) {
        toast({
          title: "Email Sent",
          description: `An information email has been sent to ${name}`
        });
        
        // Refresh contacts list to show updated status
        fetchTrustedContacts();
        
        // Create success notification via fallback method
        await createSystemNotificationFallback(
          'success',
          'Information Email Sent',
          `An information email has been sent to ${name}.`
        );
      } else {
        throw new Error("Failed to send information email");
      }
    } catch (error) {
      console.error('Error sending information email:', error);
      toast({
        title: "Error",
        description: "Failed to send information email. Please try again later.",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteContact = async (contactId: string) => {
    try {
      const success = await deleteTrustedContact(contactId);
      
      if (success) {
        // Refresh contacts list
        fetchTrustedContacts();
        onContactsChange();
        
        toast({
          title: "Contact Removed",
          description: "The contact has been removed from your trusted contacts list"
        });
      } else {
        throw new Error("Failed to delete contact");
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: "Failed to remove contact",
        variant: "destructive"
      });
    }
  };

  // Function to get appropriate status badge with simplified status
  const getStatusBadge = (status: string | null, sentAt: string | null) => {
    // In the new system, contacts are considered "delivered" once the email is sent
    if (sentAt) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
          <Check className="h-3 w-3 mr-1" /> Information Sent
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
        Not Sent
      </Badge>
    );
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5 text-willtank-600" />
          Trusted Contacts
        </CardTitle>
        <CardDescription>
          Add trusted contacts who will be notified if you miss check-ins
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="animate-spin h-8 w-8 text-willtank-600" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="font-medium mb-1">No trusted contacts yet</h3>
            <p className="text-sm mb-4">Add trusted contacts who will be notified if you miss check-ins</p>
            <Button variant="default" onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Trusted Contact
            </Button>
          </div>
        ) : (
          <>
            <Alert variant="default" className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Your trusted contacts will receive an informational email upon being added. If you miss check-ins,
                they will be instructed to contact your executor if they confirm your passing.
              </AlertDescription>
            </Alert>
            
            <div className="mb-4">
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Trusted Contact
              </Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map(contact => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{getStatusBadge(contact.invitation_status, contact.invitation_sent_at)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {!contact.invitation_sent_at && (
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleResendInformation(contact.id, contact.name)}
                          >
                            <Mail className="h-4 w-4 mr-1" />
                            Send Information
                          </Button>
                        )}
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteContact(contact.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
      
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Trusted Contact</DialogTitle>
            <DialogDescription>
              Add someone you trust who will be notified if you miss check-ins.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Contact Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Full name"
                value={newContact.name}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@example.com"
                value={newContact.email}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddContact} disabled={submitting}>
              {submitting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Add Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
