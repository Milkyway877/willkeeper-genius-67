
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { UserCog, MessageCircleQuestion, PlusCircle, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ContactField } from './ContactField';
import { Executor } from '../types';

interface ExecutorFieldProps {
  executors: Executor[];
  onUpdate: (executors: Executor[]) => void;
  onAiHelp: (field: string, position?: { x: number, y: number }) => void;
}

export function ExecutorField({ executors, onUpdate, onAiHelp }: ExecutorFieldProps) {
  const [expanded, setExpanded] = useState(false);
  
  const handleChange = (id: string, field: keyof Executor, value: string | boolean) => {
    if (field === 'isPrimary' && value === true) {
      // Set all other executors to not primary
      const updatedExecutors = executors.map(exec => ({
        ...exec,
        isPrimary: exec.id === id
      }));
      onUpdate(updatedExecutors);
    } else {
      onUpdate(executors.map(exec => exec.id === id ? { ...exec, [field]: value } : exec));
    }
  };
  
  const handleAdd = () => {
    const newExecutor: Executor = {
      id: `exec-${Date.now()}`,
      name: '',
      relationship: '',
      email: '',
      phone: '',
      address: '',
      isPrimary: executors.length === 0 // First executor is primary by default
    };
    onUpdate([...executors, newExecutor]);
  };
  
  const handleRemove = (id: string) => {
    if (executors.length <= 1) return;
    
    // If removing primary executor, make the first remaining one primary
    let newExecutors = executors.filter(e => e.id !== id);
    const wasRemovingPrimary = executors.find(e => e.id === id)?.isPrimary;
    
    if (wasRemovingPrimary && newExecutors.length > 0) {
      newExecutors = newExecutors.map((exec, i) => 
        i === 0 ? { ...exec, isPrimary: true } : exec
      );
    }
    
    onUpdate(newExecutors);
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
          {executors.find(e => e.isPrimary)?.name || 'Executor'}
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
            <div key={executor.id} className="p-3 border border-dashed rounded-md">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium">Executor {index + 1}</h4>
                
                <div className="flex items-center">
                  <div className="flex items-center gap-2 mr-3">
                    <Label htmlFor={`primary-${executor.id}`} className="text-xs">Primary</Label>
                    <Switch
                      id={`primary-${executor.id}`}
                      checked={executor.isPrimary}
                      onCheckedChange={(checked) => handleChange(executor.id, 'isPrimary', checked)}
                    />
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemove(executor.id)}
                    disabled={executors.length <= 1}
                    className="h-6 w-6 p-0"
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
                  placeholder="Full legal name"
                  onAiHelp={(position) => handleFieldAiHelp(executor.id, 'name', position)}
                />
                
                <ContactField
                  label="Relationship"
                  value={executor.relationship}
                  onChange={(value) => handleChange(executor.id, 'relationship', value)}
                  placeholder="e.g. Spouse, Child, Sibling, Friend"
                  onAiHelp={(position) => handleFieldAiHelp(executor.id, 'relationship', position)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <ContactField
                  label="Email Address"
                  value={executor.email}
                  onChange={(value) => handleChange(executor.id, 'email', value)}
                  type="email"
                  placeholder="Email address"
                  onAiHelp={(position) => handleFieldAiHelp(executor.id, 'email', position)}
                />
                
                <ContactField
                  label="Phone Number"
                  value={executor.phone}
                  onChange={(value) => handleChange(executor.id, 'phone', value)}
                  type="tel"
                  placeholder="Phone number"
                  onAiHelp={(position) => handleFieldAiHelp(executor.id, 'phone', position)}
                />
              </div>
              
              <div>
                <ContactField
                  label="Address"
                  value={executor.address}
                  onChange={(value) => handleChange(executor.id, 'address', value)}
                  placeholder="Full mailing address"
                  tooltipText="Current mailing address for this executor"
                  onAiHelp={(position) => handleFieldAiHelp(executor.id, 'address', position)}
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between items-center mt-4">
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
