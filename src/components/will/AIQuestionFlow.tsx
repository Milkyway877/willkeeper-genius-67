
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

type Question = {
  id: string;
  text: string;
  required?: boolean;
};

interface AIQuestionFlowProps {
  questions: Question[];
  onComplete: (answers: Record<string, string>) => void;
}

export function AIQuestionFlow({ questions, onComplete }: AIQuestionFlowProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };
  
  const handleSubmit = () => {
    // Validate required questions
    const requiredQuestions = questions.filter(q => q.required);
    const missingAnswers = requiredQuestions.filter(q => !answers[q.id] || answers[q.id].trim() === '');
    
    if (missingAnswers.length > 0) {
      alert(`Please answer all required questions before proceeding.`);
      return;
    }
    
    onComplete(answers);
  };
  
  return (
    <div className="space-y-6">
      {questions.map((question, index) => (
        <motion.div 
          key={question.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium text-gray-700">
            {question.text} {question.required && <span className="text-red-500">*</span>}
          </label>
          <Textarea 
            placeholder="Type your answer here..."
            className="w-full min-h-[100px]"
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          />
        </motion.div>
      ))}
      
      <div className="pt-4">
        <Button 
          onClick={handleSubmit}
          className="w-full"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Generate My Will
        </Button>
      </div>
    </div>
  );
}
