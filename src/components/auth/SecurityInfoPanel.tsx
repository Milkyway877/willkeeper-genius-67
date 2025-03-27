
import React from 'react';
import { Shield, Lock, Key } from 'lucide-react';

interface SecurityInfoPanelProps {
  mode: 'signin' | 'signup';
}

export function SecurityInfoPanel({ mode }: SecurityInfoPanelProps) {
  return (
    <div className="text-gray-800 dark:text-gray-200 space-y-8 max-w-md">
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-6 w-6 text-willtank-600 dark:text-willtank-400" />
          <h3 className="text-xl font-semibold">Security First</h3>
        </div>
        <p>
          WillTank employs bank-grade encryption to ensure your estate planning documents remain secure and private.
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-lg">Security Best Practices:</h4>
        <ul className="space-y-3">
          <li className="flex gap-3">
            <Key className="h-5 w-5 text-willtank-600 dark:text-willtank-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>TanKey is your unique access key.</strong> Keep it offline and secure.
            </span>
          </li>
          <li className="flex gap-3">
            <Lock className="h-5 w-5 text-willtank-600 dark:text-willtank-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Your 6-digit PIN</strong> is essential for account recovery.
            </span>
          </li>
          <li className="flex gap-3">
            <Shield className="h-5 w-5 text-willtank-600 dark:text-willtank-400 flex-shrink-0 mt-0.5" />
            <span>
              Never share your TanKey or PIN with anyone.
            </span>
          </li>
        </ul>
      </div>

      {mode === 'signup' ? (
        <div className="bg-willtank-50 dark:bg-slate-800 p-4 rounded-lg border border-willtank-100 dark:border-slate-700">
          <h4 className="font-medium mb-2">Creating Your Account</h4>
          <p className="text-sm">
            Your WillTank account requires a strong password and a unique TanKey that you'll need to store securely. This multi-layered approach ensures maximum protection.
          </p>
        </div>
      ) : (
        <div className="bg-willtank-50 dark:bg-slate-800 p-4 rounded-lg border border-willtank-100 dark:border-slate-700">
          <h4 className="font-medium mb-2">Accessing Your Account</h4>
          <p className="text-sm">
            To sign in, you'll need your email and TanKey. If you've lost your TanKey, you can recover access using your 6-digit PIN.
          </p>
        </div>
      )}
    </div>
  );
}
