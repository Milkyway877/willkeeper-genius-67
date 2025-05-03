
import React from 'react';
import { TextInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface FinalWishesFormProps {
  form: any;
}

export function FinalWishesForm({ form }: FinalWishesFormProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Final Wishes</h2>
      <p className="text-gray-600 mb-4">
        Provide details about your final wishes, including funeral arrangements, and any specific bequests.
      </p>
      
      <div className="space-y-6">
        {/* Specific Bequests */}
        <div className="space-y-2">
          <Label htmlFor="specificBequests">Specific Bequests</Label>
          <p className="text-sm text-gray-500 mb-2">
            List any specific items or amounts you want to leave to particular individuals or organizations.
          </p>
          <Textarea
            id="specificBequests"
            placeholder="E.g., I leave my grandfather's pocket watch to my nephew, John Smith..."
            rows={5}
            value={form.values.specificBequests}
            onChange={(e) => form.setFieldValue('specificBequests', e.target.value)}
            className="resize-y"
          />
        </div>
        
        {/* Residual Estate */}
        <div className="space-y-2">
          <Label htmlFor="residualEstate">Residual Estate</Label>
          <p className="text-sm text-gray-500 mb-2">
            Specify how to distribute the remainder of your estate after specific bequests.
          </p>
          <Textarea
            id="residualEstate"
            placeholder="E.g., The residue of my estate shall be divided equally among my children..."
            rows={5}
            value={form.values.residualEstate}
            onChange={(e) => form.setFieldValue('residualEstate', e.target.value)}
            className="resize-y"
          />
        </div>
        
        {/* Final Arrangements */}
        <div className="space-y-2">
          <Label htmlFor="finalArrangements">Final Arrangements</Label>
          <p className="text-sm text-gray-500 mb-2">
            Provide instructions for your funeral, burial, or cremation preferences.
          </p>
          <Textarea
            id="finalArrangements"
            placeholder="E.g., I wish to be cremated and have my ashes scattered at..."
            rows={5}
            value={form.values.finalArrangements}
            onChange={(e) => form.setFieldValue('finalArrangements', e.target.value)}
            className="resize-y"
          />
        </div>
      </div>
    </div>
  );
}
