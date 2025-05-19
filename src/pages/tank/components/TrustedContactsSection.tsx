
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrustedContacts } from '@/components/death-verification/TrustedContacts';

export const TrustedContactsSection = () => {
  const handleContactsChange = () => {
    // Refresh data as needed
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h2 className="text-xl font-semibold">Trusted Contacts</h2>
          <p className="text-muted-foreground text-sm">
            Manage contacts who can verify your status and access your messages
          </p>
        </div>
      </div>
      
      <TrustedContacts onContactsChange={handleContactsChange} />
    </div>
  );
};
