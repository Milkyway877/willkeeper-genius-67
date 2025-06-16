
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

  // If we're in preview mode, always show the children (preview content)
  // This allows the auth pages to show their preview forms
  if (inPreview) {
    return <>{children}</>;
  }

  // If we're not in preview and not authenticated, show the fallback
  if (isLoaded && !isSignedIn) {
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

  // For authenticated users or loading state, render children normally
  return <>{children}</>;
}
