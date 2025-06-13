
import React, { useState } from 'react';
import { TemplateWillSection } from '@/components/will/TemplateWillSection';
import { InfoField } from '@/components/will/InfoField';
import { Users, PlusCircle, Trash2, MessageCircleQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Grid, GridItem } from '@/components/ui/grid';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BeneficiariesSectionProps {
  defaultOpen?: boolean;
}

interface Beneficiary {
  id: string;
  name: string;
  relationship: string;
  email: string;
  phone: string;
  address: string;
  percentage: number;
}

export function BeneficiariesSection({ defaultOpen = false }: BeneficiariesSectionProps) {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([
    { id: '1', name: '', relationship: '', email: '', phone: '', address: '', percentage: 0 }
  ]);
  const [expanded, setExpanded] = useState(defaultOpen);

  const addBeneficiary = () => {
    setBeneficiaries([
      ...beneficiaries,
      { 
        id: `beneficiary-${Date.now()}`, 
        name: '', 
        relationship: '', 
        email: '', 
        phone: '', 
        address: '', 
        percentage: 0 
      }
    ]);
  };

  const removeBeneficiary = (id: string) => {
    if (beneficiaries.length <= 1) return;
    setBeneficiaries(beneficiaries.filter(b => b.id !== id));
  };

  const handleAiHelp = (field: string, position: { x: number, y: number }) => {
    // AI help functionality - placeholder
    console.log('AI help requested for:', field, position);
  };

  if (!expanded) {
    const displayValue = beneficiaries.map(b => b.name).filter(name => name).join(', ') || '[Enter beneficiaries]';
    const isEmpty = !beneficiaries.some(b => b.name);
    
    return (
      <span 
        className={`group cursor-pointer inline-flex items-center relative
          ${isEmpty 
            ? 'bg-amber-100 border-b-2 border-dashed border-amber-400 text-amber-800 px-2 py-1 rounded-sm hover:bg-amber-200 transition-colors' 
            : 'hover:bg-gray-100 px-1 rounded border-b border-gray-200 hover:border-gray-400'}`}
        onClick={() => setExpanded(true)}
      >
        {displayValue}
        <span className="absolute -top-5 left-0 text-[10px] bg-amber-50 text-amber-700 font-medium px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity border border-amber-200 shadow-sm whitespace-nowrap">
          Click to edit beneficiaries
        </span>
        {isEmpty && (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 text-amber-500 group-hover:animate-pulse">
            <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
            <path d="m15 5 4 4"></path>
          </svg>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 inline-flex ml-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAiHelp('beneficiary', { x: e.clientX, y: e.clientY });
                }}
              >
                <MessageCircleQuestion className="h-3 w-3 text-willtank-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Get AI help with beneficiaries</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </span>
    );
  }

  return (
    <TemplateWillSection 
      title="Beneficiaries" 
      description="People who will receive your assets"
      defaultOpen={defaultOpen}
      icon={<Users className="h-5 w-5" />}
    >
      <p className="mb-4 text-sm text-willtank-600">
        Add the people who will inherit your assets. You can add multiple beneficiaries.
      </p>

      {beneficiaries.map((beneficiary, index) => (
        <Card key={beneficiary.id} className="mb-4 relative border-dashed">
          <CardContent className="pt-6">
            <div className="absolute top-2 right-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => removeBeneficiary(beneficiary.id)}
                disabled={beneficiaries.length <= 1}
                className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>

            <p className="text-sm font-medium mb-4">Beneficiary {index + 1}</p>
            
            <Grid cols={2} gap={4} className="mb-4">
              <GridItem>
                <InfoField
                  label="Full Name"
                  name={`beneficiaries[${index}].name`}
                  tooltipText="Legal full name of the beneficiary"
                  placeholder="e.g. Jane Smith"
                  required
                />
              </GridItem>
              <GridItem>
                <InfoField
                  label="Relationship"
                  name={`beneficiaries[${index}].relationship`}
                  tooltipText="Your relationship to this person (e.g. spouse, child, sibling, friend)"
                  placeholder="e.g. Spouse"
                  required
                />
              </GridItem>
            </Grid>

            <Grid cols={2} gap={4} className="mb-4">
              <GridItem>
                <InfoField
                  label="Email Address"
                  name={`beneficiaries[${index}].email`}
                  tooltipText="Contact email for this beneficiary"
                  type="email"
                  placeholder="their@email.com"
                />
              </GridItem>
              <GridItem>
                <InfoField
                  label="Phone Number"
                  name={`beneficiaries[${index}].phone`}
                  tooltipText="Contact phone number for this beneficiary"
                  placeholder="(123) 456-7890"
                />
              </GridItem>
            </Grid>

            <InfoField
              label="Address"
              name={`beneficiaries[${index}].address`}
              tooltipText="Current mailing address for this beneficiary"
              placeholder="Street address, city, state, zip code"
              className="mb-4"
            />

            <InfoField
              label="Percentage of Estate"
              name={`beneficiaries[${index}].percentage`}
              tooltipText="What percentage of your residual estate should this beneficiary receive"
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder="e.g. 50"
              description="Enter a value between 0 and 100. The total for all beneficiaries should equal 100%."
            />
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          className="w-full mt-2" 
          onClick={addBeneficiary} 
          type="button"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Another Beneficiary
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setExpanded(false)}
          className="text-xs ml-4"
        >
          Done
        </Button>
      </div>
    </TemplateWillSection>
  );
}
