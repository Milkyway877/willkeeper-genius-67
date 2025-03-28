
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, User, UserPlus, UserCheck, Mail, Phone, 
  Shield, Check, AlertTriangle, Send, Eye, Trash2, 
  Edit, RefreshCw, Plus, CheckCircle2, Clock, UserX
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface Person {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  status: 'pending' | 'active' | 'declined' | 'inactive';
  type: 'executor' | 'beneficiary' | 'guardian' | 'trustee';
  dateAdded: Date;
  lastNotified: Date | null;
  avatarUrl?: string;
}

export default function Executors() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('all');
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [personForm, setPersonForm] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: '',
    type: 'executor',
  });
  
  // Sample people data
  const [people, setPeople] = useState<Person[]>([
    {
      id: 'person-1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phone: '(555) 123-4567',
      relationship: 'Sister',
      status: 'active',
      type: 'executor',
      dateAdded: new Date(2023, 4, 12),
      lastNotified: new Date(2023, 10, 5),
      avatarUrl: '',
    },
    {
      id: 'person-2',
      name: 'Michael Chen',
      email: 'michael.chen@example.com',
      phone: '(555) 987-6543',
      relationship: 'Best Friend',
      status: 'pending',
      type: 'executor',
      dateAdded: new Date(2023, 6, 24),
      lastNotified: new Date(2023, 6, 24),
      avatarUrl: '',
    },
    {
      id: 'person-3',
      name: 'Emma Wilson',
      email: 'emma.wilson@example.com',
      phone: '(555) 456-7890',
      relationship: 'Cousin',
      status: 'active',
      type: 'beneficiary',
      dateAdded: new Date(2023, 5, 17),
      lastNotified: new Date(2023, 9, 2),
      avatarUrl: '',
    },
    {
      id: 'person-4',
      name: 'James Rodriguez',
      email: 'james.rodriguez@example.com',
      phone: '(555) 321-6547',
      relationship: 'Friend',
      status: 'declined',
      type: 'executor',
      dateAdded: new Date(2023, 7, 8),
      lastNotified: new Date(2023, 7, 8),
      avatarUrl: '',
    },
    {
      id: 'person-5',
      name: 'Olivia Thompson',
      email: 'olivia.thompson@example.com',
      phone: '(555) 789-0123',
      relationship: 'Niece',
      status: 'active',
      type: 'beneficiary',
      dateAdded: new Date(2023, 4, 30),
      lastNotified: new Date(2023, 8, 15),
      avatarUrl: '',
    },
    {
      id: 'person-6',
      name: 'Noah Miller',
      email: 'noah.miller@example.com',
      phone: '(555) 234-5678',
      relationship: 'Brother',
      status: 'active',
      type: 'guardian',
      dateAdded: new Date(2023, 3, 22),
      lastNotified: new Date(2023, 9, 10),
      avatarUrl: '',
    },
  ]);
  
  // Handler for form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPersonForm({
      ...personForm,
      [name]: value
    });
  };
  
  // Add a new person
  const addPerson = () => {
    // Validate form inputs
    if (!personForm.name || !personForm.email || !personForm.relationship) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    setIsAddingPerson(true);
    
    // Simulate adding a person with a delay
    setTimeout(() => {
      const newPerson: Person = {
        id: `person-${people.length + 1}`,
        name: personForm.name,
        email: personForm.email,
        phone: personForm.phone,
        relationship: personForm.relationship,
        status: 'pending',
        type: personForm.type as 'executor' | 'beneficiary' | 'guardian' | 'trustee',
        dateAdded: new Date(),
        lastNotified: new Date(),
        avatarUrl: '',
      };
      
      setPeople([...people, newPerson]);
      setPersonForm({
        name: '',
        email: '',
        phone: '',
        relationship: '',
        type: 'executor',
      });
      setIsAddingPerson(false);
      
      toast({
        title: "Person Added",
        description: `${newPerson.name} has been added as a ${newPerson.type}.`,
      });
      
      // Simulate sending invitation
      toast({
        title: "Invitation Sent",
        description: `An invitation has been sent to ${newPerson.email}.`,
      });
    }, 1500);
  };
  
  // Resend invitation
  const resendInvitation = (person: Person) => {
    // Update the last notified date
    setPeople(people.map(p => 
      p.id === person.id ? { ...p, lastNotified: new Date() } : p
    ));
    
    toast({
      title: "Invitation Resent",
      description: `A new invitation has been sent to ${person.name}.`,
    });
  };
  
  // Remove a person
  const removePerson = (personId: string) => {
    const personToRemove = people.find(p => p.id === personId);
    
    if (personToRemove) {
      setPeople(people.filter(p => p.id !== personId));
      
      toast({
        title: "Person Removed",
        description: `${personToRemove.name} has been removed from your ${personToRemove.type}s.`,
      });
    }
  };
  
  // Filter people based on the selected tab
  const filteredPeople = people.filter(person => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'executors') return person.type === 'executor';
    if (selectedTab === 'beneficiaries') return person.type === 'beneficiary';
    if (selectedTab === 'guardians') return person.type === 'guardian';
    if (selectedTab === 'trustees') return person.type === 'trustee';
    return false;
  });
  
  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-600';
      case 'pending':
        return 'bg-amber-100 text-amber-600';
      case 'declined':
        return 'bg-red-100 text-red-600';
      case 'inactive':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };
  
  // Get type badge class
  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'executor':
        return 'bg-blue-100 text-blue-600';
      case 'beneficiary':
        return 'bg-purple-100 text-purple-600';
      case 'guardian':
        return 'bg-teal-100 text-teal-600';
      case 'trustee':
        return 'bg-indigo-100 text-indigo-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Beneficiaries & Executors</h1>
            <p className="text-gray-600">Manage the people involved in your estate plans.</p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Person
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a New Person</DialogTitle>
                <DialogDescription>
                  Add someone as an executor, beneficiary, guardian, or trustee for your estate plans.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Name</label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Full name"
                    value={personForm.name}
                    onChange={handleFormChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email address"
                    value={personForm.email}
                    onChange={handleFormChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">Phone (Optional)</label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Phone number"
                    value={personForm.phone}
                    onChange={handleFormChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="relationship" className="text-sm font-medium">Relationship</label>
                  <Input
                    id="relationship"
                    name="relationship"
                    placeholder="e.g., Friend, Sister, Brother"
                    value={personForm.relationship}
                    onChange={handleFormChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="type" className="text-sm font-medium">Role</label>
                  <select
                    id="type"
                    name="type"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={personForm.type}
                    onChange={handleFormChange}
                  >
                    <option value="executor">Executor</option>
                    <option value="beneficiary">Beneficiary</option>
                    <option value="guardian">Guardian</option>
                    <option value="trustee">Trustee</option>
                  </select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setPersonForm({
                  name: '',
                  email: '',
                  phone: '',
                  relationship: '',
                  type: 'executor',
                })}>
                  Cancel
                </Button>
                <Button onClick={addPerson} disabled={isAddingPerson}>
                  {isAddingPerson ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Person
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All People</TabsTrigger>
            <TabsTrigger value="executors">Executors</TabsTrigger>
            <TabsTrigger value="beneficiaries">Beneficiaries</TabsTrigger>
            <TabsTrigger value="guardians">Guardians</TabsTrigger>
            <TabsTrigger value="trustees">Trustees</TabsTrigger>
          </TabsList>
          
          <TabsContent value={selectedTab}>
            <div className="space-y-6">
              {filteredPeople.length > 0 ? (
                filteredPeople.map((person) => (
                  <motion.div
                    key={person.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                        <div className="flex items-center">
                          <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                            {person.avatarUrl ? (
                              <img 
                                src={person.avatarUrl} 
                                alt={person.name} 
                                className="h-full w-full rounded-full object-cover" 
                              />
                            ) : (
                              <User size={24} className="text-gray-500" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">{person.name}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeClass(person.type)}`}>
                                {person.type.charAt(0).toUpperCase() + person.type.slice(1)}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(person.status)}`}>
                                {person.status.charAt(0).toUpperCase() + person.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 md:mt-0 text-sm text-gray-500">
                          Added: {person.dateAdded.toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          <a href={`mailto:${person.email}`} className="text-sm text-willtank-600 hover:underline">
                            {person.email}
                          </a>
                        </div>
                        
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          <a href={`tel:${person.phone}`} className="text-sm text-gray-700">
                            {person.phone}
                          </a>
                        </div>
                        
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-700">
                            {person.relationship}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 justify-end border-t border-gray-100 pt-4">
                        {(person.status === 'pending' || person.status === 'declined') && (
                          <Button variant="outline" size="sm" onClick={() => resendInvitation(person)}>
                            <Send className="mr-2 h-4 w-4" />
                            Resend Invitation
                          </Button>
                        )}
                        
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                        
                        <Button variant="outline" size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Remove Person</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to remove {person.name} from your {person.type}s? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline">Cancel</Button>
                              <Button 
                                variant="destructive" 
                                onClick={() => removePerson(person.id)}
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Remove Person
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No people found</h3>
                  <p className="text-gray-500 mb-4">You haven't added any {selectedTab !== 'all' ? selectedTab : 'people'} yet.</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Person
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      {/* Person addition dialog content - same as above */}
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-willtank-50 rounded-xl p-6 border border-willtank-100">
            <div className="flex items-start">
              <div className="h-10 w-10 rounded-full bg-willtank-100 flex items-center justify-center mr-4">
                <Shield className="h-5 w-5 text-willtank-600" />
              </div>
              <div>
                <h3 className="font-medium mb-2">Understanding Roles</h3>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-600 mr-2 mt-0.5">Executor</span>
                    <span>Responsible for carrying out the instructions in your will, managing your estate, and distributing assets.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-600 mr-2 mt-0.5">Beneficiary</span>
                    <span>A person or organization that receives assets from your estate.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-600 mr-2 mt-0.5">Guardian</span>
                    <span>Someone who will care for your minor children if you and their other parent are unable to do so.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-600 mr-2 mt-0.5">Trustee</span>
                    <span>Manages assets placed in a trust according to the trust's terms.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-start">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                <CheckCircle2 className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium mb-2">Invitation Status</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Executors</span>
                      <span className="text-amber-600 font-medium">1 Pending</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full">
                      <div 
                        className="h-2 bg-green-500 rounded-full" 
                        style={{ width: `${(people.filter(p => p.type === 'executor' && p.status === 'active').length / 
                          people.filter(p => p.type === 'executor').length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Beneficiaries</span>
                      <span className="text-green-600 font-medium">All Confirmed</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full">
                      <div 
                        className="h-2 bg-green-500 rounded-full" 
                        style={{ width: `${(people.filter(p => p.type === 'beneficiary' && p.status === 'active').length / 
                          Math.max(1, people.filter(p => p.type === 'beneficiary').length)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Guardians</span>
                      <span className="text-green-600 font-medium">All Confirmed</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full">
                      <div 
                        className="h-2 bg-green-500 rounded-full" 
                        style={{ width: `${(people.filter(p => p.type === 'guardian' && p.status === 'active').length / 
                          Math.max(1, people.filter(p => p.type === 'guardian').length)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => {
                      const pendingPeople = people.filter(p => p.status === 'pending');
                      if (pendingPeople.length > 0) {
                        pendingPeople.forEach(person => resendInvitation(person));
                      } else {
                        toast({
                          title: "No Pending Invitations",
                          description: "All invitations have been sent and responded to."
                        });
                      }
                    }}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Remind All Pending
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
