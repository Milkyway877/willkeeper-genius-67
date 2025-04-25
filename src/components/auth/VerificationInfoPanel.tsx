
import React from 'react';
import { cn } from '@/lib/utils';
import { Shield, Lock, Eye, Mail } from 'lucide-react';
import { SecurityInfoPanel } from './SecurityInfoPanel';

export function VerificationInfoPanel() {
  // We're reusing the SecurityInfoPanel with the verification mode
  return <SecurityInfoPanel mode="verification" />;
}
