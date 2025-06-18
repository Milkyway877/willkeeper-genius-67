
import React from 'react';
import { TemplateWillSection } from '@/components/will/TemplateWillSection';
import { Video, Shield, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VideoTestamentInfoProps {
  defaultOpen?: boolean;
}

export function VideoTestamentInfo({ defaultOpen = false }: VideoTestamentInfoProps) {
  return (
    <TemplateWillSection 
      title="Video Testament Recording" 
      description="Important information about your video testament"
      defaultOpen={defaultOpen}
      icon={<Video className="h-5 w-5" />}
    >
      <div className="space-y-4">
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Your video testament serves as your digital signature.</strong> After finalizing your will, 
            you'll be guided to record a secure video testament that validates your identity and confirms your wishes.
          </AlertDescription>
        </Alert>

        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Video className="h-4 w-4 mr-2 text-gray-600" />
            What happens after you finalize your will:
          </h4>
          
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Your will document will be generated and saved securely</li>
            <li>You'll be redirected to record your video testament</li>
            <li>The video recording ensures authenticity and prevents tampering</li>
            <li>Your completed will package will be stored in WillTank</li>
          </ol>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center">
            <Shield className="h-4 w-4 text-green-600 mr-2" />
            <p className="text-sm text-green-800 font-medium">
              Platform-based recording ensures security and legal validity
            </p>
          </div>
        </div>
      </div>
    </TemplateWillSection>
  );
}
