
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { Shield, FileText, Users, Globe, Zap, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FloatingAssistant } from '@/components/ui/FloatingAssistant';

export default function Services() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const services = [
    {
      icon: <FileText className="h-6 w-6 text-willtank-500" />,
      title: 'AI-Powered Will Creation',
      description: 'Generate legally-binding will documents with the assistance of our advanced AI, customized to your specific needs and location.',
      features: [
        'Intuitive step-by-step guidance',
        'Legal terminology explained in plain language',
        'Location-specific requirements automatically applied',
        'Custom clauses for unique situations'
      ]
    },
    {
      icon: <Shield className="h-6 w-6 text-willtank-500" />,
      title: 'Bank-Grade Security',
      description: 'Rest easy knowing your sensitive information is protected with end-to-end encryption and multiple authentication factors.',
      features: [
        'AES-256 encryption for all data',
        'Multi-factor authentication',
        'Regular security audits',
        'Compliance with global privacy regulations'
      ]
    },
    {
      icon: <Users className="h-6 w-6 text-willtank-500" />,
      title: 'Executor Management',
      description: 'Assign trusted executors for your will and provide them with the appropriate level of access and information.',
      features: [
        'Digital executor invitations',
        'Custom permission levels',
        'Guided executor responsibilities',
        'Notification system for important updates'
      ]
    },
    {
      icon: <Globe className="h-6 w-6 text-willtank-500" />,
      title: 'Location-Based Services',
      description: 'Google Maps integration for asset location tracking and executor assignment based on proximity and availability.',
      features: [
        'Property location mapping',
        'Geolocation of physical assets',
        'Proximity-based executor suggestions',
        'Regional legal requirement compliance'
      ]
    },
    {
      icon: <Zap className="h-6 w-6 text-willtank-500" />,
      title: 'Multi-Device Access',
      description: 'Access your will from any device with our responsive platform that works flawlessly on mobile, tablet, or desktop.',
      features: [
        'Synchronized across all devices',
        'Offline access capabilities',
        'Mobile-optimized interface',
        'Real-time updates across devices'
      ]
    },
    {
      icon: <Lock className="h-6 w-6 text-willtank-500" />,
      title: 'Secure Document Vault',
      description: 'Store additional important documents alongside your will in our highly secure document vault system.',
      features: [
        'Unlimited document storage',
        'Organized categorization system',
        'Document sharing with specific individuals',
        'Version history and tracking'
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="container max-w-6xl py-16 md:py-24">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Services</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              WillTank provides comprehensive estate planning solutions designed to protect your legacy
              and provide peace of mind for you and your loved ones.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            {services.map((service, index) => (
              <motion.div 
                key={index} 
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="h-12 w-12 bg-willtank-50 rounded-full flex items-center justify-center mb-4">
                  {React.cloneElement(service.icon, { className: "h-6 w-6 text-willtank-600" })}
                </div>
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-willtank-500 flex-shrink-0 mt-1">•</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="bg-willtank-50 rounded-xl p-8 border border-willtank-100 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Choose the plan that's right for you and begin securing your legacy today.
              All plans come with a 14-day money-back guarantee.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/pricing">
                <Button className="bg-willtank-600 hover:bg-willtank-700">
                  View Pricing Plans
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline">
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
      <FloatingAssistant />
    </div>
  );
}
