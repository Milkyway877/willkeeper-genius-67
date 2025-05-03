
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, PlusCircle, Trash2, MessageCircleQuestion } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Beneficiary {
  id: string;
  name: string;
  relationship: string;
  percentage: number;
}

interface BeneficiaryFieldProps {
  beneficiaries: Beneficiary[];
  onUpdate: (beneficiaries: Beneficiary[]) => void;
  onAiHelp: () => void;
}

export function BeneficiaryField({ beneficiaries, onUpdate, onAiHelp }: BeneficiaryFieldProps) {
  const [expanded, setExpanded] = useState(false);
  
  const handleAdd = () => {
    const newBeneficiary = {
      id: `ben-${Date.now()}`,
      name: '',
      relationship: '',
      percentage: 0
    };
    onUpdate([...beneficiaries, newBeneficiary]);
  };
  
  const handleRemove = (id: string) => {
    if (beneficiaries.length <= 1) return;
    onUpdate(beneficiaries.filter(b => b.id !== id));
  };
  
  const handleChange = (id: string, field: string, value: string | number) => {
    onUpdate(beneficiaries.map(b => b.id === id ? { ...b, [field]: value } : b));
  };
  
  const totalPercentage = beneficiaries.reduce((sum, b) => sum + (b.percentage || 0), 0);
  
  if (!expanded) {
    return (
      <div className="relative group">
        <span 
          className="cursor-pointer border-b border-dashed border-gray-300 hover:border-willtank-400 px-1"
          onClick={() => setExpanded(true)}
        >
          {beneficiaries.map(b => b.name).join(', ')}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 inline-flex ml-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAiHelp();
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
      </div>
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
                  onClick={onAiHelp}
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
        
        {beneficiaries.map((beneficiary, index) => (
          <div key={beneficiary.id} className="mb-4 p-3 border border-dashed rounded-md">
            <div className="flex justify-between items-center mb-2">
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
            
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div>
                <Label htmlFor={`name-${beneficiary.id}`} className="text-xs">Name</Label>
                <Input 
                  id={`name-${beneficiary.id}`}
                  value={beneficiary.name} 
                  onChange={(e) => handleChange(beneficiary.id, 'name', e.target.value)} 
                  placeholder="Full Name"
                  className="h-8 text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor={`relationship-${beneficiary.id}`} className="text-xs">Relationship</Label>
                <Input 
                  id={`relationship-${beneficiary.id}`}
                  value={beneficiary.relationship} 
                  onChange={(e) => handleChange(beneficiary.id, 'relationship', e.target.value)}
                  placeholder="Relationship"
                  className="h-8 text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor={`percentage-${beneficiary.id}`} className="text-xs">Percentage</Label>
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
