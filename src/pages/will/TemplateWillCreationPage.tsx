
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { createWill } from '@/services/willService';
import { templates } from './config/wizardSteps';
import { TemplateWillEditor } from './components/TemplateWillEditor';
import { WillPreview } from './components/WillPreview';

// Mock document upload type
interface Document {
  id: string;
  name: string;
  size: string;
  type: string;
}

// Mock video recording type
interface VideoRecording {
  id: string;
  duration: string;
  thumbnail?: string;
  date: string;
}

export default function TemplateWillCreationPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [willData, setWillData] = useState<any>(null);
  const [willContent, setWillContent] = useState<string>('');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Find the selected template based on templateId
  useEffect(() => {
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);
      } else {
        // Template not found, redirect to selection page
        toast({
          title: 'Template not found',
          description: 'The selected template could not be found. Please select another template.',
          variant: 'destructive',
        });
        navigate('/will/create');
      }
    }
  }, [templateId, navigate, toast]);

  // Handle saving of will data
  const handleSaveWill = async (data: any) => {
    // Generate will content from the data
    const content = generateWillContent(data, selectedTemplate);
    setWillContent(content);
    
    try {
      // Save as draft
      await createWill({
        title: `${selectedTemplate?.title || 'My'} Will`,
        content,
        status: 'draft',
        document_url: '',
        template_type: selectedTemplate?.id || 'traditional',
        ai_generated: false
      });
      
      toast({
        title: 'Will saved',
        description: 'Your will draft has been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving will:', error);
      toast({
        title: 'Error saving will',
        description: 'There was a problem saving your will. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle will preview
  const handlePreviewWill = (data: any) => {
    const content = generateWillContent(data, selectedTemplate);
    setWillContent(content);
  };

  // Handle will finalization
  const handleFinalizeWill = async (data: any, documents: Document[], videos: VideoRecording[]) => {
    // Generate final will content
    const content = generateWillContent(data, selectedTemplate);
    setWillContent(content);
    setWillData(data);
    
    try {
      // Save as active/finalized will
      const newWill = await createWill({
        title: `${selectedTemplate?.title || 'My'} Will`,
        content,
        status: 'active',
        document_url: '',
        template_type: selectedTemplate?.id || 'traditional',
        ai_generated: false
      });
      
      if (newWill && newWill.id) {
        // Navigate to the will view page
        navigate(`/will/view/${newWill.id}`);
        
        toast({
          title: 'Will finalized',
          description: 'Your will has been finalized successfully.',
        });
      }
    } catch (error) {
      console.error('Error finalizing will:', error);
      toast({
        title: 'Error finalizing will',
        description: 'There was a problem finalizing your will. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Generate will content based on template and form data
  const generateWillContent = (data: any, template: any): string => {
    if (!data || !template) return '';
    
    // Common header
    let content = `LAST WILL AND TESTAMENT OF ${data.personalInfo.fullName.toUpperCase() || '[YOUR NAME]'}\n\n`;
    content += `I, ${data.personalInfo.fullName || '[YOUR NAME]'}, residing at ${data.personalInfo.address || '[YOUR ADDRESS]'}, `;
    content += 'being of sound mind, do hereby make, publish, and declare this to be my Last Will and Testament, ';
    content += 'revoking all previous wills and codicils made by me.\n\n';
    
    // Personal information
    content += 'ARTICLE I: PERSONAL INFORMATION\n';
    content += `I am ${data.personalInfo.maritalStatus || '[MARITAL STATUS]'}`;
    if (data.personalInfo.maritalStatus === 'married' && data.personalInfo.spouseName) {
      content += ` to ${data.personalInfo.spouseName}`;
    }
    content += '.';
    
    if (data.guardians?.childrenNames) {
      content += ` I have the following children: ${data.guardians.childrenNames}.`;
    }
    content += '\n\n';
    
    // Executor appointment
    content += 'ARTICLE II: APPOINTMENT OF EXECUTOR\n';
    content += `I appoint ${data.executors.primaryExecutor || '[PRIMARY EXECUTOR]'} to serve as Executor of my estate.`;
    
    if (data.executors.alternateExecutor) {
      content += ` If ${data.executors.primaryExecutor || '[PRIMARY EXECUTOR]'} is unable or unwilling to serve, `;
      content += `I appoint ${data.executors.alternateExecutor} to serve as alternate Executor.`;
    }
    content += '\n\n';
    
    // Property distribution
    content += 'ARTICLE III: DISTRIBUTION OF PROPERTY\n';
    content += data.beneficiaries.primaryBeneficiaries 
      ? `I give, devise, and bequeath my property as follows: ${data.beneficiaries.primaryBeneficiaries}`
      : 'I give, devise, and bequeath my property as follows: [PRIMARY BENEFICIARIES]';
      
    if (data.beneficiaries.specificBequests) {
      content += `\n\nI make the following specific bequests: ${data.beneficiaries.specificBequests}`;
    }
    content += '\n\n';
    
    // Add guardians if applicable
    if (data.guardians?.primaryGuardian) {
      content += 'ARTICLE IV: GUARDIAN FOR MINOR CHILDREN\n';
      content += `If at my death, any of my children are minors and have no surviving parent, `;
      content += `I appoint ${data.guardians.primaryGuardian} as guardian of the person and property of my minor children.`;
      
      if (data.guardians.alternateGuardian) {
        content += ` If ${data.guardians.primaryGuardian} is unable or unwilling to serve, `;
        content += `I appoint ${data.guardians.alternateGuardian} as alternate guardian.`;
      }
      content += '\n\n';
    }
    
    // Add digital assets if applicable
    if (template.id === 'digital-assets' && data.digitalAssets?.digitalAssetsList) {
      const articleNum = data.guardians?.primaryGuardian ? 'V' : 'IV';
      content += `ARTICLE ${articleNum}: DIGITAL ASSETS\n`;
      content += `My digital assets include: ${data.digitalAssets.digitalAssetsList}\n\n`;
      content += `I direct my Executor regarding my digital assets as follows: ${data.digitalAssets.digitalAssetsInstructions}\n\n`;
    }
    
    // Add final wishes if applicable
    if (data.finalWishes?.funeralInstructions) {
      let articleNum = 'IV';
      if (data.guardians?.primaryGuardian) articleNum = 'V';
      if (template.id === 'digital-assets' && data.digitalAssets?.digitalAssetsList) articleNum = 'VI';
      
      content += `ARTICLE ${articleNum}: FINAL WISHES\n`;
      content += `${data.finalWishes.funeralInstructions}\n\n`;
    }
    
    // Signature block
    content += 'IN WITNESS WHEREOF, I have hereunto set my hand this _____ day of ___________, 20___.\n\n';
    content += `Signed: ${data.personalInfo.fullName || '[NAME]'}\n`;
    content += 'Date: [Current Date]\n';
    content += 'Witnesses: [Witness 1], [Witness 2]';
    
    return content;
  };

  // Back to template selection
  const handleBack = () => {
    navigate('/will/create');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Templates
        </Button>
        
        {!selectedTemplate && (
          <Card>
            <CardContent className="p-8">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Template not found or not selected. Please go back and select a template.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
        
        {selectedTemplate && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <selectedTemplate.icon className={selectedTemplate.iconClassName || 'text-willtank-600'} />
                {selectedTemplate.title} Will Editor
              </CardTitle>
              <CardDescription>
                {selectedTemplate.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <TemplateWillEditor
                templateId={selectedTemplate.id}
                templateName={selectedTemplate.title}
                onSave={handleSaveWill}
                onPreview={handlePreviewWill}
                onFinalize={handleFinalizeWill}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
