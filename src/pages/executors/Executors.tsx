
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  User, Plus, Mail, Phone, Check, AlertTriangle, 
  Edit, Trash2, Eye, ArrowRight, ShieldCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Person {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  status: 'active' | 'invited' | 'pending';
  percentage?: number;
  inheritance?: string;
  notes?: string;
  notified: boolean;
}

export default function Executors() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('executors');
  const [executors, setExecutors] = useState<Person[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      phone: '(555) 123-4567',
      relationship: 'Sister',
      status: 'active',
      notes: 'Has agreed to be executor and has all necessary details.',
      notified: true,
    },
    {
      id: '2',
      name: 'Miguel Fernandez',
      email: 'miguel.f@example.com',
      phone: '(555) 987-6543',
      relationship: 'Friend',
      status: 'invited',
      notes: 'Secondary executor in case Sarah is unavailable.',
      notified: true,
    }
  ]);
  
  const [beneficiaries, setBeneficiaries] = useState<Person[]>([
    {
      id: '1',
      name: 'Thomas Robertson',
      email: 'thomas.r@example.com',
      phone: '(555) 234-5678',
      relationship: 'Son',
      status: 'active',
      percentage: 50,
      inheritance: 'Equal share of estate plus family heirlooms',
      notified: true,
    },
    {
      id: '2',
      name: 'Emily Robertson',
      email: 'emily.r@example.com',
      phone: '(555) 876-5432',
      relationship: 'Daughter',
      status: 'active',
      percentage: 50,
      inheritance: 'Equal share of estate plus jewelry collection',
      notified: true,
    }
  ]);

  // State for form dialogs
  const [showAddExecutorDialog, setShowAddExecutorDialog] = useState(false);
  const [showAddBeneficiaryDialog, setShowAddBeneficiaryDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [currentPerson, setCurrentPerson] = useState<Person | null>(null);
  const [formData, setFormData] = useState<Partial<Person>>({
    name: '',
    email: '',
    phone: '',
    relationship: '',
    notes: '',
    percentage: 0,
    inheritance: '',
    notified: false,
  });

  // Handle input changes in forms
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle switch changes
  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      notified: checked,
    });
  };

  // Handle adding a new executor
  const handleAddExecutor = () => {
    const newExecutor: Person = {
      id: Date.now().toString(),
      name: formData.name || '',
      email: formData.email || '',
      phone: formData.phone || '',
      relationship: formData.relationship || '',
      status: 'pending',
      notes: formData.notes,
      notified: formData.notified || false,
    };
    
    setExecutors([...executors, newExecutor]);
    setShowAddExecutorDialog(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      relationship: '',
      notes: '',
      notified: false,
    });
    
    toast({
      title: "Executor Added",
      description: `${newExecutor.name} has been added as an executor.`,
    });
  };

  // Handle adding a new beneficiary
  const handleAddBeneficiary = () => {
    const newBeneficiary: Person = {
      id: Date.now().toString(),
      name: formData.name || '',
      email: formData.email || '',
      phone: formData.phone || '',
      relationship: formData.relationship || '',
      status: 'pending',
      percentage: formData.percentage || 0,
      inheritance: formData.inheritance || '',
      notified: formData.notified || false,
    };
    
    setBeneficiaries([...beneficiaries, newBeneficiary]);
    setShowAddBeneficiaryDialog(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      relationship: '',
      percentage: 0,
      inheritance: '',
      notified: false,
    });
    
    toast({
      title: "Beneficiary Added",
      description: `${newBeneficiary.name} has been added as a beneficiary.`,
    });
  };

  // Handle editing a person
  const handleEditPerson = () => {
    if (!currentPerson) return;
    
    if (activeTab === 'executors') {
      const updatedExecutors = executors.map(executor => 
        executor.id === currentPerson.id ? { ...executor, ...formData } : executor
      );
      setExecutors(updatedExecutors);
    } else {
      const updatedBeneficiaries = beneficiaries.map(beneficiary => 
        beneficiary.id === currentPerson.id ? { ...beneficiary, ...formData } : beneficiary
      );
      setBeneficiaries(updatedBeneficiaries);
    }
    
    setShowEditDialog(false);
    toast({
      title: "Updated Successfully",
      description: `${currentPerson.name}'s information has been updated.`,
    });
  };

  // Handle removing a person
  const handleRemovePerson = () => {
    if (!currentPerson) return;
    
    if (activeTab === 'executors') {
      const updatedExecutors = executors.filter(executor => executor.id !== currentPerson.id);
      setExecutors(updatedExecutors);
    } else {
      const updatedBeneficiaries = beneficiaries.filter(beneficiary => beneficiary.id !== currentPerson.id);
      setBeneficiaries(updatedBeneficiaries);
    }
    
    setShowRemoveDialog(false);
    toast({
      title: "Removed Successfully",
      description: `${currentPerson.name} has been removed.`,
      variant: "destructive",
    });
  };

  // Open the edit dialog for a person
  const openEditDialog = (person: Person) => {
    setCurrentPerson(person);
    setFormData({
      name: person.name,
      email: person.email,
      phone: person.phone,
      relationship: person.relationship,
      notes: person.notes,
      percentage: person.percentage,
      inheritance: person.inheritance,
      notified: person.notified,
    });
    setShowEditDialog(true);
  };

  // Open the remove dialog for a person
  const openRemoveDialog = (person: Person) => {
    setCurrentPerson(person);
    setShowRemoveDialog(true);
  };

  // Open the view dialog for a person
  const openViewDialog = (person: Person) => {
    setCurrentPerson(person);
    setShowViewDialog(true);
  };

  // Reset form data when closing dialogs
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      relationship: '',
      notes: '',
      percentage: 0,
      inheritance: '',
      notified: false,
    });
    setCurrentPerson(null);
  };

  // Notify a person
  const handleNotify = (person: Person) => {
    let updatedArray;
    
    if (activeTab === 'executors') {
      updatedArray = executors.map(p => 
        p.id === person.id ? { ...p, notified: true, status: 'invited' } : p
      );
      setExecutors(updatedArray);
    } else {
      updatedArray = beneficiaries.map(p => 
        p.id === person.id ? { ...p, notified: true, status: 'invited' } : p
      );
      setBeneficiaries(updatedArray);
    }
    
    toast({
      title: "Notification Sent",
      description: `${person.name} has been notified.`,
    });
  };

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Executors & Beneficiaries</h1>
        <p className="text-gray-600 mb-8">
          Manage the people who will execute your will and inherit your assets.
        </p>
        
        <Tabs defaultValue="executors" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="executors">Executors</TabsTrigger>
            <TabsTrigger value="beneficiaries">Beneficiaries</TabsTrigger>
          </TabsList>
          
          <TabsContent value="executors">
            <div className="flex justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Your Executors</h2>
                <p className="text-gray-500">People who will manage your estate after you pass away.</p>
              </div>
              <Dialog open={showAddExecutorDialog} onOpenChange={setShowAddExecutorDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus size={16} />
                    Add Executor
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Executor</DialogTitle>
                    <DialogDescription>
                      Add a person who will be responsible for executing your will.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        placeholder="John Smith"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        placeholder="(555) 123-4567"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="relationship">Relationship</Label>
                      <Select 
                        onValueChange={(value) => handleSelectChange('relationship', value)}
                        defaultValue={formData.relationship}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spouse">Spouse</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="sibling">Sibling</SelectItem>
                          <SelectItem value="friend">Friend</SelectItem>
                          <SelectItem value="attorney">Attorney</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea 
                        id="notes" 
                        name="notes" 
                        placeholder="Any special instructions or notes..."
                        value={formData.notes}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="notified"
                        checked={formData.notified}
                        onCheckedChange={handleSwitchChange}
                      />
                      <Label htmlFor="notified">Notify this person now</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setShowAddExecutorDialog(false);
                      resetForm();
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddExecutor}>Add Executor</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {executors.map((executor) => (
                <Card key={executor.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between">
                      <span>{executor.name}</span>
                      <span className="flex items-center text-sm font-normal">
                        {executor.status === 'active' ? (
                          <span className="flex items-center text-green-600">
                            <Check size={16} className="mr-1" />
                            Active
                          </span>
                        ) : executor.status === 'invited' ? (
                          <span className="flex items-center text-amber-600">
                            <AlertTriangle size={16} className="mr-1" />
                            Invited
                          </span>
                        ) : (
                          <span className="flex items-center text-gray-600">
                            Pending
                          </span>
                        )}
                      </span>
                    </CardTitle>
                    <CardDescription>{executor.relationship}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-500" />
                        <span>{executor.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-500" />
                        <span>{executor.phone}</span>
                      </div>
                      {executor.notes && (
                        <div className="mt-2 text-gray-600 italic">
                          "{executor.notes}"
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openViewDialog(executor)}
                      >
                        <Eye size={16} className="mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openEditDialog(executor)}
                      >
                        <Edit size={16} className="mr-1" />
                        Edit
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      {!executor.notified && (
                        <Button 
                          size="sm"
                          onClick={() => handleNotify(executor)}
                        >
                          Notify
                        </Button>
                      )}
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => openRemoveDialog(executor)}
                      >
                        <Trash2 size={16} className="mr-1" />
                        Remove
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {executors.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <User className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No executors added yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add executors who will be responsible for managing your estate.
                </p>
                <div className="mt-6">
                  <Button onClick={() => setShowAddExecutorDialog(true)}>
                    <Plus size={16} className="mr-2" />
                    Add Executor
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="beneficiaries">
            <div className="flex justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Your Beneficiaries</h2>
                <p className="text-gray-500">People who will inherit your assets.</p>
              </div>
              <Dialog open={showAddBeneficiaryDialog} onOpenChange={setShowAddBeneficiaryDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus size={16} />
                    Add Beneficiary
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Beneficiary</DialogTitle>
                    <DialogDescription>
                      Add a person who will inherit from your estate.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        placeholder="John Smith"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        placeholder="(555) 123-4567"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="relationship">Relationship</Label>
                      <Select 
                        onValueChange={(value) => handleSelectChange('relationship', value)}
                        defaultValue={formData.relationship}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spouse">Spouse</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="sibling">Sibling</SelectItem>
                          <SelectItem value="friend">Friend</SelectItem>
                          <SelectItem value="charity">Charity</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="percentage">Percentage of Estate (%)</Label>
                      <Input 
                        id="percentage" 
                        name="percentage" 
                        type="number"
                        placeholder="25"
                        value={formData.percentage}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="inheritance">Inheritance Details</Label>
                      <Textarea 
                        id="inheritance" 
                        name="inheritance" 
                        placeholder="Describe what this beneficiary will inherit..."
                        value={formData.inheritance}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="notified"
                        checked={formData.notified}
                        onCheckedChange={handleSwitchChange}
                      />
                      <Label htmlFor="notified">Notify this person now</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setShowAddBeneficiaryDialog(false);
                      resetForm();
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddBeneficiary}>Add Beneficiary</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {beneficiaries.map((beneficiary) => (
                <Card key={beneficiary.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between">
                      <span>{beneficiary.name}</span>
                      <span className="flex items-center text-sm font-normal">
                        {beneficiary.status === 'active' ? (
                          <span className="flex items-center text-green-600">
                            <Check size={16} className="mr-1" />
                            Active
                          </span>
                        ) : beneficiary.status === 'invited' ? (
                          <span className="flex items-center text-amber-600">
                            <AlertTriangle size={16} className="mr-1" />
                            Invited
                          </span>
                        ) : (
                          <span className="flex items-center text-gray-600">
                            Pending
                          </span>
                        )}
                      </span>
                    </CardTitle>
                    <CardDescription>{beneficiary.relationship}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-500" />
                        <span>{beneficiary.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-500" />
                        <span>{beneficiary.phone}</span>
                      </div>
                      <div className="mt-2 p-2 bg-gray-50 rounded-md">
                        <div className="font-medium">Inheritance: {beneficiary.percentage}%</div>
                        <div className="text-gray-600 mt-1">{beneficiary.inheritance}</div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openViewDialog(beneficiary)}
                      >
                        <Eye size={16} className="mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openEditDialog(beneficiary)}
                      >
                        <Edit size={16} className="mr-1" />
                        Edit
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      {!beneficiary.notified && (
                        <Button 
                          size="sm"
                          onClick={() => handleNotify(beneficiary)}
                        >
                          Notify
                        </Button>
                      )}
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => openRemoveDialog(beneficiary)}
                      >
                        <Trash2 size={16} className="mr-1" />
                        Remove
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {beneficiaries.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <User className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No beneficiaries added yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add people who will inherit your assets.
                </p>
                <div className="mt-6">
                  <Button onClick={() => setShowAddBeneficiaryDialog(true)}>
                    <Plus size={16} className="mr-2" />
                    Add Beneficiary
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* View Person Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentPerson?.name}</DialogTitle>
              <DialogDescription>
                {currentPerson?.relationship} • {activeTab === 'executors' ? 'Executor' : 'Beneficiary'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-500">Email</span>
                <span className="font-medium">{currentPerson?.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-500">Phone</span>
                <span className="font-medium">{currentPerson?.phone}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-500">Status</span>
                <span className={`font-medium ${
                  currentPerson?.status === 'active' ? 'text-green-600' : 
                  currentPerson?.status === 'invited' ? 'text-amber-600' : 'text-gray-600'
                }`}>
                  {currentPerson?.status}
                </span>
              </div>
              
              {activeTab === 'beneficiaries' && currentPerson?.percentage && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-500">Percentage of Estate</span>
                  <span className="font-medium">{currentPerson.percentage}%</span>
                </div>
              )}
              
              {activeTab === 'beneficiaries' && currentPerson?.inheritance && (
                <div className="py-2 border-b">
                  <div className="text-gray-500 mb-1">Inheritance Details</div>
                  <div className="font-medium">{currentPerson.inheritance}</div>
                </div>
              )}
              
              {activeTab === 'executors' && currentPerson?.notes && (
                <div className="py-2 border-b">
                  <div className="text-gray-500 mb-1">Notes</div>
                  <div className="font-medium">{currentPerson.notes}</div>
                </div>
              )}
              
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500">Notified</span>
                <span className="font-medium">
                  {currentPerson?.notified ? (
                    <span className="flex items-center text-green-600">
                      <Check size={16} className="mr-1" />
                      Yes
                    </span>
                  ) : (
                    <span className="text-gray-600">No</span>
                  )}
                </span>
              </div>
            </div>
            
            <DialogFooter>
              <div className="flex justify-between w-full">
                <Button 
                  variant="outline" 
                  onClick={() => openEditDialog(currentPerson as Person)}
                >
                  <Edit size={16} className="mr-1" />
                  Edit
                </Button>
                <Button onClick={() => setShowViewDialog(false)}>Close</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Edit Person Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit {activeTab === 'executors' ? 'Executor' : 'Beneficiary'}</DialogTitle>
              <DialogDescription>
                Make changes to {currentPerson?.name}'s information.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input 
                  id="edit-name" 
                  name="name" 
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input 
                  id="edit-email" 
                  name="email" 
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input 
                  id="edit-phone" 
                  name="phone" 
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-relationship">Relationship</Label>
                <Select 
                  onValueChange={(value) => handleSelectChange('relationship', value)}
                  defaultValue={formData.relationship}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    {activeTab === 'executors' ? (
                      <SelectItem value="attorney">Attorney</SelectItem>
                    ) : (
                      <SelectItem value="charity">Charity</SelectItem>
                    )}
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {activeTab === 'beneficiaries' && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-percentage">Percentage of Estate (%)</Label>
                    <Input 
                      id="edit-percentage" 
                      name="percentage" 
                      type="number"
                      value={formData.percentage}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-inheritance">Inheritance Details</Label>
                    <Textarea 
                      id="edit-inheritance" 
                      name="inheritance" 
                      value={formData.inheritance}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}
              
              {activeTab === 'executors' && (
                <div className="grid gap-2">
                  <Label htmlFor="edit-notes">Notes</Label>
                  <Textarea 
                    id="edit-notes" 
                    name="notes" 
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Switch
                  id="edit-notified"
                  checked={formData.notified}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="edit-notified">
                  {formData.notified ? 'Has been notified' : 'Notify this person'}
                </Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowEditDialog(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button onClick={handleEditPerson}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Remove Person Dialog */}
        <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove {activeTab === 'executors' ? 'Executor' : 'Beneficiary'}</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove {currentPerson?.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowRemoveDialog(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRemovePerson}>
                Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
