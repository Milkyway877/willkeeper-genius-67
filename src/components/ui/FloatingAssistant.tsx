
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, BrainCircuit, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  
  const toggleOpen = () => setIsOpen(!isOpen);
  
  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setIsOpen(false);
      setStep(1);
    }
  };
  
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  // Step content
  const stepContent = [
    {
      title: "Welcome to WillTank",
      description: "I'm your AI assistant. I'll help you navigate the app and set up your digital legacy.",
      icon: <BrainCircuit className="h-6 w-6 text-primary" />,
    },
    {
      title: "Create Your Will",
      description: "I can help you craft a legally sound will based on your needs and preferences.",
      icon: <BrainCircuit className="h-6 w-6 text-purple-500" />,
    },
    {
      title: "Need Help?",
      description: "Ask me any questions about the app features or how to secure your digital legacy.",
      icon: <BrainCircuit className="h-6 w-6 text-blue-500" />,
    },
  ];
  
  return (
    <>
      {/* Assistant button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="fixed right-4 bottom-4 z-50"
          >
            <Button
              size="lg"
              className="w-12 h-12 rounded-full shadow-lg"
              onClick={toggleOpen}
            >
              <BrainCircuit className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Assistant panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed right-4 bottom-4 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden z-50 border border-gray-200 dark:border-gray-800"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-semibold flex items-center">
                <BrainCircuit className="h-5 w-5 mr-2 text-primary" />
                WillTank Assistant
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full"
                onClick={toggleOpen}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Content */}
            <div className="p-4">
              <div className="flex justify-center mb-4">
                {stepContent[step - 1].icon}
              </div>
              
              <h4 className="text-lg font-semibold text-center mb-2">
                {stepContent[step - 1].title}
              </h4>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
                {stepContent[step - 1].description}
              </p>
              
              {/* Pagination dots */}
              <div className="flex justify-center space-x-2 mb-4">
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-2 w-2 rounded-full",
                      index + 1 === step ? "bg-primary" : "bg-gray-300 dark:bg-gray-700"
                    )}
                  />
                ))}
              </div>
              
              {/* Navigation buttons */}
              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevStep}
                  disabled={step === 1}
                  className={step === 1 ? "invisible" : ""}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                
                <Button
                  size="sm"
                  onClick={nextStep}
                >
                  {step === totalSteps ? "Got it" : "Next"}
                  {step !== totalSteps && <ChevronRight className="h-4 w-4 ml-2" />}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
