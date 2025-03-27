
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-gray-100/50 bg-[bottom_1px_center] dark:bg-grid-gray-950/50 z-0" />
      
      <div className="container relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-400">
            Your Estate. Your Legacy.<br />
            <span className="text-willtank-600">Secured.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl">
            WillTank provides bank-grade security for your estate planning documents, ensuring your legacy is protected for generations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link to="/auth/signup">
              <Button size="lg" className="rounded-full px-8">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth/signin">
              <Button size="lg" variant="outline" className="rounded-full px-8">
                Sign In
              </Button>
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16">
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold text-willtank-600 mb-2">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime Guarantee</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold text-willtank-600 mb-2">AES-256</div>
              <div className="text-sm text-muted-foreground">Encryption</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold text-willtank-600 mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Expert Support</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold text-willtank-600 mb-2">10k+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
