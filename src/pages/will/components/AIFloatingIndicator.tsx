
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageCircleQuestion, Sparkle, X, ArrowRight, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface AIFloatingIndicatorProps {
  onRequestHelp: (field?: string) => void;
}

export function AIFloatingIndicator({ onRequestHelp }: AIFloatingIndicatorProps) {
  const [expanded, setExpanded] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const { toast } = useToast();
  
  // Common questions that users might have
  const commonQuestions = [
    { id: 1, question: "Help me choose an executor", field: "executorName" },
    { id: 2, question: "How to divide my estate", field: "beneficiaries" },
    { id: 3, question: "What are final arrangements", field: "finalArrangements" },
    { id: 4, question: "General will assistance", field: undefined }
  ];

  // More detailed field-specific questions
  const fieldSuggestions = [
    { id: 'field-1', question: "How should I format my name?", field: "fullName" },
    { id: 'field-2', question: "What address should I use?", field: "address" },
    { id: 'field-3', question: "Who should be my beneficiaries?", field: "beneficiaries" },
    { id: 'field-4', question: "What are specific bequests?", field: "specificBequests" },
    { id: 'field-5', question: "What is a residual estate?", field: "residualEstate" }
  ];
  
  // Hide welcome message after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleQuestionClick = (field?: string) => {
    onRequestHelp(field);
    setExpanded(false);
    
    toast({
      title: "AI Assistant activated",
      description: field ? `I'll help you with the ${field.replace(/([A-Z])/g, ' $1').trim()} section` : "I'll guide you through your will creation"
    });
  };
  
  // Stop pulsing animation after first expansion
  const handleExpand = () => {
    setExpanded(true);
    setPulseAnimation(false);
    setShowWelcome(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 mr-10 bg-willtank-50 border border-willtank-100 rounded-lg p-4 shadow-lg max-w-xs"
          >
            <div className="flex items-start gap-3">
              <Sparkle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-willtank-800 mb-1">AI Document Assistant</h4>
                <p className="text-sm text-willtank-700">
                  I'm here to help you complete your will document. Click on the assistant button for guidance.
                </p>
                <Button 
                  size="sm" 
                  className="mt-2 w-full justify-center" 
                  onClick={handleExpand}
                >
                  Get Started <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {expanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="bg-white rounded-lg shadow-lg p-4 mb-3 border border-willtank-100"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-medium">AI Document Assistant</h3>
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8" 
                onClick={() => setExpanded(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-2">
                How can I help you create your will today?
              </p>
              
              <Badge className="bg-willtank-50 text-willtank-800 border-willtank-200 mb-3">
                <Sparkle className="h-3 w-3 mr-1 text-amber-500" />
                AI-powered guidance
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="bg-willtank-50 rounded-md p-2">
                <h4 className="font-medium text-sm mb-1.5">Common Questions</h4>
                {commonQuestions.map((q) => (
                  <Button
                    key={q.id}
                    variant="ghost"
                    className="w-full justify-start text-left text-xs h-auto py-1.5 mb-0.5"
                    onClick={() => handleQuestionClick(q.field)}
                  >
                    <MessageCircleQuestion className="h-3 w-3 mr-2 text-willtank-500" />
                    {q.question}
                  </Button>
                ))}
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-1.5">Field-Specific Help</h4>
                {fieldSuggestions.map((q) => (
                  <Button
                    key={q.id}
                    variant="ghost"
                    className="w-full justify-start text-left text-xs h-auto py-1.5 mb-0.5"
                    onClick={() => handleQuestionClick(q.field)}
                  >
                    <ArrowRight className="h-3 w-3 mr-2 text-willtank-500" />
                    {q.question}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.button
        className={`bg-willtank-600 text-white rounded-full shadow-lg flex items-center gap-2 px-4 py-3 ${pulseAnimation ? 'animate-pulse' : ''}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleExpand}
      >
        <Sparkle className="h-5 w-5 text-amber-300" />
        <span className="font-medium">AI Document Assistant</span>
      </motion.button>
    </div>
  );
}
