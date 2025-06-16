
import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/logo/Logo';
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight } from 'lucide-react';

export default function ClerkSignUp() {
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

          {/* Clerk SignUp Component */}
          <div className="flex justify-center">
            <SignUp
              fallbackRedirectUrl="/dashboard"
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-black hover:bg-gray-800 text-white',
                  card: 'shadow-none border-none',
                  headerTitle: 'text-2xl font-bold text-black',
                  headerSubtitle: 'text-gray-600',
                  socialButtonsBlockButton: 'border-2 border-gray-300 hover:border-gray-400',
                  formFieldInput: 'border-2 border-gray-300 rounded-lg',
                  footerActionLink: 'text-willtank-600 hover:text-willtank-700 font-bold'
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
