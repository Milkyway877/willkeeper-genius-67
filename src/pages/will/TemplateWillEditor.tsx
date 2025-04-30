import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm, FormProvider } from 'react-hook-form';
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
import { VideoRecordingSection } from './components/VideoRecordingSection';
import { WillPreviewSection } from './components/WillPreviewSection';
import { createWill, updateWill } from '@/services/willService';
import { saveWillProgress } from '@/services/willProgressService';
import { useNavigate } from 'react-router-dom';
import { Loader2, Save, FileCheck } from 'lucide-react';

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
});

type WillFormValues = z.infer<typeof willSchema>;

interface TemplateWillEditorProps {
  templateId: string;
  initialData?: any;
  isNew?: boolean;
}

export function TemplateWillEditor({ templateId, initialData = {}, isNew = true }: TemplateWillEditorProps) {
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
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoData, setVideoData] = useState<{ path: string, url: string } | null>(null);
  
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
    }
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Generate will content when form values change
  useEffect(() => {
    // This is a more sophisticated template generation
    const formValues = form.getValues();
    
    let newContent = willContent;
    
    // Replace personal information
    if (formValues.fullName) {
      newContent = newContent.replace(/\[Full Name\]/g, formValues.fullName);
    }
    
    if (formValues.dateOfBirth) {
      newContent = newContent.replace(/\[Date of Birth\]/g, formValues.dateOfBirth);
    }
    
    if (formValues.homeAddress) {
      newContent = newContent.replace(/\[Address\]/g, formValues.homeAddress);
    }
    
    // Replace executor information
    const executors = formValues.executors || [];
    const primaryExecutor = executors.find(e => e.isPrimary) || executors[0];
    const alternateExecutor = executors.find(e => !e.isPrimary && e.name) || executors[1];
    
    if (primaryExecutor?.name) {
      newContent = newContent.replace(/\[Executor Name\]/g, primaryExecutor.name);
    }
    
    if (alternateExecutor?.name) {
      newContent = newContent.replace(/\[Alternate Executor Name\]/g, alternateExecutor.name);
    } else {
      newContent = newContent.replace(/\[Alternate Executor Name\]/g, "a person appointed by the court");
    }
    
    // Replace beneficiary information
    const beneficiaries = formValues.beneficiaries || [];
    let beneficiaryText = "";
    
    if (beneficiaries.length > 0) {
      beneficiaryText = beneficiaries
        .filter(b => b.name)
        .map(b => `- ${b.name} (${b.relationship || 'Relationship not specified'}): ${b.percentage || 0}% of the estate`)
        .join('\n');
        
      if (beneficiaryText) {
        newContent = newContent.replace(/\[Beneficiary details to be added\]/g, beneficiaryText);
      }
      
      const beneficiaryDistribution = beneficiaries
        .filter(b => b.name)
        .map(b => `${b.name} (${b.percentage || 0}%)`)
        .join(', ');
        
      if (beneficiaryDistribution) {
        newContent = newContent.replace(/\[Beneficiary names and distribution details\]/g, beneficiaryDistribution);
      }
    }
    
    // Replace final arrangements
    let finalArrangements = "";
    
    if (formValues.funeralPreferences) {
      finalArrangements += `Funeral Preferences: ${formValues.funeralPreferences}\n\n`;
    }
    
    if (formValues.memorialService) {
      finalArrangements += `Memorial Service: ${formValues.memorialService}\n\n`;
    }
    
    if (formValues.obituary) {
      finalArrangements += `Obituary: ${formValues.obituary}\n\n`;
    }
    
    if (formValues.charitableDonations) {
      finalArrangements += `Charitable Donations: ${formValues.charitableDonations}\n\n`;
    }
    
    if (formValues.specialInstructions) {
      finalArrangements += `Special Instructions: ${formValues.specialInstructions}`;
    }
    
    if (finalArrangements) {
      newContent = newContent.replace(/\[Final arrangements to be added\]/g, finalArrangements);
    }
    
    // If there are no specific instructions for some sections, replace with generic text
    newContent = newContent.replace(/\[Beneficiary details to be added\]/g, "No beneficiaries specified");
    newContent = newContent.replace(/\[Beneficiary names and distribution details\]/g, "my legal heirs according to applicable law");
    newContent = newContent.replace(/\[Specific bequests to be added\]/g, "No specific bequests have been specified");
    newContent = newContent.replace(/\[Final arrangements to be added\]/g, "No specific final arrangements have been specified");
    newContent = newContent.replace(/\[Executor Name\]/g, "the person appointed by the court");
    newContent = newContent.replace(/\[Alternate Executor Name\]/g, "a person appointed by the court");
    newContent = newContent.replace(/\[Address\]/g, "my current legal address");
    
    setWillContent(newContent);
  }, [form.watch()]);
  
  const handleSignatureChange = (signatureData: string | null) => {
    setSignature(signatureData);
  };
  
  const handleVideoRecording = (blob: Blob, data: { path: string, url: string }) => {
    setVideoBlob(blob);
    setVideoData(data);
  };
  
  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      
      // Save progress
      await saveWillProgress({
        template_id: templateId,
        current_step: 'editing',
        responses: form.getValues(),
        content: willContent,
        title: `${form.getValues().fullName}'s Will`,
        completedSections: ['personal_info'] // Track completed sections
      });
      
      // Save as draft will
      const willData = {
        title: `${form.getValues().fullName}'s Will`,
        content: willContent,
        status: 'draft',
        template_type: templateId,
        ai_generated: false,
        document_url: '' // Add the missing document_url property
      };
      
      const savedWill = await createWill(willData);
      
      // Add video reference if we have one
      if (savedWill?.id && videoData?.path) {
        try {
          const { error } = await supabase
            .from('will_videos')
            .insert({
              will_id: savedWill.id,
              file_path: videoData.path,
              duration: 0, // We could calculate this
            });
            
          if (error) {
            console.error('Error saving video record:', error);
          }
        } catch (videoError) {
          console.error('Error linking video to will:', videoError);
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
      
      // Validate form
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
      
      // Save as finalized will
      const willData = {
        title: `${form.getValues().fullName}'s Will`,
        content: willContent,
        status: 'active', // Mark as active/finalized
        template_type: templateId,
        ai_generated: false,
        document_url: '', // Add the missing document_url property
        // Add signature data as needed
      };
      
      const savedWill = await createWill(willData);
      
      // Add video reference if we have one
      if (savedWill?.id && videoData?.path) {
        try {
          const { error } = await supabase
            .from('will_videos')
            .insert({
              will_id: savedWill.id,
              file_path: videoData.path,
              duration: 0, // We could calculate this
            });
            
          if (error) {
            console.error('Error saving video record:', error);
          }
        } catch (videoError) {
          console.error('Error linking video to will:', videoError);
        }
      }
      
      toast({
        title: "Will Finalized",
        description: "Your will has been successfully finalized.",
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <PersonalInfoSection defaultOpen={true} />
              <BeneficiariesSection defaultOpen={false} />
              <ExecutorsSection defaultOpen={false} />
              <AssetsSection defaultOpen={false} />
              <FinalWishesSection defaultOpen={false} />
              <VideoRecordingSection 
                defaultOpen={false} 
                onRecordingComplete={handleVideoRecording} 
                willId={!isNew && willId ? willId : undefined} 
              />
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
    </div>
  );
}
