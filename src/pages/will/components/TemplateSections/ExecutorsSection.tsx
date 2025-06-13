
import React, { useState } from 'react';
import { TemplateWillSection } from '@/components/will/TemplateWillSection';
import { InfoField } from '@/components/will/InfoField';
import { UserCog, PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Grid, GridItem } from '@/components/ui/grid';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface ExecutorsSectionProps {
  defaultOpen?: boolean;
}

interface Executor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  relationship: string;
  isPrimary: boolean;
}

export function ExecutorsSection({ defaultOpen = false }: ExecutorsSectionProps) {
  const [executors, setExecutors] = useState<Executor[]>([
    { id: '1', name: '', email: '', phone: '', address: '', relationship: '', isPrimary: true }
  ]);

  const addExecutor = () => {
    setExecutors([
      ...executors,
      { 
        id: `executor-${Date.now()}`, 
        name: '', 
        email: '', 
        phone: '', 
        address: '', 
        relationship: '',
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

  return (
    <TemplateWillSection 
      title="Executors" 
      description="People who will carry out the instructions in your will"
      defaultOpen={defaultOpen}
      icon={<UserCog className="h-5 w-5" />}
    >
      <div className="bg-willtank-50 border border-willtank-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-willtank-700 font-medium">
          An executor is responsible for carrying out your wishes as expressed in your will. 
          You can name one or more executors to act together or as alternates.
        </p>
      </div>

      {executors.map((executor, index) => (
        <Card key={executor.id} className="mb-6 border-2 border-willtank-200 shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-willtank-800 flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                Executor {index + 1}
              </h3>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id={`primary-${executor.id}`}
                    checked={executor.isPrimary}
                    onCheckedChange={() => setPrimaryExecutor(executor.id)}
                  />
                  <Label htmlFor={`primary-${executor.id}`} className="text-sm">Primary Executor</Label>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeExecutor(executor.id)}
                  disabled={executors.length <= 1}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              </div>
            </div>
            
            <Grid cols={2} gap={4} className="mb-4">
              <GridItem>
                <InfoField
                  label="Full Legal Name"
                  name={`executors[${index}].name`}
                  tooltipText="Complete legal name of the executor as it appears on their identification"
                  placeholder="Enter full legal name"
                  required
                  containerClassName="mb-4"
                />
              </GridItem>
              <GridItem>
                <InfoField
                  label="Relationship to You"
                  name={`executors[${index}].relationship`}
                  tooltipText="Your relationship to this executor (e.g. spouse, child, sibling, friend)"
                  placeholder="e.g. Spouse, Child, Friend"
                  containerClassName="mb-4"
                />
              </GridItem>
            </Grid>

            <Grid cols={2} gap={4} className="mb-4">
              <GridItem>
                <InfoField
                  label="Email Address"
                  name={`executors[${index}].email`}
                  tooltipText="Contact email for this executor - used for legal notifications and executor communications"
                  type="email"
                  placeholder="executor@email.com"
                  required
                  containerClassName="mb-4"
                />
              </GridItem>
              <GridItem>
                <InfoField
                  label="Phone Number"
                  name={`executors[${index}].phone`}
                  tooltipText="Contact phone number for this executor"
                  placeholder="(555) 123-4567"
                  containerClassName="mb-4"
                />
              </GridItem>
            </Grid>

            <InfoField
              label="Current Address"
              name={`executors[${index}].address`}
              tooltipText="Current mailing address for this executor - needed for legal notifications"
              placeholder="Street address, city, state, zip code"
              containerClassName="mb-2"
            />
          </CardContent>
        </Card>
      ))}

      <Button 
        variant="outline" 
        className="w-full mt-4 border-2 border-dashed border-willtank-300 hover:border-willtank-500 text-willtank-700 hover:text-willtank-800 h-12 text-base font-medium" 
        onClick={addExecutor} 
        type="button"
      >
        <PlusCircle className="h-5 w-5 mr-2" />
        Add Alternate Executor
      </Button>
    </TemplateWillSection>
  );
}
