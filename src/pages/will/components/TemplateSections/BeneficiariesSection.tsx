
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

  const totalPercentage = beneficiaries.reduce((sum, b) => sum + (b.percentage || 0), 0);

  return (
    <TemplateWillSection 
      title="Beneficiaries" 
      description="People who will receive your assets"
      defaultOpen={defaultOpen}
      icon={<Users className="h-5 w-5" />}
    >
      <div className="bg-willtank-50 border border-willtank-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-willtank-700 font-medium">
          Add the people who will inherit your assets. You can add multiple beneficiaries and specify what percentage each should receive.
        </p>
      </div>

      {totalPercentage !== 100 && totalPercentage > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 text-amber-800 p-3 rounded-lg mb-4 text-sm font-medium">
          ⚠️ Total allocation: {totalPercentage}% (Should equal 100%)
        </div>
      )}

      {beneficiaries.map((beneficiary, index) => (
        <Card key={beneficiary.id} className="mb-6 border-2 border-willtank-200 shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-willtank-800 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Beneficiary {index + 1}
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => removeBeneficiary(beneficiary.id)}
                disabled={beneficiaries.length <= 1}
                className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
            
            <Grid cols={2} gap={4} className="mb-4">
              <GridItem>
                <InfoField
                  label="Full Legal Name"
                  name={`beneficiaries[${index}].name`}
                  tooltipText="Complete legal name of the beneficiary as it appears on their identification"
                  placeholder="Enter full legal name"
                  required
                  containerClassName="mb-4"
                />
              </GridItem>
              <GridItem>
                <InfoField
                  label="Relationship to You"
                  name={`beneficiaries[${index}].relationship`}
                  tooltipText="Your relationship to this person (e.g. spouse, child, sibling, friend)"
                  placeholder="e.g. Spouse, Child, Friend"
                  required
                  containerClassName="mb-4"
                />
              </GridItem>
            </Grid>

            <Grid cols={2} gap={4} className="mb-4">
              <GridItem>
                <InfoField
                  label="Email Address"
                  name={`beneficiaries[${index}].email`}
                  tooltipText="Contact email for this beneficiary - used by executor to communicate about inheritance"
                  type="email"
                  placeholder="beneficiary@email.com"
                  containerClassName="mb-4"
                />
              </GridItem>
              <GridItem>
                <InfoField
                  label="Phone Number"
                  name={`beneficiaries[${index}].phone`}
                  tooltipText="Contact phone number for this beneficiary"
                  placeholder="(555) 123-4567"
                  containerClassName="mb-4"
                />
              </GridItem>
            </Grid>

            <InfoField
              label="Current Address"
              name={`beneficiaries[${index}].address`}
              tooltipText="Current mailing address for this beneficiary - needed for legal notifications"
              placeholder="Street address, city, state, zip code"
              className="mb-4"
              containerClassName="mb-4"
            />

            <InfoField
              label="Percentage of Estate (%)"
              name={`beneficiaries[${index}].percentage`}
              tooltipText="What percentage of your residual estate should this beneficiary receive (must total 100% across all beneficiaries)"
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder="Enter percentage (e.g. 50)"
              description="Enter a value between 0 and 100. The total for all beneficiaries should equal 100%."
              containerClassName="mb-2"
            />
          </CardContent>
        </Card>
      ))}

      <Button 
        variant="outline" 
        className="w-full mt-4 border-2 border-dashed border-willtank-300 hover:border-willtank-500 text-willtank-700 hover:text-willtank-800 h-12 text-base font-medium" 
        onClick={addBeneficiary} 
        type="button"
      >
        <PlusCircle className="h-5 w-5 mr-2" />
        Add Another Beneficiary
      </Button>
    </TemplateWillSection>
  );
}
