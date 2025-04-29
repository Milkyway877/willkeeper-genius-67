
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, FileText, Book, Scale, Users, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

// Template data structure
interface WillTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  iconColor: string;
  detailedDescription: string;
  forWhom: string[];
  benefits: string[];
  features: string[];
  legalConsiderations: string[];
  popularityBadge?: string;
}

// Will template data
const willTemplates: WillTemplate[] = [
  {
    id: 'basic',
    name: 'Basic Will',
    description: 'A simple will for individuals with straightforward assets and beneficiaries.',
    icon: FileText,
    iconColor: 'text-blue-600',
    popularityBadge: 'Most Popular',
    detailedDescription: 'The Basic Will is designed for individuals with straightforward estates who want to ensure their assets are distributed according to their wishes. This template covers all essential aspects of a legally sound will while keeping things simple.',
    forWhom: [
      'Individuals with straightforward assets',
      'People with clear beneficiary intentions',
      'Those without complex family situations',
      'First-time will creators'
    ],
    benefits: [
      'Quick to complete',
      'Legally binding document',
      'Peace of mind for you and your loved ones',
      'Clear instructions for asset distribution'
    ],
    features: [
      'Asset inventory and allocation',
      'Beneficiary designation',
      'Executor appointment',
      'Guardianship provisions for dependents',
      'Final wishes documentation'
    ],
    legalConsiderations: [
      'Valid in all 50 states with proper execution',
      'Requires proper witnessing and notarization',
      'Should be updated after major life events'
    ]
  },
  {
    id: 'family',
    name: 'Family Protection Will',
    description: 'Comprehensive protection for families with children and complex asset distribution needs.',
    icon: Users,
    iconColor: 'text-green-600',
    detailedDescription: 'The Family Protection Will provides comprehensive coverage for families, with special attention to guardian arrangements, trust provisions for minors, and detailed distribution plans for family assets.',
    forWhom: [
      'Parents with minor children',
      'Blended families',
      'Individuals with specific guardian preferences',
      'Those with special needs dependents'
    ],
    benefits: [
      'Guardianship clarity for minor children',
      'Protection for vulnerable family members',
      'Clear inheritance structures for blended families',
      'Provisions for education and care'
    ],
    features: [
      'Guardian designation with alternatives',
      'Trust provisions for minors',
      'Specific asset distribution to family members',
      'Educational fund provisions',
      'Family heirloom allocation'
    ],
    legalConsiderations: [
      'Guardianship clauses require careful consideration',
      'May benefit from supplemental trust documents',
      'Should be updated as family circumstances change'
    ]
  },
  {
    id: 'business',
    name: 'Business Owner Will',
    description: 'Specialized will for entrepreneurs and business owners to protect business assets and succession.',
    icon: Briefcase,
    iconColor: 'text-purple-600',
    detailedDescription: 'The Business Owner Will addresses the unique needs of entrepreneurs and business owners, focusing on business succession planning, asset protection, and ensuring business continuity after death.',
    forWhom: [
      'Small business owners',
      'Partners in businesses',
      'Freelancers with intellectual property',
      'Those with business assets to protect'
    ],
    benefits: [
      'Business continuity planning',
      'Protection of business assets',
      'Clear succession guidelines',
      'Integration with business agreements'
    ],
    features: [
      'Business succession planning',
      'Partnership interest transfer provisions',
      'Intellectual property assignment',
      'Key business asset distribution',
      'Buy-sell agreement coordination'
    ],
    legalConsiderations: [
      'Should align with any existing business agreements',
      'May require coordination with business partners',
      'Consider tax implications for business transfers'
    ]
  },
  {
    id: 'complex',
    name: 'Complex Estate Will',
    description: 'For individuals with substantial assets, multiple properties, investments, and complex distribution wishes.',
    icon: Scale,
    iconColor: 'text-amber-600',
    detailedDescription: 'The Complex Estate Will is designed for individuals with substantial assets and complex distribution needs. It includes detailed provisions for multiple properties, investments, trusts, and tax considerations.',
    forWhom: [
      'Individuals with substantial assets',
      'Those with multiple properties or investments',
      'People with complex distribution wishes',
      'Individuals concerned about estate taxes'
    ],
    benefits: [
      'Comprehensive asset protection',
      'Tax optimization strategies',
      'Detailed distribution planning',
      'Protection against estate challenges'
    ],
    features: [
      'Detailed inventory of extensive assets',
      'Multiple trust provisions',
      'Tax planning strategies',
      'Charitable giving instructions',
      'International asset considerations'
    ],
    legalConsiderations: [
      'May require coordination with financial advisors',
      'Consider estate tax implications',
      'May benefit from additional trust documents',
      'Regular updates recommended as assets change'
    ]
  },
  {
    id: 'living',
    name: 'Living Will & Healthcare Directives',
    description: 'Focus on healthcare decisions, end-of-life care preferences, and medical power of attorney.',
    icon: Book,
    iconColor: 'text-red-600',
    detailedDescription: 'The Living Will & Healthcare Directives template focuses on your medical and end-of-life care preferences, ensuring your healthcare decisions are respected even if you become unable to communicate them.',
    forWhom: [
      'Anyone concerned about future medical decisions',
      'Individuals with specific healthcare preferences',
      'People with existing medical conditions',
      'Those wanting to ease burden on family during medical crises'
    ],
    benefits: [
      'Peace of mind for healthcare decisions',
      'Reduced family burden during medical emergencies',
      'Ensures your medical preferences are followed',
      'Provides clear guidance to healthcare providers'
    ],
    features: [
      'Medical power of attorney designation',
      'Specific end-of-life care preferences',
      'Organ donation wishes',
      'Pain management preferences',
      'Life-sustaining treatment directives'
    ],
    legalConsiderations: [
      'Should be shared with healthcare providers',
      'Copies should be easily accessible to family members',
      'Regular updates as medical conditions or preferences change',
      'May require additional forms depending on state laws'
    ]
  }
];

