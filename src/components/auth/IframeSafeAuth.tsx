
import React from 'react';
import { useAuth } from '@clerk/clerk-react';
import { isInLovablePreview } from '@/utils/iframeDetection';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IframeSafeAuthProps {
  children: React.ReactNode;
  fallbackMessage?: string;
}

export function IframeSafeAuth({ children, fallbackMessage }: IframeSafeAuthProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const inPreview = isInLovablePreview();

  // If we're in the Lovable preview and not authenticated, show a safe fallback
  if (inPreview && isLoaded && !isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <Shield className="h-12 w-12 text-willtank-600 mx-auto" />
            <h2 className="text-xl font-semibold">Authentication Required</h2>
            <p className="text-gray-600">
              {fallbackMessage || "To access this feature, please open the app in a new tab to sign in."}
            </p>
            <Button
              onClick={() => window.open(window.location.href, '_blank')}
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // For non-preview environments or when authenticated, render normally
  return <>{children}</>;
}
