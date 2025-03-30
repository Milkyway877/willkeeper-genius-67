import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea";
import { 
  PenTool, 
  Brain,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';

interface AIQuestionFlowProps {
  selectedTemplate: any;
  responses: Record<string, any>;
  setResponses: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  onComplete: (answers: Record<string, any>, generatedWill: string) => void;
}

export const AIQuestionFlow: React.FC<AIQuestionFlowProps> = ({ 
  selectedTemplate, 
  responses, 
  setResponses, 
  onComplete 
}) => {
  const [questions, setQuestions] = useState([
    {
      id: "willTitle",
      text: "What would you like to name your will?",
      type: "text",
      defaultValue: responses.willTitle || `My ${selectedTemplate?.title || 'Custom'} Will`,
      icon: <PenTool className="h-5 w-5 text-gray-500" />
    },
    {
      id: "executorName",
      text: "Who will be the executor of your will?",
      type: "text",
      defaultValue: responses.executorName || "",
      icon: <UserCheck className="h-5 w-5 text-gray-500" />
    },
    {
      id: "beneficiaryName",
      text: "Who will be the primary beneficiary of your will?",
      type: "text",
      defaultValue: responses.beneficiaryName || "",
      icon: <User className="h-5 w-5 text-gray-500" />
    },
    {
      id: "specificRequests",
      text: "Do you have any specific requests or instructions?",
      type: "textarea",
      defaultValue: responses.specificRequests || "",
      icon: <MessageSquare className="h-5 w-5 text-gray-500" />
    }
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [generatedWill, setGeneratedWill] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: value
    }));
  };

  const goToNextQuestion = () => {
    setResponses({ ...responses, ...answers });
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const generateWillContent = async () => {
    setIsGenerating(true);
    
    // Simulate AI will generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let generatedContent = `
      Last Will and Testament of ${answers.willTitle || selectedTemplate?.title || 'Unnamed Will'}
      
      I, ${answers.willTitle || 'the testator'}, being of sound mind, declare this to be my last will and testament.
      
      I appoint ${answers.executorName || 'an executor'} as the executor of this will.
      
      I bequeath my assets to ${answers.beneficiaryName || 'my beneficiary'}.
      
      Specific requests: ${answers.specificRequests || 'None'}.
    `;
    
    setGeneratedWill(generatedContent);
    setIsGenerating(false);
    onComplete({ ...responses, ...answers }, generatedContent);
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <div className="h-12 w-12 rounded-full bg-willtank-100 flex items-center justify-center mr-4">
          <Brain className="h-6 w-6 text-willtank-600" />
        </div>
        <div>
          <h3 className="text-lg font-medium">AI-Guided Questions</h3>
          <p className="text-gray-500">Answer a few questions to personalize your will</p>
        </div>
      </div>

      {currentQuestion ? (
        <div>
          <div className="mb-4">
            <div className="flex items-center text-gray-600 mb-1">
              {currentQuestion.icon}
              <label htmlFor={currentQuestion.id} className="ml-2 font-medium">
                {currentQuestion.text}
              </label>
            </div>
            {currentQuestion.type === "text" ? (
              <Textarea
                id={currentQuestion.id}
                placeholder="Your answer"
                className="w-full resize-none border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-willtank-500"
                value={answers[currentQuestion.id] || currentQuestion.defaultValue || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              />
            ) : (
              <Textarea
                id={currentQuestion.id}
                placeholder="Your answer"
                className="w-full resize-none border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-willtank-500"
                value={answers[currentQuestion.id] || currentQuestion.defaultValue || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              />
            )}
          </div>
          <Button onClick={goToNextQuestion} className="w-full">
            Next Question
          </Button>
        </div>
      ) : (
        <div className="text-center py-8">
          {isGenerating ? (
            <>
              <p className="text-willtank-700 font-medium mb-4">Generating Your Will...</p>
              <svg className="animate-spin h-6 w-6 text-willtank-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </>
          ) : (
            <>
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-green-700 font-medium mb-2">All Questions Answered!</p>
              <p className="text-gray-500 mb-6">Click below to generate your will document.</p>
              <Button onClick={generateWillContent}>
                Generate Will
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
