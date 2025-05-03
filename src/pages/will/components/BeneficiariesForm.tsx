
import React from 'react';
import { TextInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash, Plus } from 'lucide-react';

interface BeneficiariesFormProps {
  form: any;
}

export function BeneficiariesForm({ form }: BeneficiariesFormProps) {
  const addBeneficiary = () => {
    const beneficiaries = [...form.values.beneficiaries];
    const newId = `ben-${Date.now()}`;
    beneficiaries.push({ id: newId, name: '', relationship: '', email: '', phone: '', address: '', percentage: 0 });
    form.setFieldValue('beneficiaries', beneficiaries);
  };
  
  const removeBeneficiary = (id: string) => {
    if (form.values.beneficiaries.length <= 1) {
      return; // Don't remove if it's the last beneficiary
    }
    const beneficiaries = form.values.beneficiaries.filter((ben: any) => ben.id !== id);
    form.setFieldValue('beneficiaries', beneficiaries);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Beneficiaries</h2>
          <p className="text-gray-600">
            Beneficiaries are the people or organizations who will receive your assets.
          </p>
        </div>
        <Button type="button" onClick={addBeneficiary} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Beneficiary
        </Button>
      </div>
      
      <div className="space-y-6">
        {form.values.beneficiaries.map((beneficiary: any, index: number) => (
          <div key={beneficiary.id} className="border p-4 rounded-md relative">
            {form.values.beneficiaries.length > 1 && (
              <Button 
                type="button"
                variant="ghost" 
                size="icon"
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                onClick={() => removeBeneficiary(beneficiary.id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`name-${beneficiary.id}`}>Name</Label>
                <TextInput
                  id={`name-${beneficiary.id}`}
                  placeholder="Full name"
                  value={beneficiary.name}
                  onChange={(e) => {
                    const beneficiaries = [...form.values.beneficiaries];
                    beneficiaries[index].name = e.target.value;
                    form.setFieldValue('beneficiaries', beneficiaries);
                  }}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`relationship-${beneficiary.id}`}>Relationship</Label>
                <TextInput
                  id={`relationship-${beneficiary.id}`}
                  placeholder="e.g., Spouse, Child, Friend"
                  value={beneficiary.relationship}
                  onChange={(e) => {
                    const beneficiaries = [...form.values.beneficiaries];
                    beneficiaries[index].relationship = e.target.value;
                    form.setFieldValue('beneficiaries', beneficiaries);
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`email-${beneficiary.id}`}>Email</Label>
                <TextInput
                  id={`email-${beneficiary.id}`}
                  type="email"
                  placeholder="Email address"
                  value={beneficiary.email}
                  onChange={(e) => {
                    const beneficiaries = [...form.values.beneficiaries];
                    beneficiaries[index].email = e.target.value;
                    form.setFieldValue('beneficiaries', beneficiaries);
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`phone-${beneficiary.id}`}>Phone</Label>
                <TextInput
                  id={`phone-${beneficiary.id}`}
                  placeholder="Phone number"
                  value={beneficiary.phone}
                  onChange={(e) => {
                    const beneficiaries = [...form.values.beneficiaries];
                    beneficiaries[index].phone = e.target.value;
                    form.setFieldValue('beneficiaries', beneficiaries);
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`address-${beneficiary.id}`}>Address</Label>
                <TextInput
                  id={`address-${beneficiary.id}`}
                  placeholder="Full address"
                  value={beneficiary.address}
                  onChange={(e) => {
                    const beneficiaries = [...form.values.beneficiaries];
                    beneficiaries[index].address = e.target.value;
                    form.setFieldValue('beneficiaries', beneficiaries);
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`percentage-${beneficiary.id}`}>Percentage Share (%)</Label>
                <TextInput
                  id={`percentage-${beneficiary.id}`}
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Percentage of estate"
                  value={beneficiary.percentage || ''}
                  onChange={(e) => {
                    const beneficiaries = [...form.values.beneficiaries];
                    beneficiaries[index].percentage = Number(e.target.value);
                    form.setFieldValue('beneficiaries', beneficiaries);
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
