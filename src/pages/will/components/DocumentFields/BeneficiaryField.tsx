import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Users, PlusCircle, Trash2, MessageCircleQuestion } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ContactField } from './ContactField';
import { Beneficiary } from '../types';

interface BeneficiaryFieldProps {
  beneficiaries: Beneficiary[];
  onUpdate: (beneficiaries: Beneficiary[]) => void;
  onAiHelp: (field: string, position?: { x: number, y: number }) => void;
}

export function BeneficiaryField({ beneficiaries, onUpdate, onAiHelp }: BeneficiaryFieldProps) {
  const [expanded, setExpanded] = useState(false);
  
  const handleAdd = () => {
    const newBeneficiary: Beneficiary = {
      id: `ben-${Date.now()}`,
      name: '',
      relationship: '',
      email: '',
      phone: '',
      address: '',
      percentage: 0
    };
    onUpdate([...beneficiaries, newBeneficiary]);
  };
  
  const handleRemove = (id: string) => {
    if (beneficiaries.length <= 1) return;
    onUpdate(beneficiaries.filter(b => b.id !== id));
  };
  
  const handleChange = (id: string, field: keyof Beneficiary, value: string | number) => {
    onUpdate(beneficiaries.map(b => b.id === id ? { ...b, [field]: value } : b));
  };
  
  const handleFieldAiHelp = (id: string, field: string, position: { x: number, y: number }) => {
    onAiHelp(`beneficiary_${field}`, position);
  };
  
  const totalPercentage = beneficiaries.reduce((sum, b) => sum + (b.percentage || 0), 0);
  
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
                  onAiHelp('beneficiary', { x: e.clientX, y: e.clientY });
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
    <Card className="mt-4 mb-4">
      <CardContent className="pt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Beneficiaries
          </h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={(e) => onAiHelp('beneficiary', { x: e.clientX, y: e.clientY })}
                >
                  <MessageCircleQuestion className="h-4 w-4 text-willtank-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Get AI help with beneficiaries</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {totalPercentage !== 100 && (
          <div className="bg-amber-50 text-amber-800 p-2 rounded mb-4 text-sm">
            Total allocation: {totalPercentage}% (Should equal 100%)
          </div>
        )}
        
        <div className="space-y-4">
          {beneficiaries.map((beneficiary, index) => (
            <div key={beneficiary.id} className="mb-4 p-3 border border-dashed rounded-md">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium">Beneficiary {index + 1}</h4>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleRemove(beneficiary.id)}
                  disabled={beneficiaries.length <= 1}
                >
                  <Trash2 className="h-3 w-3 text-red-500" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <ContactField
                  label="Full Name"
                  value={beneficiary.name}
                  onChange={(value) => handleChange(beneficiary.id, 'name', value)}
                  placeholder="Full legal name"
                  onAiHelp={(position) => handleFieldAiHelp(beneficiary.id, 'name', position)}
                />
                
                <ContactField
                  label="Relationship"
                  value={beneficiary.relationship}
                  onChange={(value) => handleChange(beneficiary.id, 'relationship', value)}
                  placeholder="e.g. Spouse, Child, Friend"
                  tooltipText="Your relationship to this beneficiary"
                  onAiHelp={(position) => handleFieldAiHelp(beneficiary.id, 'relationship', position)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <ContactField
                  label="Email Address"
                  value={beneficiary.email}
                  onChange={(value) => handleChange(beneficiary.id, 'email', value)}
                  type="email"
                  placeholder="Email address"
                  onAiHelp={(position) => handleFieldAiHelp(beneficiary.id, 'email', position)}
                />
                
                <ContactField
                  label="Phone Number"
                  value={beneficiary.phone}
                  onChange={(value) => handleChange(beneficiary.id, 'phone', value)}
                  type="tel"
                  placeholder="Phone number"
                  onAiHelp={(position) => handleFieldAiHelp(beneficiary.id, 'phone', position)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ContactField
                  label="Address"
                  value={beneficiary.address}
                  onChange={(value) => handleChange(beneficiary.id, 'address', value)}
                  placeholder="Full mailing address"
                  tooltipText="Current mailing address for this beneficiary"
                  onAiHelp={(position) => handleFieldAiHelp(beneficiary.id, 'address', position)}
                />
                
                <div className="space-y-1">
                  <Label htmlFor={`percentage-${beneficiary.id}`} className="text-xs">Percentage of Estate</Label>
                  <Input 
                    id={`percentage-${beneficiary.id}`}
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={beneficiary.percentage} 
                    onChange={(e) => handleChange(beneficiary.id, 'percentage', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAdd}
            className="text-xs"
          >
            <PlusCircle className="h-3 w-3 mr-1" />
            Add Beneficiary
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
