
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserCog, PlusCircle, Trash2, MessageCircleQuestion } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ContactField } from './ContactField';
import { Executor } from '../types';

interface ExecutorFieldProps {
  executors: Executor[];
  onUpdate: (executors: Executor[]) => void;
  onAiHelp: (field: string, position?: { x: number, y: number }) => void;
}

export function ExecutorField({ executors, onUpdate, onAiHelp }: ExecutorFieldProps) {
  const [expanded, setExpanded] = useState(false);
  
  const handleAdd = () => {
    const newExecutor: Executor = {
      id: `exec-${Date.now()}`,
      name: '',
      relationship: '',
      email: '',
      phone: '',
      address: '',
      isPrimary: executors.length === 0
    };
    onUpdate([...executors, newExecutor]);
  };
  
  const handleRemove = (id: string) => {
    if (executors.length <= 1) return;
    
    // If removing the primary executor, make another one primary
    const isPrimaryBeingRemoved = executors.find(exec => exec.id === id)?.isPrimary;
    let updatedExecutors = executors.filter(exec => exec.id !== id);
    
    if (isPrimaryBeingRemoved && updatedExecutors.length > 0) {
      updatedExecutors[0].isPrimary = true;
    }
    
    onUpdate(updatedExecutors);
  };
  
  const handleChange = (id: string, field: keyof Executor, value: string | boolean) => {
    if (field === 'isPrimary' && value === true) {
      // If setting a new primary, make sure all others are not primary
      onUpdate(executors.map(exec => ({
        ...exec,
        isPrimary: exec.id === id
      })));
    } else {
      onUpdate(executors.map(exec => 
        exec.id === id ? { ...exec, [field]: value } : exec
      ));
    }
  };
  
  const handleFieldAiHelp = (id: string, field: string, position: { x: number, y: number }) => {
    onAiHelp(`executor_${field}`, position);
  };
  
  if (!expanded) {
    return (
      <div className="relative group">
        <span 
          className="cursor-pointer border-b border-dashed border-gray-300 hover:border-willtank-400 px-1"
          onClick={() => setExpanded(true)}
        >
          {executors.length > 0 
            ? executors.filter(e => e.isPrimary).map(e => e.name || '[Primary Executor]').join(', ')
            : '[Executor]'
          }
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 inline-flex ml-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAiHelp('executor', { x: e.clientX, y: e.clientY });
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
      </div>
    );
  }
  
  return (
    <Card className="mt-4 mb-4">
      <CardContent className="pt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            Executors
          </h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={(e) => onAiHelp('executor', { x: e.clientX, y: e.clientY })}
                >
                  <MessageCircleQuestion className="h-4 w-4 text-willtank-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Get AI help with executors</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="space-y-4">
          {executors.map((executor, index) => (
            <div key={executor.id} className="mb-4 p-3 border border-dashed rounded-md">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium">Executor {index + 1}</h4>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id={`primary-${executor.id}`}
                      checked={executor.isPrimary}
                      onCheckedChange={(checked) => handleChange(executor.id, 'isPrimary', checked)}
                      disabled={executor.isPrimary && executors.length > 0}
                    />
                    <Label htmlFor={`primary-${executor.id}`} className="text-xs">Primary</Label>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleRemove(executor.id)}
                    disabled={executors.length <= 1}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <ContactField
                  label="Full Name"
                  value={executor.name}
                  onChange={(value) => handleChange(executor.id, 'name', value)}
                  placeholder="e.g. John Smith"
                  required={executor.isPrimary}
                  onAiHelp={(position) => handleFieldAiHelp(executor.id, 'name', position)}
                />
                
                <ContactField
                  label="Relationship"
                  value={executor.relationship}
                  onChange={(value) => handleChange(executor.id, 'relationship', value)}
                  placeholder="e.g. Spouse, Friend, Sibling"
                  onAiHelp={(position) => handleFieldAiHelp(executor.id, 'relationship', position)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <ContactField
                  label="Email Address"
                  value={executor.email}
                  onChange={(value) => handleChange(executor.id, 'email', value)}
                  type="email"
                  placeholder="their@email.com"
                  onAiHelp={(position) => handleFieldAiHelp(executor.id, 'email', position)}
                />
                
                <ContactField
                  label="Phone Number"
                  value={executor.phone}
                  onChange={(value) => handleChange(executor.id, 'phone', value)}
                  type="tel"
                  placeholder="(123) 456-7890"
                  onAiHelp={(position) => handleFieldAiHelp(executor.id, 'phone', position)}
                />
              </div>
              
              <ContactField
                label="Address"
                value={executor.address}
                onChange={(value) => handleChange(executor.id, 'address', value)}
                placeholder="Full mailing address"
                onAiHelp={(position) => handleFieldAiHelp(executor.id, 'address', position)}
              />
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
            Add Executor
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
