
import React from 'react';
import { TextInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash, Plus } from 'lucide-react';

interface ExecutorsFormProps {
  form: any;
}

export function ExecutorsForm({ form }: ExecutorsFormProps) {
  const addExecutor = () => {
    const executors = [...form.values.executors];
    const newId = `exec-${Date.now()}`;
    executors.push({ id: newId, name: '', relationship: '', email: '', phone: '', address: '', isPrimary: false });
    form.setFieldValue('executors', executors);
  };
  
  const removeExecutor = (id: string) => {
    if (form.values.executors.length <= 1) {
      return; // Don't remove if it's the last executor
    }
    const executors = form.values.executors.filter((exec: any) => exec.id !== id);
    form.setFieldValue('executors', executors);
  };
  
  const setAsPrimary = (id: string) => {
    const executors = [...form.values.executors].map((exec: any) => ({
      ...exec,
      isPrimary: exec.id === id
    }));
    form.setFieldValue('executors', executors);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Executors</h2>
          <p className="text-gray-600">
            Executors are responsible for carrying out the instructions in your will.
          </p>
        </div>
        <Button type="button" onClick={addExecutor} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Executor
        </Button>
      </div>
      
      <div className="space-y-6">
        {form.values.executors.map((executor: any, index: number) => (
          <div key={executor.id} className="border p-4 rounded-md relative">
            {form.values.executors.length > 1 && (
              <Button 
                type="button"
                variant="ghost" 
                size="icon"
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                onClick={() => removeExecutor(executor.id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
            
            <div className="flex items-center mb-4">
              <Checkbox 
                id={`primary-${executor.id}`}
                checked={executor.isPrimary}
                onCheckedChange={() => setAsPrimary(executor.id)}
              />
              <Label htmlFor={`primary-${executor.id}`} className="ml-2">
                Primary Executor
              </Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`name-${executor.id}`}>Name</Label>
                <TextInput
                  id={`name-${executor.id}`}
                  placeholder="Full name"
                  value={executor.name}
                  onChange={(e) => {
                    const executors = [...form.values.executors];
                    executors[index].name = e.target.value;
                    form.setFieldValue('executors', executors);
                  }}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`relationship-${executor.id}`}>Relationship</Label>
                <TextInput
                  id={`relationship-${executor.id}`}
                  placeholder="e.g., Spouse, Child, Friend"
                  value={executor.relationship}
                  onChange={(e) => {
                    const executors = [...form.values.executors];
                    executors[index].relationship = e.target.value;
                    form.setFieldValue('executors', executors);
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`email-${executor.id}`}>Email</Label>
                <TextInput
                  id={`email-${executor.id}`}
                  type="email"
                  placeholder="Email address"
                  value={executor.email}
                  onChange={(e) => {
                    const executors = [...form.values.executors];
                    executors[index].email = e.target.value;
                    form.setFieldValue('executors', executors);
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`phone-${executor.id}`}>Phone</Label>
                <TextInput
                  id={`phone-${executor.id}`}
                  placeholder="Phone number"
                  value={executor.phone}
                  onChange={(e) => {
                    const executors = [...form.values.executors];
                    executors[index].phone = e.target.value;
                    form.setFieldValue('executors', executors);
                  }}
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor={`address-${executor.id}`}>Address</Label>
                <TextInput
                  id={`address-${executor.id}`}
                  placeholder="Full address"
                  value={executor.address}
                  onChange={(e) => {
                    const executors = [...form.values.executors];
                    executors[index].address = e.target.value;
                    form.setFieldValue('executors', executors);
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
