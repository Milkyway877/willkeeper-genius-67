
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MessageCircleQuestion, Sparkle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIFloatingIndicatorProps {
  onRequestHelp: (field?: string) => void;
}

export function AIFloatingIndicator({ onRequestHelp }: AIFloatingIndicatorProps) {
  const [expanded, setExpanded] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(true);
  const { toast } = useToast();
  
  // Common questions that users might have
  const commonQuestions = [
    { id: 1, question: "Help me choose an executor", field: "executorName" },
    { id: 2, question: "How to divide my estate", field: "beneficiaries" },
    { id: 3, question: "What are final arrangements", field: "finalArrangements" },
    { id: 4, question: "General will assistance", field: undefined }
  ];
  
  const handleQuestionClick = (field?: string) => {
    onRequestHelp(field);
    setExpanded(false);
    
    toast({
      title: "AI Assistant activated",
      description: "I'll guide you through this section of your will."
    });
  };
  
  // Stop pulsing animation after first expansion
  const handleExpand = () => {
    setExpanded(true);
    setPulseAnimation(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="bg-white rounded-lg shadow-lg p-4 mb-3 border border-willtank-100"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium flex items-center">
                <Sparkle className="h-4 w-4 text-amber-500 mr-2" />
                AI Document Assistant
              </h3>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-6 w-6" 
                onClick={() => setExpanded(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            
            <p className="text-xs text-gray-600 mb-3">
              How can I help with your will document today?
            </p>
            
            <div className="space-y-2">
              {commonQuestions.map((q) => (
                <Button
                  key={q.id}
                  variant="ghost"
                  className="w-full justify-start text-left text-xs h-auto py-2"
                  onClick={() => handleQuestionClick(q.field)}
                >
                  <MessageCircleQuestion className="h-3 w-3 mr-2 text-willtank-500" />
                  {q.question}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.button
        className={`bg-willtank-600 text-white rounded-full p-3 shadow-lg flex items-center justify-center ${pulseAnimation ? 'animate-pulse' : ''}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleExpand}
      >
        <MessageCircleQuestion className="h-6 w-6" />
      </motion.button>
    </div>
  );
}
