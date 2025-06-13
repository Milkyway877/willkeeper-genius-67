
import React, { useState } from 'react';
import { TemplateWillSection } from '@/components/will/TemplateWillSection';
import { InfoField } from '@/components/will/InfoField';
import { Home, Car, Landmark, Laptop, PlusCircle, MessageCircleQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentsUploader } from '@/pages/will/components/DocumentsUploader';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AssetsSectionProps {
  defaultOpen?: boolean;
  contacts?: any[];
  responses?: Record<string, any>;
}

export function AssetsSection({ defaultOpen = false, contacts = [], responses = {} }: AssetsSectionProps) {
  const [expanded, setExpanded] = useState(defaultOpen);
  
  const handleDocumentsComplete = (documents: any[]) => {
    console.log('Documents uploaded:', documents);
    // This would update the form state with the uploaded documents
  };

  const handleAiHelp = (field: string, position: { x: number, y: number }) => {
    // AI help functionality - placeholder
    console.log('AI help requested for:', field, position);
  };

  if (!expanded) {
    // Check if any asset fields have values from responses
    const hasAssets = responses?.primaryResidence || responses?.vehicleDescription || responses?.accountType || responses?.digitalAssetDescription;
    const displayValue = hasAssets ? 'Assets added' : '[Enter assets]';
    const isEmpty = !hasAssets;
    
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
          Click to edit assets
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
                  handleAiHelp('assets', { x: e.clientX, y: e.clientY });
                }}
              >
                <MessageCircleQuestion className="h-3 w-3 text-willtank-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Get AI help with assets</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </span>
    );
  }

  return (
    <TemplateWillSection 
      title="Assets & Property" 
      description="Your properties, vehicles, financial accounts, and other valuable possessions"
      defaultOpen={defaultOpen}
      icon={<Home className="h-5 w-5" />}
    >
      <p className="mb-4 text-sm text-willtank-600">
        List your major assets that should be included in your will. You can upload supporting documentation.
      </p>

      <Tabs defaultValue="property" className="mb-6">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="property" className="flex items-center gap-2">
            <Home className="h-4 w-4" /> Property
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="flex items-center gap-2">
            <Car className="h-4 w-4" /> Vehicles
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <Landmark className="h-4 w-4" /> Financial
          </TabsTrigger>
          <TabsTrigger value="digital" className="flex items-center gap-2">
            <Laptop className="h-4 w-4" /> Digital
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="property" className="space-y-4">
          <InfoField
            label="Primary Residence"
            name="primaryResidence"
            tooltipText="The address of your primary home"
            placeholder="Full address of your home"
          />
          <InfoField
            label="Ownership Details"
            name="propertyOwnershipDetails"
            tooltipText="How is this property owned? (e.g., sole ownership, joint tenancy, etc.)"
            placeholder="e.g., Sole ownership"
          />
          <InfoField
            label="Approximate Value"
            name="propertyValue"
            tooltipText="Current estimated value of the property"
            placeholder="e.g., $300,000"
          />
          <Button variant="outline" className="w-full" type="button">
            <PlusCircle className="h-4 w-4 mr-2" /> Add Another Property
          </Button>
        </TabsContent>
        
        <TabsContent value="vehicles" className="space-y-4">
          <InfoField
            label="Vehicle Description"
            name="vehicleDescription"
            tooltipText="Make, model and year of your vehicle"
            placeholder="e.g., 2020 Toyota Camry"
          />
          <InfoField
            label="Registration Number"
            name="vehicleRegistration"
            tooltipText="Vehicle registration/license plate number"
            placeholder="e.g., ABC123"
          />
          <InfoField
            label="Approximate Value"
            name="vehicleValue"
            tooltipText="Current estimated value of the vehicle"
            placeholder="e.g., $15,000"
          />
          <Button variant="outline" className="w-full" type="button">
            <PlusCircle className="h-4 w-4 mr-2" /> Add Another Vehicle
          </Button>
        </TabsContent>
        
        <TabsContent value="financial" className="space-y-4">
          <InfoField
            label="Account Type"
            name="accountType"
            tooltipText="Type of financial account (e.g., checking, savings, investment)"
            placeholder="e.g., Checking Account"
          />
          <InfoField
            label="Institution Name"
            name="institutionName"
            tooltipText="Name of the bank or financial institution"
            placeholder="e.g., Bank of America"
          />
          <InfoField
            label="Account Number (last 4 digits)"
            name="accountNumber"
            tooltipText="For identification purposes only"
            placeholder="e.g., xxxx1234"
          />
          <Button variant="outline" className="w-full" type="button">
            <PlusCircle className="h-4 w-4 mr-2" /> Add Another Financial Asset
          </Button>
        </TabsContent>
        
        <TabsContent value="digital" className="space-y-4">
          <InfoField
            label="Digital Asset Description"
            name="digitalAssetDescription"
            tooltipText="Description of digital asset (e.g., cryptocurrency, domain names, online accounts)"
            placeholder="e.g., Bitcoin holdings"
          />
          <InfoField
            label="Access Information"
            name="digitalAssetAccess"
            tooltipText="Where can your executor find access information (don't include actual passwords)"
            placeholder="e.g., Information in password manager"
          />
          <InfoField
            label="Approximate Value"
            name="digitalAssetValue"
            tooltipText="Current estimated value if applicable"
            placeholder="e.g., $5,000"
          />
          <Button variant="outline" className="w-full" type="button">
            <PlusCircle className="h-4 w-4 mr-2" /> Add Another Digital Asset
          </Button>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Supporting Documents</h3>
        <DocumentsUploader 
          contacts={contacts} 
          responses={responses} 
          onComplete={handleDocumentsComplete} 
        />
      </div>
      
      <div className="flex justify-end mt-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setExpanded(false)}
          className="text-xs"
        >
          Done
        </Button>
      </div>
    </TemplateWillSection>
  );
}
