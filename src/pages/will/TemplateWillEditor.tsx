
import React, { useState, useEffect, useRef } from 'react';
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
import { Loader2, Save, FileCheck, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { WillAttachedVideosSection } from './components/WillAttachedVideosSection';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { generateWillContent } from '@/utils/willTemplateUtils';
import { checkUserHasWill } from '@/services/willCheckService';
import { useWillSubscriptionFlow } from '@/hooks/useWillSubscriptionFlow';
import { SubscriptionModal } from '@/components/subscription/SubscriptionModal';

// Form validation schema
const willSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  homeAddress: z.string().optional(),
  email: z.string().email().optional().or(z.string().length(0)),
  phoneNumber: z.string().optional(),
  
  // For executors
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

  // For beneficiaries
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

  // For final wishes
  funeralPreferences: z.string().optional(),
  memorialService: z.string().optional(),
  obituary: z.string().optional(),
  charitableDonations: z.string().optional(),
  specialInstructions: z.string().optional(),
  
  // For signature
  signature: z.string().optional(),
});

type WillFormValues = z.infer<typeof willSchema>;

// Create a FormWatcher component to handle form updates with improved initial state handling
const FormWatcher = ({ onChange }: { onChange: (values: WillFormValues) => void }) => {
  const formValues = useWatch();
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  
  // Track user interaction with the form
  useEffect(() => {
    const handleUserInteraction = () => setHasUserInteracted(true);
    
    // Listen for user interaction events on the form
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
    // Only trigger onChange if user has interacted with the form or if we have meaningful data
    if (hasUserInteracted || hasValidFormData(formValues)) {
      onChange(formValues as WillFormValues);
    }
  }, [formValues, onChange, hasUserInteracted]);
  
  // Helper to check if form has any meaningful data beyond defaults
  const hasValidFormData = (values: any): boolean => {
    if (!values) return false;
    
    // Check if user has entered a name (most basic thing they'd enter)
    if (values.fullName && values.fullName.trim().length > 0) return true;
    
    // Check if user has entered a date of birth
    if (values.dateOfBirth && values.dateOfBirth.trim().length > 0) return true;
    
    // Check if any executor has a name
    if (values.executors && Array.isArray(values.executors)) {
      if (values.executors.some(exec => exec.name && exec.name.trim().length > 0)) return true;
    }
    
    // Check if any beneficiary has a name
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
  const [savedWillId, setSavedWillId] = useState<string | null>(willId || null);
  
  // Subscription flow integration
  const {
    showSubscriptionModal,
    handleWillSaved,
    handleSubscriptionSuccess,
    closeSubscriptionModal,
    subscriptionStatus
  } = useWillSubscriptionFlow();
  
  const form = useForm<WillFormValues>({
    resolver: zodResolver(willSchema),
    defaultValues: {
      fullName: initialData?.fullName || '',
      dateOfBirth: initialData?.dateOfBirth || '',
      homeAddress: initialData?.homeAddress || '',
      email: initialData?.email || '',
      phoneNumber: initialData?.phoneNumber || '',
      // Initialize other fields with empty arrays to prevent undefined errors
      executors: initialData?.executors || [{ name: '', email: '', phone: '', address: '', isPrimary: true }],
      beneficiaries: initialData?.beneficiaries || [{ name: '', relationship: '', email: '', phone: '', address: '', percentage: 0 }],
      funeralPreferences: initialData?.funeralPreferences || '',
      memorialService: initialData?.memorialService || '',
      obituary: initialData?.obituary || '',
      charitableDonations: initialData?.charitableDonations || '',
      specialInstructions: initialData?.specialInstructions || '',
      signature: initialData?.signature || '',
    }
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Form watcher to update content as user types
  const handleFormChange = (values: WillFormValues) => {
    console.log("Form values updated:", values);
    
    if (!values) return;
    
    // Only generate content if we have meaningful data
    const newContent = generateWillContent(values, willContent);
    setWillContent(newContent);
  };
  
  const handleSignatureChange = (signatureData: string | null) => {
    setSignature(signatureData);
    // Update form with signature data
    form.setValue('signature', signatureData || '');
  };
  
  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      
      const formValues = form.getValues();
      console.log("Saving draft with values:", formValues);
      
      // Update will content one more time to ensure latest changes
      const finalWillContent = generateWillContent(formValues, willContent);
      
      // Save progress
      await saveWillProgress({
        template_id: templateId,
        current_step: 'editing',
        responses: formValues,
        content: finalWillContent,
        title: `${formValues.fullName}'s Will`,
        completedSections: ['personal_info'] // Track completed sections
      });
      
      // Save as draft will
      const willData = {
        title: `${formValues.fullName}'s Will`,
        content: finalWillContent,
        status: 'draft',
        template_type: templateId,
        ai_generated: false,
        document_url: '',
        signature: signature || undefined,
      };
      
      let savedWill;
      if (savedWillId) {
        savedWill = await updateWill(savedWillId, willData);
      } else {
        savedWill = await createWill(willData);
        if (savedWill) {
          setSavedWillId(savedWill.id);
        }
      }
      
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
      setSaving(true);
      
      // Check if user needs subscription before finalizing
      if (!subscriptionStatus.isSubscribed) {
        // Check if this is their first will
        const willCheck = await checkUserHasWill();
        const isFirstWill = !willCheck.hasWill;
        
        // Show subscription modal for first will or if not subscribed
        await handleWillSaved(isFirstWill);
        setSaving(false);
        return;
      }
      
      // Validate form
      await form.trigger();
      if (!form.formState.isValid) {
        toast({
          title: "Form Incomplete",
          description: "Please fill in all required fields before finalizing.",
          variant: "destructive"
        });
        setSaving(false);
        return;
      }
      
      if (!signature) {
        toast({
          title: "Signature Required",
          description: "Please add your signature before finalizing your will.",
          variant: "destructive"
        });
        setSaving(false);
        return;
      }
      
      const formValues = form.getValues();
      
      // Generate final content based on form values including signature
      let finalWillContent = generateWillContent(formValues, willContent);
      
      // Add signature to the will content
      if (signature) {
        finalWillContent += `\n\nDIGITAL SIGNATURE:\n[Signature: ${formValues.fullName}]\nSigned on: ${new Date().toLocaleDateString()}\n`;
      }
      
      // Save as finalized will
      const willData = {
        title: `${formValues.fullName}'s Will`,
        content: finalWillContent,
        status: 'active', // Mark as active/finalized
        template_type: templateId,
        ai_generated: false,
        document_url: '',
        signature: signature,
      };
      
      let savedWill;
      if (savedWillId) {
        savedWill = await updateWill(savedWillId, willData);
      } else {
        savedWill = await createWill(willData);
      }
      
      toast({
        title: "Will Finalized",
        description: "Your will has been successfully finalized. You can now add videos and documents through the Tank section.",
      });
      
      // Navigate to wills listing
      navigate('/wills');
      
    } catch (error) {
      console.error("Error finalizing will:", error);
      toast({
        title: "Finalization Error",
        description: "There was an error finalizing your will. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto mb-16">
      <FormProvider {...form}>
        <form>
          {/* Add form watcher to track changes */}
          <FormWatcher onChange={handleFormChange} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <PersonalInfoSection defaultOpen={true} />
              <BeneficiariesSection defaultOpen={false} />
              <ExecutorsSection defaultOpen={false} />
              <AssetsSection defaultOpen={false} />
              <FinalWishesSection defaultOpen={false} />
              
              {savedWillId && (
                <Alert className="bg-blue-50 border border-blue-100">
                  <Video className="h-4 w-4 text-blue-500" />
                  <AlertDescription className="text-blue-700">
                    After finalizing your will, you can create video testimonies in the Tank section and attach them to this will.
                  </AlertDescription>
                </Alert>
              )}
              
              <DigitalSignature defaultOpen={false} onSignatureChange={handleSignatureChange} />
            </div>
            
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <WillPreviewSection 
                  defaultOpen={true} 
                  content={willContent}
                  signature={signature}
                  title={`${form.getValues().fullName || 'My'}'s Will`}
                />
                
                {savedWillId && (
                  <WillAttachedVideosSection willId={savedWillId} />
                )}
                
                <Card className="mt-6 p-4">
                  <div className="space-y-4">
                    <Button 
                      onClick={handleSaveDraft} 
                      variant="outline" 
                      className="w-full"
                      disabled={saving}
                      type="button"
                    >
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Draft
                    </Button>
                    
                    <Button 
                      onClick={handleFinalize} 
                      className="w-full"
                      disabled={saving}
                      type="button"
                    >
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileCheck className="mr-2 h-4 w-4" />}
                      Finalize Will
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
      
      {/* Subscription Modal */}
      <SubscriptionModal
        open={showSubscriptionModal}
        onClose={closeSubscriptionModal}
        onSubscribe={handleSubscriptionSuccess}
      />
    </div>
  );
}
