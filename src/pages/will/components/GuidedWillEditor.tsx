
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FileText, Video, Upload, Save, ChevronRight, ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WILL_SECTIONS } from '@/services/willProgressService';

interface GuidedWillEditorProps {
  willContent: string;
  onContentChange: (content: string) => void;
  onSave: () => void;
  readOnly?: boolean;
}

const GUIDED_QUESTIONS = [
  {
    section: WILL_SECTIONS.PERSONAL_INFO,
    questions: [
      { id: 'name', question: "What is your full legal name?", placeholder: "e.g., John Michael Doe" },
      { id: 'address', question: "What is your current residential address?", placeholder: "e.g., 123 Main Street, City, State, ZIP" },
      { id: 'marital', question: "What is your marital status?", placeholder: "e.g., Single, Married, Divorced, Widowed" }
    ]
  },
  {
    section: WILL_SECTIONS.ASSETS,
    questions: [
      { id: 'real-estate', question: "List any real estate properties you own:", placeholder: "e.g., Primary residence at [address], Vacation home at [address]" },
      { id: 'bank-accounts', question: "List your major financial accounts:", placeholder: "e.g., Savings accounts, Investment accounts (no need for account numbers)" },
      { id: 'valuables', question: "List any valuable personal property:", placeholder: "e.g., Vehicles, Jewelry, Art collections" }
    ]
  },
  {
    section: WILL_SECTIONS.BENEFICIARIES,
    questions: [
      { id: 'primary-beneficiaries', question: "Who are your primary beneficiaries?", placeholder: "e.g., Spouse: [Name], Children: [Names]" },
      { id: 'secondary-beneficiaries', question: "Who are your secondary beneficiaries?", placeholder: "e.g., Siblings, Parents, or Charitable organizations" },
      { id: 'specific-bequests', question: "Are there any specific items you want to leave to specific people?", placeholder: "e.g., Family heirloom to [Name]" }
    ]
  },
  {
    section: WILL_SECTIONS.EXECUTORS,
    questions: [
      { id: 'executor', question: "Who do you want to name as your primary executor?", placeholder: "e.g., [Full Name], Relationship: [Relationship]" },
      { id: 'alternate-executor', question: "Who do you want to name as your alternate executor?", placeholder: "e.g., [Full Name], Relationship: [Relationship]" }
    ]
  },
  {
    section: WILL_SECTIONS.GUARDIANS,
    questions: [
      { id: 'guardians', question: "If you have minor children, who do you want to name as their guardian?", placeholder: "e.g., [Full Name], Relationship: [Relationship]" },
      { id: 'alternate-guardians', question: "Who do you want to name as alternate guardian?", placeholder: "e.g., [Full Name], Relationship: [Relationship]" }
    ]
  },
  {
    section: WILL_SECTIONS.DIGITAL_ASSETS,
    questions: [
      { id: 'digital-assets', question: "List your important digital assets:", placeholder: "e.g., Email accounts, Social media, Cryptocurrency" },
      { id: 'digital-executor', question: "Who should handle your digital assets?", placeholder: "e.g., [Name] will manage digital accounts" }
    ]
  },
  {
    section: WILL_SECTIONS.FINAL_WISHES,
    questions: [
      { id: 'funeral', question: "Do you have specific funeral or burial wishes?", placeholder: "e.g., Cremation, Traditional burial, Memorial service preferences" },
      { id: 'final-messages', question: "Any final messages or instructions for your loved ones?", placeholder: "e.g., Personal messages, Life advice, Family values to pass on" }
    ]
  }
];

export function GuidedWillEditor({ willContent, onContentChange, onSave, readOnly = false }: GuidedWillEditorProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const { toast } = useToast();
  
  // Parse existing will content into answers
  useEffect(() => {
    if (willContent) {
      // Simple parsing logic - this could be enhanced based on your will format
      const parsedAnswers: Record<string, string> = {};
      GUIDED_QUESTIONS.forEach(section => {
        section.questions.forEach(q => {
          const match = willContent.match(new RegExp(`${q.question}\\s*([^\\n]+)`));
          if (match?.[1]) {
            parsedAnswers[q.id] = match[1].trim();
          }
        });
      });
      setAnswers(parsedAnswers);
    }
  }, [willContent]);

  const updateAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    
    // Generate updated will content
    let newContent = "LAST WILL AND TESTAMENT\n\n";
    GUIDED_QUESTIONS.forEach(section => {
      newContent += `\n== ${section.section.replace(/_/g, ' ').toUpperCase()} ==\n\n`;
      section.questions.forEach(q => {
        if (newAnswers[q.id]) {
          newContent += `${q.question}\n${newAnswers[q.id]}\n\n`;
        }
      });
    });
    
    onContentChange(newContent);
  };

  const handleSave = () => {
    onSave();
    toast({
      title: "Will Updated",
      description: "Your will has been saved successfully."
    });
  };

  const handleNavigateSection = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentSection < GUIDED_QUESTIONS.length - 1) {
      setCurrentSection(curr => curr + 1);
    } else if (direction === 'prev' && currentSection > 0) {
      setCurrentSection(curr => curr - 1);
    }
  };

  const currentSectionData = GUIDED_QUESTIONS[currentSection];

  if (readOnly) {
    return (
      <div className="prose max-w-none">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
          {willContent}
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertDescription>
          You are editing your will. Answer the questions below to update your will content.
          Progress through each section using the navigation buttons.
        </AlertDescription>
      </Alert>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-4">
          {currentSectionData.section.replace(/_/g, ' ').toUpperCase()}
        </h3>
        
        <div className="space-y-6">
          {currentSectionData.questions.map((q) => (
            <div key={q.id} className="space-y-2">
              <label className="block font-medium text-sm text-gray-700">
                {q.question}
              </label>
              <Textarea
                value={answers[q.id] || ''}
                onChange={(e) => updateAnswer(q.id, e.target.value)}
                placeholder={q.placeholder}
                className="min-h-[100px]"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4">
        <Button
          variant="outline"
          onClick={() => handleNavigateSection('prev')}
          disabled={currentSection === 0}
        >
          <ChevronLeft className="mr-2" />
          Previous Section
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave}>
            <Save className="mr-2" />
            Save Progress
          </Button>
        </div>

        <Button
          onClick={() => handleNavigateSection('next')}
          disabled={currentSection === GUIDED_QUESTIONS.length - 1}
        >
          Next Section
          <ChevronRight className="ml-2" />
        </Button>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Attachments and Media</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="outline" className="h-auto py-4">
            <Video className="mr-2" />
            Record New Video Message
          </Button>
          <Button variant="outline" className="h-auto py-4">
            <FileText className="mr-2" />
            Update Documents
          </Button>
          <Button variant="outline" className="h-auto py-4">
            <Upload className="mr-2" />
            Upload Additional Files
          </Button>
        </div>
      </div>
    </div>
  );
}
