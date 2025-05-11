import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Plus, User, Mail, Trash2, Info, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  TrustedContact, 
  getTrustedContacts, 
  createTrustedContact,
  deleteTrustedContact,
  checkTrustedContactPrerequisites
} from '@/services/trustedContactsService';
import { supabase, SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';
import { useNotificationManager } from '@/hooks/use-notification-manager';
import { getExecutors } from '@/services/executorService';

interface TrustedContactsProps {
  onContactsChange: () => void;
}

export function TrustedContacts({ onContactsChange }: TrustedContactsProps) {
  const { toast } = useToast();
  const { notifySuccess, notifyWarning } = useNotificationManager();
  
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [newContact, setNewContact] = useState({
    name: '',
    email: ''
  });
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [prerequisites, setPrerequisites] = useState<{
    hasExecutors: boolean;
    hasBeneficiaries: boolean;
    hasActiveWill: boolean;
    error?: string;
  }>({
    hasExecutors: false,
    hasBeneficiaries: false,
    hasActiveWill: false
  });
  
  useEffect(() => {
    // Initial fetch
    fetchTrustedContacts();
    checkPrerequisites();
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
  
  const checkPrerequisites = async () => {
    try {
      const result = await checkTrustedContactPrerequisites();
      setPrerequisites(result);
    } catch (error) {
      console.error('Error checking prerequisites:', error);
      setPrerequisites({
        hasExecutors: false,
        hasBeneficiaries: false,
        hasActiveWill: false,
        error: 'Failed to check prerequisites'
      });
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
      if (!prerequisites.hasExecutors || !prerequisites.hasBeneficiaries || !prerequisites.hasActiveWill) {
        toast({
          title: "Prerequisites Not Met",
          description: "You need at least one executor, one beneficiary, and an active will before adding trusted contacts.",
          variant: "destructive"
        });
        return;
      }
      
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
      
      // Attempt to send informational email
      try {
        // Get session for user info
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          throw new Error('No active session');
        }
        
        // Get user profile for name
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('first_name, last_name, full_name')
          .eq('id', session.user.id)
          .single();
          
        const userFullName = userProfile?.full_name || 
          (userProfile?.first_name && userProfile?.last_name ? 
            `${userProfile.first_name} ${userProfile.last_name}` : 'A WillTank user');
        
        // Get executor information
        const executors = await getExecutors();
        const primaryExecutor = executors.find(e => e.primary_executor) || executors[0];
        
        if (!primaryExecutor) {
          throw new Error('No executor information available');
        }
        
        const executorInfo = {
          name: primaryExecutor.name,
          email: primaryExecutor.email || '',
          phone: primaryExecutor.phone
        };
            
        // Send email via edge function
        const response = await fetch(`${window.location.origin}/functions/v1/send-contact-invitation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': SUPABASE_PUBLISHABLE_KEY || ''
          },
          body: JSON.stringify({
            contact: {
              contactId: contact.id,
              contactType: 'trusted',
              name: contact.name,
              email: contact.email,
              userId: session.user.id,
              userFullName
            },
            emailDetails: {
              subject: `Important: ${userFullName} has added you as a trusted contact`,
              includeUserBio: true,
              priority: 'high',
              executorInfo
            }
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error sending trusted contact email:', errorData);
          throw new Error(errorData.message || 'Failed to send email');
        }
      
        await createSystemNotificationFallback(
          'success',
          'Trusted Contact Added',
          `${contact.name} has been added to your trusted contacts list.`
        );
        
        notifySuccess(
          "Contact Added", 
          `${newContact.name} has been added to your trusted contacts list.`
        );
        
        // Update contact status to 'added' in database
        await supabase
          .from('trusted_contacts')
          .update({
            invitation_sent_at: new Date().toISOString(),
            invitation_status: 'added'
          })
          .eq('id', contact.id);
          
      } catch (emailError) {
        console.error('Error sending trusted contact email:', emailError);
        
        notifyWarning(
          "Contact Added", 
          `${contact.name} has been added, but we couldn't send the notification email.`
        );
        
        await createSystemNotificationFallback(
          'warning',
          'Email Delivery Issue',
          `We couldn't send the notification email to ${contact.name}.`
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

  // Function to get appropriate status badge with improved styling
  const getStatusBadge = (status: string | null) => {
    // Simplified badge system - only show "Added" status
    return (
      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
        Added
      </Badge>
    );
  };
  
  const getPrerequisitesStatus = () => {
    const missing = [];
    if (!prerequisites.hasExecutors) missing.push("an executor");
    if (!prerequisites.hasBeneficiaries) missing.push("a beneficiary");
    if (!prerequisites.hasActiveWill) missing.push("an active will");
    
    if (missing.length === 0) return null;
    
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Prerequisites Not Met</AlertTitle>
        <AlertDescription>
          Before adding trusted contacts, you need {missing.join(", and ")}.
          Trusted contacts need this information to help verify your status if you miss check-ins.
        </AlertDescription>
      </Alert>
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
        ) : (
          <>
            {getPrerequisitesStatus()}
            
            <Alert variant="default" className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Information</AlertTitle>
              <AlertDescription>
                Your trusted contacts will receive an email with instructions if you miss scheduled check-ins.
                They will be provided with your executor's contact information to help determine your status.
                No verification or action is required from them.
              </AlertDescription>
            </Alert>
            
            <div className="mb-4">
              <Button 
                onClick={() => setFormOpen(true)} 
                disabled={!prerequisites.hasExecutors || !prerequisites.hasBeneficiaries || !prerequisites.hasActiveWill}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Trusted Contact
              </Button>
            </div>
            
            {contacts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <User className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <h3 className="font-medium mb-1">No trusted contacts yet</h3>
                <p className="text-sm mb-4">
                  {prerequisites.hasExecutors && prerequisites.hasBeneficiaries && prerequisites.hasActiveWill 
                    ? "Add trusted contacts who will be notified if you miss check-ins" 
                    : "Complete the prerequisites above before adding trusted contacts"}
                </p>
              </div>
            ) : (
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
                      <TableCell>{getStatusBadge(contact.invitation_status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
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
            )}
          </>
        )}
      </CardContent>
      
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Trusted Contact</DialogTitle>
            <DialogDescription>
              Add someone you trust who will be notified if you miss check-ins.
              They will only receive informational emails - no verification is required.
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
            <Button onClick={handleAddContact} disabled={submitting || !prerequisites.hasExecutors || !prerequisites.hasBeneficiaries || !prerequisites.hasActiveWill}>
              {submitting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Add Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
