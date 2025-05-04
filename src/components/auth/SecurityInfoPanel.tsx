
import React from 'react';
import { Shield, Lock, Eye, Mail, AlertTriangle, Fingerprint } from 'lucide-react';

type SecurityInfoMode = 'signin' | 'signup' | 'recover' | 'verification';

interface SecurityInfoPanelProps {
  mode?: SecurityInfoMode;
}

export function SecurityInfoPanel({ mode = 'signin' }: SecurityInfoPanelProps) {
  return (
    <div className="h-full flex flex-col justify-center">
      <div className="space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-willtank-100 p-3 mb-4">
            <Shield className="h-8 w-8 text-willtank-600" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Bank-Grade Security</h3>
          <p className="text-muted-foreground max-w-sm">
            Your sensitive information is protected with industry-leading encryption and security practices.
          </p>
        </div>
        
        <div className="grid gap-6">
          {mode === 'signin' && (
            <>
              <SecurityFeature 
                icon={<Lock className="h-5 w-5" />}
                title="Secure Authentication"
                description="Multi-factor authentication and email verification protect your account."
              />
              <SecurityFeature 
                icon={<Eye className="h-5 w-5" />}
                title="Privacy Focused"
                description="We don't sell your data or share it with third parties."
              />
              <SecurityFeature 
                icon={<Fingerprint className="h-5 w-5" />}
                title="Device Recognition"
                description="We monitor for suspicious login attempts from unknown devices."
              />
            </>
          )}
          
          {mode === 'signup' && (
            <>
              <SecurityFeature 
                icon={<Lock className="h-5 w-5" />}
                title="End-to-End Encryption"
                description="Your data is encrypted in transit and at rest."
              />
              <SecurityFeature 
                icon={<Mail className="h-5 w-5" />}
                title="Email Verification"
                description="We verify your email to ensure account security."
              />
              <SecurityFeature 
                icon={<Shield className="h-5 w-5" />}
                title="Optional 2FA"
                description="Enable two-factor authentication for additional security."
              />
            </>
          )}
          
          {mode === 'recover' && (
            <>
              <SecurityFeature 
                icon={<AlertTriangle className="h-5 w-5" />}
                title="Secure Recovery"
                description="Account recovery is protected by multiple verification steps."
              />
              <SecurityFeature 
                icon={<Mail className="h-5 w-5" />}
                title="Email Link"
                description="A secure link will be sent to your registered email."
              />
              <SecurityFeature 
                icon={<Lock className="h-5 w-5" />}
                title="Time-Limited Reset"
                description="Password reset links expire after 30 minutes for security."
              />
            </>
          )}
          
          {mode === 'verification' && (
            <>
              <SecurityFeature 
                icon={<Mail className="h-5 w-5" />}
                title="Email Verification"
                description="Enter the code sent to your email to verify your identity."
              />
              <SecurityFeature 
                icon={<Lock className="h-5 w-5" />}
                title="Time-Limited Code"
                description="Verification codes expire after 30 minutes for security."
              />
              <SecurityFeature 
                icon={<AlertTriangle className="h-5 w-5" />}
                title="Limited Attempts"
                description="For your security, verification attempts are limited."
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface SecurityFeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function SecurityFeature({ icon, title, description }: SecurityFeatureProps) {
  return (
    <div className="flex items-start">
      <div className="shrink-0 mr-3 mt-0.5">
        <div className="bg-willtank-100 p-1.5 rounded-md text-willtank-600">
          {icon}
        </div>
      </div>
      <div>
        <h4 className="text-sm font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
