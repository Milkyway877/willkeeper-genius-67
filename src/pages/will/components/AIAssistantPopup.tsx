
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Lightbulb, MessageCircleQuestion, Loader2 } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  
  // Enhanced field-specific AI assistance with more comprehensive suggestions
  useEffect(() => {
    if (isVisible) {
      setIsLoading(true);
      
      // Simulate AI processing time
      setTimeout(() => {
        const fieldSuggestions: Record<string, string[]> = {
          'full_legal_name': [
            "Use your complete legal name as it appears on official documents like your driver's license or passport.",
            "Include middle names if they commonly appear on your legal documents to avoid confusion."
          ],
          'date_of_birth': [
            "Enter your date of birth in the format MM/DD/YYYY for consistency.",
            "Ensure this matches the date on your official identification documents."
          ],
          'current_address': [
            "Provide your complete current legal residence address including apartment numbers.",
            "Use the address where you primarily reside and receive mail for legal purposes."
          ],
          'beneficiaries': [
            "List all individuals or organizations who should inherit your assets.",
            "Consider including contingent beneficiaries in case your primary choices cannot inherit.",
            "Specify the percentage or specific assets each beneficiary should receive."
          ],
          'executors': [
            "Choose someone you trust who is organized and willing to handle estate matters.",
            "Consider selecting an alternate executor in case your first choice cannot serve.",
            "Your executor should be responsible, detail-oriented, and available when needed."
          ],
          'assets': [
            "Include all significant assets: real estate, bank accounts, investments, vehicles, and valuable personal property.",
            "Be specific about account numbers and locations to help your executor locate assets.",
            "Consider both tangible assets (property, jewelry) and intangible assets (stocks, digital accounts)."
          ],
          'guardians': [
            "Select guardians who share your values and can provide a stable, loving environment.",
            "Discuss your choice with potential guardians before naming them in your will.",
            "Consider the guardian's age, health, financial stability, and relationship with your children."
          ],
          'final_wishes': [
            "Include preferences for funeral arrangements, burial or cremation, and memorial services.",
            "Specify any charitable donations you'd like made in your memory.",
            "Add any special instructions for the distribution of personal items with sentimental value."
          ],
          'personal': [
            "Ensure all personal information is current and matches your legal documents.",
            "Double-check spelling and formatting for accuracy."
          ]
        };
        
        const suggestions = fieldSuggestions[field] || fieldSuggestions[field.toLowerCase()] || [
          "Let me help you complete this section with appropriate legal language and guidance.",
          "Consider consulting with a legal professional for complex situations."
        ];
        
        setCurrentSuggestions(suggestions);
        setIsLoading(false);
      }, 800);
    }
  }, [field, isVisible]);

  // Enhanced positioning logic
  useEffect(() => {
    if (popupRef.current && isVisible && animationComplete) {
      const rect = popupRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      let newTop = position.y;
      let newLeft = position.x;
      
      const offsetY = 15;
      const offsetX = 15;
      const padding = 20;
      
      // Vertical positioning
      if (position.y + rect.height + offsetY > viewportHeight - padding) {
        newTop = Math.max(padding, position.y - rect.height - offsetY);
      } else {
        newTop = position.y + offsetY;
      }
      
      // Horizontal positioning
      if (position.x + rect.width + offsetX > viewportWidth - padding) {
        newLeft = Math.max(padding, position.x - rect.width - offsetX);
      } else {
        newLeft = position.x + offsetX;
      }
      
      // Ensure popup stays within viewport
      newTop = Math.max(padding, Math.min(newTop, viewportHeight - rect.height - padding));
      newLeft = Math.max(padding, Math.min(newLeft, viewportWidth - rect.width - padding));
      
      popupRef.current.style.top = `${newTop}px`;
      popupRef.current.style.left = `${newLeft}px`;
    }
  }, [position, isVisible, animationComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={popupRef}
        className="fixed z-[9999] max-w-sm"
        initial={{ opacity: 0, scale: 0.9, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onAnimationComplete={() => setAnimationComplete(true)}
      >
        <Card className="shadow-2xl border-2 border-willtank-200 bg-white">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-100">
                  <Lightbulb className="h-4 w-4 text-amber-600" />
                </div>
                <h3 className="text-sm font-semibold text-willtank-800">AI Document Assistant</h3>
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-6 w-6 hover:bg-gray-100" 
                onClick={onDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-willtank-600" />
                <span className="ml-2 text-sm text-willtank-700">Generating suggestions...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {currentSuggestions.map((suggestion, index) => (
                  <div 
                    key={index} 
                    className="bg-gradient-to-r from-willtank-50 to-blue-50 p-3 rounded-lg border border-willtank-100"
                  >
                    <p className="text-sm text-willtank-800 leading-relaxed mb-3">{suggestion}</p>
                    
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 text-xs hover:bg-gray-50"
                        onClick={onDismiss}
                      >
                        Not Helpful
                      </Button>
                      <Button 
                        size="sm" 
                        className="h-7 text-xs bg-willtank-600 hover:bg-willtank-700"
                        onClick={() => onAccept(suggestion)}
                      >
                        <Check className="h-3 w-3 mr-1" /> 
                        Apply Suggestion
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 text-center">
                    💡 These suggestions are AI-generated. Consider consulting a legal professional for complex situations.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
