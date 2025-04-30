
import React from 'react';
import { TemplateWillSection } from '@/components/will/TemplateWillSection';
import { InfoField } from '@/components/will/InfoField';
import { User } from 'lucide-react';
import { Grid, GridItem } from '@/components/ui/grid';

interface PersonalInfoSectionProps {
  defaultOpen?: boolean;
}

export function PersonalInfoSection({ defaultOpen = true }: PersonalInfoSectionProps) {
  return (
    <TemplateWillSection 
      title="Personal Information" 
      description="Your basic personal information for identification purposes"
      defaultOpen={defaultOpen}
      icon={<User className="h-5 w-5" />}
    >
      <Grid cols={2} gap={4} className="mb-6">
        <GridItem>
          <InfoField
            label="Legal Full Name"
            name="fullName"
            tooltipText="Your complete legal name as it appears on official documents"
            placeholder="e.g. John Andrew Smith"
            required
          />
        </GridItem>
        <GridItem>
          <InfoField
            label="Date of Birth"
            name="dateOfBirth"
            tooltipText="Your date of birth for identification purposes"
            type="date"
            required
          />
        </GridItem>
      </Grid>

      <InfoField
        label="Home Address"
        name="homeAddress"
        tooltipText="Your current permanent residential address"
        placeholder="Street address, city, state, zip code"
        required
        className="mb-4"
      />

      <Grid cols={2} gap={4}>
        <GridItem>
          <InfoField
            label="Email Address"
            name="email"
            tooltipText="Your current email address for records"
            type="email"
            placeholder="your@email.com"
          />
        </GridItem>
        <GridItem>
          <InfoField
            label="Phone Number"
            name="phoneNumber"
            tooltipText="Your current phone number for records"
            type="tel"
            placeholder="(123) 456-7890"
          />
        </GridItem>
      </Grid>
    </TemplateWillSection>
  );
}
