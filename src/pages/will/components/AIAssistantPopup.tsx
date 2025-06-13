
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
  
  // Comprehensive field-specific AI assistance
  useEffect(() => {
    if (isVisible) {
      setIsLoading(true);
      
      // Simulate AI processing time
      setTimeout(() => {
        const fieldGuidance: Record<string, { title: string, suggestions: string[], examples?: string[] }> = {
          'full_legal_name': {
            title: 'Legal Name Guidance',
            suggestions: [
              "Enter your complete legal name exactly as it appears on your driver's license, passport, or birth certificate.",
              "Include your middle name if it appears on your government-issued ID to avoid any confusion.",
              "Do not use nicknames, abbreviations, or preferred names - use your official legal name only."
            ],
            examples: ["John Michael Smith", "Mary Elizabeth Johnson-Davis"]
          },
          'date_of_birth': {
            title: 'Date of Birth Requirements',
            suggestions: [
              "Enter your date of birth in MM/DD/YYYY format to match legal document standards.",
              "This date must match your official identification documents for legal validity.",
              "Double-check the date for accuracy as this is used for identity verification."
            ]
          },
          'current_address': {
            title: 'Legal Residence Address',
            suggestions: [
              "Provide your complete current legal residence address including apartment or unit numbers.",
              "Use the address where you primarily reside and receive official mail.",
              "This should be your domicile address for legal purposes, not a P.O. Box or temporary address."
            ],
            examples: ["123 Main Street, Apt 4B, Anytown, CA 90210", "456 Oak Avenue, Springfield, IL 62701"]
          },
          'beneficiaries': {
            title: 'Beneficiary Information',
            suggestions: [
              "List all individuals or organizations who should inherit your assets, including their full legal names.",
              "Specify the percentage or specific assets each beneficiary should receive (percentages should total 100%).",
              "Consider naming contingent beneficiaries in case your primary beneficiaries cannot inherit.",
              "Include relationship to you and contact information to help executors locate beneficiaries."
            ],
            examples: ["Spouse: 50%, Children: 25% each", "Primary: John Smith (son), Contingent: Local Charity"]
          },
          'executors': {
            title: 'Choosing Your Executor',
            suggestions: [
              "Select someone you trust completely who is organized, responsible, and willing to handle estate matters.",
              "Choose someone who is likely to outlive you and be available when needed.",
              "Consider selecting an alternate executor in case your first choice cannot serve.",
              "Your executor should be detail-oriented and comfortable handling financial and legal tasks."
            ],
            examples: ["Primary: Spouse or adult child", "Alternate: Trusted sibling or close friend", "Professional: Attorney or bank trust department"]
          },
          'assets': {
            title: 'Asset Documentation',
            suggestions: [
              "Include all significant assets: real estate, bank accounts, investment accounts, vehicles, and valuable personal property.",
              "Be specific about account numbers, financial institutions, and property addresses to help your executor.",
              "Consider both tangible assets (house, car, jewelry) and intangible assets (stocks, bonds, digital accounts).",
              "Don't forget retirement accounts, life insurance policies, and business interests."
            ],
            examples: ["Real Estate: Primary residence, rental properties", "Financial: Checking, savings, 401(k), IRA accounts", "Personal: Jewelry, art, collections"]
          },
          'guardians': {
            title: 'Guardian Selection Guidance',
            suggestions: [
              "Choose guardians who share your values and can provide a stable, loving environment for your children.",
              "Discuss your choice with potential guardians before naming them to ensure they're willing and able.",
              "Consider the guardian's age, health, financial stability, and existing relationship with your children.",
              "Name alternate guardians in case your first choice cannot serve when needed."
            ],
            examples: ["Primary: Close family member who knows your children well", "Alternate: Trusted friends with similar values"]
          },
          'final_wishes': {
            title: 'Final Arrangements',
            suggestions: [
              "Include your preferences for funeral arrangements, burial or cremation, and memorial services.",
              "Specify any charitable donations you'd like made in your memory.",
              "Add instructions for the distribution of personal items with sentimental value.",
              "Include any special requests for your funeral or memorial service."
            ],
            examples: ["Cremation with memorial service at local church", "Burial in family plot, donations to favorite charity", "Simple service, distribute photo albums to grandchildren"]
          },
          'personal': {
            title: 'Personal Information Tips',
            suggestions: [
              "Ensure all personal information is current and matches your legal documents.",
              "Use your legal name as it appears on government-issued identification.",
              "Provide your primary legal residence address for jurisdictional purposes."
            ]
          }
        };
        
        const guidance = fieldGuidance[field] || fieldGuidance[field.toLowerCase()] || {
          title: 'General Guidance',
          suggestions: [
            "Provide accurate and complete information for this section.",
            "Consider how this information affects your estate planning goals.",
            "Consult with a legal professional for complex situations."
          ]
        };
        
        setCurrentSuggestions(guidance.suggestions);
        setIsLoading(false);
      }, 600);
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
        className="fixed z-[9999] max-w-md"
        initial={{ opacity: 0, scale: 0.9, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onAnimationComplete={() => setAnimationComplete(true)}
      >
        <Card className="shadow-2xl border-2 border-willtank-200 bg-white">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Lightbulb className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-willtank-800">Field Assistance</h3>
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
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-willtank-600" />
                <span className="ml-2 text-sm text-willtank-700">Loading guidance...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {currentSuggestions.map((suggestion, index) => (
                  <div 
                    key={index} 
                    className="bg-gradient-to-r from-blue-50 to-willtank-50 p-4 rounded-lg border border-blue-100"
                  >
                    <p className="text-sm text-gray-800 leading-relaxed mb-3">{suggestion}</p>
                    
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 text-xs hover:bg-gray-50"
                        onClick={onDismiss}
                      >
                        Got it
                      </Button>
                      <Button 
                        size="sm" 
                        className="h-7 text-xs bg-willtank-600 hover:bg-willtank-700"
                        onClick={() => onAccept(suggestion)}
                      >
                        <Check className="h-3 w-3 mr-1" /> 
                        Apply Guidance
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 text-center">
                    💡 This guidance is based on legal best practices. Consider consulting an attorney for complex situations.
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
