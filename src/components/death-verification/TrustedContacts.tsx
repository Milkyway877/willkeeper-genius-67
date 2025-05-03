
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Plus, User, Mail, Trash2, Check, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNotificationTriggers } from '@/hooks/use-notification-triggers';
import { supabase } from '@/integrations/supabase/client';

interface TrustedContact {
  id: string;
  name: string;
  email: string;
  relation: string;
  verified: boolean;
  created_at?: string;
}

interface TrustedContactsProps {
  onContactsChange: () => void;
}

export function TrustedContacts({ onContactsChange }: TrustedContactsProps) {
  const { toast } = useToast();
  const { triggerContactVerified } = useNotificationTriggers();
  
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    relation: ''
  });
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    fetchTrustedContacts();
  }, []);
  
  const fetchTrustedContacts = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('trusted_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setContacts(data || []);
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
      
      if (!newContact.relation.trim()) {
        toast({
          title: "Missing Information",
          description: "Please specify your relationship with this contact",
          variant: "destructive"
        });
        return;
      }
      
      setSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Check if email already exists
      const { data: existingContacts } = await supabase
        .from('trusted_contacts')
        .select('email')
        .eq('user_id', user.id)
        .eq('email', newContact.email.toLowerCase());
      
      if (existingContacts && existingContacts.length > 0) {
        toast({
          title: "Duplicate Contact",
          description: "This email address is already in your trusted contacts list",
          variant: "destructive"
        });
        setSubmitting(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('trusted_contacts')
        .insert({
          user_id: user.id,
          name: newContact.name.trim(),
          email: newContact.email.toLowerCase().trim(),
          relation: newContact.relation.trim(),
          verified: false,
          verification_sent: false
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Clear form and close dialog
      setNewContact({ name: '', email: '', relation: '' });
      setFormOpen(false);
      
      // Refresh contacts list
      fetchTrustedContacts();
      onContactsChange();
      
      // Send verification email (this would be implemented in a Supabase edge function)
      try {
        await sendVerificationEmail(data.id, newContact.name, newContact.email);
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
      }
      
      toast({
        title: "Contact Added",
        description: `${newContact.name} has been added to your trusted contacts list.`
      });
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

  const sendVerificationEmail = async (contactId: string, name: string, email: string) => {
    // This would call a Supabase Edge Function to send the verification email
    const verificationToken = crypto.randomUUID();
    
    // Save verification token to database
    const { error } = await supabase
      .from('contact_verifications')
      .insert({
        contact_id: contactId,
        contact_type: 'trusted',
        verification_token: verificationToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      });
    
    if (error) {
      throw error;
    }
    
    // This would actually be done in a Supabase Edge Function
    // For now, we'll just mark the verification as sent
    const { error: updateError } = await supabase
      .from('trusted_contacts')
      .update({ verification_sent: true })
      .eq('id', contactId);
    
    if (updateError) {
      throw updateError;
    }
    
    return true;
  };
  
  const handleResendVerification = async (contactId: string, name: string, email: string) => {
    try {
      await sendVerificationEmail(contactId, name, email);
      
      toast({
        title: "Verification Email Sent",
        description: `A verification email has been sent to ${email}`
      });
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast({
        title: "Error",
        description: "Failed to send verification email",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('trusted_contacts')
        .delete()
        .eq('id', contactId);
      
      if (error) {
        throw error;
      }
      
      // Refresh contacts list
      fetchTrustedContacts();
      onContactsChange();
      
      toast({
        title: "Contact Removed",
        description: "The contact has been removed from your trusted contacts list"
      });
    } catch (error) {
      console.error('Error removing trusted contact:', error);
      toast({
        title: "Error",
        description: "Failed to remove trusted contact",
        variant: "destructive"
      });
    }
  };

  // Mock for testing - this would be triggered by the verification link in the email
  const mockVerifyContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('trusted_contacts')
        .update({ verified: true })
        .eq('id', contactId);
      
      if (error) {
        throw error;
      }
      
      // Refresh contacts list
      fetchTrustedContacts();
      onContactsChange();
      
      // Trigger notification
      await triggerContactVerified();
      
      toast({
        title: "Contact Verified",
        description: "The contact has been verified successfully"
      });
    } catch (error) {
      console.error('Error verifying trusted contact:', error);
      toast({
        title: "Error",
        description: "Failed to verify trusted contact",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-willtank-600" />
            Trusted Verification Contacts
          </CardTitle>
          <CardDescription>
            These contacts are specifically designated to verify your status and are separate from beneficiaries or executors to prevent conflicts of interest
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertTitle>Enhanced Security</AlertTitle>
            <AlertDescription>
              Trusted contacts only verify your status and have no access to your will assets, helping prevent potential conflicts of interest. We recommend adding at least 2 trusted contacts who are not beneficiaries or executors.
            </AlertDescription>
          </Alert>

          {contacts.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No trusted contacts yet</h3>
              <p className="text-sm text-gray-500 mb-4">Add trusted contacts who can verify your status</p>
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Trusted Contact
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <Button onClick={() => setFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Trusted Contact
                </Button>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Relation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map(contact => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">{contact.name}</TableCell>
                      <TableCell>{contact.email}</TableCell>
                      <TableCell>{contact.relation}</TableCell>
                      <TableCell>
                        {contact.verified ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <Check className="h-3.5 w-3.5 mr-1" /> Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {!contact.verified && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleResendVerification(contact.id, contact.name, contact.email)}
                          >
                            Resend
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDeleteContact(contact.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        
                        {/* For development testing only - would be removed in production */}
                        {!contact.verified && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200"
                            onClick={() => mockVerifyContact(contact.id)}
                          >
                            Test Verify
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog for adding new trusted contacts */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Trusted Contact</DialogTitle>
            <DialogDescription>
              Add someone you trust to verify your status who is not a beneficiary or executor of your will.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input 
                  id="name"
                  name="name"
                  placeholder="John Smith"
                  className="pl-10"
                  value={newContact.name}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input 
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  className="pl-10"
                  value={newContact.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="relation">Relationship</Label>
              <Input 
                id="relation"
                name="relation"
                placeholder="e.g. Friend, Family Member, Colleague"
                value={newContact.relation}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAddContact}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full"></span>
                  Adding...
                </>
              ) : (
                <>Add Contact</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
