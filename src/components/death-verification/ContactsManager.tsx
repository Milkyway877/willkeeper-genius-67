
import React, { useState, useEffect } from 'react';
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Users, UserPlus, Mail, Phone, Check, X, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { 
  sendContactInvitation, 
  getTrustedContacts, 
  createTrustedContact
} from '@/services/contactsService';
import { 
  getBeneficiaries, 
  getExecutors, 
  updateBeneficiary, 
  updateExecutor,
  Beneficiary, 
  Executor 
} from '@/services/executorService';

// Define TrustedContact interface to match what createTrustedContact expects
export interface TrustedContact {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  relationship?: string;
  invitation_status?: string;
}

const trustedContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  relationship: z.string().optional(),
});

interface ContactsManagerProps {
  deathVerificationEnabled: boolean;
  pinSystemEnabled: boolean;
  executorOverrideEnabled: boolean;
  trustedContactEnabled: boolean;
}

export function ContactsManager({
  deathVerificationEnabled,
  pinSystemEnabled,
  executorOverrideEnabled,
  trustedContactEnabled,
}: ContactsManagerProps) {
  const { toast } = useToast();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [executors, setExecutors] = useState<Executor[]>([]);
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<{id: string, type: string, email: string, phone?: string} | null>(null);
  const [sending, setSending] = useState<Record<string, boolean>>({});
  
  const trustedContactForm = useForm<z.infer<typeof trustedContactSchema>>({
    resolver: zodResolver(trustedContactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      relationship: "",
    },
  });
  
  useEffect(() => {
    if (deathVerificationEnabled) {
      fetchContacts();
    }
  }, [deathVerificationEnabled]);
  
  const fetchContacts = async () => {
    setLoading(true);
    
    try {
      const [beneficiariesData, executorsData, trustedData] = await Promise.all([
        getBeneficiaries(),
        getExecutors(),
        getTrustedContacts()
      ]);
      
      setBeneficiaries(beneficiariesData);
      setExecutors(executorsData);
      setTrustedContacts(trustedData);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Error",
        description: "Failed to load contacts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddTrustedContact = async (data: z.infer<typeof trustedContactSchema>) => {
    try {
      const contactData: TrustedContact = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        relationship: data.relationship,
      };
      
      await createTrustedContact(contactData);
      setAddDialogOpen(false);
      trustedContactForm.reset();
      await fetchContacts();
      toast({
        title: "Contact Added",
        description: "The trusted contact has been added successfully."
      });
    } catch (error) {
      console.error('Error adding trusted contact:', error);
      toast({
        title: "Error",
        description: "Failed to add trusted contact. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateContact = async (id: string, type: 'beneficiary' | 'executor', email: string, phone?: string) => {
    try {
      if (type === 'beneficiary') {
        await updateBeneficiary(id, { email, phone });
      } else if (type === 'executor') {
        await updateExecutor(id, { email });
      }
      
      setEditingContact(null);
      await fetchContacts();
      toast({
        title: "Contact Updated",
        description: "The contact information has been updated successfully."
      });
    } catch (error) {
      console.error('Error updating contact:', error);
      toast({
        title: "Error",
        description: "Failed to update contact information. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleSendInvitation = async (id: string, type: 'beneficiary' | 'executor' | 'trusted', name: string, email: string, isResend = false) => {
    try {
      // Set sending state for this contact
      setSending(prev => ({ ...prev, [`${type}-${id}`]: true }));
      
      const success = await sendContactInvitation({
        contactId: id,
        contactType: type as any,
        name,
        email,
        userId: '',  // Will be filled in by the backend
      });
      
      if (success) {
        toast({
          title: isResend ? "Notification Resent" : "Notification Sent",
          description: `${name} has been notified about their ${type} role.`,
        });
        await fetchContacts();
      } else {
        throw new Error("Failed to send notification");
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Error",
        description: "Failed to send notification. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(prev => ({ ...prev, [`${type}-${id}`]: false }));
    }
  };
  
  const getStatusBadge = (status?: string) => {
    if (!status || status === 'not_sent') {
      return <Badge variant="outline" className="bg-gray-100">Not Notified</Badge>;
    } else if (status === 'sent' || status === 'notified') {
      return <Badge variant="outline" className="bg-green-100 text-green-800">Notified</Badge>;
    } else if (status === 'failed') {
      return <Badge variant="outline" className="bg-red-100 text-red-800">Failed</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };
  
  if (!deathVerificationEnabled) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-willtank-600" />
            Contact Management
          </CardTitle>
          <CardDescription>
            Manage contacts who will be notified about their roles in your digital legacy plan. 
            If any contact wishes to decline their role, they should contact you directly for removal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin h-6 w-6 border-2 border-willtank-600 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Beneficiaries Section */}
              <div>
                <h3 className="font-medium text-lg mb-2 flex items-center">
                  <User className="mr-2 h-4 w-4 text-willtank-600" />
                  Beneficiaries {pinSystemEnabled && <span className="ml-2 text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">PIN System Enabled</span>}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  These contacts will be notified of their beneficiary role and may need to provide their PIN to access your will when the time comes.
                </p>
                
                {beneficiaries.length > 0 ? (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Notification Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {beneficiaries.map((beneficiary) => (
                          <TableRow key={beneficiary.id}>
                            <TableCell className="font-medium">{beneficiary.name}</TableCell>
                            <TableCell>
                              {editingContact?.id === beneficiary.id ? (
                                <Input 
                                  value={editingContact.email} 
                                  onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })}
                                  className="h-8 w-full max-w-[200px]"
                                />
                              ) : (
                                beneficiary.email || <span className="text-gray-400">Not set</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {editingContact?.id === beneficiary.id ? (
                                <Input 
                                  value={editingContact.phone || ''} 
                                  onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })}
                                  className="h-8 w-full max-w-[150px]"
                                />
                              ) : (
                                beneficiary.phone || <span className="text-gray-400">Not set</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(beneficiary.invitation_status)}
                            </TableCell>
                            <TableCell className="text-right">
                              {editingContact?.id === beneficiary.id ? (
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => setEditingContact(null)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="default"
                                    onClick={() => handleUpdateContact(beneficiary.id, 'beneficiary', editingContact.email, editingContact.phone)}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex justify-end gap-2">
                                  {!beneficiary.email ? (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => setEditingContact({ 
                                        id: beneficiary.id, 
                                        type: 'beneficiary', 
                                        email: beneficiary.email || '', 
                                        phone: beneficiary.phone 
                                      })}
                                    >
                                      Add Email
                                    </Button>
                                  ) : (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      disabled={sending[`beneficiary-${beneficiary.id}`]}
                                      onClick={() => handleSendInvitation(
                                        beneficiary.id, 
                                        'beneficiary', 
                                        beneficiary.name, 
                                        beneficiary.email || '',
                                        beneficiary.invitation_status === 'sent' || beneficiary.invitation_status === 'notified'
                                      )}
                                    >
                                      {sending[`beneficiary-${beneficiary.id}`] ? (
                                        <>
                                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                                          Sending...
                                        </>
                                      ) : (
                                        <>
                                          {(beneficiary.invitation_status === 'sent' || beneficiary.invitation_status === 'notified') ? (
                                            <>
                                              <RefreshCw className="mr-2 h-4 w-4" />
                                              Resend Notification
                                            </>
                                          ) : (
                                            <>
                                              <Mail className="mr-2 h-4 w-4" />
                                              Send Notification
                                            </>
                                          )}
                                        </>
                                      )}
                                    </Button>
                                  )}
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="p-4 border rounded-md bg-gray-50 text-center">
                    <p>No beneficiaries found. Add beneficiaries to your will first.</p>
                  </div>
                )}
              </div>
              
              {/* Executors Section */}
              {executorOverrideEnabled && (
                <div>
                  <h3 className="font-medium text-lg mb-2 flex items-center">
                    <Users className="mr-2 h-4 w-4 text-willtank-600" />
                    Executors {executorOverrideEnabled && <span className="ml-2 text-xs bg-green-100 text-green-800 py-1 px-2 rounded-full">Override Enabled</span>}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    These contacts will be notified of their executor role and can help with will execution when the time comes.
                  </p>
                  
                  {executors.length > 0 ? (
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Notification Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {executors.map((executor) => (
                            <TableRow key={executor.id}>
                              <TableCell className="font-medium">{executor.name}</TableCell>
                              <TableCell>
                                {editingContact?.id === executor.id ? (
                                  <Input 
                                    value={editingContact.email} 
                                    onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })}
                                    className="h-8 w-full max-w-[200px]"
                                  />
                                ) : (
                                  executor.email || <span className="text-gray-400">Not set</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(executor.invitation_status)}
                              </TableCell>
                              <TableCell className="text-right">
                                {editingContact?.id === executor.id ? (
                                  <div className="flex justify-end gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      onClick={() => setEditingContact(null)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="default"
                                      onClick={() => handleUpdateContact(executor.id, 'executor', editingContact.email)}
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex justify-end gap-2">
                                    {!executor.email ? (
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => setEditingContact({ 
                                          id: executor.id, 
                                          type: 'executor', 
                                          email: executor.email || '' 
                                        })}
                                      >
                                        Add Email
                                      </Button>
                                    ) : (
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        disabled={sending[`executor-${executor.id}`]}
                                        onClick={() => handleSendInvitation(
                                          executor.id, 
                                          'executor', 
                                          executor.name, 
                                          executor.email || '',
                                          executor.invitation_status === 'sent' || executor.invitation_status === 'notified'
                                        )}
                                      >
                                        {sending[`executor-${executor.id}`] ? (
                                          <>
                                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                                            Sending...
                                          </>
                                        ) : (
                                          <>
                                            {(executor.invitation_status === 'sent' || executor.invitation_status === 'notified') ? (
                                              <>
                                                <RefreshCw className="mr-2 h-4 w-4" />
                                                Resend Notification
                                              </>
                                            ) : (
                                              <>
                                                <Mail className="mr-2 h-4 w-4" />
                                                Send Notification
                                              </>
                                            )}
                                          </>
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="p-4 border rounded-md bg-gray-50 text-center">
                      <p>No executors found. Add executors to your will first.</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Trusted Contacts Section */}
              {trustedContactEnabled && (
                <div>
                  <h3 className="font-medium text-lg mb-2 flex items-center">
                    <User className="mr-2 h-4 w-4 text-willtank-600" />
                    Trusted Contacts
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Trusted contacts will be notified of their role and can help verify your status during check-ins.
                  </p>
                  
                  {trustedContacts.length > 0 ? (
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Notification Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {trustedContacts.map((contact) => (
                            <TableRow key={contact.id}>
                              <TableCell className="font-medium">{contact.name}</TableCell>
                              <TableCell>{contact.email}</TableCell>
                              <TableCell>{contact.phone || <span className="text-gray-400">Not set</span>}</TableCell>
                              <TableCell>
                                {getStatusBadge(contact.invitation_status)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  disabled={sending[`trusted-${contact.id}`]}
                                  onClick={() => handleSendInvitation(
                                    contact.id!, 
                                    'trusted', 
                                    contact.name, 
                                    contact.email,
                                    contact.invitation_status === 'sent' || contact.invitation_status === 'notified'
                                  )}
                                >
                                  {sending[`trusted-${contact.id}`] ? (
                                    <>
                                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                                      Sending...
                                    </>
                                  ) : (
                                    <>
                                      {(contact.invitation_status === 'sent' || contact.invitation_status === 'notified') ? (
                                        <>
                                          <RefreshCw className="mr-2 h-4 w-4" />
                                          Resend Notification
                                        </>
                                      ) : (
                                        <>
                                          <Mail className="mr-2 h-4 w-4" />
                                          Send Notification
                                        </>
                                      )}
                                    </>
                                  )}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="p-4 border rounded-md bg-gray-50 text-center">
                      <p>No trusted contacts added yet.</p>
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-end">
                    <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add Trusted Contact
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Add Trusted Contact</DialogTitle>
                          <DialogDescription>
                            Add someone you trust who can help verify your status and access your will in emergencies.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <Form {...trustedContactForm}>
                          <form onSubmit={trustedContactForm.handleSubmit(handleAddTrustedContact)} className="space-y-4">
                            <FormField
                              control={trustedContactForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Full name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={trustedContactForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Email address" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={trustedContactForm.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone (optional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Phone number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={trustedContactForm.control}
                              name="relationship"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Relationship (optional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. Family member, Lawyer, Friend" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <DialogFooter>
                              <Button type="submit">Add Contact</Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              )}
              
              {/* Important Notice */}
              <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                <h3 className="font-medium mb-2 flex items-center text-blue-800">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Important Notice
                </h3>
                <p className="text-sm text-blue-700 mb-2">
                  All contacts listed above will be automatically notified of their roles. They don't need to confirm or accept anything through the system.
                </p>
                <p className="text-sm text-blue-700">
                  If any contact wishes to decline their role, they should contact you directly and you can manually remove them from your will or trusted contacts list.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-gray-500">
            Keep your contact information up to date for the best experience.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
