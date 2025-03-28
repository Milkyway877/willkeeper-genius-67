
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Download,
  Share2,
  Users,
  UserPlus,
  Edit,
  AlertTriangle,
  Clock,
  Printer,
  Save,
  Heart,
  ChevronLeft,
  Lock
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  Will,
  WillExecutor,
  WillBeneficiary,
  WillSignature,
  getWill,
  getWillExecutors,
  getWillBeneficiaries,
  getWillSignatures,
  generateWillPDF
} from '@/services/willsService';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function WillDetail() {
  const [will, setWill] = useState<Will | null>(null);
  const [executors, setExecutors] = useState<WillExecutor[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<WillBeneficiary[]>([]);
  const [signatures, setSignatures] = useState<WillSignature[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('document');
  const [willContent, setWillContent] = useState('');
  const [showAddExecutorDialog, setShowAddExecutorDialog] = useState(false);
  const [showAddBeneficiaryDialog, setShowAddBeneficiaryDialog] = useState(false);
  const [downloading, setDownloading] = useState(false);
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [newExecutor, setNewExecutor] = useState({
    name: '',
    email: ''
  });

  const [newBeneficiary, setNewBeneficiary] = useState({
    name: '',
    relationship: '',
    percentage: 0
  });

  useEffect(() => {
    const loadWillData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Load the will and related data in parallel
        const [willData, executorsData, beneficiariesData, signaturesData] = await Promise.all([
          getWill(id),
          getWillExecutors(id),
          getWillBeneficiaries(id),
          getWillSignatures(id)
        ]);
        
        if (!willData) {
          toast({
            title: "Will not found",
            description: "We couldn't find the requested will document.",
            variant: "destructive"
          });
          navigate('/wills');
          return;
        }
        
        setWill(willData);
        setExecutors(executorsData);
        setBeneficiaries(beneficiariesData);
        setSignatures(signaturesData);
        
        // Generate sample will content for demo purposes
        // In a real app, this would be fetched from the server
        const sampleWillContent = `
LAST WILL AND TESTAMENT OF ALEX MORGAN

I, Alex Morgan, residing at 123 Main Street, Anytown, USA, being of sound mind, declare this to be my Last Will and Testament.

ARTICLE I: REVOCATION
I revoke all previous wills and codicils.

ARTICLE II: FAMILY INFORMATION
I am married to Jamie Morgan. We have two children: Taylor Morgan and Riley Morgan.

ARTICLE III: EXECUTOR
I appoint Jamie Morgan as the Executor of this Will. If they are unable or unwilling to serve, I appoint my sibling, Casey Morgan, as alternate Executor.

ARTICLE IV: GUARDIAN
If my spouse does not survive me, I appoint my sibling, Casey Morgan, as guardian of my minor children.

ARTICLE V: DISPOSITION OF PROPERTY
I give all my property, real and personal, to my spouse, Jamie Morgan, if they survive me.
If my spouse does not survive me, I give all my property in equal shares to my children, Taylor Morgan and Riley Morgan.

ARTICLE VI: DIGITAL ASSETS
I authorize my Executor to access, modify, control, archive, transfer, and delete my digital assets.

ARTICLE VII: TAXES AND EXPENSES
I direct my Executor to pay all just debts, funeral expenses, and costs of administering my estate.

Signed: Alex Morgan
Date: ${format(new Date(), 'MMMM d, yyyy')}
Witnesses: [Witness 1], [Witness 2]
`;
        
        setWillContent(sampleWillContent);
      } catch (error) {
        console.error('Error loading will data:', error);
        toast({
          title: "Error loading will",
          description: "We couldn't load the will document. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadWillData();
  }, [id, navigate, toast]);

  const handleBackToWills = () => {
    navigate('/wills');
  };

  const handleEditWill = () => {
    if (id) {
      navigate(`/will/${id}/edit`);
    }
  };

  const handleAddExecutor = () => {
    setShowAddExecutorDialog(true);
  };

  const handleAddBeneficiary = () => {
    setShowAddBeneficiaryDialog(true);
  };

  const handleDownloadPDF = async () => {
    if (!will) return;
    
    try {
      setDownloading(true);
      const pdfUrl = await generateWillPDF(will.id, willContent);
      
      if (pdfUrl) {
        // In a real app, this would trigger a download of the PDF
        toast({
          title: "PDF Generated",
          description: "Your will document has been generated as a PDF."
        });
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Error generating PDF",
        description: "We couldn't generate the PDF. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleShareWill = () => {
    // In a real app, this would show sharing options
    toast({
      title: "Share options",
      description: "Sharing options would be shown here."
    });
  };

  const handlePrintWill = () => {
    // In a real app, this would trigger printing
    toast({
      title: "Print dialog",
      description: "Print dialog would be shown here."
    });
  };

  const submitNewExecutor = () => {
    // For this demo, just show a toast and close the dialog
    toast({
      title: "Executor added",
      description: `${newExecutor.name} has been added as an executor.`
    });
    
    // In a real app, this would call the API to add the executor
    const newExecutorObj: WillExecutor = {
      id: crypto.randomUUID(),
      name: newExecutor.name,
      email: newExecutor.email,
      status: 'pending',
      created_at: new Date().toISOString(),
      will_id: id
    };
    
    setExecutors([...executors, newExecutorObj]);
    setNewExecutor({ name: '', email: '' });
    setShowAddExecutorDialog(false);
  };

  const submitNewBeneficiary = () => {
    // For this demo, just show a toast and close the dialog
    toast({
      title: "Beneficiary added",
      description: `${newBeneficiary.name} has been added as a beneficiary.`
    });
    
    // In a real app, this would call the API to add the beneficiary
    const newBeneficiaryObj: WillBeneficiary = {
      id: crypto.randomUUID(),
      name: newBeneficiary.name,
      relationship: newBeneficiary.relationship,
      percentage: newBeneficiary.percentage,
      created_at: new Date().toISOString(),
      will_id: id
    };
    
    setBeneficiaries([...beneficiaries, newBeneficiaryObj]);
    setNewBeneficiary({ name: '', relationship: '', percentage: 0 });
    setShowAddBeneficiaryDialog(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-6xl mx-auto py-6">
          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Skeleton className="h-[600px] w-full rounded-xl" />
            </div>
            
            <div className="space-y-6">
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!will) {
    return (
      <Layout>
        <div className="container max-w-6xl mx-auto py-6 text-center">
          <div className="mb-6">
            <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Will Not Found</h1>
            <p className="text-gray-600 mb-6">
              We couldn't find the requested will document.
            </p>
            <Button onClick={handleBackToWills}>
              <ChevronLeft size={16} className="mr-2" />
              Back to My Wills
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto py-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center mb-2">
              <button 
                onClick={handleBackToWills}
                className="flex items-center text-willtank-600 hover:text-willtank-700 text-sm mr-4"
              >
                <ChevronLeft size={16} className="mr-1" />
                Back to Wills
              </button>
              
              <h1 className="text-2xl font-bold flex items-center">
                <FileText className="mr-2 h-6 w-6 text-willtank-600" />
                {will.title}
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant={will.status.toLowerCase() === 'active' ? 'default' : 'outline'}>
                {will.status}
              </Badge>
              
              {will.ai_generated && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  AI Generated
                </Badge>
              )}
              
              <span className="text-sm text-gray-500 flex items-center">
                <Clock size={14} className="mr-1" />
                Last updated {format(new Date(will.updated_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrintWill}>
              <Printer size={16} className="mr-2" />
              Print
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleShareWill}>
              <Share2 size={16} className="mr-2" />
              Share
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadPDF}
              disabled={downloading}
            >
              {downloading ? (
                <>
                  <Skeleton className="h-4 w-4 rounded-full mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Download size={16} className="mr-2" />
                  Download PDF
                </>
              )}
            </Button>
            
            <Button onClick={handleEditWill}>
              <Edit size={16} className="mr-2" />
              Edit Will
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Tabs 
              defaultValue="document" 
              className="w-full"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="mb-4">
                <TabsTrigger value="document">Will Document</TabsTrigger>
                <TabsTrigger value="executors">Executors</TabsTrigger>
                <TabsTrigger value="beneficiaries">Beneficiaries</TabsTrigger>
                <TabsTrigger value="signatures">Signatures</TabsTrigger>
              </TabsList>
              
              <TabsContent value="document">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center">
                      <FileText className="text-willtank-700 mr-2" size={18} />
                      <h3 className="font-medium">Will Document</h3>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <Clock size={14} className="mr-1" />
                      Created on {format(new Date(will.created_at), 'MMMM d, yyyy')}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {willContent}
                      </pre>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="executors">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center">
                      <Users className="text-willtank-700 mr-2" size={18} />
                      <h3 className="font-medium">Will Executors</h3>
                    </div>
                    <Button size="sm" variant="outline" onClick={handleAddExecutor}>
                      <UserPlus size={14} className="mr-1" />
                      Add Executor
                    </Button>
                  </div>
                  
                  <div className="p-6">
                    {executors.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                          <Users className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No Executors Added</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                          Executors are responsible for carrying out the provisions of your will. Add at least one executor.
                        </p>
                        <Button onClick={handleAddExecutor}>
                          <UserPlus size={16} className="mr-2" />
                          Add Executor
                        </Button>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Added On</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {executors.map((executor) => (
                            <TableRow key={executor.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center">
                                  <Avatar className="h-8 w-8 mr-2">
                                    <AvatarFallback className="bg-willtank-100 text-willtank-700">
                                      {executor.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  {executor.name}
                                </div>
                              </TableCell>
                              <TableCell>{executor.email}</TableCell>
                              <TableCell>
                                <Badge variant={executor.status === 'confirmed' ? 'default' : 'outline'}>
                                  {executor.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-500">
                                {format(new Date(executor.created_at), 'MMM d, yyyy')}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="beneficiaries">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center">
                      <Heart className="text-willtank-700 mr-2" size={18} />
                      <h3 className="font-medium">Will Beneficiaries</h3>
                    </div>
                    <Button size="sm" variant="outline" onClick={handleAddBeneficiary}>
                      <UserPlus size={14} className="mr-1" />
                      Add Beneficiary
                    </Button>
                  </div>
                  
                  <div className="p-6">
                    {beneficiaries.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                          <Heart className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No Beneficiaries Added</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                          Beneficiaries are individuals or organizations who will receive portions of your estate. Add beneficiaries to specify how your assets should be distributed.
                        </p>
                        <Button onClick={handleAddBeneficiary}>
                          <UserPlus size={16} className="mr-2" />
                          Add Beneficiary
                        </Button>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Relationship</TableHead>
                            <TableHead>Percentage</TableHead>
                            <TableHead>Added On</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {beneficiaries.map((beneficiary) => (
                            <TableRow key={beneficiary.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center">
                                  <Avatar className="h-8 w-8 mr-2">
                                    <AvatarFallback className="bg-willtank-100 text-willtank-700">
                                      {beneficiary.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  {beneficiary.name}
                                </div>
                              </TableCell>
                              <TableCell>{beneficiary.relationship}</TableCell>
                              <TableCell>{beneficiary.percentage ? `${beneficiary.percentage}%` : 'N/A'}</TableCell>
                              <TableCell className="text-gray-500">
                                {format(new Date(beneficiary.created_at), 'MMM d, yyyy')}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="signatures">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center">
                      <FileText className="text-willtank-700 mr-2" size={18} />
                      <h3 className="font-medium">Signatures</h3>
                    </div>
                    <Button size="sm" variant="outline">
                      <UserPlus size={14} className="mr-1" />
                      Add Signature
                    </Button>
                  </div>
                  
                  <div className="p-6">
                    {signatures.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                          <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No Signatures Added</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                          For a will to be legally binding, it typically requires signatures from the testator and witnesses. Add signatures when your will is finalized.
                        </p>
                        <Button variant="outline">
                          <UserPlus size={16} className="mr-2" />
                          Add Signature
                        </Button>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Signed On</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {signatures.map((signature) => (
                            <TableRow key={signature.id}>
                              <TableCell className="font-medium">
                                {signature.signer_name}
                              </TableCell>
                              <TableCell>{signature.signer_role || 'Witness'}</TableCell>
                              <TableCell className="text-gray-500">
                                {format(new Date(signature.signed_at), 'MMMM d, yyyy')}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-medium mb-4">Will Information</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <div className="flex items-center">
                    <div className={`h-2.5 w-2.5 rounded-full ${
                      will.status.toLowerCase() === 'active' ? 'bg-green-500' :
                      will.status.toLowerCase() === 'draft' ? 'bg-amber-500' :
                      will.status.toLowerCase() === 'signed' ? 'bg-blue-500' :
                      'bg-gray-500'
                    } mr-2`}></div>
                    <p className={`font-medium ${
                      will.status.toLowerCase() === 'active' ? 'text-green-700' :
                      will.status.toLowerCase() === 'draft' ? 'text-amber-700' :
                      will.status.toLowerCase() === 'signed' ? 'text-blue-700' :
                      'text-gray-700'
                    }`}>
                      {will.status}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Created On</p>
                  <p className="font-medium">{format(new Date(will.created_at), 'MMMM d, yyyy')}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Last Modified</p>
                  <p className="font-medium">{format(new Date(will.updated_at), 'MMMM d, yyyy')}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Template Type</p>
                  <p className="font-medium">{will.template_type || 'Standard'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Security</p>
                  <div className="flex items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-500 mr-2"></div>
                    <p className="font-medium text-blue-700 flex items-center">
                      <Lock size={12} className="mr-1" />
                      AES-256 Encrypted
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-willtank-50 rounded-xl border border-willtank-100 p-6"
            >
              <h3 className="text-lg font-medium mb-4">Legal Requirements</h3>
              
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg border border-willtank-100 text-sm">
                  <p className="text-willtank-800 font-medium mb-1 flex items-center">
                    <AlertTriangle size={14} className="mr-1 text-amber-500" />
                    Witnesses Required
                  </p>
                  <p className="text-gray-600">Two witnesses must sign your will for it to be legally valid.</p>
                </div>
                
                <div className="bg-white p-3 rounded-lg border border-willtank-100 text-sm">
                  <p className="text-willtank-800 font-medium mb-1 flex items-center">
                    <AlertTriangle size={14} className="mr-1 text-amber-500" />
                    Notarization Recommended
                  </p>
                  <p className="text-gray-600">While not required in all states, notarization adds an extra layer of authenticity.</p>
                </div>
                
                <div className="bg-white p-3 rounded-lg border border-willtank-100 text-sm">
                  <p className="text-willtank-800 font-medium mb-1 flex items-center">
                    <AlertTriangle size={14} className="mr-1 text-amber-500" />
                    Digital Signatures
                  </p>
                  <p className="text-gray-600">Some jurisdictions may not recognize digital signatures for wills.</p>
                </div>
              </div>
              
              <Button className="w-full mt-4" variant="outline">
                View Full Legal Requirements
              </Button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-medium mb-4">Actions</h3>
              
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Share2 size={16} className="mr-2" />
                  Share with Attorney
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <Save size={16} className="mr-2" />
                  Create Version History
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <Download size={16} className="mr-2" />
                  Export to PDF
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Add Executor Dialog */}
      <Dialog open={showAddExecutorDialog} onOpenChange={setShowAddExecutorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Executor</DialogTitle>
            <DialogDescription>
              Add a new executor to your will. Executors are responsible for carrying out the provisions in your will.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="executor-name">Full Name</Label>
              <Input 
                id="executor-name" 
                value={newExecutor.name}
                onChange={(e) => setNewExecutor({...newExecutor, name: e.target.value})}
                placeholder="John Smith"
              />
            </div>
            
            <div>
              <Label htmlFor="executor-email">Email Address</Label>
              <Input 
                id="executor-email"
                type="email"
                value={newExecutor.email}
                onChange={(e) => setNewExecutor({...newExecutor, email: e.target.value})}
                placeholder="john.smith@example.com"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAddExecutorDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitNewExecutor}
              disabled={!newExecutor.name || !newExecutor.email}
            >
              Add Executor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Beneficiary Dialog */}
      <Dialog open={showAddBeneficiaryDialog} onOpenChange={setShowAddBeneficiaryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Beneficiary</DialogTitle>
            <DialogDescription>
              Add a new beneficiary to your will. Beneficiaries are individuals or organizations who will receive portions of your estate.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="beneficiary-name">Full Name</Label>
              <Input 
                id="beneficiary-name" 
                value={newBeneficiary.name}
                onChange={(e) => setNewBeneficiary({...newBeneficiary, name: e.target.value})}
                placeholder="Jane Smith"
              />
            </div>
            
            <div>
              <Label htmlFor="beneficiary-relationship">Relationship</Label>
              <Input 
                id="beneficiary-relationship"
                value={newBeneficiary.relationship}
                onChange={(e) => setNewBeneficiary({...newBeneficiary, relationship: e.target.value})}
                placeholder="Spouse, Child, Friend, etc."
              />
            </div>
            
            <div>
              <Label htmlFor="beneficiary-percentage">Percentage of Estate (%)</Label>
              <Input 
                id="beneficiary-percentage"
                type="number"
                value={newBeneficiary.percentage.toString()}
                onChange={(e) => setNewBeneficiary({...newBeneficiary, percentage: parseInt(e.target.value) || 0})}
                placeholder="50"
                min="0"
                max="100"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAddBeneficiaryDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitNewBeneficiary}
              disabled={!newBeneficiary.name || !newBeneficiary.relationship}
            >
              Add Beneficiary
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
