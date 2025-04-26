
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Plus, Trash, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  address: string;
}

interface ContactsCollectionProps {
  contacts: Contact[];
  onComplete: (contacts: Contact[]) => void;
}

export function ContactsCollection({ contacts: initialContacts, onComplete }: ContactsCollectionProps) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [newContact, setNewContact] = useState<Contact>({
    id: '',
    name: '',
    role: 'Executor',
    email: '',
    phone: '',
    address: ''
  });
  const [editing, setEditing] = useState<string | null>(null);
  const [requiredContacts, setRequiredContacts] = useState<string[]>(['Executor']);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  // Check if all required contacts are added
  useEffect(() => {
    const hasAllRequiredRoles = requiredContacts.every(role => 
      contacts.some(contact => contact.role.toLowerCase() === role.toLowerCase())
    );
    
    setIsComplete(hasAllRequiredRoles);
  }, [contacts, requiredContacts]);

  const addContact = () => {
    if (!newContact.name) {
      toast({
        title: "Name is required",
        description: "Please provide a name for this contact.",
        variant: "destructive"
      });
      return;
    }

    const updatedContacts = [...contacts, {
      ...newContact,
      id: `contact-${Date.now()}`
    }];
    
    setContacts(updatedContacts);
    setNewContact({
      id: '',
      name: '',
      role: 'Executor',
      email: '',
      phone: '',
      address: ''
    });
    
    toast({
      title: "Contact added",
      description: `${newContact.name} has been added as ${newContact.role}.`
    });
  };

  const updateContact = (id: string) => {
    const updatedContacts = contacts.map(contact => 
      contact.id === id ? { ...newContact } : contact
    );
    
    setContacts(updatedContacts);
    setEditing(null);
    setNewContact({
      id: '',
      name: '',
      role: 'Executor',
      email: '',
      phone: '',
      address: ''
    });
    
    toast({
      title: "Contact updated",
      description: `${newContact.name}'s information has been updated.`
    });
  };

  const editContact = (contact: Contact) => {
    setNewContact({ ...contact });
    setEditing(contact.id);
  };

  const removeContact = (id: string) => {
    const contactToRemove = contacts.find(c => c.id === id);
    const isRequiredRole = requiredContacts.includes(contactToRemove?.role || '');
    const hasAnotherOfSameRole = contacts.some(c => c.role === contactToRemove?.role && c.id !== id);
    
    if (isRequiredRole && !hasAnotherOfSameRole) {
      toast({
        title: "Cannot remove contact",
        description: `A ${contactToRemove?.role} is required. Please add another ${contactToRemove?.role} before removing this one.`,
        variant: "destructive"
      });
      return;
    }
    
    const updatedContacts = contacts.filter(contact => contact.id !== id);
    setContacts(updatedContacts);
    
    if (editing === id) {
      setEditing(null);
      setNewContact({
        id: '',
        name: '',
        role: 'Executor',
        email: '',
        phone: '',
        address: ''
      });
    }
    
    toast({
      title: "Contact removed",
      description: `${contactToRemove?.name} has been removed.`
    });
  };

  const handleComplete = () => {
    // Verify we have all required roles before completing
    const missingRoles = requiredContacts.filter(role => 
      !contacts.some(contact => contact.role.toLowerCase() === role.toLowerCase())
    );
    
    if (missingRoles.length > 0) {
      toast({
        title: "Missing required contacts",
        description: `Please add the following roles: ${missingRoles.join(', ')}`,
        variant: "destructive"
      });
      return;
    }
    
    onComplete(contacts);
  };

  const roleOptions = [
    "Executor", 
    "Alternate Executor", 
    "Guardian", 
    "Beneficiary", 
    "Witness", 
    "Attorney",
    "Digital Executor",
    "Financial Advisor",
    "Medical Representative",
    "Trustee"
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>
            Add important people related to your will. At minimum, you should have an executor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Input form for new contact */}
            <div className="border rounded-md p-4 bg-gray-50">
              <h3 className="text-md font-medium mb-4">
                {editing ? "Edit Contact" : "Add New Contact"}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Full Name <span className="text-red-500">*</span></Label>
                  <Input 
                    id="contactName"
                    value={newContact.name}
                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactRole">Role <span className="text-red-500">*</span></Label>
                  <Select 
                    value={newContact.role}
                    onValueChange={(value) => setNewContact({...newContact, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input 
                    id="contactEmail"
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                    placeholder="john.doe@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Phone Number</Label>
                  <Input 
                    id="contactPhone"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="contactAddress">Address</Label>
                  <Input 
                    id="contactAddress"
                    value={newContact.address}
                    onChange={(e) => setNewContact({...newContact, address: e.target.value})}
                    placeholder="123 Main St, City, State, ZIP"
                  />
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                {editing ? (
                  <Button onClick={() => updateContact(editing)}>
                    Update Contact
                  </Button>
                ) : (
                  <Button onClick={addContact}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Contact
                  </Button>
                )}
              </div>
            </div>
            
            {/* List of added contacts */}
            {contacts.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-md font-medium">Added Contacts ({contacts.length})</h3>
                
                <div className="grid grid-cols-1 gap-3">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="border rounded-md p-3 bg-white flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{contact.name}</span>
                          <Badge variant="outline">{contact.role}</Badge>
                          {requiredContacts.includes(contact.role) && (
                            <Badge variant="secondary" className="text-xs">Required</Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-500 mt-1">
                          {contact.email && <div>{contact.email}</div>}
                          {contact.phone && <div>{contact.phone}</div>}
                          {contact.address && <div className="truncate max-w-md">{contact.address}</div>}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => editContact(contact)}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => removeContact(contact.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed rounded-md">
                <UserPlus className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No contacts added yet</p>
                <p className="text-sm text-gray-400">Add at least one executor</p>
              </div>
            )}
            
            {/* Completion status */}
            <div className="border-t pt-4 mt-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {isComplete ? (
                    <div className="flex items-center text-green-600">
                      <Check className="h-5 w-5 mr-1" />
                      <span>All required contacts added</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-600">
                      <AlertCircle className="h-5 w-5 mr-1" />
                      <span>Required contacts missing</span>
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={handleComplete}
                  disabled={!isComplete}
                >
                  Save & Continue
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
