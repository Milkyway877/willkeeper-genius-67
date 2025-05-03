
import React from 'react';
import { templates } from '@/pages/will/config/wizardSteps';

interface TemplateWillHeaderProps {
  templateId: string;
}

export const TemplateWillHeader: React.FC<TemplateWillHeaderProps> = ({ templateId }) => {
  const template = templates.find(t => t.id === templateId);

  if (!template) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-willtank-50 to-amber-50 border border-willtank-100 rounded-lg p-4 mb-6">
      <h2 className="font-medium text-lg text-willtank-800">{template.title}</h2>
      <p className="text-willtank-600 text-sm mt-1">{template.description}</p>
      {template.features && template.features.length > 0 && (
        <ul className="mt-3 space-y-1">
          {template.features.map((feature, index) => (
            <li key={index} className="flex items-start text-sm">
              <span className="inline-block w-4 h-4 mr-2 text-willtank-600">•</span>
              <span className="text-willtank-700">{feature}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
