
import React, { useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Outlet } from 'react-router-dom';
import { isInLovablePreview } from '@/utils/iframeDetection';
import { useClerk } from '@clerk/clerk-react';

function App() {
  const clerk = useClerk();
  const inPreview = isInLovablePreview();

  useEffect(() => {
    // Prevent automatic redirects in iframe preview context
    if (inPreview && clerk) {
      // Override Clerk's navigate function to prevent redirects in iframe
      const originalNavigate = clerk.navigate;
      clerk.navigate = (to: string) => {
        console.log('Navigation prevented in preview mode:', to);
        // Don't navigate in iframe preview
        return Promise.resolve();
      };

      return () => {
        // Restore original navigate function
        clerk.navigate = originalNavigate;
      };
    }
  }, [clerk, inPreview]);

  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}

export default App;
