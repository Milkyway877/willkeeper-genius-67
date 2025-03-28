
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
                We use enterprise-grade security to protect your account and your legacy planning documents.
              </p>
              <p>
                Your data is encrypted using advanced security standards to ensure your information remains private and secure.
              </p>
              <p>
                We recommend using a strong password and keeping your login credentials secure.
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
                Our authentication process ensures that only you can access your will and estate documents.
              </p>
              <p>
                We recommend using a password manager to store your credentials securely.
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
                Forgot your password? No problem. We've designed a secure recovery process.
              </p>
              <p>
                Enter your email address and we'll send you a password reset link.
              </p>
              <p>
                For your security, password reset links expire after a short period of time.
              </p>
              <p>
                If you continue to have issues, please contact our support team for assistance.
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
