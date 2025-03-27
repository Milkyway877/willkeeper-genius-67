
import React from 'react';
import { Shield, FileText, Users, Zap, Lock, Globe } from 'lucide-react';

const features = [
  {
    icon: <FileText className="h-6 w-6 text-willtank-500" />,
    title: 'AI-Powered Will Creation',
    description: 'Generate legally-binding will documents with the assistance of our advanced AI, customized to your specific needs and location.'
  },
  {
    icon: <Shield className="h-6 w-6 text-willtank-500" />,
    title: 'Bank-Grade Security',
    description: 'Rest easy knowing your sensitive information is protected with end-to-end encryption and multiple authentication factors.'
  },
  {
    icon: <Users className="h-6 w-6 text-willtank-500" />,
    title: 'Executor Management',
    description: 'Assign trusted executors for your will and provide them with the appropriate level of access and information.'
  },
  {
    icon: <Globe className="h-6 w-6 text-willtank-500" />,
    title: 'Location-Based Services',
    description: 'Google Maps integration for asset location tracking and executor assignment based on proximity and availability.'
  },
  {
    icon: <Zap className="h-6 w-6 text-willtank-500" />,
    title: 'Multi-Device Access',
    description: 'Access your will from any device with our responsive platform that works flawlessly on mobile, tablet, or desktop.'
  },
  {
    icon: <Lock className="h-6 w-6 text-willtank-500" />,
    title: 'Secure Document Vault',
    description: 'Store additional important documents alongside your will in our highly secure document vault system.'
  }
];

export function Features() {
  return (
    <section id="features" className="py-12 sm:py-16 lg:py-20 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Comprehensive Will Management
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Our platform offers a complete suite of tools to create, manage, and secure your will with confidence.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 hover-lift border border-gray-100"
            >
              <div className="h-12 w-12 rounded-lg bg-willtank-50 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
