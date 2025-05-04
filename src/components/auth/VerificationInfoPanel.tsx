
import React from 'react';
import { SecurityInfoPanel } from './SecurityInfoPanel';

export function VerificationInfoPanel() {
  // We're reusing the SecurityInfoPanel with the verification mode
  return <SecurityInfoPanel mode="verification" />;
}
