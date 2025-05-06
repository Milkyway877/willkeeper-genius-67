import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, CheckCircle, AlertTriangle, Pencil, Signature } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { generateWillDocument } from '@/utils/willTemplateUtils';
import { useDebounce } from '@/hooks/use-debounce';
import { createWill, updateWill } from '@/services/willService';
import { saveWillProgress } from '@/services/willProgressService';
import { useNavigate } from 'react-router-dom';
import { useCompletion } from 'ai/react';
import { SignaturePad } from './SignaturePad';

interface DocumentWillEditorProps {
  templateId: string;
  initialData?: any;
  willId?: string;
  onSave?: (data: any) => void;
}

export function DocumentWillEditor({ templateId, initialData = {}, willId: initialWillId, onSave }: DocumentWillEditorProps) {
  const [personalInfo, setPersonalInfo] = useState({
    fullName: initialData?.personalInfo?.fullName || '',
    address: initialData?.personalInfo?.address || '',
    dateOfBirth: initialData?.personalInfo?.dateOfBirth || '',
    email: initialData?.personalInfo?.email || '',
    phone: initialData?.personalInfo?.phone || '',
  });
  const [executors, setExecutors] = useState(initialData?.executors || []);
  const [beneficiaries, setBeneficiaries] = useState(initialData?.beneficiaries || []);
  const [assets, setAssets] = useState(initialData?.assets || []);
  const [finalWishes, setFinalWishes] = useState({
    funeralPreferences: initialData?.finalWishes?.funeralPreferences || '',
    memorialService: initialData?.finalWishes?.memorialService || '',
    obituary: initialData?.finalWishes?.obituary || '',
    charitableDonations: initialData?.finalWishes?.charitableDonations || '',
    specialInstructions: initialData?.finalWishes?.specialInstructions || '',
  });
  const [signature, setSignature] = useState<string | null>(initialData?.signature || null);
  const [isSectionComplete, setIsSectionComplete] = useState({
    personalInfo: !!initialData?.personalInfo,
    executors: !!initialData?.executors,
    beneficiaries: !!initialData?.beneficiaries,
    assets: !!initialData?.assets,
    finalWishes: !!initialData?.finalWishes,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isContentDirty, setIsContentDirty] = useState(false);
  const [willId, setWillId] = useState(initialWillId || null);
  const [isValid, setIsValid] = useState(false);
  const [isFinalizingModalOpen, setIsFinalizingModalOpen] = useState(false);
  const [isRequiredFieldsErrorOpen, setIsRequiredFieldsErrorOpen] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // AI Autocomplete
  const { complete, completion } = useCompletion({
    api: "/api/completion",
  });
  
  // Debounce state updates for saving progress
  const debouncedPersonalInfo = useDebounce(personalInfo, 500);
  const debouncedExecutors = useDebounce(executors, 500);
  const debouncedBeneficiaries = useDebounce(beneficiaries, 500);
  const debouncedAssets = useDebounce(assets, 500);
  const debouncedFinalWishes = useDebounce(finalWishes, 500);
  
  // Effect to save progress when debounced state changes
  useEffect(() => {
    if (willId) {
      handleSaveProgress({
        personalInfo: debouncedPersonalInfo,
        executors: debouncedExecutors,
        beneficiaries: debouncedBeneficiaries,
        assets: debouncedAssets,
        finalWishes: debouncedFinalWishes,
        signature: signature
      });
    }
  }, [debouncedPersonalInfo, debouncedExecutors, debouncedBeneficiaries, debouncedAssets, debouncedFinalWishes, signature, willId]);
  
  // Function to generate the will document
  const generateWillDocument = (data: any): string => {
    let document = `
      LAST WILL AND TESTAMENT
      
      I, ${data.personalInfo?.fullName || '[Full Name]'}, residing at ${data.personalInfo?.address || '[Address]'}, being of sound mind, do hereby declare this to be my Last Will and Testament.
      
      ARTICLE I: DECLARATIONS
      I declare that I am of legal age to make this will and that I am under no duress or undue influence.
      
      ARTICLE II: EXECUTOR
      I appoint ${data.executors?.[0]?.name || '[Executor Name]'} as the Executor of this Will. If they are unable or unwilling to serve, I appoint ${data.executors?.[1]?.name || '[Alternate Executor Name]'} as alternate Executor.
      
      ARTICLE III: BENEFICIARIES
      I give, devise, and bequeath all of my property, both real and personal, to the following beneficiaries:
      ${data.beneficiaries?.map((beneficiary: any) => `- ${beneficiary.name || '[Beneficiary Name]'}: ${beneficiary.percentage || '[Percentage]'}%`).join('\n') || '[Beneficiary Details]'}
      
      ARTICLE IV: ASSETS
      My assets include:
      ${data.assets?.map((asset: any) => `- ${asset.description || '[Asset Description]'}`).join('\n') || '[Asset Details]'}
      
      ARTICLE V: FINAL WISHES
      ${data.finalWishes?.funeralPreferences ? `My funeral preferences are: ${data.finalWishes.funeralPreferences}` : ''}
      ${data.finalWishes?.memorialService ? `I would like a memorial service with: ${data.finalWishes.memorialService}` : ''}
      ${data.finalWishes?.obituary ? `My obituary should include: ${data.finalWishes.obituary}` : ''}
      ${data.finalWishes?.charitableDonations ? `I would like to make the following charitable donations: ${data.finalWishes.charitableDonations}` : ''}
      ${data.finalWishes?.specialInstructions ? `Special instructions: ${data.finalWishes.specialInstructions}` : ''}
      
      Signed: ${data.personalInfo?.fullName || '[Full Name]'}
      Date: ${new Date().toLocaleDateString()}
    `;
    
    if (signature) {
      document += `\n\nDigitally Signed: ${signature}`;
    }
    
    return document;
  };
  
  // Function to handle saving progress
  const handleSaveProgress = async (values: any, isDraft: boolean = true) => {
    try {
      setIsSaving(true);
      
      // Generate content based on current values
      const newContent = generateWillDocument(values);
      
      // Save progress to will_progress table
      if (willId) {
        await saveWillProgress({
          template_id: templateId,
          will_id: willId,
          responses: values,
          content: newContent
        });
      }
      
      // Update existing will if we have a will_id
      if (willId) {
        await updateWill(willId, {
          content: newContent,
          title: `${values.personalInfo?.fullName || 'My'}'s Will`,
        });
      }
      
      toast({
        title: "Progress Saved",
        description: "Your will progress has been saved"
      });
      
      setIsContentDirty(false);
      
    } catch (error) {
      console.error('Error saving progress:', error);
      
      toast({
        title: "Error Saving Progress",
        description: "There was an error saving your progress. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async (values: any) => {
    try {
      setIsSaving(true);
      setIsFinalizingModalOpen(false);
      
      // Generate content based on current values
      const newContent = generateWillDocument(values);
      
      // Save as a new will if we don't have a will_id
      if (!willId) {
        // Create a new will
        const newWill = {
          title: `${values.personalInfo?.fullName || 'My'}'s Will`,
          content: newContent,
          status: 'draft' as 'active' | 'draft' | 'completed',
          template_type: templateId,
          document_url: '',
        };
        
        const savedWill = await createWill(newWill);
        
        if (savedWill) {
          // Save progress with the new will_id
          await saveWillProgress({
            template_id: templateId,
            will_id: savedWill.id,
            responses: values,
            content: newContent
          });
          
          setWillId(savedWill.id);
          
          // Navigate to the will page
          navigate(`/will/${savedWill.id}`);
        }
      } else {
        // Update existing will
        await updateWill(willId, {
          content: newContent,
          title: `${values.personalInfo?.fullName || 'My'}'s Will`,
          status: 'draft' as 'active' | 'draft' | 'completed'
        });
        
        toast({
          title: "Draft Saved",
          description: "Your will draft has been saved. You can continue editing later."
        });
      }
      
      setIsContentDirty(false);
      
    } catch (error) {
      console.error('Error saving draft:', error);
      
      toast({
        title: "Error Saving Draft",
        description: "There was an error saving your draft. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalize = async (values: any) => {
    try {
      setIsFinalizing(true);
      setIsFinalizingModalOpen(false);
      
      // Check if required sections are completed
      if (!isValid) {
        setIsRequiredFieldsErrorOpen(true);
        setIsFinalizingModalOpen(false);
        return;
      }
      
      if (!signature) {
        toast({
          title: "Signature Required",
          description: "Please sign your will to finalize it",
          variant: "destructive"
        });
        return;
      }
      
      // Generate the final will document
      const finalContent = generateWillDocument(values);
      
      // If we already have a will, update it
      if (willId) {
        await updateWill(willId, {
          content: finalContent,
          status: 'active' as 'active' | 'draft' | 'completed',
          title: `${values.personalInfo?.fullName || 'My'}'s Will`,
        });
        
        toast({
          title: "Will Finalized",
          description: "Your will has been successfully finalized and saved"
        });
        
        navigate(`/will/${willId}`);
      } else {
        // Create a new finalized will
        const newWill = {
          title: `${values.personalInfo?.fullName || 'My'}'s Will`,
          content: finalContent,
          status: 'active' as 'active' | 'draft' | 'completed',
          template_type: templateId,
          document_url: '',
        };
        
        const savedWill = await createWill(newWill);
        
        if (savedWill) {
          toast({
            title: "Will Finalized",
            description: "Your will has been successfully created and finalized"
          });
          
          navigate(`/will/${savedWill.id}`);
        }
      }
      
    } catch (error) {
      console.error('Error finalizing will:', error);
      
      toast({
        title: "Error Finalizing Will",
        description: "There was an error finalizing your will. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsFinalizing(false);
    }
  };
  
  // Validate the form
  useEffect(() => {
    setIsValid(
      isSectionComplete.personalInfo &&
      isSectionComplete.executors &&
      isSectionComplete.beneficiaries &&
      isSectionComplete.assets &&
      isSectionComplete.finalWishes
    );
  }, [isSectionComplete]);
  
  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({ ...prev, [name]: value }));
    setIsContentDirty(true);
  };
  
  const handleExecutorChange = (index: number, field: string, value: string) => {
    const newExecutors = [...executors];
    newExecutors[index][field] = value;
    setExecutors(newExecutors);
    setIsContentDirty(true);
  };
  
  const handleAddExecutor = () => {
    setExecutors([...executors, { name: '', relationship: '', email: '', phone: '', address: '' }]);
    setIsContentDirty(true);
  };
  
  const handleRemoveExecutor = (index: number) => {
    const newExecutors = [...executors];
    newExecutors.splice(index, 1);
    setExecutors(newExecutors);
    setIsContentDirty(true);
  };
  
  const handleBeneficiaryChange = (index: number, field: string, value: string) => {
    const newBeneficiaries = [...beneficiaries];
    newBeneficiaries[index][field] = value;
    setBeneficiaries(newBeneficiaries);
    setIsContentDirty(true);
  };
  
  const handleAddBeneficiary = () => {
    setBeneficiaries([...beneficiaries, { name: '', relationship: '', email: '', phone: '', address: '', percentage: '' }]);
    setIsContentDirty(true);
  };
  
  const handleRemoveBeneficiary = (index: number) => {
    const newBeneficiaries = [...beneficiaries];
    newBeneficiaries.splice(index, 1);
    setBeneficiaries(newBeneficiaries);
    setIsContentDirty(true);
  };
  
  const handleAssetChange = (index: number, field: string, value: string) => {
    const newAssets = [...assets];
    newAssets[index][field] = value;
    setAssets(newAssets);
    setIsContentDirty(true);
  };
  
  const handleAddAsset = () => {
    setAssets([...assets, { description: '' }]);
    setIsContentDirty(true);
  };
  
  const handleRemoveAsset = (index: number) => {
    const newAssets = [...assets];
    newAssets.splice(index, 1);
    setAssets(newAssets);
    setIsContentDirty(true);
  };
  
  const handleFinalWishesChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFinalWishes(prev => ({ ...prev, [name]: value }));
    setIsContentDirty(true);
  };
  
  const handleSectionComplete = (section: string, complete: boolean) => {
    setIsSectionComplete(prev => ({ ...prev, [section]: complete }));
  };
  
  const handleSign = (signedData: string | null) => {
    setSignature(signedData);
    setIsContentDirty(true);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Enter your personal details.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input type="text" id="fullName" name="fullName" value={personalInfo.fullName} onChange={handlePersonalInfoChange} />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input type="text" id="address" name="address" value={personalInfo.address} onChange={handlePersonalInfoChange} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input type="date" id="dateOfBirth" name="dateOfBirth" value={personalInfo.dateOfBirth} onChange={handlePersonalInfoChange} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input type="email" id="email" name="email" value={personalInfo.email} onChange={handlePersonalInfoChange} />
            </div>
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input type="tel" id="phone" name="phone" value={personalInfo.phone} onChange={handlePersonalInfoChange} />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="personal-info-complete" checked={isSectionComplete.personalInfo} onCheckedChange={(checked) => handleSectionComplete('personalInfo', checked)} />
            <Label htmlFor="personal-info-complete">Section Complete</Label>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Executors</CardTitle>
          <CardDescription>Appoint executors to manage your will.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {executors.map((executor: any, index: number) => (
            <div key={index} className="space-y-2 border rounded-md p-4">
              <h4 className="text-sm font-medium">Executor {index + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`executor-${index}-name`}>Name</Label>
                  <Input type="text" id={`executor-${index}-name`} value={executor.name} onChange={(e) => handleExecutorChange(index, 'name', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor={`executor-${index}-relationship`}>Relationship</Label>
                  <Input type="text" id={`executor-${index}-relationship`} value={executor.relationship} onChange={(e) => handleExecutorChange(index, 'relationship', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`executor-${index}-email`}>Email</Label>
                  <Input type="email" id={`executor-${index}-email`} value={executor.email} onChange={(e) => handleExecutorChange(index, 'email', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor={`executor-${index}-phone`}>Phone</Label>
                  <Input type="tel" id={`executor-${index}-phone`} value={executor.phone} onChange={(e) => handleExecutorChange(index, 'phone', e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor={`executor-${index}-address`}>Address</Label>
                <Input type="text" id={`executor-${index}-address`} value={executor.address} onChange={(e) => handleExecutorChange(index, 'address', e.target.value)} />
              </div>
              {executors.length > 1 && (
                <Button variant="outline" size="sm" onClick={() => handleRemoveExecutor(index)}>Remove</Button>
              )}
            </div>
          ))}
          <Button variant="secondary" size="sm" onClick={handleAddExecutor}>Add Executor</Button>
          <div className="flex items-center space-x-2">
            <Switch id="executors-complete" checked={isSectionComplete.executors} onCheckedChange={(checked) => handleSectionComplete('executors', checked)} />
            <Label htmlFor="executors-complete">Section Complete</Label>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Beneficiaries</CardTitle>
          <CardDescription>List the beneficiaries of your will.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {beneficiaries.map((beneficiary: any, index: number) => (
            <div key={index} className="space-y-2 border rounded-md p-4">
              <h4 className="text-sm font-medium">Beneficiary {index + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`beneficiary-${index}-name`}>Name</Label>
                  <Input type="text" id={`beneficiary-${index}-name`} value={beneficiary.name} onChange={(e) => handleBeneficiaryChange(index, 'name', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor={`beneficiary-${index}-relationship`}>Relationship</Label>
                  <Input type="text" id={`beneficiary-${index}-relationship`} value={beneficiary.relationship} onChange={(e) => handleBeneficiaryChange(index, 'relationship', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`beneficiary-${index}-email`}>Email</Label>
                  <Input type="email" id={`beneficiary-${index}-email`} value={beneficiary.email} onChange={(e) => handleBeneficiaryChange(index, 'email', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor={`beneficiary-${index}-phone`}>Phone</Label>
                  <Input type="tel" id={`beneficiary-${index}-phone`} value={beneficiary.phone} onChange={(e) => handleBeneficiaryChange(index, 'phone', e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor={`beneficiary-${index}-address`}>Address</Label>
                <Input type="text" id={`beneficiary-${index}-address`} value={beneficiary.address} onChange={(e) => handleBeneficiaryChange(index, 'address', e.target.value)} />
              </div>
              <div>
                <Label htmlFor={`beneficiary-${index}-percentage`}>Percentage</Label>
                <Input type="number" id={`beneficiary-${index}-percentage`} value={beneficiary.percentage} onChange={(e) => handleBeneficiaryChange(index, 'percentage', e.target.value)} />
              </div>
              {beneficiaries.length > 1 && (
                <Button variant="outline" size="sm" onClick={() => handleRemoveBeneficiary(index)}>Remove</Button>
              )}
            </div>
          ))}
          <Button variant="secondary" size="sm" onClick={handleAddBeneficiary}>Add Beneficiary</Button>
          <div className="flex items-center space-x-2">
            <Switch id="beneficiaries-complete" checked={isSectionComplete.beneficiaries} onCheckedChange={(checked) => handleSectionComplete('beneficiaries', checked)} />
            <Label htmlFor="beneficiaries-complete">Section Complete</Label>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Assets</CardTitle>
          <CardDescription>List your assets and their descriptions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {assets.map((asset: any, index: number) => (
            <div key={index} className="space-y-2 border rounded-md p-4">
              <h4 className="text-sm font-medium">Asset {index + 1}</h4>
              <div>
                <Label htmlFor={`asset-${index}-description`}>Description</Label>
                <Textarea id={`asset-${index}-description`} value={asset.description} onChange={(e) => handleAssetChange(index, 'description', e.target.value)} />
              </div>
              {assets.length > 1 && (
                <Button variant="outline" size="sm" onClick={() => handleRemoveAsset(index)}>Remove</Button>
              )}
            </div>
          ))}
          <Button variant="secondary" size="sm" onClick={handleAddAsset}>Add Asset</Button>
          <div className="flex items-center space-x-2">
            <Switch id="assets-complete" checked={isSectionComplete.assets} onCheckedChange={(checked) => handleSectionComplete('assets', checked)} />
            <Label htmlFor="assets-complete">Section Complete</Label>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Final Wishes</CardTitle>
          <CardDescription>Specify your final wishes.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <Label htmlFor="funeralPreferences">Funeral Preferences</Label>
            <Textarea id="funeralPreferences" name="funeralPreferences" value={finalWishes.funeralPreferences} onChange={handleFinalWishesChange} />
          </div>
          <div>
            <Label htmlFor="memorialService">Memorial Service</Label>
            <Textarea id="memorialService" name="memorialService" value={finalWishes.memorialService} onChange={handleFinalWishesChange} />
          </div>
          <div>
            <Label htmlFor="obituary">Obituary</Label>
            <Textarea id="obituary" name="obituary" value={finalWishes.obituary} onChange={handleFinalWishesChange} />
          </div>
          <div>
            <Label htmlFor="charitableDonations">Charitable Donations</Label>
            <Textarea id="charitableDonations" name="charitableDonations" value={finalWishes.charitableDonations} onChange={handleFinalWishesChange} />
          </div>
          <div>
            <Label htmlFor="specialInstructions">Special Instructions</Label>
            <Textarea id="specialInstructions" name="specialInstructions" value={finalWishes.specialInstructions} onChange={handleFinalWishesChange} />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="final-wishes-complete" checked={isSectionComplete.finalWishes} onCheckedChange={(checked) => handleSectionComplete('finalWishes', checked)} />
            <Label htmlFor="final-wishes-complete">Section Complete</Label>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Digital Signature</CardTitle>
          <CardDescription>Sign your will digitally.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignaturePad onSign={handleSign} initialSignature={signature} />
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => handleSaveDraft({ personalInfo, executors, beneficiaries, assets, finalWishes, signature })} disabled={isSaving}>
          {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Draft</>}
        </Button>
        <Button onClick={() => setIsFinalizingModalOpen(true)} disabled={isSaving}>
          {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Finalizing...</> : <><CheckCircle className="mr-2 h-4 w-4" /> Finalize Will</>}
        </Button>
      </div>
      
      <AlertDialog open={isFinalizingModalOpen} onOpenChange={setIsFinalizingModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalize Will</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to finalize your will? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsFinalizingModalOpen(false)} disabled={isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleFinalize({ personalInfo, executors, beneficiaries, assets, finalWishes, signature })} disabled={isSaving}>
              {isFinalizing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Finalizing...</> : <>Finalize</>}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={isRequiredFieldsErrorOpen} onOpenChange={setIsRequiredFieldsErrorOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              Incomplete Information
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Please complete all required sections before finalizing your will.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsRequiredFieldsErrorOpen(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
