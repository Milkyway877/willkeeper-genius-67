
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
  // Add more validation rules for other fields as needed
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
  
  const form = useForm<WillFormValues>({
    resolver: zodResolver(willSchema),
    defaultValues: {
      fullName: initialData?.fullName || '',
      dateOfBirth: initialData?.dateOfBirth || '',
      // Initialize other fields here
    }
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Generate will content when form values change
  useEffect(() => {
    // This would be a more sophisticated template generation
    // For now, we'll just update specific placeholders
    const formValues = form.getValues();
    
    let newContent = willContent;
    if (formValues.fullName) {
      newContent = newContent.replace(/\[Full Name\]/g, formValues.fullName);
    }
    
    if (formValues.dateOfBirth) {
      newContent = newContent.replace(/\[Date of Birth\]/g, formValues.dateOfBirth);
    }
    
    // Update other placeholders based on form values
    
    setWillContent(newContent);
  }, [form.watch()]);
  
  const handleSignatureChange = (signatureData: string | null) => {
    setSignature(signatureData);
  };
  
  const handleVideoRecording = (blob: Blob) => {
    setVideoBlob(blob);
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
        ai_generated: false
      };
      
      const savedWill = await createWill(willData);
      
      toast({
        title: "Draft Saved",
        description: "Your will has been saved as a draft.",
      });
      
      // You can do something with the savedWill.id if needed
      
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
        // Add signature data as needed
      };
      
      const savedWill = await createWill(willData);
      
      // Upload video if present
      if (videoBlob && savedWill?.id) {
        // Video upload logic would go here
        // This would typically involve uploading to storage
        console.log('Would upload video for will:', savedWill.id);
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
              <VideoRecordingSection defaultOpen={false} onRecordingComplete={handleVideoRecording} />
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
                    >
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Draft
                    </Button>
                    
                    <Button 
                      onClick={handleFinalize} 
                      className="w-full"
                      disabled={saving}
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
