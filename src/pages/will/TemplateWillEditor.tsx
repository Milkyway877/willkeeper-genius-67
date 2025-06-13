
import React, { useState } from 'react';
import { PersonalInfoSection } from './components/TemplateSections/PersonalInfoSection';
import { BeneficiariesSection } from './components/TemplateSections/BeneficiariesSection';
import { ExecutorsSection } from './components/TemplateSections/ExecutorsSection';
import { AssetsSection } from './components/TemplateSections/AssetsSection';
import { Button } from '@/components/ui/button';
import { Save, FileText } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';

interface TemplateWillEditorProps {
  templateId: string;
  initialData?: any;
  willId?: string;
  onSave: (data: any) => void;
}

export function TemplateWillEditor({ 
  templateId, 
  initialData, 
  willId, 
  onSave 
}: TemplateWillEditorProps) {
  const [saving, setSaving] = useState(false);
  
  const form = useForm({
    defaultValues: initialData || {
      personalInfo: {},
      beneficiaries: [],
      executors: [],
      assets: {}
    }
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = form.getValues();
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormProvider {...form}>
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          <PersonalInfoSection defaultOpen={true} />
          <BeneficiariesSection defaultOpen={false} />
          <ExecutorsSection defaultOpen={false} />
          <AssetsSection defaultOpen={false} />
        </div>
        
        <div className="sticky bottom-0 bg-white border-t border-gray-200 mt-8 pt-4 pb-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {willId ? 'Draft saved automatically' : 'Draft will be created on first save'}
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => window.print()}
              >
                <FileText className="h-4 w-4" />
                Preview
              </Button>
              
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-willtank-600 hover:bg-willtank-700"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Will'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
