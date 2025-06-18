
import { useState, useEffect } from 'react';
import { templates } from '@/pages/will/config/wizardSteps';

export interface WillTemplate {
  id: string;
  title: string;
  description: string;
}

export function useWillTemplates() {
  const [willTemplates, setWillTemplates] = useState<WillTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Convert wizard templates to will templates format
    const convertedTemplates: WillTemplate[] = templates.map(template => ({
      id: template.id,
      title: template.title,
      description: template.description
    }));
    
    setWillTemplates(convertedTemplates);
    setLoading(false);
  }, []);

  return {
    templates: willTemplates,
    loading
  };
}
