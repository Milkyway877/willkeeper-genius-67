
// We can't update this file directly because it's in the read-only files list
// Instead, let's create a custom version for verification
<lov-write file_path="src/components/auth/VerificationInfoPanel.tsx">
import React from 'react';
import { cn } from '@/lib/utils';
import { Shield, Lock, Eye, Mail } from 'lucide-react';

export function VerificationInfoPanel() {
  return (
    <div className="space-y-8 max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-willtank-100/80 mb-4">
          <Mail className="h-6 w-6 text-willtank-800" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Verify Your Email</h2>
        <p className="text-gray-600">
          Email verification helps us ensure that you're the rightful owner of your account.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-willtank-100/80 flex items-center justify-center">
            <Shield className="h-5 w-5 text-willtank-800" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium text-gray-900">Enhanced Security</h3>
            <p className="text-sm text-gray-600">
              Verifying your email adds an extra layer of protection to your account.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-willtank-100/80 flex items-center justify-center">
            <Lock className="h-5 w-5 text-willtank-800" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium text-gray-900">Account Recovery</h3>
            <p className="text-sm text-gray-600">
              A verified email enables secure account recovery and password resets.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-willtank-100/80 flex items-center justify-center">
            <Eye className="h-5 w-5 text-willtank-800" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium text-gray-900">Privacy Protection</h3>
            <p className="text-sm text-gray-600">
              We use verification to protect your sensitive information and legal documents.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
