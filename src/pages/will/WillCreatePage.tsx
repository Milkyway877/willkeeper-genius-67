
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Check, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { templates } from './config/wizardSteps';
import { motion } from 'framer-motion';

export default function WillCreatePage() {
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
  };

  const handleContinue = () => {
    if (!selectedTemplate) {
      toast({
        title: "Template Required",
        description: "Please select a template to continue.",
        variant: "destructive"
      });
      return;
    }
    
    // Navigate to the document-based will creation page with the selected template
    navigate(`/will/template-creation/${selectedTemplate.id}`);
    
    toast({
      title: "Template Selected",
      description: `You've selected the ${selectedTemplate.title} template.`,
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Your Will</h1>
          <p className="text-gray-500">Select a template that fits your needs</p>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select a Will Template</CardTitle>
            <CardDescription>
              Choose the template that best suits your situation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className={cn(
                      "border p-6 rounded-lg cursor-pointer transition-all",
                      selectedTemplate?.id === template.id
                        ? "border-willtank-600 bg-willtank-50"
                        : "hover:border-willtank-300"
                    )}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <div className={cn("p-2 rounded-full", "bg-blue-100")}>
                          {template.icon ? (
                            <template.icon className={cn("h-5 w-5", template.iconClassName || "text-blue-600")} />
                          ) : (
                            <div className="h-5 w-5" />
                          )}
                        </div>
                        <h3 className="ml-3 font-medium">{template.title}</h3>
                      </div>
                      {selectedTemplate?.id === template.id && (
                        <div className="h-6 w-6 bg-willtank-600 rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    {template.tags && template.tags.length > 0 && (
                      <Badge variant="outline" className="bg-willtank-50 text-willtank-700 border-willtank-200">
                        {template.tags[0]}
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8 flex justify-end">
              <Button 
                onClick={handleContinue}
                disabled={!selectedTemplate}
                className="px-6"
              >
                Continue to Document Editor
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
