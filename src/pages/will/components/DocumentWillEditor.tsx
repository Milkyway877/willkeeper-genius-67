
import React, { useState, useEffect } from 'react';
import { BasicInfoForm } from './BasicInfoForm';
import { ExecutorsForm } from './ExecutorsForm';
import { BeneficiariesForm } from './BeneficiariesForm';
import { AssetsForm } from './AssetsForm';
import { FinalWishesForm } from './FinalWishesForm';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useForm } from '@mantine/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DigitalSignatureCanvas } from './DigitalSignatureCanvas';
import { ArrowRight, ArrowLeft, Loader2, Check } from 'lucide-react';

interface DocumentWillEditorProps {
  templateId: string;
  initialData?: any;
  willId?: string;
  onSave?: (data: any) => void;
  onComplete?: (data: any, signature: string | null) => void;
}

export function DocumentWillEditor({
  templateId,
  initialData = {},
  willId,
  onSave,
  onComplete
}: DocumentWillEditorProps) {
  const [currentTab, setCurrentTab] = useState('personal-info');
  const [signature, setSignature] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSave, setAutoSave] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  
  const form = useForm({
    initialValues: {
      personalInfo: initialData.personalInfo || {
        fullName: '',
        dateOfBirth: '',
        address: '',
        email: '',
        phone: '',
        maritalStatus: '',
        spouseName: '',
        children: []
      },
      executors: initialData.executors || [{ id: "exec-1", name: "", relationship: "", email: "", phone: "", address: "", isPrimary: true }],
      beneficiaries: initialData.beneficiaries || [{ id: "ben-1", name: "", relationship: "", email: "", phone: "", address: "", percentage: 0 }],
      assets: initialData.assets || {
        realEstate: [],
        vehicles: [],
        financialAccounts: [],
        personalItems: []
      },
      specificBequests: initialData.specificBequests || "",
      residualEstate: initialData.residualEstate || "",
      finalArrangements: initialData.finalArrangements || ""
    }
  });
  
  useEffect(() => {
    // Set up auto-save every 30 seconds
    const saveInterval = setInterval(() => {
      if (onSave) {
        console.log("Auto-saving form data...");
        onSave(form.values);
      }
    }, 30000);
    
    setAutoSave(saveInterval);
    
    return () => {
      if (autoSave) clearInterval(autoSave);
    };
  }, []);
  
  // Handle tab navigation
  const goToNextTab = () => {
    if (currentTab === 'personal-info') setCurrentTab('executors');
    else if (currentTab === 'executors') setCurrentTab('beneficiaries');
    else if (currentTab === 'beneficiaries') setCurrentTab('assets');
    else if (currentTab === 'assets') setCurrentTab('final-wishes');
    else if (currentTab === 'final-wishes') setCurrentTab('review');
  };
  
  const goToPreviousTab = () => {
    if (currentTab === 'review') setCurrentTab('final-wishes');
    else if (currentTab === 'final-wishes') setCurrentTab('assets');
    else if (currentTab === 'assets') setCurrentTab('beneficiaries');
    else if (currentTab === 'beneficiaries') setCurrentTab('executors');
    else if (currentTab === 'executors') setCurrentTab('personal-info');
  };
  
  // Save changes
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      if (onSave) {
        await onSave(form.values);
      }
      
      toast({
        title: "Changes saved",
        description: "Your will has been saved successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem saving your changes.",
        variant: "destructive"
      });
      console.error("Error saving will:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Complete will creation
  const handleComplete = async () => {
    try {
      setIsSaving(true);
      
      // Validate required fields
      if (!form.values.personalInfo.fullName) {
        toast({
          title: "Missing information",
          description: "Please enter your full name in the Personal Information section.",
          variant: "destructive"
        });
        setCurrentTab('personal-info');
        setIsSaving(false);
        return;
      }
      
      if (form.values.executors.length === 0 || !form.values.executors[0].name) {
        toast({
          title: "Missing information",
          description: "Please add at least one executor.",
          variant: "destructive"
        });
        setCurrentTab('executors');
        setIsSaving(false);
        return;
      }
      
      if (form.values.beneficiaries.length === 0 || !form.values.beneficiaries[0].name) {
        toast({
          title: "Missing information",
          description: "Please add at least one beneficiary.",
          variant: "destructive"
        });
        setCurrentTab('beneficiaries');
        setIsSaving(false);
        return;
      }
      
      if (!signature) {
        toast({
          title: "Signature required",
          description: "Please sign your will before completing.",
          variant: "destructive"
        });
        setIsSaving(false);
        return;
      }
      
      if (onComplete) {
        await onComplete(form.values, signature);
      }
      
      toast({
        title: "Will completed!",
        description: "Your will has been completed successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem completing your will.",
        variant: "destructive"
      });
      console.error("Error completing will:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle signature update
  const handleSignatureChange = (signatureData: string | null) => {
    setSignature(signatureData);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="w-full overflow-x-auto flex justify-start border-b pb-0">
          <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
          <TabsTrigger value="executors">Executors</TabsTrigger>
          <TabsTrigger value="beneficiaries">Beneficiaries</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="final-wishes">Final Wishes</TabsTrigger>
          <TabsTrigger value="review">Review & Sign</TabsTrigger>
        </TabsList>
        
        <div className="p-4 md:p-6">
          <TabsContent value="personal-info">
            <BasicInfoForm form={form} />
          </TabsContent>
          
          <TabsContent value="executors">
            <ExecutorsForm form={form} />
          </TabsContent>
          
          <TabsContent value="beneficiaries">
            <BeneficiariesForm form={form} />
          </TabsContent>
          
          <TabsContent value="assets">
            <AssetsForm form={form} />
          </TabsContent>
          
          <TabsContent value="final-wishes">
            <FinalWishesForm form={form} />
          </TabsContent>
          
          <TabsContent value="review">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Digital Signature</h2>
              <p className="text-gray-600 mb-4">
                Please sign below to complete your will. Your digital signature will be legally binding.
              </p>
              
              <DigitalSignatureCanvas 
                onSignatureChange={handleSignatureChange}
                initialSignature={signature}
              />
              
              {signature ? (
                <div className="bg-green-50 border border-green-100 rounded p-3 flex items-center">
                  <Check className="text-green-600 mr-2" />
                  <span className="text-green-700">Signature saved</span>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-100 rounded p-3">
                  <p className="text-amber-700">Please sign above to complete your will</p>
                </div>
              )}
            </div>
          </TabsContent>
        </div>
        
        <div className="p-4 md:px-6 border-t flex justify-between">
          <Button 
            type="button" 
            variant="outline"
            onClick={goToPreviousTab}
            disabled={currentTab === 'personal-info'}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Progress
            </Button>
            
            {currentTab === 'review' ? (
              <Button 
                type="button"
                onClick={handleComplete}
                disabled={isSaving || !signature}
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Complete Will
              </Button>
            ) : (
              <Button 
                type="button"
                onClick={goToNextTab}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
}
