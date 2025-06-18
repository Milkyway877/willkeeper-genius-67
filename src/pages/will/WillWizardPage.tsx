
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

  const handleWillCreated = async (newWill: Will) => {
    try {
      // Clear any saved progress
      await clearWillProgress(newWill.id);
      
      // Store the newly created will ID for highlighting in dashboard
      sessionStorage.setItem('newlyCreatedWill', newWill.id);
      
      // Show success modal
      setCreatedWill(newWill);
      setShowSuccess(true);
      
      toast({
        title: "Will Created Successfully!",
        description: "Your will has been created and saved.",
      });
      
    } catch (error) {
      console.error('Error handling will creation:', error);
      toast({
        title: "Error",
        description: "There was a problem processing your will creation.",
        variant: "destructive"
      });
    }
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
              <CardTitle>Create Your Will</CardTitle>
            </CardHeader>
            <CardContent>
              <WillWizard />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