export default function WillCreatePage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  const handleUseTemplate = (templateId: string) => {
    // Save selected template without navigating
    localStorage.setItem('selectedWillTemplate', templateId);
    setSelectedTemplate(templateId);
    
    // Show success notification
    toast({
      title: "Template Selected",
      description: `Your template has been saved. You'll be able to continue creating your will soon.`,
      variant: "default",
    });
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Select a Will Template</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the template that best fits your needs. Each template is designed for specific situations
            and can be customized to your requirements.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {willTemplates.map((template) => (
            <TemplateCard 
              key={template.id}
              template={template}
              isSelected={selectedTemplate === template.id}
              onSelect={() => setSelectedTemplate(template.id)}
              onUseTemplate={handleUseTemplate}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}

interface TemplateCardProps {
  template: WillTemplate;
  isSelected: boolean;
  onSelect: () => void;
  onUseTemplate: (templateId: string) => void;
}

function TemplateCard({ template, isSelected, onSelect, onUseTemplate }: TemplateCardProps) {
  const Icon = template.icon;
  
  return (
    <Card 
      className={cn(
        "transition-all duration-200 hover:shadow-md cursor-pointer overflow-hidden relative border-2",
        isSelected ? "border-purple-600 shadow-lg" : "border-gray-200 dark:border-gray-800"
      )}
      onClick={onSelect}
    >
      {template.popularityBadge && (
        <div className="absolute top-0 right-0">
          <Badge className="bg-purple-100 text-purple-800 border-purple-200 m-2">
            {template.popularityBadge}
          </Badge>
        </div>
      )}
      
      <CardContent className="p-5 flex flex-col h-full">
        <div className="mb-4 flex items-center">
          <div className={cn("p-3 rounded-md mr-3", `bg-${template.iconColor.split('-')[1]}-50`)}>
            <Icon className={cn("h-6 w-6", template.iconColor)} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{template.name}</h3>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">{template.description}</p>
        
        <div className="text-sm text-muted-foreground mb-2">
          <p className="font-medium mb-1">Best for:</p>
          <ul className="list-disc pl-5 space-y-1">
            {template.forWhom.slice(0, 2).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
        
        <div className="mt-auto pt-4 flex flex-col gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                Learn More
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Icon className={cn("h-5 w-5", template.iconColor)} />
                  {template.name}
                </DialogTitle>
                <DialogDescription>
                  {template.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">About this Template</h3>
                  <p>{template.detailedDescription}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">Who is this for?</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {template.forWhom.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">Key Features</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {template.features.map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">Benefits</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {template.benefits.map((benefit, i) => (
                      <li key={i}>{benefit}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">Legal Considerations</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {template.legalConsiderations.map((consideration, i) => (
                      <li key={i}>{consideration}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={() => onUseTemplate(template.id)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Use This Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onUseTemplate(template.id);
            }}
            className={cn(
              "w-full",
              isSelected ? "bg-purple-600 hover:bg-purple-700" : ""
            )}
          >
            {isSelected && <Check className="mr-2 h-4 w-4" />}
            Use Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
