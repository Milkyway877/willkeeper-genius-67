
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowRight, MoveDown, RefreshCw } from "lucide-react";

interface AIQuestionFlowProps {
  selectedTemplate: {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    sample: string;
    tags: string[];
  } | null;
  responses: Record<string, any>;
  setResponses: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  onComplete: (responses: Record<string, any>, generatedWill: string) => void;
}

export const AIQuestionFlow: React.FC<AIQuestionFlowProps> = ({ 
  selectedTemplate, 
  responses, 
  setResponses, 
  onComplete 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isGeneratingWill, setIsGeneratingWill] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isQuestionAnswered, setIsQuestionAnswered] = useState(false);

  useEffect(() => {
    setCurrentAnswer(responses[questions[currentQuestionIndex]?.id] || "");
    setIsQuestionAnswered(!!responses[questions[currentQuestionIndex]?.id]);
  }, [currentQuestionIndex, responses]);

  const questions = [
    {
      id: "willTitle",
      question: "What would you like to title your will?",
      type: "text",
      placeholder: "e.g., Last Will and Testament of John Smith",
      defaultValue: selectedTemplate ? `${selectedTemplate.title} - ${new Date().toLocaleDateString()}` : ""
    },
    {
      id: "fullName",
      question: "What is your full legal name?",
      type: "text",
      placeholder: "e.g., John Robert Smith"
    },
    {
      id: "address",
      question: "What is your current legal address?",
      type: "textarea",
      placeholder: "e.g., 123 Main Street, Apt 4B, New York, NY 10001"
    },
    {
      id: "maritalStatus",
      question: "What is your marital status?",
      type: "select",
      options: ["Single", "Married", "Divorced", "Widowed", "Domestic Partnership"]
    },
    {
      id: "spouseName",
      question: "What is your spouse's full name?",
      type: "text",
      placeholder: "e.g., Sarah Jane Smith",
      conditional: (responses: Record<string, any>) => 
        responses.maritalStatus === "Married" || 
        responses.maritalStatus === "Domestic Partnership"
    },
    {
      id: "children",
      question: "Do you have any children?",
      type: "select",
      options: ["Yes", "No"]
    },
    {
      id: "childrenNames",
      question: "Please list the full names of all your children, separated by commas.",
      type: "textarea",
      placeholder: "e.g., Emily Smith, Michael Smith, Jennifer Smith",
      conditional: (responses: Record<string, any>) => responses.children === "Yes"
    },
    {
      id: "executorName",
      question: "Who would you like to name as the executor of your will?",
      type: "text",
      placeholder: "e.g., Sarah Jane Smith"
    },
    {
      id: "executorRelationship",
      question: "What is your relationship to the executor?",
      type: "text",
      placeholder: "e.g., Spouse, Sibling, Friend, Attorney"
    },
    {
      id: "alternateExecutor",
      question: "Who would you like to name as an alternate executor?",
      type: "text",
      placeholder: "e.g., Michael Robert Jones"
    },
    {
      id: "guardianNeeded",
      question: "Do you need to appoint a guardian for minor children?",
      type: "select",
      options: ["Yes", "No"],
      conditional: (responses: Record<string, any>) => responses.children === "Yes"
    },
    {
      id: "guardianName",
      question: "Who would you like to name as guardian of your minor children?",
      type: "text",
      placeholder: "e.g., Robert and Lisa Johnson",
      conditional: (responses: Record<string, any>) => 
        responses.children === "Yes" && 
        responses.guardianNeeded === "Yes"
    },
    {
      id: "specificBequests",
      question: "Do you want to make any specific bequests (gifts to specific people)?",
      type: "select",
      options: ["Yes", "No"]
    },
    {
      id: "bequestDetails",
      question: "Please describe your specific bequests",
      type: "textarea",
      placeholder: "e.g., I leave my grandmother's pearl necklace to my daughter Emily Smith. I leave my book collection to my friend David Johnson.",
      conditional: (responses: Record<string, any>) => responses.specificBequests === "Yes"
    },
    {
      id: "residualEstate",
      question: "Who should receive the remainder of your estate?",
      type: "textarea",
      placeholder: "e.g., The remainder of my estate shall be divided equally among my children, or if I have no surviving children, to my spouse."
    },
    {
      id: "digitalAssetInstructions",
      question: "Do you have any specific instructions for your digital assets (social media, cryptocurrency, etc.)?",
      type: "textarea",
      placeholder: "e.g., I authorize my executor to access and manage all my digital accounts and assets."
    }
  ];

  const filteredQuestions = questions.filter(q => 
    !q.conditional || q.conditional(responses)
  );

  const handleNextQuestion = () => {
    // Save the current answer
    if (currentAnswer.trim()) {
      setResponses({
        ...responses,
        [filteredQuestions[currentQuestionIndex].id]: currentAnswer
      });
    }
    
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer(responses[filteredQuestions[currentQuestionIndex + 1]?.id] || "");
      setIsQuestionAnswered(!!responses[filteredQuestions[currentQuestionIndex + 1]?.id]);
    } else {
      generateWill();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setCurrentAnswer(responses[filteredQuestions[currentQuestionIndex - 1]?.id] || "");
      setIsQuestionAnswered(!!responses[filteredQuestions[currentQuestionIndex - 1]?.id]);
    }
  };

  const handleSelectChange = (value: string) => {
    setCurrentAnswer(value);
    setIsQuestionAnswered(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCurrentAnswer(e.target.value);
    setIsQuestionAnswered(!!e.target.value.trim());
  };

  const generateWill = () => {
    setIsGeneratingWill(true);
    
    // Save the current answer first
    const finalResponses = {
      ...responses,
      [filteredQuestions[currentQuestionIndex].id]: currentAnswer
    };
    
    // Simulate progress
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
    
    // After "generating" the will (simulated delay)
    setTimeout(() => {
      clearInterval(interval);
      setGenerationProgress(100);
      
      // Generate a sample will based on the responses
      const generatedWill = generateWillFromResponses(finalResponses);
      
      setIsGeneratingWill(false);
      
      // Complete the process and move to the next step
      onComplete(finalResponses, generatedWill);
    }, 5000);
  };

  const generateWillFromResponses = (responses: Record<string, any>) => {
    let willContent = `LAST WILL AND TESTAMENT OF ${responses.fullName?.toUpperCase() || '[YOUR NAME]'}\n\n`;
    
    willContent += `I, ${responses.fullName || '[YOUR NAME]'}, residing at ${responses.address || '[YOUR ADDRESS]'}, being of sound mind, declare this to be my Last Will and Testament.\n\n`;
    
    willContent += `ARTICLE I: REVOCATION\nI revoke all previous wills and codicils.\n\n`;
    
    willContent += `ARTICLE II: FAMILY INFORMATION\n`;
    if (responses.maritalStatus === 'Married' || responses.maritalStatus === 'Domestic Partnership') {
      willContent += `I am ${responses.maritalStatus.toLowerCase()} to ${responses.spouseName || '[SPOUSE NAME]'}. `;
    } else {
      willContent += `I am ${responses.maritalStatus?.toLowerCase() || 'single'}. `;
    }
    
    if (responses.children === 'Yes' && responses.childrenNames) {
      const childrenList = responses.childrenNames.split(',').map((name: string) => name.trim());
      willContent += `I have ${childrenList.length} ${childrenList.length === 1 ? 'child' : 'children'}: ${responses.childrenNames}.\n\n`;
    } else {
      willContent += `I do not have any children.\n\n`;
    }
    
    willContent += `ARTICLE III: EXECUTOR\nI appoint ${responses.executorName || '[EXECUTOR NAME]'} as the Executor of this Will. `;
    willContent += `If they are unable or unwilling to serve, I appoint ${responses.alternateExecutor || '[ALTERNATE EXECUTOR]'} as alternate Executor.\n\n`;
    
    if (responses.children === 'Yes' && responses.guardianNeeded === 'Yes') {
      willContent += `ARTICLE IV: GUARDIAN\nI appoint ${responses.guardianName || '[GUARDIAN NAME]'} as guardian of my minor children.\n\n`;
    }
    
    willContent += `ARTICLE V: DISPOSITION OF PROPERTY\n`;
    if (responses.specificBequests === 'Yes' && responses.bequestDetails) {
      willContent += `I make the following specific bequests:\n${responses.bequestDetails}\n\n`;
    }
    
    willContent += `For the residue of my estate: ${responses.residualEstate || '[RESIDUAL ESTATE INSTRUCTIONS]'}\n\n`;
    
    willContent += `ARTICLE VI: DIGITAL ASSETS\n${responses.digitalAssetInstructions || 'I authorize my Executor to access, modify, control, archive, transfer, and delete my digital assets.'}\n\n`;
    
    willContent += `ARTICLE VII: TAXES AND EXPENSES\nI direct my Executor to pay all just debts, funeral expenses, and costs of administering my estate.\n\n`;
    
    willContent += `Signed: ${responses.fullName || '[YOUR SIGNATURE]'}\n`;
    willContent += `Date: ${new Date().toLocaleDateString()}\n`;
    willContent += `Witnesses: [Witness 1], [Witness 2]`;
    
    return willContent;
  };

  const currentQuestion = filteredQuestions[currentQuestionIndex];
  
  if (isGeneratingWill) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-willtank-600 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Generating Your Will</h3>
          <p className="text-gray-600 mb-6">
            We're analyzing your answers and creating a personalized will document...
          </p>
          
          <div className="w-full bg-gray-100 h-2 rounded-full mb-2">
            <div 
              className="bg-willtank-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${generationProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500">{generationProgress}% complete</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
        <span>Question {currentQuestionIndex + 1} of {filteredQuestions.length}</span>
        <span>{Math.round((currentQuestionIndex / filteredQuestions.length) * 100)}% complete</span>
      </div>
      
      <div className="w-full bg-gray-100 h-1 mb-8">
        <div 
          className="bg-willtank-600 h-1 transition-all duration-300" 
          style={{ width: `${(currentQuestionIndex / filteredQuestions.length) * 100}%` }}
        ></div>
      </div>
      
      <h3 className="text-xl font-medium mb-6">{currentQuestion?.question}</h3>
      
      <div className="mb-8">
        {currentQuestion?.type === 'select' ? (
          <Select 
            value={currentAnswer} 
            onValueChange={handleSelectChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {currentQuestion.options?.map((option, idx) => (
                <SelectItem key={idx} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : currentQuestion?.type === 'textarea' ? (
          <Textarea 
            placeholder={currentQuestion.placeholder}
            value={currentAnswer}
            onChange={handleInputChange}
            className="min-h-[120px]"
          />
        ) : (
          <Input 
            type="text" 
            placeholder={currentQuestion?.placeholder}
            defaultValue={currentQuestion?.defaultValue || ""}
            value={currentAnswer}
            onChange={handleInputChange}
          />
        )}
      </div>
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          Previous Question
        </Button>
        
        <Button 
          onClick={handleNextQuestion}
          disabled={!isQuestionAnswered}
        >
          {currentQuestionIndex === filteredQuestions.length - 1 ? (
            <>Generate Will<ArrowRight className="ml-2 h-4 w-4" /></>
          ) : (
            <>Next Question<ArrowRight className="ml-2 h-4 w-4" /></>
          )}
        </Button>
      </div>
    </div>
  );
};
