
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Brain, ArrowRight, ArrowLeft } from 'lucide-react';

export function WillCreationAIWizard() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questions = [
    {
      id: 'name',
      question: "What is your full legal name?",
      type: 'text',
      placeholder: 'Enter your full name as it appears on legal documents'
    },
    {
      id: 'age',
      question: "What is your age?",
      type: 'number',
      placeholder: 'Enter your age'
    },
    {
      id: 'maritalStatus',
      question: "What is your marital status?",
      type: 'select',
      options: ['Single', 'Married', 'Divorced', 'Widowed']
    },
    {
      id: 'children',
      question: "Do you have children? If yes, please list their names and ages.",
      type: 'textarea',
      placeholder: 'List your children or write "None" if you have no children'
    },
    {
      id: 'assets',
      question: "What are your main assets? (Real estate, investments, bank accounts, etc.)",
      type: 'textarea',
      placeholder: 'Describe your significant assets'
    }
  ];

  const handleAnswerChange = (value: string) => {
    setAnswers({
      ...answers,
      [questions[currentQuestion].id]: value
    });
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Brain className="mr-3 h-8 w-8 text-blue-600" />
          AI Will Creation
        </h1>
        <p className="text-gray-600">Our AI will guide you through creating your will with smart questions.</p>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{currentQ.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentQ.type === 'text' && (
            <div>
              <Input
                value={answers[currentQ.id] || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder={currentQ.placeholder}
              />
            </div>
          )}

          {currentQ.type === 'number' && (
            <div>
              <Input
                type="number"
                value={answers[currentQ.id] || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder={currentQ.placeholder}
              />
            </div>
          )}

          {currentQ.type === 'textarea' && (
            <div>
              <Textarea
                value={answers[currentQ.id] || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder={currentQ.placeholder}
                rows={4}
              />
            </div>
          )}

          {currentQ.type === 'select' && currentQ.options && (
            <div className="space-y-2">
              {currentQ.options.map((option) => (
                <Button
                  key={option}
                  variant={answers[currentQ.id] === option ? "default" : "outline"}
                  onClick={() => handleAnswerChange(option)}
                  className="w-full justify-start"
                >
                  {option}
                </Button>
              ))}
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={previousQuestion}
              disabled={currentQuestion === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <Button
              onClick={nextQuestion}
              disabled={currentQuestion === questions.length - 1}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
