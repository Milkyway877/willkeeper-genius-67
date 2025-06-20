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
import { WillPreviewSection } from './components/WillPreviewSection';
import { createWill, updateWill } from '@/services/willService';
import { saveWillProgress } from '@/services/willProgressService';
import { useNavigate } from 'react-router-dom';
import { Loader2, Save, FileCheck, Video, Upload, Shield } from 'lucide-react';
import { generateWillContent } from '@/utils/willTemplateUtils';
import { useWillSubscriptionFlow } from '@/hooks/useWillSubscriptionFlow';
import { SubscriptionModal } from '@/components/subscription/SubscriptionModal';
import { WillCreationSuccess } from './components/WillCreationSuccess';

// Simplified form validation schema without signature requirement
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

Date: ${new Date().toLocaleDateString()}
  `);
  
  const [saving, setSaving] = useState<boolean>(false);
  const [isFinalized, setIsFinalized] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [finalizedWill, setFinalizedWill] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<WillFormValues | null>(null);
  
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
    console.log("TemplateWillEditor: Form values updated:", values);
    
    if (!values) return;
    
    // Store the structured form data
    setFormData(values);
    
    const newContent = generateWillContent(values, willContent);
    setWillContent(newContent);
  };
  
  // Transform form data to structured format for professional preview
  const getStructuredData = () => {
    if (!formData) return null;
    
    return {
      personalInfo: {
        fullName: formData.fullName || '',
        dateOfBirth: formData.dateOfBirth || '',
        address: formData.homeAddress || '',
        email: formData.email || '',
        phoneNumber: formData.phoneNumber || ''
      },
      executors: formData.executors || [],
      beneficiaries: formData.beneficiaries || [],
      funeralPreferences: formData.funeralPreferences || '',
      memorialService: formData.memorialService || '',
      obituary: formData.obituary || '',
      charitableDonations: formData.charitableDonations || '',
      specialInstructions: formData.specialInstructions || '',
      finalArrangements: [
        formData.funeralPreferences,
        formData.memorialService,
        formData.obituary,
        formData.charitableDonations,
        formData.specialInstructions
      ].filter(Boolean).join('\n\n') || 'No specific arrangements specified'
    };
  };
  
  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      
      const formValues = form.getValues();
      console.log("TemplateWillEditor: Saving draft");
      
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
        status: 'draft' as const,
        template_type: templateId,
        ai_generated: false,
        document_url: '',
        metadata: {
          formValues: formValues,
          templateId: templateId,
          savedAt: new Date().toISOString()
        }
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
      console.log('TemplateWillEditor: Starting finalization process...');
      console.log('TemplateWillEditor: Form valid:', form.formState.isValid);
      
      await form.trigger();
      if (!form.formState.isValid) {
        toast({
          title: "Form Incomplete",
          description: "Please fill in all required fields before finalizing.",
          variant: "destructive"
        });
        return;
      }
      
      setIsGenerating(true);
      
      const formValues = form.getValues();
      
      // Generate the final will content with all user data
      const finalWillContent = generateWillContent(formValues, willContent);
      const contentWithTimestamp = finalWillContent + `\n\nFinalized on: ${new Date().toLocaleString()}`;
      
      console.log('TemplateWillEditor: Final will content:', contentWithTimestamp);
      
      const willData = {
        title: `${formValues.fullName}'s Will`,
        content: contentWithTimestamp,
        status: 'active' as const,
        template_type: templateId,
        ai_generated: false,
        document_url: '',
        metadata: {
          formValues: formValues,
          templateId: templateId,
          finalizedAt: new Date().toISOString()
        }
      };
      
      console.log('TemplateWillEditor: Saving will data:', willData);
      
      const savedWill = await createWill(willData);
      
      if (savedWill && savedWill.id) {
        console.log('TemplateWillEditor: Will finalized successfully with ID:', savedWill.id);
        
        // Verify the saved content
        console.log('TemplateWillEditor: Saved will content preview:', savedWill.content?.substring(0, 200));
        
        setFinalizedWill(savedWill);
        setIsFinalized(true);
        setShowSuccessModal(true);
        
        toast({
          title: "Will Finalized Successfully!",
          description: "Your will has been created with all your information.",
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
    <div className="container mx-auto mb-16">
      <FormProvider {...form}>
        <form>
          <FormWatcher onChange={handleFormChange} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <PersonalInfoSection defaultOpen={true} />
              <BeneficiariesSection defaultOpen={false} />
              <ExecutorsSection defaultOpen={false} />
              <AssetsSection defaultOpen={false} />
              <FinalWishesSection defaultOpen={false} />
              
              {/* Next Steps Information Panel */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <FileCheck className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-blue-900">After Will Finalization</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-blue-800 font-medium">
                      Once your will is finalized, you'll complete these important steps:
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white/80 p-4 rounded-lg border border-blue-100">
                        <div className="flex items-center mb-2">
                          <Upload className="h-5 w-5 text-blue-600 mr-2" />
                          <h4 className="font-medium text-blue-900">1. Upload Documents</h4>
                        </div>
                        <p className="text-sm text-blue-700">
                          Upload supporting documents like property deeds, financial statements, and identification.
                        </p>
                      </div>
                      
                      <div className="bg-white/80 p-4 rounded-lg border border-blue-100">
                        <div className="flex items-center mb-2">
                          <Video className="h-5 w-5 text-blue-600 mr-2" />
                          <h4 className="font-medium text-blue-900">2. Record Video Testament</h4>
                        </div>
                        <p className="text-sm text-blue-700">
                          Record your personal video testament through our secure platform for authenticity.
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 text-green-600 mr-2" />
                        <p className="text-sm text-green-800 font-medium">
                          Platform-based recording ensures security and prevents tampering
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <WillPreviewSection 
                  defaultOpen={true} 
                  content={willContent}
                  structuredData={getStructuredData()}
                  title={`${form.getValues().fullName || 'My'}'s Will`}
                  isWillFinalized={isFinalized}
                />
                
                <Card className="mt-6 p-4">
                  <div className="space-y-4">
                    <Button 
                      onClick={handleSaveDraft} 
                      variant="outline" 
                      className="w-full"
                      disabled={saving || isGenerating}
                      type="button"
                    >
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Draft
                    </Button>
                    
                    <Button 
                      onClick={handleFinalize} 
                      className="w-full"
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
                      Free will creation - Complete with documents & video next
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
