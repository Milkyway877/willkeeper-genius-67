
import React from 'react';
import { Button } from '@/components/common/Button';
import { ChevronRight, Shield, Lock, CheckCircle } from 'lucide-react';

export function Hero() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 overflow-hidden">
      <div className="container px-4 md:px-6">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-center">
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-willtank-50 px-3 py-1 text-sm font-medium text-willtank-700 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <Shield size={14} />
              <span>Bank-Grade Security</span>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Secure Your Legacy with <span className="text-willtank-500">Will</span>Tank
            </h1>
            
            <p className="text-lg text-gray-600 md:text-xl max-w-[600px] animate-fade-in" style={{ animationDelay: '0.3s' }}>
              The most secure platform for creating, storing, and managing your will. Ensure your legacy is preserved exactly as you intend.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Button 
                size="lg" 
                rightIcon={<ChevronRight size={16} />}
              >
                Get Started Now
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
              >
                View Plans
              </Button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-willtank-500" />
                <span className="text-sm text-gray-600">AI-Powered Creation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-willtank-500" />
                <span className="text-sm text-gray-600">End-to-End Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-willtank-500" />
                <span className="text-sm text-gray-600">Executor Management</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-willtank-500" />
                <span className="text-sm text-gray-600">Legal Compliance</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-willtank-500" />
                <span className="text-sm text-gray-600">Multi-Device Access</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-willtank-500" />
                <span className="text-sm text-gray-600">24/7 Support</span>
              </div>
            </div>
          </div>
          
          <div className="relative animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-willtank-100 to-willtank-50 rounded-2xl transform rotate-3 scale-105 animate-float"></div>
            <div className="relative bg-white rounded-2xl shadow-medium overflow-hidden border border-willtank-100">
              <div className="p-1 bg-willtank-50 border-b border-willtank-100">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-medium mb-1">My Last Will & Testament</h3>
                    <p className="text-sm text-gray-500">Last updated: Today at 10:45 AM</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <Lock size={12} />
                    <span>Secured</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="h-3 bg-gray-100 rounded-full w-full"></div>
                  <div className="h-3 bg-gray-100 rounded-full w-5/6"></div>
                  <div className="h-3 bg-gray-100 rounded-full w-full"></div>
                  <div className="h-3 bg-gray-100 rounded-full w-4/6"></div>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="p-3 bg-willtank-50 rounded-lg border border-willtank-100">
                    <h4 className="text-xs text-gray-500 mb-1">Executor</h4>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                      <span className="text-sm font-medium">Jane Smith</span>
                    </div>
                  </div>
                  <div className="p-3 bg-willtank-50 rounded-lg border border-willtank-100">
                    <h4 className="text-xs text-gray-500 mb-1">Assets</h4>
                    <div className="flex items-center gap-2">
                      <Lock size={14} className="text-willtank-500" />
                      <span className="text-sm font-medium">5 Recorded</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
