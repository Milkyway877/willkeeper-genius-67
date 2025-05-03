
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
    return (
      <div className="relative group">
        <span 
          className="cursor-pointer border-b border-dashed border-gray-300 hover:border-willtank-400 px-1"
          onClick={() => setExpanded(true)}
        >
          {guardians.map(g => g.name).join(', ') || 'Guardian(s)'}
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
      </div>
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
