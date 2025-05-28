
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Pricing as PricingComponent } from '@/components/home/Pricing';
import { FloatingAssistant } from '@/components/ui/FloatingAssistant';

export default function Pricing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="py-12">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Plans and Pricing
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Choose the right plan for your estate planning needs.
              </p>
            </div>
            
            <PricingComponent />
            
            <div className="mt-16 bg-gray-50 p-8 rounded-lg max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg">Can I change plans later?</h3>
                  <p className="mt-1 text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes will take effect on your next billing cycle.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Do you offer refunds?</h3>
                  <p className="mt-1 text-gray-600">We offer a 14-day money-back guarantee for all plans if you're not satisfied with our service.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">What happens when my subscription ends?</h3>
                  <p className="mt-1 text-gray-600">Your documents will remain securely stored, but you'll lose access to premium features until you renew your subscription.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      <FloatingAssistant />
    </div>
  );
}
