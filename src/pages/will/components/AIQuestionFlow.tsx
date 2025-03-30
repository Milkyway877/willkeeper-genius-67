
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Bot, ChevronRight } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';

interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

interface Question {
  id: string;
  text: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'multiselect';
  options?: QuestionOption[];
  required?: boolean;
}

interface AIQuestionFlowProps {
  questions: Question[];
  onComplete: (answers: Record<string, any>) => void;
}

export function AIQuestionFlow({ questions, onComplete }: AIQuestionFlowProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isCurrentQuestionAnswered, setIsCurrentQuestionAnswered] = useState(false);
  
  const currentQuestion = questions[currentQuestionIndex];
  
  // Check if the current question is answered whenever the answers change
  useEffect(() => {
    if (!currentQuestion) return;
    
    const currentAnswer = answers[currentQuestion.id];
    const isAnswered = currentQuestion.required 
      ? !!currentAnswer && (
          currentQuestion.type === 'checkbox' 
          ? Array.isArray(currentAnswer) ? currentAnswer.length > 0 : !!currentAnswer
          : true
        )
      : true;
    
    setIsCurrentQuestionAnswered(isAnswered);
  }, [answers, currentQuestion]);
  
  const handleAnswer = (value: any) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      onComplete(answers);
    }
  };
  
  const renderQuestionInput = () => {
    if (!currentQuestion) return null;
    
    switch (currentQuestion.type) {
      case 'text':
        return (
          <Input 
            value={answers[currentQuestion.id] || ''} 
            onChange={e => handleAnswer(e.target.value)} 
            placeholder="Type your answer..."
            className="w-full"
          />
        );
      case 'textarea':
        return (
          <Textarea 
            value={answers[currentQuestion.id] || ''} 
            onChange={e => handleAnswer(e.target.value)} 
            placeholder="Type your answer..."
            className="w-full min-h-[100px]"
          />
        );
      case 'radio':
        return (
          <RadioGroup 
            value={answers[currentQuestion.id] || ''}
            onValueChange={handleAnswer}
            className="space-y-3"
          >
            {currentQuestion.options?.map(option => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.id} />
                <Label htmlFor={option.id}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'checkbox':
      case 'multiselect':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map(option => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={option.id} 
                  checked={Array.isArray(answers[currentQuestion.id]) 
                    ? answers[currentQuestion.id].includes(option.value)
                    : false
                  }
                  onCheckedChange={(checked) => {
                    const currentAnswers = Array.isArray(answers[currentQuestion.id]) 
                      ? [...answers[currentQuestion.id]] 
                      : [];
                    
                    if (checked) {
                      handleAnswer([...currentAnswers, option.value]);
                    } else {
                      handleAnswer(currentAnswers.filter(val => val !== option.value));
                    }
                  }}
                />
                <Label htmlFor={option.id}>{option.label}</Label>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 bg-primary/10">
            <AvatarImage src="/lovable-uploads/b9cfd3bc-eebb-4e46-a3ef-2272fa3debc9.png" />
            <AvatarFallback><Bot /></AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>AI-Assisted Will Creation</CardTitle>
            <CardDescription>Step {currentQuestionIndex + 1} of {questions.length}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <motion.div
          key={currentQuestion?.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div className="text-lg font-medium">{currentQuestion?.text}</div>
          <div>{renderQuestionInput()}</div>
        </motion.div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
        >
          Back
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!isCurrentQuestionAnswered}
          className="flex items-center"
        >
          {currentQuestionIndex < questions.length - 1 ? "Next Step" : "Complete"}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
