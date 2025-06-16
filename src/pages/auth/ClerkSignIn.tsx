
import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/logo/Logo';
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight } from 'lucide-react';
import { isInLovablePreview } from '@/utils/iframeDetection';
import { IframeSafeAuth } from '@/components/auth/IframeSafeAuth';

export default function ClerkSignIn() {
  const inPreview = isInLovablePreview();

  // Preview content that shows the layout without functional authentication
  const previewContent = (
    <div className="min-h-screen w-full flex flex-col bg-background">
      {/* Header */}
      <header className="p-6 md:p-8 border-b">
        <Link to="/" className="inline-block">
          <Logo color="black" className="h-10 w-auto" />
        </Link>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md mx-auto space-y-6">
          {/* Executor Access Banner */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-amber-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Are you an Executor?</p>
                  <p className="text-xs text-amber-700">Access wills with your verification codes</p>
                </div>
              </div>
              <Link to="/will-unlock">
                <Button variant="default" size="default" className="bg-amber-600 hover:bg-amber-700 text-white">
                  Executor Access
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Preview Sign In Form */}
          <div className="flex justify-center">
            <div className="w-full max-w-sm border rounded-lg p-6 bg-white shadow-sm">
              <h1 className="text-2xl font-bold text-black mb-4">Sign in to WillTank</h1>
              <p className="text-gray-600 mb-6">Preview Mode - Open in new tab to sign in</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-2" 
                    placeholder="Enter your email"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input 
                    type="password" 
                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-2" 
                    placeholder="Enter your password"
                    disabled
                  />
                </div>
                <Button className="w-full bg-black hover:bg-gray-800 text-white" disabled>
                  Sign in (Preview Mode)
                </Button>
              </div>
              
              <p className="text-center text-sm text-gray-600 mt-4">
                Don't have an account? <Link to="/auth/signup" className="text-willtank-600 hover:text-willtank-700 font-bold">Sign up</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="p-6 text-center text-sm text-muted-foreground border-t">
        &copy; {new Date().getFullYear()} WillTank. All rights reserved.
      </footer>
    </div>
  );

  if (inPreview) {
    return (
      <IframeSafeAuth fallbackMessage="To sign in to your account, please open WillTank in a new tab. This will allow you to securely access your account.">
        {previewContent}
      </IframeSafeAuth>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      {/* Header */}
      <header className="p-6 md:p-8 border-b">
        <Link to="/" className="inline-block">
          <Logo color="black" className="h-10 w-auto" />
        </Link>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md mx-auto space-y-6">
          {/* Executor Access Banner */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-amber-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Are you an Executor?</p>
                  <p className="text-xs text-amber-700">Access wills with your verification codes</p>
                </div>
              </div>
              <Link to="/will-unlock">
                <Button variant="default" size="default" className="bg-amber-600 hover:bg-amber-700 text-white">
                  Executor Access
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Clerk SignIn Component */}
          <div className="flex justify-center">
            <SignIn
              redirectUrl="/dashboard"
              fallbackRedirectUrl="/dashboard"
              signUpUrl="/auth/signup"
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-black hover:bg-gray-800 text-white',
                  card: 'shadow-none border-none w-full',
                  headerTitle: 'text-2xl font-bold text-black',
                  headerSubtitle: 'text-gray-600',
                  socialButtonsBlockButton: 'border-2 border-gray-300 hover:border-gray-400',
                  formFieldInput: 'border-2 border-gray-300 rounded-lg',
                  footerActionLink: 'text-willtank-600 hover:text-willtank-700 font-bold',
                  rootBox: 'w-full',
                  cardBox: 'w-full shadow-none',
                }
              }}
            />
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="p-6 text-center text-sm text-muted-foreground border-t">
        &copy; {new Date().getFullYear()} WillTank. All rights reserved.
      </footer>
    </div>
  );
}
