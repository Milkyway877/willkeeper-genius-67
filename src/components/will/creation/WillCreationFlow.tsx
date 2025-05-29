
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle } from 'lucide-react';

export function WillCreationFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  
  const steps = [
    { id: 1, title: 'Personal Information', completed: false },
    { id: 2, title: 'Beneficiaries', completed: false },
    { id: 3, title: 'Assets', completed: false },
    { id: 4, title: 'Executors', completed: false },
    { id: 5, title: 'Review & Sign', completed: false }
  ];

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Your Will</h1>
        <p className="text-gray-600">Follow our guided process to create your legal will.</p>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center">
                {step.completed ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : currentStep === step.id ? (
                  <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                    {step.id}
                  </div>
                ) : (
                  <Circle className="h-8 w-8 text-gray-300" />
                )}
                <span className={`ml-2 text-sm font-medium ${
                  currentStep === step.id ? 'text-blue-600' : 
                  step.completed ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="w-16 h-1 bg-gray-200 mx-4">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: step.completed ? '100%' : '0%' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Step {currentStep}: {steps[currentStep - 1]?.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">
                {steps[currentStep - 1]?.title} Section
              </h3>
              <p className="text-gray-600 mb-8">
                This is where the {steps[currentStep - 1]?.title.toLowerCase()} form would appear.
                You would fill out the relevant information for this step of your will creation.
              </p>
              
              <div className="flex justify-between max-w-md mx-auto">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                <Button 
                  onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                  disabled={currentStep === steps.length}
                >
                  {currentStep === steps.length ? 'Complete' : 'Next'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
