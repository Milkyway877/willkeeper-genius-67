
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { templates } from './config/wizardSteps';
import { getWillProgress, WillProgress, saveWillProgress } from '@/services/willProgressService';
import { DocumentWillEditor } from './components/DocumentWillEditor';
import { createWill, updateWill } from '@/services/willService';

export default function TemplateWillCreationPage() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [progress, setProgress] = useState<WillProgress | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      if (!templateId) {
        toast({
          title: "Template Not Found",
          description: "Please select a template to create your will.",
          variant: "destructive"
        });
        navigate('/will/create');
        return;
      }
      
      // Find the selected template
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        toast({
          title: "Invalid Template",
          description: "The selected template was not found.",
          variant: "destructive"
        });
        navigate('/will/create');
        return;
      }
      
      setSelectedTemplate(template);
      
      try {
        // Load any saved progress
        const savedProgress = await getWillProgress(templateId);
        setProgress(savedProgress);
      } catch (error) {
        console.error("Error loading progress:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [templateId]);
  
  const handleBack = () => {
    navigate('/will/create');
  };
  
  const handleSave = async (data: any) => {
    try {
      // Save progress
      if (progress) {
        await saveWillProgress({
          ...progress,
          responses: data,
          updated_at: new Date().toISOString()
        });
      }
      
      // If there's a will ID, update the will
      if (progress?.will_id) {
        await updateWill(progress.will_id, {
          title: `${data.personalInfo?.fullName}'s Will`,
          content: JSON.stringify(data),
        });
      } else {
        // Create a new will
        const willData = {
          title: `${data.personalInfo?.fullName}'s Will`,
          content: JSON.stringify(data),
          status: 'draft' as 'active' | 'draft' | 'completed',
          template_type: templateId || '',
          ai_generated: false,
          document_url: ''
        };
        
        const savedWill = await createWill(willData);
        
        // Update progress with will ID
        if (savedWill && progress) {
          await saveWillProgress({
            ...progress,
            will_id: savedWill.id,
            responses: data
          });
        }
      }
    } catch (error) {
      console.error("Error saving will:", error);
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 min-h-[calc(100vh-64px)] flex flex-col pb-24">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Button variant="ghost" onClick={handleBack} className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Templates
            </Button>
            
            <h1 className="text-2xl md:text-3xl font-bold">{selectedTemplate?.title || 'Create Your Will'}</h1>
            <p className="text-gray-500 mt-1">
              Complete your legal will document with our interactive editor
            </p>
          </div>
        </div>
        
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-willtank-600" />
          </div>
        ) : (
          <div className="flex-1">
            <DocumentWillEditor 
              templateId={templateId || ''} 
              initialData={progress?.responses} 
              willId={progress?.will_id}
              onSave={handleSave}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
