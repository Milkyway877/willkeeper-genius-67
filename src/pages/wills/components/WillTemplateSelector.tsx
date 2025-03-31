
import React, { useState } from 'react';
import { TemplateCard } from '@/pages/will/components/TemplateCard';
import { Scroll, BookTemplate, File, Home, FolderArchive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const templates = [
  {
    id: 'basic',
    title: 'Basic Will',
    description: 'Simple will for individuals with straightforward asset distribution needs.',
    icon: <File className="h-7 w-7 text-willtank-600" />,
    tags: ['Simple', 'Individual'],
    sample: `I, [Your Name], being of sound mind and body, do hereby declare this to be my Last Will and Testament.

I revoke all previous wills and codicils.

I appoint [Executor Name] to be the Executor of this will.

I give all of my property, both real and personal, to [Beneficiary Name].

If [Beneficiary Name] does not survive me, I give all my property to [Alternate Beneficiary].
    `,
  },
  {
    id: 'family',
    title: 'Family Protection Will',
    description: 'Comprehensive will for families with children, including guardianship provisions.',
    icon: <Home className="h-7 w-7 text-willtank-600" />,
    tags: ['Family', 'Guardianship'],
    sample: `I, [Your Name], being of sound mind and body, do hereby declare this to be my Last Will and Testament.

I revoke all previous wills and codicils.

I appoint [Executor Name] to be the Executor of this will.

I appoint [Guardian Name] as the guardian of my minor children.

I establish a trust for my children with [Trustee Name] as trustee.

I give all of my property, both real and personal, to be divided equally among my children when they reach the age of 25.
    `,
  },
  {
    id: 'complex',
    title: 'Complex Estate Will',
    description: 'Advanced will for complex estates, businesses, or significant assets.',
    icon: <FolderArchive className="h-7 w-7 text-willtank-600" />,
    tags: ['Estate', 'Business', 'Advanced'],
    sample: `I, [Your Name], being of sound mind and body, do hereby declare this to be my Last Will and Testament.

I revoke all previous wills and codicils.

I appoint [Executor Name] to be the Executor of this will.

I give my business interests in [Business Name] to [Business Heir].

I establish a trust for my real estate holdings with [Trustee Name] as trustee.

I give specific bequests as follows:
- [Asset 1] to [Recipient 1]
- [Asset 2] to [Recipient 2]

I give the remainder of my estate to be divided equally among [List of Beneficiaries].
    `,
  },
  {
    id: 'custom',
    title: 'Custom AI Will',
    description: 'Create a fully customized will with our AI assistant based on your specific needs.',
    icon: <BookTemplate className="h-7 w-7 text-willtank-600" />,
    tags: ['AI', 'Custom', 'Personalized'],
  },
];

interface WillTemplateSelectorProps {
  onSelectTemplate: (template: any) => void;
}

export default function WillTemplateSelector({ onSelectTemplate }: WillTemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleSelect = (template: any) => {
    setSelectedTemplate(template.id);
    onSelectTemplate(template);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={selectedTemplate === template.id}
            onSelect={() => handleSelect(template)}
          />
        ))}
      </div>
      
      <div className="mt-8 flex justify-between">
        <Button variant="outline" disabled>
          Back
        </Button>
        <Button 
          disabled={!selectedTemplate} 
          onClick={() => {
            const template = templates.find(t => t.id === selectedTemplate);
            if (template) onSelectTemplate(template);
          }}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
