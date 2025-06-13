
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
  
  // Field-specific AI assistance with practical, actionable advice
  useEffect(() => {
    if (isVisible) {
      const fieldSuggestions: Record<string, string[]> = {
        fullName: [
          "Use your complete legal name exactly as it appears on your driver's license or passport.",
          "Include your middle name if you commonly use it on legal documents like your bank account or mortgage."
        ],
        dateOfBirth: [
          "Enter your birth date in MM/DD/YYYY format (e.g., 03/15/1985).",
          "Double-check this matches your official documents - it's used for legal identification."
        ],
        address: [
          "Use your current primary residence address where you receive mail.",
          "Include full address: Street number, street name, city, state, and ZIP code."
        ],
        homeAddress: [
          "Enter your primary residence address where you currently live.",
          "This should match your voter registration or driver's license address."
        ],
        email: [
          "Use an email address you check regularly - important will updates will be sent here.",
          "Consider using a permanent email address that you'll have long-term access to."
        ],
        phoneNumber: [
          "Enter your primary phone number with area code (e.g., (555) 123-4567).",
          "This helps your executor contact you or verify your identity if needed."
        ],
        executorName: [
          "Choose someone you trust completely - they'll handle your entire estate.",
          "Consider someone who is organized, responsible, and willing to take on this role."
        ],
        alternateExecutorName: [
          "Pick a different person than your primary executor as a backup.",
          "This person should also be trustworthy and capable of managing financial matters."
        ],
        executor: [
          "Your executor will manage your estate, pay debts, and distribute assets according to your will.",
          "Choose someone who is organized, trustworthy, and lives reasonably close to you."
        ],
        beneficiaries: [
          "List people who will inherit your assets. Include their full legal names.",
          "Make sure percentages add up to 100%. Consider what happens if a beneficiary dies before you."
        ],
        beneficiary: [
          "Enter the full legal name of someone who will receive part of your estate.",
          "Include their relationship to you and current contact information for your executor's reference."
        ],
        specificBequests: [
          "Detail specific items you want certain people to receive (jewelry, furniture, collections).",
          "Be specific: 'My grandmother's diamond ring to my daughter Sarah' rather than just 'jewelry'."
        ],
        residualEstate: [
          "This covers everything not specifically mentioned elsewhere in your will.",
          "Usually goes to your spouse, children, or other close family members in percentages."
        ],
        finalArrangements: [
          "Include your preferences for burial, cremation, funeral services, or memorial wishes.",
          "Be specific about location preferences and any special requests for your service."
        ],
        funeralPreferences: [
          "Specify whether you prefer burial or cremation, and any specific location requests.",
          "Include any special music, readings, or ceremony preferences you have."
        ],
        memorialService: [
          "Describe the type of memorial or celebration of life you'd prefer.",
          "Include preferred location, attendees, or special elements you'd like included."
        ],
        guardianName: [
          "Choose someone who would care for your minor children if both parents die.",
          "Consider their values, lifestyle, age, and relationship with your children."
        ],
        guardian: [
          "This person will raise your minor children and make important decisions for them.",
          "Choose someone who shares your values and has a good relationship with your kids."
        ],
        assets: [
          "List your major assets: home, vehicles, bank accounts, investments, and valuable items.",
          "Include approximate values and account numbers (last 4 digits) for your executor's reference."
        ],
        // Beneficiary-specific field help
        beneficiary_name: [
          "Enter the complete legal name of this beneficiary exactly as it appears on their ID.",
          "Avoid nicknames - use their full legal name for proper identification."
        ],
        beneficiary_relationship: [
          "Specify your relationship: spouse, child, sibling, parent, friend, etc.",
          "This helps your executor understand your intentions and verify identities."
        ],
        beneficiary_email: [
          "Provide a current email address where this beneficiary can be reached.",
          "This helps your executor contact them when it's time to distribute assets."
        ],
        beneficiary_phone: [
          "Include area code and current phone number for this beneficiary.",
          "Your executor will use this to notify them and coordinate asset distribution."
        ],
        beneficiary_address: [
          "Enter this beneficiary's current mailing address.",
          "This ensures your executor can send legal notices and inheritance information."
        ],
        // Executor-specific field help
        executor_name: [
          "Enter the full legal name of your chosen executor.",
          "This person will manage your entire estate, so choose someone very trustworthy."
        ],
        executor_relationship: [
          "Specify how this person is related to you: spouse, child, sibling, friend, etc.",
          "Family members or close friends are typically chosen as executors."
        ],
        executor_email: [
          "Provide a reliable email address for your executor.",
          "They'll receive important legal documents and court communications at this address."
        ],
        executor_phone: [
          "Include your executor's current phone number with area code.",
          "Courts and attorneys will use this to contact your executor about estate matters."
        ],
        executor_address: [
          "Enter your executor's current mailing address.",
          "Legal notices and court documents will be sent to this address."
        ],
        // Guardian-specific field help
        guardian_name: [
          "Enter the full legal name of the person who would care for your minor children.",
          "Choose someone who loves your children and shares your parenting values."
        ],
        guardian_relationship: [
          "Specify their relationship to you: sibling, parent, close friend, etc.",
          "Consider how well they know and get along with your children."
        ],
        guardian_email: [
          "Provide a current email address for your chosen guardian.",
          "This ensures they can be contacted quickly in case of emergency."
        ],
        guardian_phone: [
          "Include the guardian's current phone number with area code.",
          "Emergency contacts and legal authorities will use this number."
        ],
        guardian_address: [
          "Enter the guardian's current home address.",
          "Consider if this location would be suitable for raising your children."
        ]
      };
      
      setCurrentSuggestions(
        fieldSuggestions[field] || [
          "Provide accurate, complete information for this field.",
          "Double-check your entry for spelling and accuracy."
        ]
      );
    }
  }, [field, isVisible]);

  // Adjusts position based on available screen space
  useEffect(() => {
    if (popupRef.current && isVisible) {
      const rect = popupRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      let newTop = position.y;
      let newLeft = position.x;
      
      const offsetY = 10;
      const offsetX = 10;
      
      if (position.y + rect.height + offsetY > viewportHeight) {
        newTop = Math.max(10, position.y - rect.height - offsetY);
      } else {
        newTop = position.y + offsetY;
      }
      
      if (position.x + rect.width + offsetX > viewportWidth) {
        newLeft = Math.max(10, viewportWidth - rect.width - offsetX);
      } else {
        newLeft = position.x + offsetX;
      }
      
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
        <Card className="w-80 shadow-xl border-willtank-200 bg-white">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <h3 className="text-sm font-semibold text-willtank-800">Field Help</h3>
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-7 w-7" 
                onClick={onDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {currentSuggestions.map((suggestion, index) => (
                <div 
                  key={index} 
                  className="bg-willtank-50 p-3 rounded-lg text-sm border border-willtank-100"
                >
                  <p className="text-willtank-800 mb-3 leading-relaxed">{suggestion}</p>
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 text-xs"
                      onClick={onDismiss}
                    >
                      Got it
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
