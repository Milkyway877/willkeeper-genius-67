
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Phone, Home, Plus, Trash2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

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
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const { toast } = useToast();

  const handleAddContact = () => {
    setEditingContact({
      id: `contact-${Date.now()}`,
      name: '',
      role: 'Beneficiary',
      email: '',
      phone: '',
      address: ''
    });
    setIsAddingContact(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact({ ...contact });
    setIsAddingContact(false);
  };

  const handleSaveContact = () => {
    if (!editingContact) return;
    
    if (!editingContact.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for this contact.",
        variant: "destructive"
      });
      return;
    }
    
    let updatedContacts: Contact[];
    
    if (isAddingContact) {
      updatedContacts = [...contacts, editingContact];
    } else {
      updatedContacts = contacts.map(c => 
        c.id === editingContact.id ? editingContact : c
      );
    }
    
    setContacts(updatedContacts);
    setEditingContact(null);
    setIsAddingContact(false);
    
    toast({
      title: isAddingContact ? "Contact Added" : "Contact Updated",
      description: `${editingContact.name} has been ${isAddingContact ? 'added' : 'updated'} successfully.`
    });
  };

  const handleRemoveContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
    
    toast({
      title: "Contact Removed",
      description: "The contact has been removed successfully."
    });
  };

  const handleComplete = () => {
    onComplete(contacts);
  };

  const validateEmails = () => {
    const invalidContacts = contacts.filter(c => 
      c.email.trim() !== '' && 
      !/^\S+@\S+\.\S+$/.test(c.email)
    );
    
    if (invalidContacts.length > 0) {
      toast({
        title: "Invalid Email Addresses",
        description: `Please correct the email ${invalidContacts.length > 1 ? 'addresses' : 'address'} for: ${invalidContacts.map(c => c.name).join(', ')}`,
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  // Group contacts by role for better organization
  const contactsByRole = contacts.reduce((acc, contact) => {
    if (!acc[contact.role]) {
      acc[contact.role] = [];
    }
    acc[contact.role].push(contact);
    return acc;
  }, {} as Record<string, Contact[]>);

  const roleOrder = ["Executor", "Alternate Executor", "Guardian", "Beneficiary", "Trustee", "Witness", "Other"];

  return (
    <div className="space-y-6">
      <div className="bg-willtank-50 p-4 rounded-lg mb-6 border border-willtank-100">
        <h3 className="font-medium text-willtank-700 mb-2">Important People in Your Will</h3>
        <p className="text-sm text-gray-600">
          We've identified the following people mentioned in your will conversation. Please provide their contact information
          for future reference and communication. This information will be used for document delivery and notifications.
        </p>
      </div>
      
      {/* Summary of roles needed */}
      {Object.keys(contactsByRole).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Contact Information Needed:</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {roleOrder
              .filter(role => contactsByRole[role] && contactsByRole[role].length > 0)
              .map(role => (
                <li key={role}>
                  <span className="font-medium">{role}s ({contactsByRole[role].length}):</span> 
                  {contactsByRole[role].map(c => c.name).join(', ')}
                </li>
              ))}
          </ul>
        </div>
      )}
      
      {/* Contact list */}
      {contacts.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-lg">
          <p className="text-gray-500">No contacts identified yet. Add contacts using the button below.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {roleOrder.filter(role => contactsByRole[role]).map(role => (
            contactsByRole[role] && (
              <div key={role} className="space-y-3">
                <h3 className="font-medium text-gray-700 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center bg-willtank-100 rounded-full h-6 w-6 text-xs text-willtank-700">
                    {contactsByRole[role].length}
                  </span>
                  {role}s
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {contactsByRole[role].map((contact) => (
                    <motion.div 
                      key={contact.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 hover:border-willtank-300 transition-all duration-200"
                    >
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium">{contact.name}</h3>
                          <p className="text-sm text-gray-500">{contact.role}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleEditContact(contact)}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-red-500 hover:text-red-700" 
                            onClick={() => handleRemoveContact(contact.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-2 text-sm">
                        {contact.email && (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{contact.email}</span>
                          </div>
                        )}
                        
                        {contact.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                        
                        {contact.address && (
                          <div className="flex items-center">
                            <Home className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{contact.address}</span>
                          </div>
                        )}
                        
                        {!contact.email && !contact.phone && !contact.address && (
                          <div className="text-amber-600 text-sm italic">
                            No contact information provided yet
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}
      
      {/* Add contact button */}
      {!editingContact && (
        <Button 
          variant="outline" 
          onClick={handleAddContact}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another Contact
        </Button>
      )}
      
      {/* Edit contact form */}
      {editingContact && (
        <Card>
          <CardHeader>
            <CardTitle>{isAddingContact ? "Add New Contact" : `Edit ${editingContact.name}`}</CardTitle>
            <CardDescription>
              {isAddingContact 
                ? "Add a new person related to your will." 
                : `Update the contact information for ${editingContact.name}.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="flex">
                  <div className="bg-gray-50 p-2 border border-r-0 rounded-l-md flex items-center">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input 
                    id="name" 
                    className="rounded-l-none"
                    value={editingContact.name} 
                    onChange={e => setEditingContact({...editingContact, name: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={editingContact.role} 
                  onValueChange={value => setEditingContact({...editingContact, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Executor">Executor</SelectItem>
                    <SelectItem value="Alternate Executor">Alternate Executor</SelectItem>
                    <SelectItem value="Beneficiary">Beneficiary</SelectItem>
                    <SelectItem value="Guardian">Guardian</SelectItem>
                    <SelectItem value="Trustee">Trustee</SelectItem>
                    <SelectItem value="Witness">Witness</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex">
                <div className="bg-gray-50 p-2 border border-r-0 rounded-l-md flex items-center">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <Input 
                  id="email" 
                  type="email"
                  className="rounded-l-none"
                  value={editingContact.email} 
                  onChange={e => setEditingContact({...editingContact, email: e.target.value})}
                  placeholder="johndoe@example.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex">
                <div className="bg-gray-50 p-2 border border-r-0 rounded-l-md flex items-center">
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <Input 
                  id="phone" 
                  className="rounded-l-none"
                  value={editingContact.phone} 
                  onChange={e => setEditingContact({...editingContact, phone: e.target.value})}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <div className="flex">
                <div className="bg-gray-50 p-2 border border-r-0 rounded-l-md flex items-center align-top">
                  <Home className="h-4 w-4 text-gray-400" />
                </div>
                <Textarea 
                  id="address" 
                  className="rounded-l-none min-h-[80px]"
                  value={editingContact.address} 
                  onChange={e => setEditingContact({...editingContact, address: e.target.value})}
                  placeholder="123 Main St, Anytown, CA 12345"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setEditingContact(null);
                setIsAddingContact(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveContact}>
              <Check className="h-4 w-4 mr-2" />
              {isAddingContact ? "Add Contact" : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {!editingContact && contacts.length > 0 && (
        <div className="mt-8">
          <Button 
            className="w-full"
            size="lg"
            onClick={() => {
              if (validateEmails()) {
                handleComplete();
              }
            }}
          >
            <Check className="mr-2 h-4 w-4" />
            Save Contacts & Continue
          </Button>
          <p className="text-xs text-center text-gray-500 mt-2">
            Contact information will be used for document notifications and deliveries only.
          </p>
        </div>
      )}
    </div>
  );
}
