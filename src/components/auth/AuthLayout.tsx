
import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/logo/Logo';
import { PageTransition } from '@/components/animations/PageTransition';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
  children: React.ReactNode;
  rightPanel: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, rightPanel, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background">
      {/* Left panel with form */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="p-6 md:p-8">
          <Link to="/" className="inline-block">
            <Logo color="default" className="h-8 w-auto" />
          </Link>
        </header>
        
        <main className="flex-1 flex items-center justify-center px-6 py-10 md:px-12">
          <PageTransition className="w-full max-w-md mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">{title}</h1>
              {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
            </div>
            
            {children}
          </PageTransition>
        </main>
        
        <footer className="p-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} WillTank. All rights reserved.
        </footer>
      </div>
      
      {/* Right panel with security info */}
      <div className={cn(
        "hidden lg:flex lg:w-[450px] bg-willtank-50 flex-col items-center justify-center p-12 border-l border-border",
        "dark:bg-slate-900"
      )}>
        <PageTransition>
          {rightPanel}
        </PageTransition>
      </div>
    </div>
  );
}
