
import React from 'react';
import { Shield, ShieldCheck, Info, Lock } from 'lucide-react';

interface SecurityInfoPanelProps {
  mode: 'signup' | 'signin';
}

export function SecurityInfoPanel({ mode }: SecurityInfoPanelProps) {
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-willtank-100 text-willtank-600 mb-4">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Security Matters</h2>
        <p className="text-muted-foreground">
          {mode === 'signup' 
            ? 'Protect your estate planning with bank-grade security.'
            : 'Safely access your secure estate planning documents.'}
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-4 border border-border shadow-sm">
          <div className="flex gap-3">
            <Shield className="h-5 w-5 text-willtank-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium mb-1">TanKey Protection</h3>
              <p className="text-sm text-muted-foreground">
                Your TanKey is a unique access key. Store it offline and securely.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-border shadow-sm">
          <div className="flex gap-3">
            <Lock className="h-5 w-5 text-willtank-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium mb-1">PIN Recovery</h3>
              <p className="text-sm text-muted-foreground">
                Your 6-digit PIN is essential for account recovery. Keep it confidential.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-border shadow-sm">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-willtank-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium mb-1">Security Best Practices</h3>
              <ul className="text-sm text-muted-foreground space-y-2 mt-2">
                <li className="flex items-start gap-2">
                  <span className="text-willtank-500 text-lg leading-none">•</span>
                  <span>Never share your TanKey or PIN with anyone</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-willtank-500 text-lg leading-none">•</span>
                  <span>Use a password manager for additional security</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-willtank-500 text-lg leading-none">•</span>
                  <span>Enable extra security settings inside your account</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
