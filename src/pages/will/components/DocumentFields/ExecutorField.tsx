
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { UserCog, MessageCircleQuestion } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Executor {
  id: string;
  name: string;
  isPrimary: boolean;
}

interface ExecutorFieldProps {
  executors: Executor[];
  onUpdate: (executors: Executor[]) => void;
  onAiHelp: () => void;
}

export function ExecutorField({ executors, onUpdate, onAiHelp }: ExecutorFieldProps) {
  const [expanded, setExpanded] = useState(false);
  
  const handleChange = (id: string, field: string, value: string | boolean) => {
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
                    onAiHelp();
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
                  onClick={onAiHelp}
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
                
                <div className="flex items-center gap-2">
                  <Label htmlFor={`primary-${executor.id}`} className="text-xs">Primary</Label>
                  <Switch
                    id={`primary-${executor.id}`}
                    checked={executor.isPrimary}
                    onCheckedChange={(checked) => handleChange(executor.id, 'isPrimary', checked)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor={`name-${executor.id}`} className="text-xs">Name</Label>
                <Input 
                  id={`name-${executor.id}`}
                  value={executor.name} 
                  onChange={(e) => handleChange(executor.id, 'name', e.target.value)} 
                  placeholder="Full Name"
                  className="h-8 text-sm"
                />
              </div>
            </div>
          ))}
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setExpanded(false)}
          className="text-xs mt-4"
        >
          Done
        </Button>
      </CardContent>
    </Card>
  );
}
