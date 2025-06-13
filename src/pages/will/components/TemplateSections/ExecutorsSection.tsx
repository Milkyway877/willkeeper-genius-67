
import React, { useState } from 'react';
import { TemplateWillSection } from '@/components/will/TemplateWillSection';
import { InfoField } from '@/components/will/InfoField';
import { UserCog, PlusCircle, Trash2, MessageCircleQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Grid, GridItem } from '@/components/ui/grid';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ExecutorsSectionProps {
  defaultOpen?: boolean;
}

interface Executor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  isPrimary: boolean;
}

export function ExecutorsSection({ defaultOpen = false }: ExecutorsSectionProps) {
  const [executors, setExecutors] = useState<Executor[]>([
    { id: '1', name: '', email: '', phone: '', address: '', isPrimary: true }
  ]);
  const [expanded, setExpanded] = useState(defaultOpen);

  const addExecutor = () => {
    setExecutors([
      ...executors,
      { 
        id: `executor-${Date.now()}`, 
        name: '', 
        email: '', 
        phone: '', 
        address: '', 
        isPrimary: false
      }
    ]);
  };

  const removeExecutor = (id: string) => {
    if (executors.length <= 1) return;
    setExecutors(executors.filter(exec => exec.id !== id));
  };

  const setPrimaryExecutor = (id: string) => {
    setExecutors(executors.map(exec => ({
      ...exec,
      isPrimary: exec.id === id
    })));
  };

  const handleAiHelp = (field: string, position: { x: number, y: number }) => {
    // AI help functionality - placeholder
    console.log('AI help requested for:', field, position);
  };

  if (!expanded) {
    const displayValue = executors.map(e => e.name).filter(name => name).join(', ') || '[Enter executors]';
    const isEmpty = !executors.some(e => e.name);
    
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
          Click to edit executors
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
                  handleAiHelp('executor', { x: e.clientX, y: e.clientY });
                }}
              >
                <MessageCircleQuestion className="h-3 w-3 text-willtank-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Get AI help with executors</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </span>
    );
  }

  return (
    <TemplateWillSection 
      title="Executors" 
      description="People who will carry out the instructions in your will"
      defaultOpen={defaultOpen}
      icon={<UserCog className="h-5 w-5" />}
    >
      <p className="mb-4 text-sm text-willtank-600">
        An executor is responsible for carrying out your wishes as expressed in your will. 
        You can name one or more executors to act together or as alternates.
      </p>

      {executors.map((executor, index) => (
        <Card key={executor.id} className="mb-4 relative border-dashed">
          <CardContent className="pt-6">
            <div className="absolute top-2 right-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => removeExecutor(executor.id)}
                disabled={executors.length <= 1}
                className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>

            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-medium">Executor {index + 1}</p>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id={`primary-${executor.id}`}
                  checked={executor.isPrimary}
                  onCheckedChange={() => setPrimaryExecutor(executor.id)}
                />
                <Label htmlFor={`primary-${executor.id}`}>Primary Executor</Label>
              </div>
            </div>
            
            <Grid cols={2} gap={4} className="mb-4">
              <GridItem>
                <InfoField
                  label="Full Name"
                  name={`executors[${index}].name`}
                  tooltipText="Legal full name of the executor"
                  placeholder="e.g. John Smith"
                  required
                />
              </GridItem>
              <GridItem>
                <InfoField
                  label="Email Address"
                  name={`executors[${index}].email`}
                  tooltipText="Contact email for this executor"
                  type="email"
                  placeholder="their@email.com"
                  required
                />
              </GridItem>
            </Grid>

            <Grid cols={2} gap={4} className="mb-4">
              <GridItem>
                <InfoField
                  label="Phone Number"
                  name={`executors[${index}].phone`}
                  tooltipText="Contact phone number for this executor"
                  placeholder="(123) 456-7890"
                />
              </GridItem>
              <GridItem>
                <InfoField
                  label="Relationship"
                  name={`executors[${index}].relationship`}
                  tooltipText="Your relationship to this person (e.g. spouse, child, sibling, friend)"
                  placeholder="e.g. Sister"
                />
              </GridItem>
            </Grid>

            <InfoField
              label="Address"
              name={`executors[${index}].address`}
              tooltipText="Current mailing address for this executor"
              placeholder="Street address, city, state, zip code"
            />
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          className="w-full mt-2" 
          onClick={addExecutor} 
          type="button"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Alternate Executor
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
