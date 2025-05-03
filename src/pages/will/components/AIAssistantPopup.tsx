
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Lightbulb, MessageCircleQuestion } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIAssistantPopupProps {
  field: string;
  isVisible: boolean;
  onAccept: (suggestion: string) => void;
  onDismiss: () => void;
  position: { x: number, y: number };
}

export function AIAssistantPopup({ field, isVisible, onAccept, onDismiss, position }: AIAssistantPopupProps) {
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const [animationComplete, setAnimationComplete] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  
  // Field-specific AI assistance
  useEffect(() => {
    if (isVisible) {
      const fieldSuggestions: Record<string, string[]> = {
        fullName: [
          "Enter your complete legal name as it appears on official documents.",
          "Use your full name including middle name if you commonly use it on legal documents."
        ],
        dateOfBirth: [
          "Enter your date of birth in MM/DD/YYYY format.",
          "For example: 05/15/1980"
        ],
        address: [
          "Enter your current legal address, including city, state, and zip code.",
          "For example: 123 Main Street, Anytown, CA 12345"
        ],
        executorName: [
          "Choose someone trustworthy who is willing and able to manage your estate.",
          "Common choices include spouses, adult children, or trusted friends."
        ],
        alternateExecutorName: [
          "Select a backup executor in case your first choice is unable or unwilling to serve.",
          "This person should be equally trustworthy and capable."
        ],
        beneficiaries: [
          "List each beneficiary with their name, relationship, and percentage of your estate.",
          "For example: - Jane Doe (Spouse): 50% of the estate\n- John Doe (Son): 25% of the estate\n- Sarah Doe (Daughter): 25% of the estate"
        ],
        specificBequests: [
          "Detail any specific items or monetary amounts you want to leave to particular people.",
          "For example: I leave my grandfather's pocket watch to my son, John Doe."
        ],
        residualEstate: [
          "Specify who receives the remainder of your estate after specific bequests.",
          "For example: I give all the rest and residue of my estate to my spouse, Jane Doe."
        ],
        finalArrangements: [
          "Include preferences for funeral services, burial or cremation, and memorial requests.",
          "For example: I wish to be cremated and have my ashes scattered at [location]."
        ]
      };
      
      setCurrentSuggestions(fieldSuggestions[field] || ["Let me help you complete this field with appropriate information."]);
    }
  }, [field, isVisible]);

  // Adjusts position based on available screen space
  useEffect(() => {
    if (popupRef.current && isVisible) {
      const rect = popupRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Default positioning - start at the click coordinates
      let newTop = position.y;
      let newLeft = position.x;
      
      // Add a small offset from the cursor
      const offsetY = 10;
      const offsetX = 10;
      
      // Check if the popup would go off the bottom of the screen
      if (position.y + rect.height + offsetY > viewportHeight) {
        // Place it above the click position
        newTop = Math.max(10, position.y - rect.height - offsetY);
      } else {
        // Place it below the click position with offset
        newTop = position.y + offsetY;
      }
      
      // Check if the popup would go off the right of the screen
      if (position.x + rect.width + offsetX > viewportWidth) {
        // Place it to the left of the click position
        newLeft = Math.max(10, viewportWidth - rect.width - offsetX);
      } else {
        // Place it to the right of the click position with offset
        newLeft = position.x + offsetX;
      }
      
      // Apply the calculated position
      popupRef.current.style.top = `${newTop}px`;
      popupRef.current.style.left = `${newLeft}px`;
    }
  }, [position, isVisible, animationComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={popupRef}
        className="fixed z-50"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        onAnimationComplete={() => setAnimationComplete(true)}
      >
        <Card className="w-72 shadow-lg border-willtank-200">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-medium text-willtank-800">AI Suggestions</h3>
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-6 w-6" 
                onClick={onDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {currentSuggestions.map((suggestion, index) => (
                <div 
                  key={index} 
                  className="bg-willtank-50 p-2 rounded-md text-sm border border-willtank-100"
                >
                  <p className="text-willtank-700 mb-2">{suggestion}</p>
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 text-xs"
                      onClick={onDismiss}
                    >
                      Dismiss
                    </Button>
                    <Button 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={() => onAccept(suggestion)}
                    >
                      <Check className="h-3 w-3 mr-1" /> 
                      Accept
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
