import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, X, Check, ArrowRight, MessageCircleQuestion } from 'lucide-react';

interface AISuggestionsPanelProps {
  isVisible: boolean;
  activeField: string | null;
  onClose: () => void;
  onSuggestionAccept: (field: string, suggestion: string) => void;
}

interface Suggestion {
  id: string;
  text: string;
  field: string;
  type: 'general' | 'specific';
}

export function AISuggestionsPanel({ 
  isVisible, 
  activeField, 
  onClose, 
  onSuggestionAccept 
}: AISuggestionsPanelProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [animatingOut, setAnimatingOut] = useState(false);

  // Generate suggestions based on the active field
  useEffect(() => {
    if (activeField) {
      const fieldSpecificSuggestions = generateSuggestionsForField(activeField);
      setSuggestions(fieldSpecificSuggestions);
      setCurrentSuggestionIndex(0);
    } else {
      const generalSuggestions = generateGeneralSuggestions();
      setSuggestions(generalSuggestions);
    }
  }, [activeField]);

  // Helper function to generate field-specific suggestions (memoized)
  const generateSuggestionsForField = useCallback((field: string): Suggestion[] => {
    const fieldSuggestions: Record<string, Suggestion[]> = {
      'fullName': [
        {
          id: 'name-1',
          text: "Enter your full legal name as it appears on official documents.",
          field: 'fullName',
          type: 'specific'
        },
        {
          id: 'name-2',
          text: "Include your middle name if you commonly use it on legal documents.",
          field: 'fullName',
          type: 'specific'
        }
      ],
      'dateOfBirth': [
        {
          id: 'dob-1',
          text: "Enter your date of birth in MM/DD/YYYY format.",
          field: 'dateOfBirth',
          type: 'specific'
        },
        {
          id: 'dob-2',
          text: "For example: 05/15/1980",
          field: 'dateOfBirth',
          type: 'specific'
        }
      ],
      'address': [
        {
          id: 'addr-1',
          text: "Enter your full current legal address.",
          field: 'address',
          type: 'specific'
        },
        {
          id: 'addr-2',
          text: "For example: 123 Main Street, Anytown, CA 12345",
          field: 'address',
          type: 'specific'
        }
      ],
      'executorName': [
        {
          id: 'exec-1',
          text: "Choose someone trustworthy who is willing and able to manage your estate.",
          field: 'executorName',
          type: 'specific'
        },
        {
          id: 'exec-2',
          text: "Common choices include spouses, adult children, or trusted friends.",
          field: 'executorName',
          type: 'specific'
        }
      ],
      'alternateExecutorName': [
        {
          id: 'alt-exec-1',
          text: "Select a backup executor in case your first choice is unable or unwilling to serve.",
          field: 'alternateExecutorName',
          type: 'specific'
        },
        {
          id: 'alt-exec-2',
          text: "This person should be equally trustworthy and capable.",
          field: 'alternateExecutorName',
          type: 'specific'
        }
      ],
      'beneficiaries': [
        {
          id: 'ben-1',
          text: "List each beneficiary with their name, relationship, and percentage of your estate.",
          field: 'beneficiaries',
          type: 'specific'
        },
        {
          id: 'ben-2',
          text: "For example:\n- Jane Doe (Spouse): 50% of the estate\n- John Doe (Son): 25% of the estate\n- Sarah Doe (Daughter): 25% of the estate",
          field: 'beneficiaries',
          type: 'specific'
        }
      ],
      'specificBequests': [
        {
          id: 'beq-1',
          text: "Detail any specific items or monetary amounts you want to leave to particular people.",
          field: 'specificBequests',
          type: 'specific'
        },
        {
          id: 'beq-2',
          text: "For example: I leave my grandfather's pocket watch to my son, John Doe.",
          field: 'specificBequests',
          type: 'specific'
        }
      ],
      'residualEstate': [
        {
          id: 'res-1',
          text: "Specify who receives the remainder of your estate after specific bequests.",
          field: 'residualEstate',
          type: 'specific'
        },
        {
          id: 'res-2',
          text: "For example: I give all the rest and residue of my estate to my spouse, Jane Doe.",
          field: 'residualEstate',
          type: 'specific'
        }
      ],
      'finalArrangements': [
        {
          id: 'arr-1',
          text: "Include preferences for funeral services, burial or cremation, and memorial requests.",
          field: 'finalArrangements',
          type: 'specific'
        },
        {
          id: 'arr-2',
          text: "For example: I wish to be cremated and have my ashes scattered at [location].",
          field: 'finalArrangements',
          type: 'specific'
        }
      ]
    };

    return fieldSuggestions[field] || generateGeneralSuggestions();
  }, []);

  // Helper function to generate general suggestions (memoized)
  const generateGeneralSuggestions = useCallback((): Suggestion[] => {
    return [
      {
        id: 'gen-1',
        text: "Start by filling in your personal details in Article I.",
        field: 'fullName',
        type: 'general'
      },
      {
        id: 'gen-2',
        text: "Make sure to specify at least one executor in Article II.",
        field: 'executorName',
        type: 'general'
      },
      {
        id: 'gen-3',
        text: "Remember to list all beneficiaries in Article III.",
        field: 'beneficiaries',
        type: 'general'
      }
    ];
  }, []);

  // Handle accepting a suggestion
  const handleAcceptSuggestion = useCallback((suggestion: Suggestion) => {
    onSuggestionAccept(suggestion.field, suggestion.text);
  }, [onSuggestionAccept]);

  // Handle showing next suggestion
  const handleNextSuggestion = useCallback(() => {
    setCurrentSuggestionIndex((prev) => 
      prev < suggestions.length - 1 ? prev + 1 : 0
    );
  }, [suggestions.length]);

  // Handle animation before closing
  const handleClose = useCallback(() => {
    setAnimatingOut(true);
    setTimeout(() => {
      setAnimatingOut(false);
      onClose();
    }, 300);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed right-4 top-24 w-80 z-40"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-willtank-200 shadow-lg">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold text-willtank-800">AI Document Assistant</h3>
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={handleClose}
                className="h-8 w-8"
                type="button"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {activeField ? (
              <div className="mb-3 bg-willtank-50 p-2 rounded text-sm">
                <span className="font-medium">Currently editing:</span> {activeField.replace(/([A-Z])/g, ' $1').trim()}
              </div>
            ) : null}

            {suggestions.length > 0 && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSuggestionIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-willtank-50 border border-willtank-100 rounded-md p-3 mb-3"
                >
                  <p className="text-willtank-700 mb-3">
                    {suggestions[currentSuggestionIndex].text}
                  </p>
                  <div className="flex justify-between items-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleNextSuggestion}
                      className="text-xs"
                      type="button"
                    >
                      Next Tip <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAcceptSuggestion(suggestions[currentSuggestionIndex])}
                      className="text-xs"
                      type="button"
                    >
                      <Check className="mr-1 h-3 w-3" /> Apply
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            <div className="mt-4 border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-500 mb-2">Need more help?</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-xs"
                onClick={() => {}}
                type="button"
              >
                <MessageCircleQuestion className="mr-2 h-4 w-4 text-willtank-500" />
                Ask for more detailed guidance
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
