
import React from 'react';
import { cn } from '@/lib/utils';
import { Shield, Lock, Eye, Mail, History, Key } from 'lucide-react';

interface SecurityInfoPanelProps {
  mode?: 'signup' | 'signin' | 'recover' | 'verification';
}

export function SecurityInfoPanel({ mode = 'signup' }: SecurityInfoPanelProps) {
  // Determine which icon and content to show based on the mode
  const getIcon = () => {
    switch (mode) {
      case 'signin':
        return <Lock className="h-6 w-6 text-willtank-800" />;
      case 'recover':
        return <Key className="h-6 w-6 text-willtank-800" />;
      case 'verification':
        return <Mail className="h-6 w-6 text-willtank-800" />;
      case 'signup':
      default:
        return <Shield className="h-6 w-6 text-willtank-800" />;
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'signin': return "Secure Sign In";
      case 'recover': return "Account Recovery";
      case 'verification': return "Verify Your Email";
      case 'signup':
      default: return "Secure Registration";
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'signin': return "Our secure sign in process protects your account and sensitive information.";
      case 'recover': return "Account recovery helps you regain access while maintaining security.";
      case 'verification': return "Email verification helps us ensure that you're the rightful owner of your account.";
      case 'signup':
      default: return "Your information is protected with bank-grade encryption.";
    }
  };

  return (
    <div className="space-y-8 max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-willtank-100/80 mb-4">
          {getIcon()}
        </div>
        <h2 className="text-2xl font-bold mb-2">{getTitle()}</h2>
        <p className="text-gray-600">
          {getDescription()}
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
              We use industry-standard security practices to protect your data.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-willtank-100/80 flex items-center justify-center">
            <Lock className="h-5 w-5 text-willtank-800" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium text-gray-900">Data Encryption</h3>
            <p className="text-sm text-gray-600">
              Your information is encrypted both in transit and at rest.
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
              We never share your personal information with third parties.
            </p>
          </div>
        </div>

        {mode === 'signin' && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-willtank-100/80 flex items-center justify-center">
              <History className="h-5 w-5 text-willtank-800" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-gray-900">Session Security</h3>
              <p className="text-sm text-gray-600">
                Automatic time-outs and secure session management protect your account.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
