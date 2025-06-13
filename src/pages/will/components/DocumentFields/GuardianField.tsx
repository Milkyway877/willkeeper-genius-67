
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, PlusCircle, Trash2, MessageCircleQuestion } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ContactField } from './ContactField';
import { Guardian } from '../types';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface GuardianFieldProps {
  guardians: Guardian[];
  onUpdate: (guardians: Guardian[]) => void;
  onAiHelp: (field: string, position?: { x: number, y: number }) => void;
  children?: string[]; // List of children's names
}

export function GuardianField({ guardians, onUpdate, onAiHelp, children = [] }: GuardianFieldProps) {
  const [expanded, setExpanded] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  const handleAdd = () => {
    const newGuardian: Guardian = {
      id: `guardian-${Date.now()}`,
      name: '',
      relationship: '',
      email: '',
      phone: '',
      address: '',
      forChildren: children
    };
    onUpdate([...guardians, newGuardian]);
  };
  
  const handleRemove = (id: string) => {
    if (guardians.length <= 1) return;
    onUpdate(guardians.filter(g => g.id !== id));
  };
  
  const handleChange = (id: string, field: keyof Guardian, value: string | string[]) => {
    onUpdate(guardians.map(g => g.id === id ? { ...g, [field]: value } : g));
  };
  
  const handleFieldAiHelp = (id: string, field: string, position: { x: number, y: number }) => {
    onAiHelp(`guardian_${field}`, position);
  };
  
  if (!expanded) {
    const displayValue = guardians.map(g => g.name).filter(name => name).join(', ') || '[Enter guardians]';
    const isEmpty = !guardians.some(g => g.name);
    
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
          Click to edit guardians
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
                  onAiHelp('guardian', { x: e.clientX, y: e.clientY });
                }}
              >
                <MessageCircleQuestion className="h-3 w-3 text-willtank-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Get AI help with guardians</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </span>
    );
  }
  
  return (
    <Card className="mt-4 mb-4">
      <CardContent className="pt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Guardians
          </h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={(e) => onAiHelp('guardian', { x: e.clientX, y: e.clientY })}
                >
                  <MessageCircleQuestion className="h-4 w-4 text-willtank-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Get AI help with guardians</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="space-y-4">
          {guardians.map((guardian, index) => (
            <div key={guardian.id} className="mb-4 p-3 border border-dashed rounded-md">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium">Guardian {index + 1}</h4>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleRemove(guardian.id)}
                  disabled={guardians.length <= 1}
                >
                  <Trash2 className="h-3 w-3 text-red-500" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <ContactField
                  label="Full Name"
                  value={guardian.name}
                  onChange={(value) => handleChange(guardian.id, 'name', value)}
                  placeholder="Full legal name"
                  onAiHelp={(position) => handleFieldAiHelp(guardian.id, 'name', position)}
                />
                
                <ContactField
                  label="Relationship"
                  value={guardian.relationship}
                  onChange={(value) => handleChange(guardian.id, 'relationship', value)}
                  placeholder="e.g. Sibling, Cousin, Friend"
                  tooltipText="Your relationship to this guardian"
                  onAiHelp={(position) => handleFieldAiHelp(guardian.id, 'relationship', position)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <ContactField
                  label="Email Address"
                  value={guardian.email}
                  onChange={(value) => handleChange(guardian.id, 'email', value)}
                  type="email"
                  placeholder="Email address"
                  onAiHelp={(position) => handleFieldAiHelp(guardian.id, 'email', position)}
                />
                
                <ContactField
                  label="Phone Number"
                  value={guardian.phone}
                  onChange={(value) => handleChange(guardian.id, 'phone', value)}
                  type="tel"
                  placeholder="Phone number"
                  onAiHelp={(position) => handleFieldAiHelp(guardian.id, 'phone', position)}
                />
              </div>
              
              <div>
                <ContactField
                  label="Address"
                  value={guardian.address}
                  onChange={(value) => handleChange(guardian.id, 'address', value)}
                  placeholder="Full mailing address"
                  tooltipText="Current mailing address for this guardian"
                  onAiHelp={(position) => handleFieldAiHelp(guardian.id, 'address', position)}
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="mb-4">
          <Label htmlFor="guardian-instructions" className="text-xs">Special Instructions for Guardian(s)</Label>
          <Textarea
            id="guardian-instructions"
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="Add any special instructions for the guardian(s) regarding care for your dependents..."
            className="mt-1 min-h-[100px] text-sm"
          />
        </div>
        
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAdd}
            className="text-xs"
          >
            <PlusCircle className="h-3 w-3 mr-1" />
            Add Guardian
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setExpanded(false)}
            className="text-xs"
          >
            Done
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
