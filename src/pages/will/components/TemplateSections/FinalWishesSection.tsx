
import React from 'react';
import { TemplateWillSection } from '@/components/will/TemplateWillSection';
import { InfoField } from '@/components/will/InfoField';
import { Heart } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { InfoTooltip } from '@/components/ui/info-tooltip';

interface FinalWishesSectionProps {
  defaultOpen?: boolean;
}

export function FinalWishesSection({ defaultOpen = false }: FinalWishesSectionProps) {
  return (
    <TemplateWillSection 
      title="Final Wishes & Instructions" 
      description="Funeral arrangements, memorial preferences, and special instructions"
      defaultOpen={defaultOpen}
      icon={<Heart className="h-5 w-5" />}
    >
      <p className="mb-4 text-sm text-willtank-600">
        Although not legally binding in all jurisdictions, you can express your preferences for funeral arrangements
        and final wishes to guide your loved ones.
      </p>

      <div className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 mb-1">
            <Label htmlFor="funeralPreferences">Funeral Preferences</Label>
            <InfoTooltip text="Your preferences for burial, cremation, or other arrangements" />
          </div>
          <Textarea 
            id="funeralPreferences"
            name="funeralPreferences"
            placeholder="Describe your funeral preferences, such as burial vs cremation, religious services, etc."
            className="min-h-24"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 mb-1">
            <Label htmlFor="memorialService">Memorial Service</Label>
            <InfoTooltip text="Your preferences for any memorial service or celebration of life" />
          </div>
          <Textarea 
            id="memorialService"
            name="memorialService"
            placeholder="Describe any wishes for a memorial service, such as location, music, readings, etc."
            className="min-h-24"
          />
        </div>

        <InfoField
          label="Obituary Preferences"
          name="obituary"
          tooltipText="Any specific information you'd like included in your obituary"
          placeholder="Details you'd like shared in your obituary"
        />

        <InfoField
          label="Charitable Donations"
          name="charitableDonations"
          tooltipText="Any charities you'd prefer donations to be made to in your memory"
          placeholder="e.g., American Cancer Society, Local Animal Shelter"
        />
        
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 mb-1">
            <Label htmlFor="specialInstructions">Special Instructions</Label>
            <InfoTooltip text="Any other final wishes or special instructions not covered elsewhere" />
          </div>
          <Textarea 
            id="specialInstructions"
            name="specialInstructions"
            placeholder="Any other wishes or instructions for your loved ones"
            className="min-h-24"
          />
        </div>
      </div>
    </TemplateWillSection>
  );
}
