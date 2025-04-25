
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TwoFactorInput } from '@/components/ui/TwoFactorInput';
import { Shield, ArrowLeft, Mail } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { fadeInUp } from '@/components/auth/animations';
import { useToast } from "@/hooks/use-toast";

export default function AccountVerification() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const { email, isLogin, message } = location.state || {
    email: '',
    isLogin: false,
    message: "We've sent a verification code to your email address. Please enter it below to complete your account setup."
  };

  const handleVerification = async (code: string) => {
    setLoading(true);
    setError(null);

    // Simulate verification delay
    setTimeout(() => {
      setLoading(false);
      toast({
        title: isLogin ? "Login successful!" : "Account verified successfully!",
        description: `Welcome${email ? ` ${email}` : ''} to WillTank.`,
      });
      // Redirect to onboarding for new users, dashboard for existing users
      navigate(isLogin ? '/dashboard' : '/auth/onboarding');
    }, 1500);
  };

  const handleResendCode = () => {
    toast({
      title: "Verification code resent",
      description: `We've sent a new code to ${email || 'your email address'}.`,
    });
  };

  const handleGoBack = () => {
    navigate(isLogin ? '/auth/login' : '/auth/signup');
  };

  return (
    <AuthLayout title={isLogin ? "Verify Your Login" : "Verify Your Account"}>
      <motion.div
        className="w-full max-w-md space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Icon and Description */}
        <motion.div 
          className="text-center space-y-4"
          variants={fadeInUp}
        >
          <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-muted-foreground">
            {message}
          </p>
          {email && (
            <p className="text-sm font-medium text-blue-500">
              {email}
            </p>
          )}
        </motion.div>

        {/* Verification Code Input */}
        <motion.div 
          className="space-y-4"
          variants={fadeInUp}
        >
          <TwoFactorInput
            onSubmit={handleVerification}
            loading={loading}
            error={error}
          />

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={handleResendCode}
              disabled={loading}
            >
              <Mail className="mr-2 h-4 w-4" />
              Resend verification code
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoBack}
              disabled={loading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {isLogin ? 'login' : 'signup'}
            </Button>
          </div>
        </motion.div>

        {/* Security Note */}
        <motion.div
          className="mt-8 text-center text-sm text-muted-foreground"
          variants={fadeInUp}
        >
          <p>
            This additional step helps us keep your WillTank account secure.
          </p>
        </motion.div>
      </motion.div>
    </AuthLayout>
  );
}
