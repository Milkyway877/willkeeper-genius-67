
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { UserPlus, FileText, Shield, Share2, ArrowRight, HelpCircle, CheckCircle } from 'lucide-react';

export default function HowItWorks() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const steps = [
    {
      title: "Create Your Account",
      description: "Sign up in minutes with your email address. We'll verify your identity and set up your secure account with multi-factor authentication.",
      icon: <UserPlus className="text-willtank-500" size={24} />,
      image: "/placeholder.svg",
      benefits: [
        "Secure verification process",
        "Multi-factor authentication",
        "Data encryption from day one",
        "No credit card required to start"
      ]
    },
    {
      title: "Draft Your Will",
      description: "Use our intuitive interface to create a legally binding will. Our AI-powered assistant helps you make informed decisions based on your jurisdiction.",
      icon: <FileText className="text-willtank-500" size={24} />,
      image: "/placeholder.svg",
      benefits: [
        "Step-by-step guided process",
        "Location-specific legal compliance",
        "AI suggestions for completeness",
        "Real-time document validation"
      ]
    },
    {
      title: "Secure Your Documents",
      description: "Your will and related documents are protected with military-grade encryption. Only you control who can access your information and when.",
      icon: <Shield className="text-willtank-500" size={24} />,
      image: "/placeholder.svg",
      benefits: [
        "AES-256 bit encryption",
        "Role-based access control",
        "Digital signature authentication",
        "Tamper-evident sealing"
      ]
    },
    {
      title: "Share With Trusted Contacts",
      description: "Designate executors and trusted contacts who will receive access to your will when needed, with the level of permissions you specify.",
      icon: <Share2 className="text-willtank-500" size={24} />,
      image: "/placeholder.svg",
      benefits: [
        "Granular permission settings",
        "Time-based access controls",
        "Secure notification system",
        "Executor preparation resources"
      ]
    }
  ];

  const faqs = [
    {
      question: "How long does it take to create a will?",
      answer: "Most users complete their will in less than 30 minutes. Our intuitive interface guides you through each step, and you can save your progress at any time."
    },
    {
      question: "Is my will legally binding?",
      answer: "Yes, wills created through WillTank are legally binding as long as they're properly signed and witnessed according to your jurisdiction's requirements. Our system provides clear guidance on these requirements."
    },
    {
      question: "Can I update my will?",
      answer: "Absolutely. You can update your will at any time. We recommend reviewing your will annually or whenever you experience major life changes like marriage, having children, or acquiring significant assets."
    },
    {
      question: "How do executors access my will when needed?",
      answer: "You'll designate executors during the will creation process. When the time comes, they'll receive secure access instructions through the contact methods you've provided, with appropriate identity verification."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-16 md:py-20">
        <div className="container px-4 md:px-6 max-w-5xl mx-auto">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-willtank-50 px-3 py-1 text-sm font-medium text-willtank-700 mb-4">
              <HelpCircle size={14} />
              <span>Simple Process</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">How WillTank Works</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform simplifies the estate planning process with a secure, intuitive approach designed for today's digital world.
            </p>
          </motion.div>

          <div className="space-y-24 mb-20">
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                className={`grid md:grid-cols-2 gap-10 items-center ${index % 2 !== 0 ? 'md:grid-flow-dense' : ''}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className={index % 2 !== 0 ? 'md:col-start-2' : ''}>
                  <div className="bg-willtank-50 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                    {step.icon}
                  </div>
                  <span className="text-willtank-600 font-medium mb-2 block">Step {index + 1}</span>
                  <h2 className="text-2xl font-bold mb-4 text-gray-900">{step.title}</h2>
                  <p className="text-gray-600 mb-6">{step.description}</p>
                  
                  <div className="space-y-3">
                    {step.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle size={18} className="text-willtank-500 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className={`rounded-xl overflow-hidden shadow-md bg-gradient-to-br from-willtank-50 to-gray-100 aspect-[4/3] flex items-center justify-center ${index % 2 !== 0 ? 'md:col-start-1' : ''}`}>
                  <img 
                    src={step.image} 
                    alt={`Step ${index + 1}: ${step.title}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="bg-gradient-to-br from-willtank-50 to-gray-50 rounded-2xl p-8 md:p-12 mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Get answers to the most common questions about using WillTank for your estate planning needs.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <motion.div 
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Ready to Secure Your Legacy?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Start creating your will today and ensure your assets are protected for future generations.
            </p>
            <Link to="/auth/signup">
              <Button className="bg-willtank-500 hover:bg-willtank-600">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
