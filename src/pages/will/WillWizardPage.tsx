
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WillWizard } from './components/WillWizard';
import { WillCreationSuccess } from './components/WillCreationSuccess';
import { createWill, Will } from '@/services/willService';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { templates } from './config/wizardSteps';
import { clearWillProgress } from '@/services/willProgressService';

export default function WillWizardPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [willData, setWillData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [createdWill, setCreatedWill] = useState<Will | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const template = templates.find(t => t.id === templateId);
  
  useEffect(() => {
    if (!template) {
      toast({
        title: "Template not found",
        description: "The requested template could not be found.",
        variant: "destructive"
      });
      navigate('/will/create');
    }
  }, [template, navigate, toast]);

  const handleStepComplete = (stepData: any) => {
    setWillData(prev => ({ ...prev, ...stepData }));
    if (currentStep < (template?.steps.length || 0) - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleStepBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinalizeWill = async (finalData: any) => {
    if (!template) return;
    
    setIsLoading(true);
    
    try {
      const combinedData = { ...willData, ...finalData };
      
      // Generate will content based on template and data
      const willContent = generateWillContent(template, combinedData);
      
      const will = {
        title: combinedData.personalInfo?.fullName ? 
          `Will of ${combinedData.personalInfo.fullName}` : 
          `${template.title} Will`,
        status: 'active' as const,
        document_url: '',
        template_type: template.id,
        ai_generated: false,
        content: willContent
      };
      
      const newWill = await createWill(will);
      
      if (newWill) {
        // Clear any saved progress
        await clearWillProgress(newWill.id);
        
        // Show success modal instead of immediate redirect
        setCreatedWill(newWill);
        setShowSuccess(true);
        
        toast({
          title: "Will Created Successfully!",
          description: "Your will has been created and saved.",
        });
      }
      
    } catch (error) {
      console.error('Error creating will:', error);
      toast({
        title: "Error Creating Will",
        description: "There was a problem creating your will. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateWillContent = (template: any, data: any): string => {
    // This is a simplified content generation - in a real app, you'd have more sophisticated templating
    const { personalInfo, executors, beneficiaries, assets, finalWishes } = data;
    
    let content = `LAST WILL AND TESTAMENT\n\n`;
    content += `I, ${personalInfo?.fullName || '[Name]'}, `;
    content += `of ${personalInfo?.address || '[Address]'}, `;
    content += `being of sound mind and disposing memory, do hereby make, publish and declare this to be my Last Will and Testament.\n\n`;
    
    if (executors && executors.length > 0) {
      content += `EXECUTORS\n`;
      content += `I hereby nominate and appoint the following person(s) as executor(s) of this Will:\n`;
      executors.forEach((executor: any, index: number) => {
        content += `${index + 1}. ${executor.name} of ${executor.address || '[Address]'}\n`;
      });
      content += `\n`;
    }
    
    if (beneficiaries && beneficiaries.length > 0) {
      content += `BENEFICIARIES\n`;
      content += `I give, devise and bequeath my estate as follows:\n`;
      beneficiaries.forEach((beneficiary: any, index: number) => {
        content += `${index + 1}. To ${beneficiary.name} (${beneficiary.relationship}): ${beneficiary.bequest || 'As specified'}\n`;
      });
      content += `\n`;
    }
    
    if (assets && assets.length > 0) {
      content += `ASSETS\n`;
      assets.forEach((asset: any, index: number) => {
        content += `${index + 1}. ${asset.type}: ${asset.description} - Value: ${asset.value || 'As assessed'}\n`;
      });
      content += `\n`;
    }
    
    if (finalWishes) {
      content += `FINAL WISHES\n`;
      content += `${finalWishes}\n\n`;
    }
    
    content += `IN WITNESS WHEREOF, I have hereunto set my hand this day.\n\n`;
    content += `Signature: _________________________\n`;
    content += `${personalInfo?.fullName || '[Name]'}\n`;
    content += `Date: ${new Date().toLocaleDateString()}\n`;
    
    return content;
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setCreatedWill(null);
  };

  if (!template) {
    return <Layout><div>Loading...</div></Layout>;
  }

  if (showSuccess && createdWill) {
    return (
      <WillCreationSuccess 
        will={createdWill} 
        onClose={handleSuccessClose}
        autoRedirect={true}
      />
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/will/create')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle>{template.title} Creation Wizard</CardTitle>
            </CardHeader>
            <CardContent>
              <WillWizard
                template={template}
                currentStep={currentStep}
                willData={willData}
                onStepComplete={handleStepComplete}
                onStepBack={handleStepBack}
                onFinalize={handleFinalizeWill}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
