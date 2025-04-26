
import { templates } from '../config/wizardSteps';
import { TemplateCard } from './TemplateCard';

interface WillTemplateSelectionProps {
  selectedTemplate: any;
  onSelect: (template: any) => void;
}

export const WillTemplateSelection = ({ selectedTemplate, onSelect }: WillTemplateSelectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          isSelected={selectedTemplate?.id === template.id}
          onSelect={() => onSelect(template)}
        />
      ))}
    </div>
  );
};
