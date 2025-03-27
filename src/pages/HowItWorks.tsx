
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { CheckCircle, Edit, Users, Shield, Smartphone, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HowItWorks() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const steps = [
    {
      title: "Create Your Account",
      description: "Sign up in minutes with our secure, user-friendly platform. Verify your identity to ensure your will's legal validity.",
      icon: <CheckCircle className="text-white" size={24} />,
      color: "bg-willtank-500"
    },
    {
      title: "Draft Your Will",
      description: "Follow our guided process to create a legally sound document. Our intuitive interface makes even complex arrangements simple.",
      icon: <Edit className="text-white" size={24} />,
      color: "bg-willtank-600"
    },
    {
      title: "Add Beneficiaries",
      description: "Easily designate who will receive your assets. Add detailed instructions for specific bequests or conditions.",
      icon: <Users className="text-white" size={24} />,
      color: "bg-willtank-700"
    },
    {
      title: "Secure Your Documents",
      description: "All documents are encrypted and stored in our secure vault. Only you control who has access and when.",
      icon: <Shield className="text-white" size={24} />,
      color: "bg-willtank-800"
    }
  ];

  const faqs = [
    {
      question: "Is my will legally binding?",
      answer: "Yes, wills created on WillTank are legally binding as long as they are properly executed according to your jurisdiction's requirements. We provide detailed instructions for witnessing and signing to ensure validity."
    },
    {
      question: "How do I update my will?",
      answer: "You can update your will anytime through your WillTank dashboard. Each revision is tracked and stored securely, and you can choose which version is the active one."
    },
    {
      question: "Who can access my will?",
      answer: "Only you and the trusted contacts you specifically designate can access your will, and you control exactly when and how they can view it."
    },
    {
      question: "Can I include digital assets in my will?",
      answer: "Yes, WillTank provides specific sections for digital assets, including cryptocurrencies, online accounts, and digital collections, with secure methods to pass access to your beneficiaries."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-20">
        <div className="container px-4 md:px-6 max-w-5xl mx-auto">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">How WillTank Works</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Create, store, and share your will securely in four simple steps. Our platform makes estate planning straightforward while ensuring maximum legal protection.
            </p>
          </motion.div>

          <motion.div 
            className="relative mb-20"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            {/* Connector line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-200 transform -translate-x-1/2 hidden md:block"></div>
            
            {/* Steps */}
            <div className="space-y-12 relative">
              {steps.map((step, index) => (
                <motion.div 
                  key={index}
                  className="md:grid md:grid-cols-2 gap-8 items-center"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className={index % 2 === 0 ? "md:order-1" : "md:order-2"}>
                    <div className="flex items-center mb-4">
                      <div className={`${step.color} w-12 h-12 rounded-full flex items-center justify-center mr-4 z-10`}>
                        {step.icon}
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-800">Step {index + 1}: {step.title}</h3>
                    </div>
                    <p className="text-gray-600 pl-16">{step.description}</p>
                  </div>
                  <div className={`bg-gray-50 rounded-xl p-6 mt-4 md:mt-0 ${index % 2 === 0 ? "md:order-2" : "md:order-1"}`}>
                    <div className="h-40 flex items-center justify-center bg-white rounded-lg border border-gray-200">
                      <div className="text-center text-gray-400">
                        <Smartphone size={48} className="mx-auto mb-2" />
                        <p className="text-sm">Step {index + 1} Illustration</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="bg-willtank-50 rounded-2xl p-8 md:p-12 mb-16"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <motion.div 
                  key={index} 
                  className="bg-white rounded-xl p-6 shadow-sm"
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className="flex items-start">
                    <HelpCircle className="text-willtank-500 mr-3 mt-1 flex-shrink-0" size={18} />
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">{faq.question}</h3>
                      <p className="text-gray-600 text-sm">{faq.answer}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to secure your legacy?</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of users who have already created their secure, legally-binding wills with WillTank.
            </p>
            <Button size="lg" className="px-8">Get Started Today</Button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
