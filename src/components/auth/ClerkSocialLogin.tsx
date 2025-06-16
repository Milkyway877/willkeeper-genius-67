
import React from 'react';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Chrome, Github, Apple } from 'lucide-react';

interface ClerkSocialLoginProps {
  mode: 'signin' | 'signup';
}

export function ClerkSocialLogin({ mode }: ClerkSocialLoginProps) {
  const AuthButton = mode === 'signin' ? SignInButton : SignUpButton;
  const actionText = mode === 'signin' ? 'Sign in' : 'Sign up';

  return (
    <div className="space-y-3">
      <div className="text-center text-sm text-gray-500 mb-4">
        Or continue with
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        <AuthButton strategy="oauth_google" fallbackRedirectUrl="/dashboard">
          <Button variant="outline" className="w-full">
            <Chrome className="h-4 w-4 mr-2" />
            {actionText} with Google
          </Button>
        </AuthButton>
        
        <AuthButton strategy="oauth_github" fallbackRedirectUrl="/dashboard">
          <Button variant="outline" className="w-full">
            <Github className="h-4 w-4 mr-2" />
            {actionText} with GitHub
          </Button>
        </AuthButton>
        
        <AuthButton strategy="oauth_apple" fallbackRedirectUrl="/dashboard">
          <Button variant="outline" className="w-full">
            <Apple className="h-4 w-4 mr-2" />
            {actionText} with Apple
          </Button>
        </AuthButton>
      </div>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">or continue with email</span>
        </div>
      </div>
    </div>
  );
}
