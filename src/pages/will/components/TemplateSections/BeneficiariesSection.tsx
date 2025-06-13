
import React, { useState } from 'react';
import { TemplateWillSection } from '@/components/will/TemplateWillSection';
import { InfoField } from '@/components/will/InfoField';
import { Users, PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Grid, GridItem } from '@/components/ui/grid';
import { Card, CardContent } from '@/components/ui/card';

interface BeneficiariesSectionProps {
  defaultOpen?: boolean;
}

interface Beneficiary {
  id: string;
  name: string;
  relationship: string;
  email: string;
  phone: string;
  address: string;
  percentage: number;
}

export function BeneficiariesSection({ defaultOpen = false }: BeneficiariesSectionProps) {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([
    { id: '1', name: '', relationship: '', email: '', phone: '', address: '', percentage: 0 }
  ]);

  const addBeneficiary = () => {
    setBeneficiaries([
      ...beneficiaries,
      { 
        id: `beneficiary-${Date.now()}`, 
        name: '', 
        relationship: '', 
        email: '', 
        phone: '', 
        address: '', 
        percentage: 0 
      }
    ]);
  };

  const removeBeneficiary = (id: string) => {
    if (beneficiaries.length <= 1) return;
    setBeneficiaries(beneficiaries.filter(b => b.id !== id));
  };

  return (
    <TemplateWillSection 
      title="Beneficiaries" 
      description="People who will receive your assets"
      defaultOpen={defaultOpen}
      icon={<Users className="h-5 w-5" />}
    >
      <p className="mb-4 text-sm text-willtank-600">
        Add the people who will inherit your assets. You can add multiple beneficiaries.
      </p>

      {beneficiaries.map((beneficiary, index) => (
        <Card key={beneficiary.id} className="mb-4 relative border-dashed">
          <CardContent className="pt-6">
            <div className="absolute top-2 right-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => removeBeneficiary(beneficiary.id)}
                disabled={beneficiaries.length <= 1}
                className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>

            <p className="text-sm font-medium mb-4">Beneficiary {index + 1}</p>
            
            <Grid cols={2} gap={4} className="mb-4">
              <GridItem>
                <InfoField
                  label="Full Name"
                  name={`beneficiaries[${index}].name`}
                  tooltipText="Legal full name of the beneficiary"
                  placeholder="e.g. Jane Smith"
                  required
                />
              </GridItem>
              <GridItem>
                <InfoField
                  label="Relationship"
                  name={`beneficiaries[${index}].relationship`}
                  tooltipText="Your relationship to this person (e.g. spouse, child, sibling, friend)"
                  placeholder="e.g. Spouse"
                  required
                />
              </GridItem>
            </Grid>

            <Grid cols={2} gap={4} className="mb-4">
              <GridItem>
                <InfoField
                  label="Email Address"
                  name={`beneficiaries[${index}].email`}
                  tooltipText="Contact email for this beneficiary"
                  type="email"
                  placeholder="their@email.com"
                />
              </GridItem>
              <GridItem>
                <InfoField
                  label="Phone Number"
                  name={`beneficiaries[${index}].phone`}
                  tooltipText="Contact phone number for this beneficiary"
                  placeholder="(123) 456-7890"
                />
              </GridItem>
            </Grid>

            <InfoField
              label="Address"
              name={`beneficiaries[${index}].address`}
              tooltipText="Current mailing address for this beneficiary"
              placeholder="Street address, city, state, zip code"
              className="mb-4"
            />

            <InfoField
              label="Percentage of Estate"
              name={`beneficiaries[${index}].percentage`}
              tooltipText="What percentage of your residual estate should this beneficiary receive"
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder="e.g. 50"
              description="Enter a value between 0 and 100. The total for all beneficiaries should equal 100%."
            />
          </CardContent>
        </Card>
      ))}

      <Button 
        variant="outline" 
        className="w-full mt-2" 
        onClick={addBeneficiary} 
        type="button"
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Another Beneficiary
      </Button>
    </TemplateWillSection>
  );
}
