
import React from 'react';
import { Shield, Lock, KeySquare } from 'lucide-react';

interface SecurityInfoPanelProps {
  mode: 'signin' | 'signup' | 'recover';
}

export function SecurityInfoPanel({ mode }: SecurityInfoPanelProps) {
  const renderContent = () => {
    switch (mode) {
      case 'signin':
        return (
          <>
            <Shield className="h-16 w-16 text-willtank-600 mb-6" />
            <h2 className="text-2xl font-bold mb-4">Secure Sign In</h2>
            <div className="space-y-4">
              <p>
                Your TanKey is a unique identifier that grants you access to your secure will management platform.
              </p>
              <p>
                Unlike traditional passwords, your TanKey is generated using advanced cryptography, making it significantly more secure against brute force attacks.
              </p>
              <p>
                Keep your TanKey in a password manager or secure location. If lost, you can recover access using your PIN.
              </p>
            </div>
          </>
        );
      
      case 'signup':
        return (
          <>
            <Lock className="h-16 w-16 text-willtank-600 mb-6" />
            <h2 className="text-2xl font-bold mb-4">Bank-Grade Security</h2>
            <div className="space-y-4">
              <p>
                WillTank uses the same security standards employed by financial institutions to protect your sensitive information.
              </p>
              <p>
                Your data is encrypted using AES-256, the same encryption standard used by banks and governments worldwide.
              </p>
              <p>
                Our multi-factor authentication process ensures that only you can access your will and estate documents.
              </p>
              <p>
                Store your recovery PIN in a safe place. It's your backup access method if you ever lose your TanKey.
              </p>
            </div>
          </>
        );
        
      case 'recover':
        return (
          <>
            <KeySquare className="h-16 w-16 text-willtank-600 mb-6" />
            <h2 className="text-2xl font-bold mb-4">Account Recovery</h2>
            <div className="space-y-4">
              <p>
                Lost access to your TanKey? No problem. We've designed a secure recovery process.
              </p>
              <p>
                Enter your email address and the 6-digit PIN you created when you first registered.
              </p>
              <p>
                After verification, we'll generate a new TanKey and send it to your registered email address.
              </p>
              <p>
                For your security, the recovery process has rate limitations to prevent unauthorized access attempts.
              </p>
            </div>
          </>
        );
    }
  };
  
  return (
    <div className="text-slate-700 dark:text-slate-300">
      {renderContent()}
    </div>
  );
}
