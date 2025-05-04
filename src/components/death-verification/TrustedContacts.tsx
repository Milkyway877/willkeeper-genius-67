
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
import { 
  TrustedContact, 
  getTrustedContacts, 
  createTrustedContact, 
  sendVerificationRequest, 
  deleteTrustedContact 
} from '@/services/trustedContactsService';

interface TrustedContactsProps {
  onContactsChange: () => void;
}

export function TrustedContacts({ onContactsChange }: TrustedContactsProps) {
  const { toast } = useToast();
  const { triggerTrustedContactAdded, triggerTrustedContactVerified } = useNotificationTriggers();
  
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [newContact, setNewContact] = useState({
    name: '',
    email: ''
  });
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
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
      
      // Send verification email
      try {
        await sendVerificationRequest(contact.id);
        // Trigger notification
        await triggerTrustedContactAdded(contact.name);
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
  
  const handleResendVerification = async (contactId: string, name: string) => {
    try {
      const success = await sendVerificationRequest(contactId);
      
      if (success) {
        toast({
          title: "Verification Email Sent",
          description: `A verification email has been sent to ${name}`
        });
      } else {
        throw new Error("Failed to send verification email");
      }
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
        throw new Error("Failed to remove trusted contact");
      }
    } catch (error) {
      console.error('Error removing trusted contact:', error);
      toast({
        title: "Error",
        description: "Failed to remove trusted contact",
        variant: "destructive"
      });
    }
  };
  
  const isVerified = (contact: TrustedContact) => {
    return contact.invitation_status === 'verified';
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

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-willtank-500 border-t-transparent rounded-full"></div>
            </div>
          ) : contacts.length === 0 ? (
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
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map(contact => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">{contact.name}</TableCell>
                      <TableCell>{contact.email}</TableCell>
                      <TableCell>
                        {isVerified(contact) ? (
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
                        {!isVerified(contact) && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleResendVerification(contact.id, contact.name)}
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
