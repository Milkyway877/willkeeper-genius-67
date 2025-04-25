
import React from 'react';
import { Link } from 'react-router-dom';
import { SignupForm } from "@/components/ui/signup-form";
import { Logo } from "@/components/ui/logo/Logo";
import { SecurityTipsPanel } from "@/components/ui/security-tips-panel";

export default function Signup() {
  return (
    <div className="min-h-screen w-full bg-gray-950 flex">
      {/* Left side - Security Tips */}
      <div className="hidden md:flex md:w-1/2 bg-black relative overflow-hidden">
        <SecurityTipsPanel />
      </div>
      
      {/* Right side - Signup Form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="mb-6">
          <Logo size="lg" color="white" showSlogan />
        </div>
        
        <SignupForm />
        
        <div className="mt-6 text-center text-gray-400">
          Already have an account? <Link to="/auth/login" className="text-white hover:underline">Login here</Link>
        </div>
      </div>
    </div>
  );
}
