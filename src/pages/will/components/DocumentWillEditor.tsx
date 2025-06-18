import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Users, 
  Building2, 
  Heart, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft,
  ArrowRight,
  Save,
  Eye,
  Video,
  Upload
} from 'lucide-react';

import { PersonalInfoSection } from './TemplateSections/PersonalInfoSection';
import { BeneficiariesSection } from './TemplateSections/BeneficiariesSection';
import { AssetsSection } from './TemplateSections/AssetsSection';
import { ExecutorsSection } from './TemplateSections/ExecutorsSection';
import { FinalWishesSection } from './TemplateSections/FinalWishesSection';
import { VideoTestamentInfo } from './TemplateSections/DigitalSignature';
import { WillPreview } from './WillPreview';

import { generateWillContent } from '@/utils/willTemplateUtils';
import { createWill } from '@/services/willService';
import { useWillTemplates } from '@/hooks/useWillTemplates';

interface WillResponses {
  fullName?: string;
  dateOfBirth?: string;
  homeAddress?: string;
  email?: string;
  phoneNumber?: string;
  beneficiaries?: Array<{
    name: string;
    relationship: string;
    percentage: number;
  }>;
  executors?: Array<{
    name: string;
    relationship: string;
    isPrimary?: boolean;
  }>;
  assets?: string;
  funeralPreferences?: string;
  memorialService?: string;
  charitableDonations?: string;
  specialInstructions?: string;
  personal_info_completed?: boolean;
  beneficiaries_completed?: boolean;
  executors_completed?: boolean;
  assets_completed?: boolean;
  final_wishes_completed?: boolean;
}

export default function DocumentWillEditor() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { templates } = useWillTemplates();

  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [responses, setResponses] = useState<WillResponses>({});
  const [isComplete, setIsComplete] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [editableContent, setEditableContent] = useState('');
  const [splitView, setSplitView] = useState(false);

  useEffect(() => {
    if (templateId && templates.length > 0) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);
        setEditableContent(''); // Initialize with empty content since templates don't have content property
      }
    }
  }, [templateId, templates]);

  useEffect(() => {
    const checkCompletion = () => {
      const hasPersonalInfo = responses.fullName && responses.dateOfBirth;
      const hasBeneficiaries = responses.beneficiaries && responses.beneficiaries.length > 0;
      const hasExecutors = responses.executors && responses.executors.length > 0;
      
      setIsComplete(!!(hasPersonalInfo && hasBeneficiaries && hasExecutors));
    };

    checkCompletion();
  }, [responses]);

  const handleResponseChange = (section: string, data: any) => {
    setResponses(prev => ({
      ...prev,
      [section]: data,
      [`${section}_completed`]: true
    }));

    // Update the will content when responses change
    const newContent = generateWillContent({ ...responses, [section]: data }, editableContent);
    setEditableContent(newContent);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableContent(e.target.value);
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editableContent);
      toast({
        title: "Copied to clipboard",
        description: "Will content has been copied to your clipboard"
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleGenerateOfficialWill = async () => {
    if (!isComplete) {
      toast({
        title: "Please complete all required sections",
        description: "Fill in personal information, beneficiaries, and executors before finalizing.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsGenerating(true);
      setProgress(0);

      // Simulate progress steps
      const progressSteps = [
        { value: 20, message: "Generating will document..." },
        { value: 50, message: "Processing beneficiary information..." },
        { value: 70, message: "Adding executor details..." },
        { value: 90, message: "Finalizing document..." },
        { value: 100, message: "Will created successfully!" }
      ];

      for (const step of progressSteps) {
        setProgress(step.value);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      const willData = {
        title: `${responses.fullName || 'My'} Will`,
        content: JSON.stringify({
          responses,
          textContent: editableContent,
          template: selectedTemplate
        }),
        status: 'active',
        template_type: templateId || 'standard',
        ai_generated: false,
        document_url: ''
      };

      const savedWill = await createWill(willData);

      if (savedWill?.id) {
        toast({
          title: "Will Created Successfully!",
          description: "Your will has been generated. Next step: Record your video testament.",
        });

        // Navigate to video recording
        navigate(`/will/video-creation/${savedWill.id}`, {
          state: { willId: savedWill.id, willTitle: willData.title }
        });
      }

    } catch (error) {
      console.error('Error generating will:', error);
      toast({
        title: "Generation Failed",
        description: "There was an error creating your will. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!selectedTemplate) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  const sections = [
    { id: 'personal', title: 'Personal Information', icon: FileText, completed: !!responses.personal_info_completed },
    { id: 'beneficiaries', title: 'Beneficiaries', icon: Users, completed: !!responses.beneficiaries_completed },
    { id: 'executors', title: 'Executors', icon: Building2, completed: !!responses.executors_completed },
    { id: 'assets', title: 'Assets & Bequests', icon: Building2, completed: !!responses.assets_completed },
    { id: 'wishes', title: 'Final Wishes', icon: Heart, completed: !!responses.final_wishes_completed }
  ];

  const completedSections = sections.filter(s => s.completed).length;
  const completionPercentage = Math.round((completedSections / sections.length) * 100);

  return (
    <Layout>
      <div className="container mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/will/templates')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Templates
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{selectedTemplate.title}</h1>
              <p className="text-gray-600 mt-1">{selectedTemplate.description}</p>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-500">Progress</div>
              <div className="flex items-center gap-2">
                <Progress value={completionPercentage} className="w-20" />
                <span className="text-sm font-medium">{completionPercentage}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <PersonalInfoSection 
              defaultOpen={true}
            />
            
            <BeneficiariesSection />
            
            <ExecutorsSection />
            
            <AssetsSection />
            
            <FinalWishesSection />

            <VideoTestamentInfo defaultOpen={false} />

            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <Video className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-900">Next Steps After Finalization</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/80 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center mb-2">
                      <Video className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="font-medium text-blue-900">1. Record Video Testament</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      Record your personal video testament through our secure platform for authenticity.
                    </p>
                  </div>
                  
                  <div className="bg-white/80 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center mb-2">
                      <Upload className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="font-medium text-blue-900">2. Upload Documents</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      Upload supporting documents like property deeds and financial statements.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Eye className="mr-2 h-5 w-5" />
                    Will Preview
                  </CardTitle>
                  <CardDescription>
                    Live preview of your will document
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-80 overflow-y-auto border rounded p-3 bg-gray-50 text-xs">
                    <WillPreview content={editableContent} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <Button 
                      onClick={handleGenerateOfficialWill}
                      className="w-full"
                      size="lg"
                      disabled={!isComplete || isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Will...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Finalize Will
                        </>
                      )}
                    </Button>

                    {isGenerating && (
                      <div className="space-y-2">
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-gray-500 text-center">
                          {progress < 30 && "Generating your will document..."}
                          {progress >= 30 && "Processing beneficiary information..."}
                          {progress >= 60 && progress < 90 && "Adding executor details..."}
                          {progress >= 90 && "Finalizing document..."}
                        </p>
                      </div>
                    )}

                    {!isComplete && (
                      <p className="text-xs text-gray-500 text-center">
                        Complete all required sections to finalize your will
                      </p>
                    )}

                    {isComplete && !isGenerating && (
                      <p className="text-xs text-green-600 text-center font-medium">
                        ✓ Ready to finalize - Video testament recording next
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
