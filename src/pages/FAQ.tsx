
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQ() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const faqItems = [
    {
      question: "What is WillTank?",
      answer: "WillTank is a secure digital platform designed to simplify estate planning and will creation. We provide tools for creating legally sound wills, storing important documents, and managing your legacy planning in one secure place."
    },
    {
      question: "Is my information secure?",
      answer: "Absolutely. WillTank employs bank-level encryption and security protocols. Your personal information and documents are encrypted and protected with multiple layers of security to ensure complete privacy and confidentiality."
    },
    {
      question: "Are wills created on WillTank legally valid?",
      answer: "Wills created on WillTank are designed to meet legal requirements in most jurisdictions. However, specific legal requirements vary by location. We recommend reviewing your completed will with a legal professional in your jurisdiction to ensure it meets all local requirements."
    },
    {
      question: "How do I update my will?",
      answer: "You can update your will at any time by logging into your WillTank account and accessing the will editor. After making changes, you'll need to go through the finalization process again, which may include re-signing and having your updated will witnessed according to your local laws."
    },
    {
      question: "What happens to my will when I die?",
      answer: "WillTank includes a death verification system that allows your designated executors to gain access to your will and other important documents after your passing has been verified through our secure verification process."
    },
    {
      question: "How does the executor access my will?",
      answer: "Your designated executor will be notified according to your preferences. They'll go through a verification process to confirm their identity and your passing before being granted access to your will and any other documents you've designated for them."
    },
    {
      question: "Can I store other important documents besides my will?",
      answer: "Yes, WillTank's Legacy Vault feature allows you to securely store and organize important documents such as insurance policies, property deeds, digital asset information, and personal messages to loved ones."
    },
    {
      question: "What subscription plans do you offer?",
      answer: "WillTank offers several subscription plans, from a basic plan for simple will creation to premium plans with advanced features like unlimited document storage, priority support, and automated check-ins. Visit our Pricing page for current plan details and pricing information."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions about WillTank's services, security, and estate planning solutions.
            </p>
          </motion.div>
          
          <motion.div 
            className="max-w-3xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-gray-200 rounded-lg overflow-hidden">
                  <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 text-left font-medium">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-4 bg-white text-gray-700">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-6">
                Couldn't find what you're looking for?
              </p>
              <a href="mailto:support@willtank.com" className="inline-flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition">
                Contact Support
              </a>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
