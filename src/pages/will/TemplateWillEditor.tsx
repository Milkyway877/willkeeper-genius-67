import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { PersonalInfoSection } from './components/TemplateSections/PersonalInfoSection';
import { BeneficiariesSection } from './components/TemplateSections/BeneficiariesSection';
import { AssetsSection } from './components/TemplateSections/AssetsSection';
import { ExecutorsSection } from './components/TemplateSections/ExecutorsSection';
import { FinalWishesSection } from './components/TemplateSections/FinalWishesSection';
import { DigitalSignature } from './components/TemplateSections/DigitalSignature';
import { WillPreviewSection } from './components/WillPreviewSection';
import { createWill, updateWill } from '@/services/willService';
import { saveWillProgress } from '@/services/willProgressService';
import { useNavigate } from 'react-router-dom';
import { Loader2, Save, FileCheck } from 'lucide-react';
import { generateWillContent } from '@/utils/willTemplateUtils';
import { useWillSubscriptionFlow } from '@/hooks/useWillSubscriptionFlow';
import { SubscriptionModal } from '@/components/subscription/SubscriptionModal';
import { WillCreationSuccess } from './components/WillCreationSuccess';
import { FileCheck as Users, UsersCog, Building2, ShieldCheck, PenTool } from 'lucide-react';

// Simplified form validation schema without videos/documents
const willSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  homeAddress: z.string().optional(),
  email: z.string().email().optional().or(z.string().length(0)),
  phoneNumber: z.string().optional(),
  
  executors: z.array(
    z.object({
      name: z.string().optional(),
      relationship: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      isPrimary: z.boolean().optional(),
    })
  ).optional(),

  beneficiaries: z.array(
    z.object({
      name: z.string().optional(),
      relationship: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      percentage: z.number().optional().or(z.string().optional())
    })
  ).optional(),

  funeralPreferences: z.string().optional(),
  memorialService: z.string().optional(),
  obituary: z.string().optional(),
  charitableDonations: z.string().optional(),
  specialInstructions: z.string().optional(),
});

type WillFormValues = z.infer<typeof willSchema>;

// Enhanced FormWatcher component for faster real-time updates
const FormWatcher = ({ onChange }: { onChange: (values: WillFormValues) => void }) => {
  const formValues = useWatch();
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  
  useEffect(() => {
    const handleUserInteraction = () => setHasUserInteracted(true);
    
    const formElement = document.querySelector('form');
    if (formElement) {
      formElement.addEventListener('input', handleUserInteraction);
      formElement.addEventListener('change', handleUserInteraction);
    }
    
    return () => {
      if (formElement) {
        formElement.removeEventListener('input', handleUserInteraction);
        formElement.removeEventListener('change', handleUserInteraction);
      }
    };
  }, []);
  
  useEffect(() => {
    if (hasUserInteracted || hasValidFormData(formValues)) {
      onChange(formValues as WillFormValues);
    }
  }, [formValues, onChange, hasUserInteracted]);
  
  const hasValidFormData = (values: any): boolean => {
    if (!values) return false;
    
    if (values.fullName && values.fullName.trim().length > 0) return true;
    if (values.dateOfBirth && values.dateOfBirth.trim().length > 0) return true;
    
    if (values.executors && Array.isArray(values.executors)) {
      if (values.executors.some(exec => exec.name && exec.name.trim().length > 0)) return true;
    }
    
    if (values.beneficiaries && Array.isArray(values.beneficiaries)) {
      if (values.beneficiaries.some(ben => ben.name && ben.name.trim().length > 0)) return true;
    }
    
    return false;
  };
  
  return null;
};

interface TemplateWillEditorProps {
  templateId: string;
  initialData?: any;
  isNew?: boolean;
  willId?: string;
}

