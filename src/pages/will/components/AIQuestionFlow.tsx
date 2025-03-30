
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

type Question = {
  id: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'number';
  question: string;
  description?: string;
  options?: string[];
  required?: boolean;
};

type AIQuestionFlowProps = {
  selectedTemplate?: any;
  responses: Record<string, any>;
  setResponses: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  onComplete: (responses: Record<string, any>, generatedWill: string) => void;
};

export const AIQuestionFlow: React.FC<AIQuestionFlowProps> = ({
  selectedTemplate,
  responses,
  setResponses,
  onComplete
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentQuestionAnswered, setCurrentQuestionAnswered] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<any>('');
  const [validationError, setValidationError] = useState('');

  // Generate questions based on the selected template
  const questions = getQuestionsForTemplate(selectedTemplate?.id || 'traditional');

  useEffect(() => {
    // Check if the current question has been answered
    if (responses[questions[currentQuestionIndex]?.id]) {
      setCurrentAnswer(responses[questions[currentQuestionIndex].id]);
      setCurrentQuestionAnswered(true);
    } else {
      setCurrentAnswer('');
      setCurrentQuestionAnswered(false);
    }
    setValidationError('');
  }, [currentQuestionIndex, questions, responses]);

  const handleAnswer = (value: any) => {
    setCurrentAnswer(value);
    
    const currentQuestion = questions[currentQuestionIndex];
    
    if (currentQuestion.required) {
      if (typeof value === 'string' && value.trim() === '') {
        setValidationError('This field is required');
        setCurrentQuestionAnswered(false);
      } else {
        setValidationError('');
        setCurrentQuestionAnswered(true);
      }
    } else {
      setCurrentQuestionAnswered(true);
    }
  };

  const handleNextQuestion = () => {
    if (validationError) return;
    
    // Save current answer to responses
    setResponses(prev => ({
      ...prev,
      [questions[currentQuestionIndex].id]: currentAnswer
    }));
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleGenerateWill();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleGenerateWill = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation with a timeout
    setTimeout(() => {
      const generatedWill = generateSampleWill(responses, selectedTemplate?.id);
      setIsGenerating(false);
      setIsComplete(true);
      
      // Call the onComplete callback with responses and the generated will
      onComplete(responses, generatedWill);
    }, 3000);
  };
  
  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="bg-green-50 p-4 rounded-full mb-4">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h3 className="text-xl font-medium text-green-700 mb-2">Will Generated Successfully</h3>
        <p className="text-gray-600 mb-4 text-center">
          Your will has been created based on your answers. You can now review and edit it in the next step.
        </p>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-12 w-12 text-willtank-600 animate-spin mb-4" />
        <h3 className="text-xl font-medium mb-2">Generating Your Will</h3>
        <p className="text-gray-600 mb-4 text-center">
          We're using AI to create your personalized will based on your answers.
          This usually takes just a few moments...
        </p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">{currentQuestion.question}</h3>
          <span className="text-xs text-gray-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>
        {currentQuestion.description && (
          <p className="text-gray-600 text-sm mb-4">{currentQuestion.description}</p>
        )}
      </div>
      
      <div className="mb-8">
        {currentQuestion.type === 'text' && (
          <div>
            <Input 
              placeholder="Type your answer here" 
              value={currentAnswer || ''}
              onChange={(e) => handleAnswer(e.target.value)}
            />
          </div>
        )}
        
        {currentQuestion.type === 'textarea' && (
          <div>
            <Textarea 
              placeholder="Type your answer here" 
              className="min-h-[150px]"
              value={currentAnswer || ''}
              onChange={(e) => handleAnswer(e.target.value)}
            />
          </div>
        )}
        
        {currentQuestion.type === 'radio' && (
          <RadioGroup 
            value={currentAnswer || ''} 
            onValueChange={handleAnswer}
          >
            {currentQuestion.options?.map((option, index) => (
              <div className="flex items-center space-x-2 mb-2" key={index}>
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )}
        
        {currentQuestion.type === 'checkbox' && (
          <div className="space-y-2">
            {currentQuestion.options?.map((option, index) => (
              <div className="flex items-center space-x-2" key={index}>
                <Checkbox 
                  id={`option-${index}`} 
                  checked={currentAnswer?.includes(option) || false}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleAnswer([...(currentAnswer || []), option]);
                    } else {
                      handleAnswer((currentAnswer || []).filter((item: string) => item !== option));
                    }
                  }}
                />
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        )}
        
        {currentQuestion.type === 'number' && (
          <div>
            <Input 
              type="number" 
              placeholder="Enter a number" 
              value={currentAnswer || ''}
              onChange={(e) => handleAnswer(e.target.value)}
            />
          </div>
        )}
        
        {validationError && (
          <div className="text-red-500 text-sm mt-2 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {validationError}
          </div>
        )}
      </div>
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        
        <Button 
          onClick={handleNextQuestion}
          disabled={!currentQuestionAnswered}
        >
          {currentQuestionIndex < questions.length - 1 ? 'Next' : 'Generate Will'}
        </Button>
      </div>
      
      <div className="mt-6">
        <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
          <motion.div 
            className="bg-willtank-500 h-full"
            initial={{ width: `${(currentQuestionIndex / questions.length) * 100}%` }}
            animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Start</span>
          <span>Complete</span>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate questions based on template
function getQuestionsForTemplate(templateId: string): Question[] {
  const commonQuestions: Question[] = [
    {
      id: 'willTitle',
      type: 'text',
      question: 'What would you like to title your will?',
      description: 'This is how your will document will be identified.',
      required: true
    },
    {
      id: 'fullName',
      type: 'text',
      question: 'What is your full legal name?',
      description: 'Enter your full name as it appears on official documents.',
      required: true
    },
    {
      id: 'address',
      type: 'textarea',
      question: 'What is your current residential address?',
      description: 'Enter your complete address including street, city, state, and zip code.',
      required: true
    },
    {
      id: 'maritalStatus',
      type: 'radio',
      question: 'What is your marital status?',
      options: ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'],
      required: true
    }
  ];
  
  const templateSpecificQuestions: Record<string, Question[]> = {
    'traditional': [
      {
        id: 'spouseName',
        type: 'text',
        question: 'If married, what is your spouse\'s full name?',
        description: 'Leave blank if not applicable.'
      },
      {
        id: 'children',
        type: 'textarea',
        question: 'List the full names of your children, if any.',
        description: 'Enter one name per line. Leave blank if not applicable.'
      },
      {
        id: 'executor',
        type: 'text',
        question: 'Who would you like to name as the executor of your will?',
        description: 'This person will be responsible for carrying out the terms of your will.',
        required: true
      },
      {
        id: 'alternateExecutor',
        type: 'text',
        question: 'Who would you like to name as an alternate executor?',
        description: 'This person will serve if your primary executor is unable or unwilling to do so.',
        required: true
      },
      {
        id: 'guardian',
        type: 'text',
        question: 'If you have minor children, who would you like to name as their guardian?',
        description: 'Leave blank if not applicable.'
      },
      {
        id: 'assetDistribution',
        type: 'textarea',
        question: 'How would you like your assets to be distributed?',
        description: 'For example: "All to my spouse, and if they predecease me, equally to my children."',
        required: true
      }
    ],
    'digital-assets': [
      {
        id: 'digitalExecutor',
        type: 'text',
        question: 'Who would you like to manage your digital assets after your death?',
        description: 'This person will have access to your online accounts and digital files.',
        required: true
      },
      {
        id: 'socialMediaAccounts',
        type: 'checkbox',
        question: 'Which social media accounts do you have?',
        options: ['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'TikTok', 'Snapchat', 'Pinterest', 'Other'],
        required: true
      },
      {
        id: 'socialMediaWishes',
        type: 'radio',
        question: 'What would you like to happen to your social media accounts?',
        options: ['Memorialize accounts', 'Delete all accounts', 'Transfer to a family member', 'Executor\'s discretion'],
        required: true
      },
      {
        id: 'cryptocurrencyOwned',
        type: 'checkbox',
        question: 'Do you own any of the following cryptocurrencies?',
        options: ['Bitcoin', 'Ethereum', 'Litecoin', 'Dogecoin', 'Ripple', 'Other', 'None'],
        required: true
      },
      {
        id: 'digitalCollectibles',
        type: 'textarea',
        question: 'Describe any digital collectibles or NFTs you own.',
        description: 'Include where they are stored and how to access them.'
      },
      {
        id: 'accessInstructions',
        type: 'textarea',
        question: 'How should your digital executor access your passwords and accounts?',
        description: 'For example: "Password manager details are stored in my safe deposit box."',
        required: true
      }
    ],
    'living-trust': [
      {
        id: 'trusteeName',
        type: 'text',
        question: 'Who would you like to name as the trustee of your living trust?',
        description: 'This person will manage the trust while you are alive and after your death.',
        required: true
      },
      {
        id: 'successorTrustee',
        type: 'text',
        question: 'Who would you like to name as successor trustee?',
        description: 'This person will serve if your primary trustee is unable or unwilling to do so.',
        required: true
      },
      {
        id: 'realEstateInTrust',
        type: 'textarea',
        question: 'List any real estate properties you want to include in your trust.',
        description: 'Include full addresses and property descriptions.',
        required: true
      },
      {
        id: 'financialAccountsInTrust',
        type: 'textarea',
        question: 'List any financial accounts you want to include in your trust.',
        description: 'Include bank accounts, investment accounts, etc.'
      },
      {
        id: 'trustBeneficiaries',
        type: 'textarea',
        question: 'Who are the beneficiaries of your trust?',
        description: 'List each beneficiary and what percentage or specific assets they should receive.',
        required: true
      }
    ]
  };
  
  // Combine common questions with template-specific questions
  return [...commonQuestions, ...(templateSpecificQuestions[templateId] || [])];
}

// Function to generate a sample will based on user answers
function generateSampleWill(responses: Record<string, any>, templateId: string): string {
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  let willContent = "";
  
  if (templateId === 'traditional' || !templateId) {
    willContent = `LAST WILL AND TESTAMENT OF ${responses.fullName?.toUpperCase() || '[YOUR NAME]'}

I, ${responses.fullName || '[YOUR NAME]'}, residing at ${responses.address || '[YOUR ADDRESS]'}, being of sound mind, declare this to be my Last Will and Testament, hereby revoking all previous wills and codicils made by me.

ARTICLE I: REVOCATION
I revoke all previous wills and codicils.

ARTICLE II: FAMILY INFORMATION
I am ${responses.maritalStatus?.toLowerCase() || '[MARITAL STATUS]'}${responses.spouseName ? ` to ${responses.spouseName}` : ''}.
${responses.children ? `I have the following children: ${responses.children}.` : 'I have no children.'}

ARTICLE III: EXECUTOR
I appoint ${responses.executor || '[EXECUTOR NAME]'} as the Executor of this Will. If they are unable or unwilling to serve, I appoint ${responses.alternateExecutor || '[ALTERNATE EXECUTOR]'} as alternate Executor.

${responses.guardian ? `ARTICLE IV: GUARDIAN\nIf my spouse does not survive me, I appoint ${responses.guardian} as guardian of my minor children.` : ''}

ARTICLE ${responses.guardian ? 'V' : 'IV'}: DISPOSITION OF PROPERTY
${responses.assetDistribution || 'I give all my property, real and personal, to my beneficiaries as specified.'}

ARTICLE ${responses.guardian ? 'VI' : 'V'}: DIGITAL ASSETS
I authorize my Executor to access, modify, control, archive, transfer, and delete my digital assets.

ARTICLE ${responses.guardian ? 'VII' : 'VI'}: TAXES AND EXPENSES
I direct my Executor to pay all just debts, funeral expenses, and costs of administering my estate.

IN WITNESS WHEREOF, I have signed this Will on ${today}.

________________________
${responses.fullName || '[YOUR SIGNATURE]'}, Testator

WITNESSES:
The foregoing instrument was signed, published and declared by the above-named Testator as their Last Will, in our presence, and we, at their request and in their presence, and in the presence of each other, have subscribed our names as witnesses thereto, believing said Testator to be of sound mind and memory.

________________________
Witness 1

________________________
Witness 2`;
  } 
  else if (templateId === 'digital-assets') {
    willContent = `DIGITAL ASSET WILL AND TESTAMENT OF ${responses.fullName?.toUpperCase() || '[YOUR NAME]'}

I, ${responses.fullName || '[YOUR NAME]'}, residing at ${responses.address || '[YOUR ADDRESS]'}, being of sound mind, make this Digital Asset Will and Testament to provide for the disposition of my digital assets.

ARTICLE I: APPOINTMENT OF DIGITAL EXECUTOR
I hereby designate and appoint ${responses.digitalExecutor || '[DIGITAL EXECUTOR NAME]'} as Digital Executor of this Will.

ARTICLE II: DIGITAL EXECUTOR POWERS
I grant my Digital Executor full authority to access, handle, distribute, and dispose of my digital assets according to the instructions in this document.

ARTICLE III: SOCIAL MEDIA ACCOUNTS
I have the following social media accounts: ${responses.socialMediaAccounts?.join(', ') || '[SOCIAL MEDIA ACCOUNTS]'}.
I wish for these accounts to be ${responses.socialMediaWishes?.toLowerCase() || '[SOCIAL MEDIA WISHES]'}.

ARTICLE IV: CRYPTOCURRENCY ASSETS
I own the following cryptocurrency assets: ${responses.cryptocurrencyOwned?.filter((c: string) => c !== 'None').join(', ') || 'None'}.
${responses.cryptocurrencyOwned && !responses.cryptocurrencyOwned.includes('None') ? 'My Digital Executor is authorized to access these assets and distribute them according to Article V of this document.' : ''}

${responses.digitalCollectibles ? `ARTICLE V: DIGITAL COLLECTIBLES\n${responses.digitalCollectibles}` : ''}

ARTICLE ${responses.digitalCollectibles ? 'VI' : 'V'}: ACCESS INSTRUCTIONS
${responses.accessInstructions || 'Instructions for accessing my digital assets are stored in a secure location known to my Digital Executor.'}

IN WITNESS WHEREOF, I have signed this Will on ${today}.

________________________
${responses.fullName || '[YOUR SIGNATURE]'}, Testator

WITNESSES:

________________________
Witness 1

________________________
Witness 2`;
  }
  else if (templateId === 'living-trust') {
    willContent = `REVOCABLE LIVING TRUST OF ${responses.fullName?.toUpperCase() || '[YOUR NAME]'}

THIS TRUST AGREEMENT is made this ${today}, between ${responses.fullName || '[YOUR NAME]'}, hereinafter referred to as the "Grantor," and ${responses.trusteeName || '[TRUSTEE NAME]'}, hereinafter referred to as the "Trustee."

ARTICLE I: TRUST CREATION
The Grantor hereby transfers and delivers to the Trustee the property described in Schedule A attached hereto, to have and to hold the same, and any other property which the Trustee may hereafter at any time receive, IN TRUST NEVERTHELESS, for the uses and purposes and upon the terms and conditions hereinafter set forth.

ARTICLE II: SUCCESSOR TRUSTEE
If the Trustee ceases to serve for any reason, I appoint ${responses.successorTrustee || '[SUCCESSOR TRUSTEE]'} as Successor Trustee.

ARTICLE III: DISTRIBUTION DURING GRANTOR'S LIFETIME
During the lifetime of the Grantor, the Trustee shall hold, manage, invest, and reinvest the trust estate, and shall collect the income therefrom and shall pay to the Grantor all of the net income and so much of the principal as the Grantor may request at any time.

ARTICLE IV: DISTRIBUTION UPON GRANTOR'S DEATH
Upon the death of the Grantor, after payment of expenses and taxes, the Trustee shall distribute the remaining trust estate as follows:
${responses.trustBeneficiaries || '[DISTRIBUTION INSTRUCTIONS]'}

ARTICLE V: POWERS OF TRUSTEE
The Trustee shall have full power to do everything in administering this Trust that the Trustee deems to be for the best interests of the beneficiaries.

ARTICLE VI: REVOCATION AND AMENDMENT
During the lifetime of the Grantor, this Trust may be revoked in whole or in part by an instrument in writing signed by the Grantor and delivered to the Trustee.

IN WITNESS WHEREOF, the Grantor and Trustee have signed this Trust Agreement on the day and year first written above.

________________________
${responses.fullName || '[YOUR SIGNATURE]'}, Grantor

________________________
${responses.trusteeName || '[TRUSTEE SIGNATURE]'}, Trustee

SCHEDULE A
PROPERTY TRANSFERRED TO THE TRUST

Real Estate Properties:
${responses.realEstateInTrust || '[REAL ESTATE PROPERTIES]'}

Financial Accounts:
${responses.financialAccountsInTrust || '[FINANCIAL ACCOUNTS]'}`;
  }
  
  return willContent;
}
