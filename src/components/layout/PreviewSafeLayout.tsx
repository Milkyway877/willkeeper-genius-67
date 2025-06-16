
import React from 'react';
import { Layout } from './Layout';
import { IframeSafeAuth } from '@/components/auth/IframeSafeAuth';
import { isInLovablePreview } from '@/utils/iframeDetection';

interface PreviewSafeLayoutProps {
  children: React.ReactNode;
  forceAuthenticated?: boolean;
}

export function PreviewSafeLayout({ children, forceAuthenticated = true }: PreviewSafeLayoutProps) {
  const inPreview = isInLovablePreview();

  if (inPreview && forceAuthenticated) {
    return (
      <IframeSafeAuth fallbackMessage="This page requires authentication. Please open in a new tab to access your account.">
        <Layout forceAuthenticated={forceAuthenticated}>
          {children}
        </Layout>
      </IframeSafeAuth>
    );
  }

  return (
    <Layout forceAuthenticated={forceAuthenticated}>
      {children}
    </Layout>
  );
}
