
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserPlus, 
  User, 
  Mail, 
  Phone, 
  Edit, 
  Trash2, 
  Heart, 
  ShieldCheck,
  Search,
  Filter,
  Check,
  X,
  Eye,
  Loader2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Executor, 
  Beneficiary,
  getExecutors, 
  getBeneficiaries, 
  createExecutor, 
  createBeneficiary,
  updateExecutor,
  updateBeneficiary,
  deleteExecutor,
  deleteBeneficiary,
  sendVerificationRequest 
} from '@/services/executorService';

export default function Executors() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("executors");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [currentPerson, setCurrentPerson] = useState<Executor | Beneficiary | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [executors, setExecutors] = useState<Executor[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);

  const [formData, setFormData] = useState<Partial<Executor | Beneficiary>>({
    name: '',
    email: '',
    phone: '',
    relationship: '',
    address: '',
    notes: '',
    percentage: 0
  });

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [executorsData, beneficiariesData] = await Promise.all([
          getExecutors(),
          getBeneficiaries()
        ]);
        
        setExecutors(executorsData);
        setBeneficiaries(beneficiariesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error loading data",
          description: "Could not load your executors and beneficiaries. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  // Filtered lists based on search
  const filteredExecutors = executors.filter(
    exec => exec.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            exec.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            exec.relationship.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBeneficiaries = beneficiaries.filter(
    benef => benef.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             benef.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
             benef.relationship.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'percentage' ? parseFloat(value) : value
    }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle person add
  const handleAddPerson = async () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Missing information",
        description: "Please provide at least a name and email.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      if (activeTab === "executors") {
        const newExecutor = await createExecutor(formData as Omit<Executor, 'id' | 'created_at' | 'isVerified'>);
        if (newExecutor) {
          setExecutors(prev => [newExecutor, ...prev]);
          toast({
            title: "Executor Added",
            description: `${newExecutor.name} has been added as an executor.`
          });
        }
      } else {
        const newBeneficiary = await createBeneficiary(formData as Omit<Beneficiary, 'id' | 'created_at' | 'isVerified'>);
        if (newBeneficiary) {
          setBeneficiaries(prev => [newBeneficiary, ...prev]);
          toast({
            title: "Beneficiary Added",
            description: `${newBeneficiary.name} has been added as a beneficiary.`
          });
        }
      }
      
      setShowAddDialog(false);
      resetForm();
    } catch (error) {
      console.error("Error adding person:", error);
      toast({
        title: "Failed to add",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle person edit
  const handleEditPerson = async () => {
    if (!currentPerson) return;
    
    setIsSaving(true);
    
    try {
      if (activeTab === "executors") {
        const updatedExecutor = await updateExecutor(currentPerson.id, formData as Partial<Executor>);
        if (updatedExecutor) {
          setExecutors(prev => prev.map(exec => 
            exec.id === currentPerson.id ? updatedExecutor : exec
          ));
          toast({
            title: "Executor Updated",
            description: `${updatedExecutor.name}'s information has been updated.`
          });
        }
      } else {
        const updatedBeneficiary = await updateBeneficiary(currentPerson.id, formData as Partial<Beneficiary>);
        if (updatedBeneficiary) {
          setBeneficiaries(prev => prev.map(benef => 
            benef.id === currentPerson.id ? updatedBeneficiary : benef
          ));
          toast({
            title: "Beneficiary Updated",
            description: `${updatedBeneficiary.name}'s information has been updated.`
          });
        }
      }
      
      setShowEditDialog(false);
      resetForm();
    } catch (error) {
      console.error("Error updating person:", error);
      toast({
        title: "Failed to update",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle person remove
  const handleRemovePerson = async () => {
    if (!currentPerson) return;
    
    setIsSaving(true);
    
    try {
      let success = false;
      
      if (activeTab === "executors") {
        success = await deleteExecutor(currentPerson.id);
        if (success) {
          setExecutors(prev => prev.filter(exec => exec.id !== currentPerson.id));
          toast({
            title: "Executor Removed",
            description: `${currentPerson.name} has been removed from your executors.`
          });
        }
      } else {
        success = await deleteBeneficiary(currentPerson.id);
        if (success) {
          setBeneficiaries(prev => prev.filter(benef => benef.id !== currentPerson.id));
          toast({
            title: "Beneficiary Removed",
            description: `${currentPerson.name} has been removed from your beneficiaries.`
          });
        }
      }
      
      if (!success) {
        throw new Error("Failed to delete");
      }
      
      setShowRemoveDialog(false);
      setCurrentPerson(null);
    } catch (error) {
      console.error("Error removing person:", error);
      toast({
        title: "Failed to remove",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      relationship: '',
      address: '',
      notes: '',
      percentage: 0
    });
    setCurrentPerson(null);
  };

  // Open edit dialog
  const openEditDialog = (person: Executor | Beneficiary) => {
    setCurrentPerson(person);
    setFormData({
      name: person.name,
      email: person.email,
      phone: person.phone,
      relationship: person.relationship,
      address: person.address || '',
      notes: person.notes || '',
      percentage: 'percentage' in person ? person.percentage : undefined
    });
    setShowEditDialog(true);
  };

  // Open view dialog
  const openViewDialog = (person: Executor | Beneficiary) => {
    setCurrentPerson(person);
    setShowViewDialog(true);
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Send verification request
  const handleSendVerification = async (person: Executor | Beneficiary) => {
    try {
      const success = await sendVerificationRequest(
        person.email, 
        person.name, 
        activeTab === "executors" ? 'executor' : 'beneficiary'
      );
      
      if (success) {
        toast({
          title: "Verification Email Sent",
          description: `A verification request has been sent to ${person.email}.`
        });
      } else {
        throw new Error("Failed to send verification");
      }
    } catch (error) {
      console.error("Error sending verification:", error);
      toast({
        title: "Failed to send verification",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Toggle verification status
  const handleToggleVerification = async (person: Executor | Beneficiary, isVerified: boolean) => {
    try {
      let updatedPerson;
      
      if (activeTab === "executors") {
        updatedPerson = await updateExecutor(person.id, { isVerified });
      } else {
        updatedPerson = await updateBeneficiary(person.id, { isVerified });
      }
      
      if (updatedPerson) {
        if (activeTab === "executors") {
          setExecutors(prev => prev.map(exec => 
            exec.id === person.id ? { ...exec, isVerified } : exec
          ));
        } else {
          setBeneficiaries(prev => prev.map(benef => 
            benef.id === person.id ? { ...benef, isVerified } : benef
          ));
        }
        
        if (isVerified) {
          toast({
            title: "Verification Status Updated",
            description: `${person.name} is now marked as verified.`
          });
        } else {
          toast({
            title: "Verification Status Updated",
            description: `${person.name} is now marked as not verified.`
          });
        }
      }
    } catch (error) {
      console.error("Error updating verification status:", error);
      toast({
        title: "Failed to update verification",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Beneficiaries & Executors</h1>
              <p className="text-gray-600">Loading your data...</p>
            </div>
          </div>
          
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-10 w-10 text-willtank-600 animate-spin" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Beneficiaries & Executors</h1>
            <p className="text-gray-600">Manage the people who will execute your will and receive your assets.</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Button onClick={() => {
              resetForm();
              setShowAddDialog(true);
            }}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add {activeTab === "executors" ? "Executor" : "Beneficiary"}
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder={`Search ${activeTab}...`}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="md:w-auto">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
        
        <Tabs defaultValue="executors" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="executors">Executors</TabsTrigger>
            <TabsTrigger value="beneficiaries">Beneficiaries</TabsTrigger>
          </TabsList>
          
          <TabsContent value="executors">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExecutors.length > 0 ? (
                filteredExecutors.map(executor => (
                  <motion.div
                    key={executor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <Avatar className="h-12 w-12 mr-4">
                            <AvatarImage src={undefined} />
                            <AvatarFallback className="bg-willtank-100 text-willtank-700">{getInitials(executor.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg font-medium">{executor.name}</h3>
                            <p className="text-sm text-gray-500">{executor.relationship}</p>
                          </div>
                        </div>
                        {executor.isVerified && (
                          <div className="flex items-center text-green-600 text-sm">
                            <Check className="h-4 w-4 mr-1" />
                            <span>Verified</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">{executor.email}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">{executor.phone || 'No phone provided'}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-6">
                        {!executor.isVerified && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSendVerification(executor)}
                          >
                            Send Verification
                          </Button>
                        )}
                        {executor.isVerified && (
                          <div className="text-xs text-gray-500">
                            Verified on {new Date(executor.created_at).toLocaleDateString()}
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openViewDialog(executor)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openEditDialog(executor)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setCurrentPerson(executor);
                              setShowRemoveDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : searchQuery ? (
                <div className="col-span-3 text-center py-12">
                  <p className="text-gray-500">No executors match your search criteria.</p>
                </div>
              ) : null}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-gray-50 border border-dashed border-gray-300 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer flex flex-col items-center justify-center p-10"
                onClick={() => {
                  resetForm();
                  setShowAddDialog(true);
                }}
              >
                <UserPlus className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 font-medium">Add New Executor</p>
                <p className="text-sm text-gray-500 text-center mt-2">
                  Add someone you trust to carry out your final wishes
                </p>
              </motion.div>
            </div>
          </TabsContent>
          
          <TabsContent value="beneficiaries">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBeneficiaries.length > 0 ? (
                filteredBeneficiaries.map(beneficiary => (
                  <motion.div
                    key={beneficiary.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <Avatar className="h-12 w-12 mr-4">
                            <AvatarImage src={undefined} />
                            <AvatarFallback className="bg-willtank-100 text-willtank-700">{getInitials(beneficiary.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg font-medium">{beneficiary.name}</h3>
                            <p className="text-sm text-gray-500">{beneficiary.relationship}</p>
                          </div>
                        </div>
                        <div className="bg-willtank-100 text-willtank-700 px-3 py-1 rounded-full text-sm font-medium">
                          {beneficiary.percentage || 0}%
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">{beneficiary.email}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">{beneficiary.phone || 'No phone provided'}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-end items-center mt-6">
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openViewDialog(beneficiary)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openEditDialog(beneficiary)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setCurrentPerson(beneficiary);
                              setShowRemoveDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : searchQuery ? (
                <div className="col-span-3 text-center py-12">
                  <p className="text-gray-500">No beneficiaries match your search criteria.</p>
                </div>
              ) : null}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-gray-50 border border-dashed border-gray-300 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer flex flex-col items-center justify-center p-10"
                onClick={() => {
                  resetForm();
                  setShowAddDialog(true);
                }}
              >
                <Heart className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 font-medium">Add New Beneficiary</p>
                <p className="text-sm text-gray-500 text-center mt-2">
                  Add a person or organization to receive your assets
                </p>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Person Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add {activeTab === "executors" ? "Executor" : "Beneficiary"}</DialogTitle>
            <DialogDescription>
              {activeTab === "executors" 
                ? "Add someone you trust to oversee the execution of your will."
                : "Add someone who will receive assets from your estate."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="Enter full name" 
                  value={formData.name || ''}
                  onChange={handleFormChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship</Label>
                <Select 
                  onValueChange={(value) => handleSelectChange("relationship", value)}
                  value={formData.relationship || ''}
                >
                  <SelectTrigger id="relationship">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Spouse">Spouse</SelectItem>
                    <SelectItem value="Child">Child</SelectItem>
                    <SelectItem value="Parent">Parent</SelectItem>
                    <SelectItem value="Sibling">Sibling</SelectItem>
                    <SelectItem value="Friend">Friend</SelectItem>
                    <SelectItem value="Organization">Organization</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="Enter email address" 
                  value={formData.email || ''}
                  onChange={handleFormChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  placeholder="Enter phone number" 
                  value={formData.phone || ''}
                  onChange={handleFormChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                name="address" 
                placeholder="Enter physical address" 
                value={formData.address || ''}
                onChange={handleFormChange}
              />
            </div>
            
            {activeTab === "beneficiaries" && (
              <div className="space-y-2">
                <Label htmlFor="percentage">Percentage of Estate (%)</Label>
                <Input 
                  id="percentage" 
                  name="percentage" 
                  type="number" 
                  min="0" 
                  max="100" 
                  placeholder="Enter percentage" 
                  value={formData.percentage !== undefined ? formData.percentage : ''}
                  onChange={handleFormChange}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes" 
                name="notes" 
                placeholder="Enter any additional notes" 
                value={formData.notes || ''}
                onChange={handleFormChange}
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isSaving}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddPerson} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add {activeTab === "executors" ? "Executor" : "Beneficiary"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Person Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit {activeTab === "executors" ? "Executor" : "Beneficiary"}</DialogTitle>
            <DialogDescription>
              Update information for {currentPerson?.name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input 
                  id="edit-name" 
                  name="name" 
                  placeholder="Enter full name" 
                  value={formData.name || ''}
                  onChange={handleFormChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-relationship">Relationship</Label>
                <Select 
                  onValueChange={(value) => handleSelectChange("relationship", value)}
                  value={formData.relationship || ''}
                >
                  <SelectTrigger id="edit-relationship">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Spouse">Spouse</SelectItem>
                    <SelectItem value="Child">Child</SelectItem>
                    <SelectItem value="Parent">Parent</SelectItem>
                    <SelectItem value="Sibling">Sibling</SelectItem>
                    <SelectItem value="Friend">Friend</SelectItem>
                    <SelectItem value="Organization">Organization</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email Address</Label>
                <Input 
                  id="edit-email" 
                  name="email" 
                  type="email" 
                  placeholder="Enter email address" 
                  value={formData.email || ''}
                  onChange={handleFormChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input 
                  id="edit-phone" 
                  name="phone" 
                  placeholder="Enter phone number" 
                  value={formData.phone || ''}
                  onChange={handleFormChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input 
                id="edit-address" 
                name="address" 
                placeholder="Enter physical address" 
                value={formData.address || ''}
                onChange={handleFormChange}
              />
            </div>
            
            {activeTab === "beneficiaries" && (
              <div className="space-y-2">
                <Label htmlFor="edit-percentage">Percentage of Estate (%)</Label>
                <Input 
                  id="edit-percentage" 
                  name="percentage" 
                  type="number" 
                  min="0" 
                  max="100" 
                  placeholder="Enter percentage" 
                  value={formData.percentage !== undefined ? formData.percentage : ''}
                  onChange={handleFormChange}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Input 
                id="edit-notes" 
                name="notes" 
                placeholder="Enter any additional notes" 
                value={formData.notes || ''}
                onChange={handleFormChange}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="verification" className="flex-1">Verification Status</Label>
              <div className="flex items-center space-x-2">
                <Label htmlFor="verification" className={currentPerson?.isVerified ? "text-green-600" : "text-gray-500"}>
                  {currentPerson?.isVerified ? "Verified" : "Not Verified"}
                </Label>
                <Switch 
                  id="verification" 
                  checked={currentPerson?.isVerified || false}
                  onCheckedChange={(checked) => {
                    if (currentPerson) {
                      handleToggleVerification(currentPerson, checked);
                    }
                  }}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isSaving}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleEditPerson} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Person Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Remove {activeTab === "executors" ? "Executor" : "Beneficiary"}</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {currentPerson?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-between items-center py-4">
            <DialogClose asChild>
              <Button variant="outline" disabled={isSaving}>Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleRemovePerson} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Person Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentPerson?.name}</DialogTitle>
            <DialogDescription>
              {activeTab === "executors" ? "Executor" : "Beneficiary"} Details
            </DialogDescription>
          </DialogHeader>
          
          {currentPerson && (
            <div className="py-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Avatar className="h-16 w-16 mr-4">
                    <AvatarImage src={undefined} />
                    <AvatarFallback className="bg-willtank-100 text-willtank-700 text-lg">{getInitials(currentPerson.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-medium">{currentPerson.name}</h3>
                    <p className="text-gray-500">{currentPerson.relationship}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {currentPerson.isVerified ? (
                    <div className="flex items-center text-green-600">
                      <ShieldCheck className="h-5 w-5 mr-2" />
                      <span>Verified</span>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSendVerification(currentPerson)}
                    >
                      Send Verification
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email Address</p>
                  <p className="font-medium">{currentPerson.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                  <p className="font-medium">{currentPerson.phone || 'No phone provided'}</p>
                </div>
                {currentPerson.address && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 mb-1">Address</p>
                    <p className="font-medium">{currentPerson.address}</p>
                  </div>
                )}
                {'percentage' in currentPerson && currentPerson.percentage !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Percentage of Estate</p>
                    <p className="font-medium">{currentPerson.percentage}%</p>
                  </div>
                )}
                {currentPerson.notes && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 mb-1">Notes</p>
                    <p>{currentPerson.notes}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Added On</p>
                  <p className="font-medium">{new Date(currentPerson.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>Close</Button>
            <Button onClick={() => {
              setShowViewDialog(false);
              if (currentPerson) {
                openEditDialog(currentPerson);
              }
            }}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
