
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send,
  User,
  Bot,
  ArrowRight,
  Loader2,
  Check,
  FileText,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type AIQuestionFlowProps = {
  selectedTemplate: any;
  responses: Record<string, any>;
  setResponses: (responses: Record<string, any>) => void;
  onComplete: (responses: Record<string, any>, generatedWill: string) => void;
};

type Question = {
  id: string;
  text: string;
  type: 'text' | 'textarea' | 'yesno' | 'options';
  options?: string[];
  dependsOn?: {
    question: string;
    value: string | boolean;
  };
};

export function AIQuestionFlow({ 
  selectedTemplate, 
  responses, 
  setResponses, 
  onComplete 
}: AIQuestionFlowProps) {
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  
  useEffect(() => {
    if (selectedTemplate) {
      if (selectedTemplate.id === 'traditional') {
        setQuestions([
          { 
            id: 'fullName', 
            text: 'What is your full legal name?', 
            type: 'text' 
          },
          { 
            id: 'address', 
            text: 'What is your current residential address?', 
            type: 'textarea' 
          },
          { 
            id: 'maritalStatus', 
            text: 'What is your marital status?', 
            type: 'options',
            options: ['Single', 'Married', 'Divorced', 'Widowed'] 
          },
          { 
            id: 'spouseName', 
            text: 'What is your spouse\'s full name?', 
            type: 'text',
            dependsOn: {
              question: 'maritalStatus',
              value: 'Married'
            }
          },
          { 
            id: 'hasChildren', 
            text: 'Do you have any children?', 
            type: 'yesno' 
          },
          { 
            id: 'childrenNames', 
            text: 'Please list the full names of all your children, separated by commas.', 
            type: 'textarea',
            dependsOn: {
              question: 'hasChildren',
              value: true
            }
          },
          { 
            id: 'executorName', 
            text: 'Who would you like to name as the executor of your will?', 
            type: 'text' 
          },
          { 
            id: 'alternateExecutor', 
            text: 'Would you like to designate an alternate executor in case your primary choice is unavailable?', 
            type: 'yesno' 
          },
          { 
            id: 'alternateExecutorName', 
            text: 'Who would you like to name as your alternate executor?', 
            type: 'text',
            dependsOn: {
              question: 'alternateExecutor',
              value: true
            }
          },
          { 
            id: 'guardianNeeded', 
            text: 'Do you need to appoint a guardian for minor children?', 
            type: 'yesno',
            dependsOn: {
              question: 'hasChildren',
              value: true
            }
          },
          { 
            id: 'guardianName', 
            text: 'Who would you like to name as guardian for your minor children?', 
            type: 'text',
            dependsOn: {
              question: 'guardianNeeded',
              value: true
            }
          },
          { 
            id: 'specificBequests', 
            text: 'Are there any specific possessions you would like to leave to particular individuals?', 
            type: 'yesno' 
          },
          { 
            id: 'bequestsDetails', 
            text: 'Please describe these specific bequests (item and recipient).', 
            type: 'textarea',
            dependsOn: {
              question: 'specificBequests',
              value: true
            }
          },
          { 
            id: 'residualEstate', 
            text: 'Who should receive the remainder of your estate?', 
            type: 'textarea' 
          },
          { 
            id: 'digitalAssets', 
            text: 'Do you have specific inheritance wishes for digital assets?', 
            type: 'yesno' 
          },
          { 
            id: 'digitalAssetsDetails', 
            text: 'Please describe your digital assets and how you would like them handled.', 
            type: 'textarea',
            dependsOn: {
              question: 'digitalAssets',
              value: true
            }
          }
        ]);
      } else if (selectedTemplate.id === 'digital-assets') {
        setQuestions([
          { 
            id: 'fullName', 
            text: 'What is your full legal name?', 
            type: 'text' 
          },
          { 
            id: 'address', 
            text: 'What is your current residential address?', 
            type: 'textarea' 
          },
          { 
            id: 'digitalExecutor', 
            text: 'Who would you like to name as your digital executor?', 
            type: 'text' 
          },
          { 
            id: 'hasCryptocurrency', 
            text: 'Do you own cryptocurrency assets?', 
            type: 'yesno' 
          },
          { 
            id: 'cryptocurrencyDetails', 
            text: 'Please list your cryptocurrency holdings and where they are stored.', 
            type: 'textarea',
            dependsOn: {
              question: 'hasCryptocurrency',
              value: true
            }
          },
          { 
            id: 'hasNFTs', 
            text: 'Do you own any NFTs (Non-Fungible Tokens)?', 
            type: 'yesno' 
          },
          { 
            id: 'nftDetails', 
            text: 'Please list your NFT holdings and where they are stored.', 
            type: 'textarea',
            dependsOn: {
              question: 'hasNFTs',
              value: true
            }
          },
          { 
            id: 'socialMediaAccounts', 
            text: 'Please list your social media accounts that should be managed after your passing.', 
            type: 'textarea' 
          },
          { 
            id: 'emailAccounts', 
            text: 'Please list your email accounts that should be managed after your passing.', 
            type: 'textarea' 
          },
          { 
            id: 'digitalInstructions', 
            text: 'What specific instructions do you have for your digital assets?', 
            type: 'textarea' 
          },
          { 
            id: 'passwordManager', 
            text: 'Do you use a password manager or other secure storage for your digital access information?', 
            type: 'yesno' 
          },
          { 
            id: 'passwordManagerDetails', 
            text: 'Please describe how your digital executor can access your password manager or secure storage.', 
            type: 'textarea',
            dependsOn: {
              question: 'passwordManager',
              value: true
            }
          },
          { 
            id: 'digitalMemorial', 
            text: 'Do you have preferences for how your digital presence should be memorialized?', 
            type: 'textarea' 
          }
        ]);
      } else if (selectedTemplate.id === 'living-trust') {
        setQuestions([
          { 
            id: 'fullName', 
            text: 'What is your full legal name?', 
            type: 'text' 
          },
          { 
            id: 'address', 
            text: 'What is your current residential address?', 
            type: 'textarea' 
          },
          { 
            id: 'trustName', 
            text: 'What would you like to name your trust?', 
            type: 'text' 
          },
          { 
            id: 'trustee', 
            text: 'Who would you like to name as the trustee of your trust?', 
            type: 'text' 
          },
          { 
            id: 'successorTrustee', 
            text: 'Who would you like to name as your successor trustee?', 
            type: 'text' 
          },
          { 
            id: 'beneficiaries', 
            text: 'Please list all beneficiaries of your trust.', 
            type: 'textarea' 
          },
          { 
            id: 'assetsList', 
            text: 'Please list the major assets you plan to include in your trust.', 
            type: 'textarea' 
          },
          { 
            id: 'distributionTerms', 
            text: 'How would you like your assets distributed upon your passing?', 
            type: 'textarea' 
          }
        ]);
      } else {
        setQuestions([
          { 
            id: 'fullName', 
            text: 'What is your full legal name?', 
            type: 'text' 
          },
          { 
            id: 'address', 
            text: 'What is your current residential address?', 
            type: 'textarea' 
          },
          { 
            id: 'executorName', 
            text: 'Who would you like to name as the executor of your will?', 
            type: 'text' 
          },
          { 
            id: 'beneficiaries', 
            text: 'Please list all beneficiaries of your will.', 
            type: 'textarea' 
          },
          { 
            id: 'assetDistribution', 
            text: 'How would you like your assets distributed?', 
            type: 'textarea' 
          }
        ]);
      }
    }
  }, [selectedTemplate]);

  // Add a safe way to access the current question that checks if it exists
  const currentQuestion = questions.length > currentQuestionIndex ? questions[currentQuestionIndex] : null;
  
  const shouldShowQuestion = (question: Question): boolean => {
    if (!question.dependsOn) return true;
    
    const dependentValue = responses[question.dependsOn.question];
    return dependentValue === question.dependsOn.value;
  };
  
  const findNextQuestionIndex = (currentIndex: number): number => {
    let nextIndex = currentIndex + 1;
    
    while (
      nextIndex < questions.length && 
      !shouldShowQuestion(questions[nextIndex])
    ) {
      nextIndex++;
    }
    
    return nextIndex;
  };

  const handleAnswer = async () => {
    if (!currentQuestion) return;
    
    if (!currentAnswer.trim()) {
      toast({
        title: "Answer Required",
        description: "Please provide an answer to continue.",
        variant: "destructive"
      });
      return;
    }
    
    let value: string | boolean = currentAnswer;
    if (currentQuestion.type === 'yesno') {
      value = currentAnswer.toLowerCase() === 'yes';
    }
    
    const updatedResponses = { ...responses, [currentQuestion.id]: value };
    setResponses(updatedResponses);
    
    setIsTyping(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { 
          query: `Based on the user's answer to the question "${currentQuestion.text}" which was "${currentAnswer}", provide any additional relevant context or guidance that might help them with the next steps of creating their will. Be brief and focused.`,
          conversation_history: []
        }
      });
      
      if (!error && data?.response) {
        localStorage.setItem('willAIEnhancement', data.response);
      }
    } catch (error) {
      console.error('Error enhancing answers with AI:', error);
    }
    
    setTimeout(() => {
      setIsTyping(false);
      
      const nextIndex = findNextQuestionIndex(currentQuestionIndex);
      
      if (nextIndex < questions.length) {
        setCurrentQuestionIndex(nextIndex);
        setCurrentAnswer('');
      } else {
        setAllQuestionsAnswered(true);
      }
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAnswer();
    }
  };

  const handleGenerateWill = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const generatedWill = generateWillContent(selectedTemplate, responses);
      setIsGenerating(false);
      onComplete(responses, generatedWill);
    }, 3000);
  };

  const generateWillContent = (template: any, responses: Record<string, any>): string => {
    if (template.id === 'traditional') {
      return `LAST WILL AND TESTAMENT OF ${responses.fullName?.toUpperCase() || '[NAME]'}

I, ${responses.fullName || '[NAME]'}, residing at ${responses.address || '[ADDRESS]'}, being of sound mind, declare this to be my Last Will and Testament.

ARTICLE I: REVOCATION
I revoke all previous wills and codicils.

ARTICLE II: FAMILY INFORMATION
I am ${responses.maritalStatus || '[MARITAL STATUS]'}${responses.spouseName ? ` to ${responses.spouseName}` : ''}.
${responses.hasChildren ? `I have the following children: ${responses.childrenNames || '[CHILDREN NAMES]'}.` : 'I have no children.'}

ARTICLE III: EXECUTOR
I appoint ${responses.executorName || '[EXECUTOR NAME]'} as the Executor of this Will.
${responses.alternateExecutor ? `If they are unable or unwilling to serve, I appoint ${responses.alternateExecutorName || '[ALTERNATE EXECUTOR]'} as alternate Executor.` : ''}

${responses.guardianNeeded ? `ARTICLE IV: GUARDIAN
If needed, I appoint ${responses.guardianName || '[GUARDIAN NAME]'} as guardian of my minor children.` : ''}

ARTICLE ${responses.guardianNeeded ? 'V' : 'IV'}: DISPOSITION OF PROPERTY
${responses.specificBequests ? `I make the following specific bequests: ${responses.bequestsDetails || '[SPECIFIC BEQUESTS]'}` : ''}

I give all my remaining property to ${responses.residualEstate || '[BENEFICIARIES]'}.

ARTICLE ${responses.guardianNeeded ? 'VI' : 'V'}: DIGITAL ASSETS
${responses.digitalAssets ? `I direct my Executor regarding my digital assets as follows: ${responses.digitalAssetsDetails || '[DIGITAL ASSETS DETAILS]'}` : 'I authorize my Executor to access, modify, control, archive, transfer, and delete my digital assets.'}

Signed: ${responses.fullName || '[NAME]'}
Date: [Current Date]
Witnesses: [Witness 1], [Witness 2]`;
    } else if (template.id === 'digital-assets') {
      return `DIGITAL ASSET WILL AND TESTAMENT OF ${responses.fullName?.toUpperCase() || '[NAME]'}

I, ${responses.fullName || '[NAME]'}, residing at ${responses.address || '[ADDRESS]'}, being of sound mind, declare this to be my Digital Asset Will and Testament.

ARTICLE I: DIGITAL EXECUTOR
I appoint ${responses.digitalExecutor || '[DIGITAL EXECUTOR]'} as my Digital Executor with authority to manage all my digital assets.

ARTICLE II: CRYPTOCURRENCY ASSETS
${responses.hasCryptocurrency ? `My cryptocurrency assets include: ${responses.cryptocurrencyDetails || '[CRYPTOCURRENCY DETAILS]'}` : 'I have no cryptocurrency assets.'}

ARTICLE III: NFT ASSETS
${responses.hasNFTs ? `My NFT holdings include: ${responses.nftDetails || '[NFT DETAILS]'}` : 'I have no NFT assets.'}

ARTICLE IV: SOCIAL MEDIA ACCOUNTS
My social media accounts include: ${responses.socialMediaAccounts || '[SOCIAL MEDIA ACCOUNTS]'}

ARTICLE V: EMAIL ACCOUNTS
My email accounts include: ${responses.emailAccounts || '[EMAIL ACCOUNTS]'}

ARTICLE VI: ACCESS INFORMATION
${responses.passwordManager ? `My access information is stored in: ${responses.passwordManagerDetails || '[PASSWORD MANAGER DETAILS]'}` : 'I have provided separate secure instructions for accessing my digital accounts.'}

ARTICLE VII: DIGITAL MEMORIAL PREFERENCES
My preferences for my digital memorial are: ${responses.digitalMemorial || '[DIGITAL MEMORIAL PREFERENCES]'}

Signed: ${responses.fullName || '[NAME]'}
Date: [Current Date]
Witnesses: [Witness 1], [Witness 2]`;
    } else {
      return `LAST WILL AND TESTAMENT OF ${responses.fullName?.toUpperCase() || '[NAME]'}

I, ${responses.fullName || '[NAME]'}, residing at ${responses.address || '[ADDRESS]'}, being of sound mind, declare this to be my Last Will and Testament.

ARTICLE I: REVOCATION
I revoke all previous wills and codicils.

ARTICLE II: EXECUTOR
I appoint ${responses.executorName || '[EXECUTOR NAME]'} as the Executor of this Will.

ARTICLE III: DISPOSITION OF PROPERTY
I give all my property to my beneficiaries as follows: ${responses.beneficiaries || '[BENEFICIARIES]'}
Distribution terms: ${responses.assetDistribution || '[ASSET DISTRIBUTION]'}

Signed: ${responses.fullName || '[NAME]'}
Date: [Current Date]
Witnesses: [Witness 1], [Witness 2]`;
    }
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-10">
        <Loader2 className="h-10 w-10 animate-spin mx-auto text-willtank-500" />
        <p className="mt-4 text-gray-600">Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <div className="flex items-center">
          <Bot className="text-willtank-700 mr-2" size={18} />
          <h3 className="font-medium">AI Assistant</h3>
        </div>
        <div className="text-xs text-gray-500">
          {currentQuestionIndex + 1} of {questions.length} questions
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-6 mb-6">
          {Object.entries(responses).map(([questionId, answer], index) => {
            const question = questions.find(q => q.id === questionId);
            return (
              <div key={questionId} className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-8 w-8 rounded-full bg-willtank-100 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-willtank-600" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-700 font-medium">{question?.text || questionId}</p>
                </div>
              </div>
            );
          })}
          
          {Object.entries(responses).map(([questionId, answer], index) => {
            return (
              <div key={`answer-${questionId}`} className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-700">{typeof answer === 'boolean' ? (answer ? 'Yes' : 'No') : answer}</p>
                </div>
              </div>
            );
          })}
          
          {!allQuestionsAnswered && currentQuestion && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="flex-shrink-0 mt-1">
                <div className="h-8 w-8 rounded-full bg-willtank-100 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-willtank-600" />
                </div>
              </div>
              <div>
                <p className="text-gray-700 font-medium">{currentQuestion.text}</p>
              </div>
            </motion.div>
          )}
        </div>
        
        {!allQuestionsAnswered && currentQuestion ? (
          <div className="mt-4">
            {currentQuestion.type === 'text' && (
              <div className="flex gap-2">
                <Input
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your answer here..."
                  className="flex-1"
                />
                <Button onClick={handleAnswer} disabled={isTyping}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {currentQuestion.type === 'textarea' && (
              <div className="flex flex-col gap-2">
                <Textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="min-h-[100px]"
                />
                <Button onClick={handleAnswer} disabled={isTyping} className="self-end">
                  {isTyping ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Submit
                </Button>
              </div>
            )}
            
            {currentQuestion.type === 'yesno' && (
              <div className="flex gap-2">
                <Button 
                  variant={currentAnswer === 'Yes' ? 'default' : 'outline'} 
                  onClick={() => setCurrentAnswer('Yes')}
                  className="flex-1"
                >
                  Yes
                </Button>
                <Button 
                  variant={currentAnswer === 'No' ? 'default' : 'outline'} 
                  onClick={() => setCurrentAnswer('No')}
                  className="flex-1"
                >
                  No
                </Button>
                <Button onClick={handleAnswer} disabled={!currentAnswer || isTyping}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {currentQuestion.type === 'options' && currentQuestion.options && (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {currentQuestion.options.map((option) => (
                    <Button 
                      key={option} 
                      variant={currentAnswer === option ? 'default' : 'outline'} 
                      onClick={() => setCurrentAnswer(option)}
                      className="justify-start"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
                <Button 
                  onClick={handleAnswer} 
                  disabled={!currentAnswer || isTyping}
                  className="self-end mt-2"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Submit
                </Button>
              </div>
            )}
          </div>
        ) : allQuestionsAnswered ? (
          <div className="mt-6 text-center">
            <div className="mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-medium mb-2">All Questions Completed!</h3>
            <p className="text-gray-600 mb-6">We have all the information needed to generate your will.</p>
            
            <Button 
              onClick={handleGenerateWill} 
              className="mx-auto"
              disabled={isGenerating}
              size="lg"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Generating Your Will...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate My Will
                </>
              )}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
