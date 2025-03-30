import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, ChevronRight, PenSquare } from 'lucide-react';

type AIQuestionFlowProps = {
  selectedTemplate: any;
  responses: Record<string, any>;
  setResponses: (responses: Record<string, any>) => void;
  onComplete: (responses: Record<string, any>, generatedWill: string) => void;
  onStartGeneration?: () => void;
};

export const AIQuestionFlow: React.FC<AIQuestionFlowProps> = ({ 
  selectedTemplate, 
  responses, 
  setResponses, 
  onComplete,
  onStartGeneration
}) => {
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>(responses);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  
  const questions = [
    {
      id: "fullName",
      label: "Full Name",
      type: "text",
      required: true,
      placeholder: "Enter your full name"
    },
    {
      id: "address",
      label: "Address",
      type: "text",
      required: true,
      placeholder: "Enter your current address"
    },
    {
      id: "maritalStatus",
      label: "Marital Status",
      type: "select",
      required: true,
      options: ["Single", "Married", "Divorced", "Widowed"]
    },
    {
      id: "spouseName",
      label: "Spouse's Full Name",
      type: "text",
      required: false,
      placeholder: "Enter your spouse's full name",
      dependsOn: "maritalStatus",
      dependsOnValue: "Married"
    },
    {
      id: "haveChildren",
      label: "Do you have children?",
      type: "select",
      required: true,
      options: ["Yes", "No"]
    },
    {
      id: "numChildren",
      label: "Number of Children",
      type: "number",
      required: false,
      placeholder: "Enter the number of children",
      dependsOn: "haveChildren",
      dependsOnValue: "Yes"
    },
    {
      id: "childrenNames",
      label: "Children's Full Names",
      type: "text",
      required: false,
      placeholder: "Enter children's names, separated by commas",
      dependsOn: "haveChildren",
      dependsOnValue: "Yes"
    },
    {
      id: "executorName",
      label: "Executor's Full Name",
      type: "text",
      required: true,
      placeholder: "Enter the executor's full name"
    },
    {
      id: "alternateExecutorName",
      label: "Alternate Executor's Full Name",
      type: "text",
      required: false,
      placeholder: "Enter the alternate executor's full name"
    },
    {
      id: "guardianName",
      label: "Guardian's Full Name (for minor children)",
      type: "text",
      required: false,
      placeholder: "Enter the guardian's full name",
      dependsOn: "haveChildren",
      dependsOnValue: "Yes"
    },
    {
      id: "specificBequests",
      label: "Specific Bequests",
      type: "textarea",
      required: false,
      placeholder: "Enter any specific bequests you'd like to include"
    },
    {
      id: "specialInstructions",
      label: "Special Instructions",
      type: "textarea",
      required: false,
      placeholder: "Enter any special instructions for your will"
    }
  ];
  
  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  
  const handleNextQuestion = () => {
    // Validate current answer
    const currentQ = questions[currentQuestion];
    const answer = answers[currentQ.id];
    
    if (!answer && currentQ.required) {
      toast({
        title: "Response Required",
        description: "Please provide an answer for this question."
      });
      return;
    }
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleGenerateWill();
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleGenerateWill = async () => {
    try {
      setIsGenerating(true);
      if (onStartGeneration) {
        onStartGeneration();
      }

      // Simulate API delay for generation
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Create a sample will document based on the answers
      const answersObj = Object.entries(answers).reduce((acc, [key, value]) => {
        // Map question ID to its label and answer
        const question = questions.find(q => q.id === key);
        if (question) {
          acc[question.label] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      // Include will title
      const willTitle = answers.fullName ? 
        `Last Will and Testament of ${answers.fullName}` : 
        "Last Will and Testament";
      
      setAnswers(prev => ({
        ...prev,
        willTitle
      }));

      // Generate sample content based on template and answers
      const generatedWill = `
LAST WILL AND TESTAMENT OF ${answers.fullName || "ALEX MORGAN"}

I, ${answers.fullName || "ALEX MORGAN"}, residing at ${answers.address || "123 Main Street, Anytown, USA"}, being of sound mind, declare this to be my Last Will and Testament.

ARTICLE I: REVOCATION
I revoke all previous wills and codicils.

ARTICLE II: FAMILY INFORMATION
I am ${answers.maritalStatus || "married"} to ${answers.spouseName || "Jamie Morgan"}. 
${answers.haveChildren === "Yes" ? `We have ${answers.numChildren || "two"} children: ${answers.childrenNames || "Taylor Morgan and Riley Morgan"}.` : "We have no children."}

ARTICLE III: EXECUTOR
I appoint ${answers.executorName || "Jamie Morgan"} as the Executor of this Will. If they are unable or unwilling to serve, I appoint ${answers.alternateExecutorName || "Casey Morgan"}, as alternate Executor.

ARTICLE IV: GUARDIAN
${answers.haveChildren === "Yes" ? `If my spouse does not survive me, I appoint ${answers.guardianName || "Casey Morgan"} as guardian of my minor children.` : ""}

ARTICLE V: DISPOSITION OF PROPERTY
I give all my property, real and personal, to my ${answers.maritalStatus === "Married" ? "spouse, " + (answers.spouseName || "Jamie Morgan") : "beneficiaries as designated below"}, if they survive me.
${answers.haveChildren === "Yes" ? `If my spouse does not survive me, I give all my property in equal shares to my children, ${answers.childrenNames || "Taylor Morgan and Riley Morgan"}.` : ""}

ARTICLE VI: DIGITAL ASSETS
I authorize my Executor to access, modify, control, archive, transfer, and delete my digital assets.

ARTICLE VII: TAXES AND EXPENSES
I direct my Executor to pay all just debts, funeral expenses, and costs of administering my estate.

${answers.specificBequests ? `ARTICLE VIII: SPECIFIC BEQUESTS
${answers.specificBequests}` : ""}

${answers.specialInstructions ? `ARTICLE IX: SPECIAL INSTRUCTIONS
${answers.specialInstructions}` : ""}

Signed: ${answers.fullName || "Alex Morgan"}
Date: ${new Date().toLocaleDateString()}
Witnesses: [Witness 1], [Witness 2]
`;

      setGeneratedContent(generatedWill);
      setShowPreview(true);
      setIsCompleted(true);
      
      // Complete the flow with the responses and generated content
      onComplete({...answers, willTitle}, generatedWill);
      
    } catch (error) {
      console.error('Error generating will:', error);
      toast({
        title: "Error Generating Will",
        description: "There was a problem generating your will. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      
      {!isCompleted ? (
        <div className="space-y-6">
          {questions[currentQuestion].type === "text" && (
            <div>
              <Label htmlFor={questions[currentQuestion].id}>{questions[currentQuestion].label}</Label>
              <Input
                type="text"
                id={questions[currentQuestion].id}
                placeholder={questions[currentQuestion].placeholder}
                value={answers[questions[currentQuestion].id] || ""}
                onChange={(e) => handleAnswerChange(questions[currentQuestion].id, e.target.value)}
              />
            </div>
          )}
          
          {questions[currentQuestion].type === "number" && (
            <div>
              <Label htmlFor={questions[currentQuestion].id}>{questions[currentQuestion].label}</Label>
              <Input
                type="number"
                id={questions[currentQuestion].id}
                placeholder={questions[currentQuestion].placeholder}
                value={answers[questions[currentQuestion].id] || ""}
                onChange={(e) => handleAnswerChange(questions[currentQuestion].id, parseInt(e.target.value))}
              />
            </div>
          )}
          
          {questions[currentQuestion].type === "textarea" && (
            <div>
              <Label htmlFor={questions[currentQuestion].id}>{questions[currentQuestion].label}</Label>
              <Textarea
                id={questions[currentQuestion].id}
                placeholder={questions[currentQuestion].placeholder}
                value={answers[questions[currentQuestion].id] || ""}
                onChange={(e) => handleAnswerChange(questions[currentQuestion].id, e.target.value)}
              />
            </div>
          )}
          
          {questions[currentQuestion].type === "select" && (
            <div>
              <Label htmlFor={questions[currentQuestion].id}>{questions[currentQuestion].label}</Label>
              <Select onValueChange={(value) => handleAnswerChange(questions[currentQuestion].id, value)}>
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${questions[currentQuestion].label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {questions[currentQuestion].options?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="flex justify-between mt-8">
            {currentQuestion > 0 && (
              <Button variant="outline" onClick={handlePrevQuestion}>
                Back
              </Button>
            )}
            
            <Button 
              onClick={handleNextQuestion} 
              className="ml-auto"
            >
              {currentQuestion === questions.length - 1 ? 'Generate Will' : 'Next Question'}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <Check className="h-10 w-10 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Will Generated!</h3>
            <p className="text-gray-500">
              Your will has been successfully generated based on your answers.
            </p>
          </div>
          
          <Button onClick={() => setShowPreview(true)} className="w-full">
            <PenSquare className="mr-2 h-4 w-4" />
            Review Will
          </Button>
        </div>
      )}
      
      {isGenerating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="text-center">
              <Loader2 className="h-10 w-10 text-willtank-600 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Generating Your Will</h3>
              <p className="text-gray-500">
                Our AI is creating a customized will based on your responses. This may take a moment...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
