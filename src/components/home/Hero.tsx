
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Check } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative isolate overflow-hidden bg-white">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Secure Your Legacy with <span className="text-willtank-600">WillTank</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            The future of will management. Create, store, and manage your wills with bank-grade security
            and AI-powered simplicity.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link to="/auth/signup">
              <Button size="lg" className="rounded-md px-6 py-3 bg-willtank-600 hover:bg-willtank-700">
                Get Started
              </Button>
            </Link>
            <Link to="/auth/signin" className="text-sm font-semibold leading-6 text-gray-900">
              Sign In <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Shield className="mr-2 h-5 w-5 text-willtank-600" />
              <span>Bank-Grade Security</span>
            </div>
            <div className="flex items-center">
              <Lock className="mr-2 h-5 w-5 text-willtank-600" />
              <span>End-to-End Encryption</span>
            </div>
            <div className="flex items-center">
              <Check className="mr-2 h-5 w-5 text-willtank-600" />
              <span>Legally Compliant</span>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 top-[calc(100%-10rem)] -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-willtank-400 to-willtank-600 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
      </div>
    </div>
  );
}