export function TemplateWillEditor({ 
  templateId, 
  initialData = {}, 
  isNew = true,
  willId 
}: TemplateWillEditorProps) {
  const [willContent, setWillContent] = useState<string>(`
LAST WILL AND TESTAMENT

I, [Full Name], residing at [Address], being of sound mind, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all wills and codicils previously made by me.

ARTICLE I: PERSONAL INFORMATION
I declare that I was born on [Date of Birth] and that I am creating this will to ensure my wishes are carried out after my death.

ARTICLE II: APPOINTMENT OF EXECUTOR
I appoint [Executor Name] to serve as the Executor of my estate. If they are unable or unwilling to serve, I appoint [Alternate Executor Name] to serve as alternate Executor.

ARTICLE III: BENEFICIARIES
I bequeath my assets to the following beneficiaries:
[Beneficiary details to be added]

ARTICLE IV: SPECIFIC BEQUESTS
[Specific bequests to be added]

ARTICLE V: RESIDUAL ESTATE
I give all the rest and residue of my estate to [Beneficiary names and distribution details].

ARTICLE VI: FINAL ARRANGEMENTS
[Final arrangements to be added]

Digitally signed by: [Full Name]
Date: ${new Date().toLocaleDateString()}
  `);
  
  const [signature, setSignature] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [isFinalized, setIsFinalized] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [finalizedWill, setFinalizedWill] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  
  const form = useForm<WillFormValues>({
    resolver: zodResolver(willSchema),
    defaultValues: {
      fullName: initialData?.fullName || '',
      dateOfBirth: initialData?.dateOfBirth || '',
      homeAddress: initialData?.homeAddress || '',
      email: initialData?.email || '',
      phoneNumber: initialData?.phoneNumber || '',
      executors: initialData?.executors || [{ name: '', email: '', phone: '', address: '', isPrimary: true }],
      beneficiaries: initialData?.beneficiaries || [{ name: '', relationship: '', email: '', phone: '', address: '', percentage: 0 }],
      funeralPreferences: initialData?.funeralPreferences || '',
      memorialService: initialData?.memorialService || '',
      obituary: initialData?.obituary || '',
      charitableDonations: initialData?.charitableDonations || '',
      specialInstructions: initialData?.specialInstructions || '',
    }
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleFormChange = (values: WillFormValues) => {
    console.log("Form values updated:", values);
    
    if (!values) return;
    
    const newContent = generateWillContent(values, willContent);
    setWillContent(newContent);
  };
  
  const handleSignatureChange = (signatureData: string | null) => {
    setSignature(signatureData);
  };
  
  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      
      const formValues = form.getValues();
      console.log("Saving draft with values:", formValues);
      
      const finalWillContent = generateWillContent(formValues, willContent);
      
      await saveWillProgress({
        template_id: templateId,
        current_step: 'editing',
        responses: formValues,
        content: finalWillContent,
        title: `${formValues.fullName}'s Will`,
        completedSections: ['personal_info']
      });
      
      const willData = {
        title: `${formValues.fullName}'s Will`,
        content: finalWillContent,
        status: 'draft',
        template_type: templateId,
        ai_generated: false,
        document_url: ''
      };
      
      const savedWill = await createWill(willData);
      
      toast({
        title: "Draft Saved",
        description: "Your will has been saved as a draft.",
      });
      
    } catch (error) {
      console.error("Error saving will:", error);
      toast({
        title: "Save Error",
        description: "There was an error saving your will. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleFinalize = async () => {
    try {
      await form.trigger();
      if (!form.formState.isValid) {
        toast({
          title: "Form Incomplete",
          description: "Please fill in all required fields before finalizing.",
          variant: "destructive"
        });
        return;
      }
      
      if (!signature) {
        toast({
          title: "Signature Required",
          description: "Please add your signature before finalizing your will.",
          variant: "destructive"
        });
        return;
      }
      
      setIsGenerating(true);
      
      const formValues = form.getValues();
      
      const finalWillContent = generateWillContent(formValues, willContent);
      const contentWithSignature = finalWillContent + `\n\nDigital Signature: ${signature}\nSigned on: ${new Date().toLocaleString()}`;
      
      const willData = {
        title: `${formValues.fullName}'s Will`,
        content: contentWithSignature,
        status: 'active',
        template_type: templateId,
        ai_generated: false,
        document_url: '',
      };
      
      const savedWill = await createWill(willData);
      
      if (savedWill && savedWill.id) {
        setFinalizedWill(savedWill);
        setIsFinalized(true);
        setShowSuccessModal(true);
        
        toast({
          title: "Will Finalized Successfully!",
          description: "Your will has been created. You have 24 hours of free access before upgrade is required.",
        });
      }
      
    } catch (error) {
      console.error("Error finalizing will:", error);
      toast({
        title: "Finalization Error",
        description: "There was an error finalizing your will. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Show success modal instead of regular editor when finalized
  if (showSuccessModal && finalizedWill) {
    return (
      <WillCreationSuccess 
        will={finalizedWill} 
        onClose={() => setShowSuccessModal(false)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-willtank-50">
      <div className="container mx-auto px-4 py-8 mb-16">
        {/* Remove Subscription Modal - no barriers during creation */}
        
        <FormProvider {...form}>
          <form>
            <FormWatcher onChange={handleFormChange} />
            
            {/* Enhanced Header */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-willtank-800 mb-2">Create Your Will</h1>
              <p className="text-willtank-600 max-w-2xl mx-auto">
                Complete each section below to create a comprehensive and legally sound will. 
                Our AI assistant is here to help guide you through the process.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 space-y-8">
                {/* Enhanced sections with better visibility */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-willtank-600 to-blue-600 text-white p-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <FileCheck className="h-6 w-6" />
                      Personal Information
                    </h2>
                    <p className="text-willtank-100 mt-1">Start with your basic information</p>
                  </div>
                  <div className="p-6">
                    <PersonalInfoSection defaultOpen={true} />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Users className="h-6 w-6" />
                      Beneficiaries
                    </h2>
                    <p className="text-purple-100 mt-1">Who will inherit your assets</p>
                  </div>
                  <div className="p-6">
                    <BeneficiariesSection defaultOpen={false} />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <UsersCog className="h-6 w-6" />
                      Executors
                    </h2>
                    <p className="text-green-100 mt-1">Who will manage your estate</p>
                  </div>
                  <div className="p-6">
                    <ExecutorsSection defaultOpen={false} />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Building2 className="h-6 w-6" />
                      Assets & Property
                    </h2>
                    <p className="text-amber-100 mt-1">Detail your valuable possessions</p>
                  </div>
                  <div className="p-6">
                    <AssetsSection defaultOpen={false} />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <ShieldCheck className="h-6 w-6" />
                      Final Wishes
                    </h2>
                    <p className="text-blue-100 mt-1">Your final instructions and preferences</p>
                  </div>
                  <div className="p-6">
                    <FinalWishesSection defaultOpen={false} />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <PenTool className="h-6 w-6" />
                      Digital Signature
                    </h2>
                    <p className="text-red-100 mt-1">Sign your will digitally</p>
                  </div>
                  <div className="p-6">
                    <DigitalSignature defaultOpen={false} onSignatureChange={handleSignatureChange} />
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-6 space-y-6">
                  <WillPreviewSection 
                    defaultOpen={true} 
                    content={willContent}
                    signature={signature}
                    title={`${form.getValues().fullName || 'My'}'s Will`}
                    isWillFinalized={isFinalized}
                  />
                  
                  <Card className="bg-gradient-to-br from-willtank-50 to-blue-50 border-willtank-200">
                    <div className="p-6 space-y-4">
                      <div className="text-center">
                        <h3 className="font-semibold text-willtank-800 mb-2">Ready to Complete?</h3>
                        <p className="text-sm text-willtank-600 mb-4">
                          Save your progress or finalize your will when ready.
                        </p>
                      </div>
                      
                      <Button 
                        onClick={handleSaveDraft} 
                        variant="outline" 
                        className="w-full border-willtank-300 hover:bg-willtank-50"
                        disabled={saving || isGenerating}
                        type="button"
                      >
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Draft
                      </Button>
                      
                      <Button 
                        onClick={handleFinalize} 
                        className="w-full bg-willtank-600 hover:bg-willtank-700"
                        disabled={saving || isFinalized || isGenerating}
                        type="button"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Finalizing Will...
                          </>
                        ) : (
                          <>
                            <FileCheck className="mr-2 h-4 w-4" />
                            {isFinalized ? 'Will Finalized' : 'Finalize Will'}
                          </>
                        )}
                      </Button>
                      
                      <p className="text-xs text-gray-500 text-center">
                        ✨ Free will creation - 24 hours secure access included
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
