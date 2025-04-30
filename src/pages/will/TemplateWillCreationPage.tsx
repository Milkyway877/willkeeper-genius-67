
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { templates } from './config/wizardSteps';
import { getWillProgress, WillProgress } from '@/services/willProgressService';
import { TemplateWillEditor } from './TemplateWillEditor';

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
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <Button variant="ghost" onClick={handleBack} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Templates
            </Button>
            
            <h1 className="text-3xl font-bold">{selectedTemplate?.title || 'Create Your Will'}</h1>
            <p className="text-gray-500 mt-1">
              Complete the form below to create your legal will document
            </p>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-willtank-600" />
          </div>
        ) : (
          <TemplateWillEditor 
            templateId={templateId || ''} 
            initialData={progress?.responses} 
            isNew={!progress?.will_id}
          />
        )}
      </div>
    </Layout>
  );
}
