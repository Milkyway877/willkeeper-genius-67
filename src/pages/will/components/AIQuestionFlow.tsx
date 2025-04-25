import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Bot, Loader2 } from 'lucide-react';
import { saveAIConversation } from '@/services/willAiService';

interface AIQuestionFlowProps {
  selectedTemplate: any;
  willId: string;
  onComplete: (responses: Record<string, any>, generatedContent: string) => void;
}

export function AIQuestionFlow({ selectedTemplate, willId, onComplete }: AIQuestionFlowProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize the conversation with a template-specific prompt
    const initialPrompt = `Let's start creating your ${selectedTemplate?.title || 'traditional'} will. What is your full legal name and current address?`;
    setMessages([{ role: 'assistant', content: initialPrompt }]);
  }, [selectedTemplate]);

  const handleSendMessage = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    
    // Optimistically update the UI with the user's message
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setQuery('');
    
    try {
      const response = await fetch('https://ksiinmxsycosnpchutuw.supabase.co/functions/v1/gpt-will-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          template_type: selectedTemplate?.id,
          conversation_history: messages
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update the UI with the assistant's response
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      
      // Extract structured information from the response
      const newResponses = extractInformation(data.response);
      setResponses(prev => ({ ...prev, ...newResponses }));
      
      // Check if the conversation is complete based on certain criteria
      if (data.response.includes("That's all the information I need")) {
        setIsComplete(true);
        setGeneratedContent("This is the generated will content based on the conversation.");
      }
      
    } catch (error) {
      console.error('Error calling the edge function:', error);
      toast({
        title: "Error",
        description: "Failed to get a response from the AI assistant.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const extractInformation = (response: string) => {
    const extracted: Record<string, any> = {};
    
    // Example: Extract full name
    const fullNameMatch = response.match(/My full name is (.*)/);
    if (fullNameMatch && fullNameMatch[1]) {
      extracted.fullName = fullNameMatch[1].trim();
    }
    
    // Example: Extract executor name
    const executorNameMatch = response.match(/executor is (.*)/);
    if (executorNameMatch && executorNameMatch[1]) {
      extracted.executorName = executorNameMatch[1].trim();
    }
    
    // Add more extraction logic here based on expected responses
    
    return extracted;
  };

  const handleComplete = async () => {
    if (!isComplete) return;
    
    try {
      // Save the conversation to the database
      await saveAIConversation(willId, {
        messages: messages,
        responses: responses
      }, {
        contacts: extractContactsFromResponses(responses)
      });
      
      onComplete(responses, generatedContent);
    } catch (error) {
      console.error('Error saving AI conversation:', error);
      toast({
        title: "Error",
        description: "Failed to save conversation data. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gray-50 border-gray-200">
        <div className="p-4 max-h-[50vh] overflow-y-auto">
          {messages.map((message, index) => (
            <div key={index} className={`mb-2 p-3 rounded-lg ${message.role === 'user' ? 'bg-blue-100 text-blue-800 ml-auto w-fit' : 'bg-gray-100 text-gray-800 mr-auto w-fit'}`}>
              <div className="font-medium">{message.role === 'user' ? 'You' : 'AI Assistant'}</div>
              <div className="whitespace-pre-line">{message.content}</div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Thinking...
            </div>
          )}
        </div>
      </Card>
      
      <div className="flex">
        <input
          type="text"
          placeholder="Ask a question..."
          className="flex-1 border rounded-l-md px-4 py-2"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
        />
        <Button onClick={handleSendMessage} disabled={isLoading} className="rounded-l-none">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="mr-2 h-4 w-4" />
          )}
          Send
        </Button>
      </div>
      
      {isComplete && (
        <div className="flex justify-end mt-4">
          <Button onClick={handleComplete} className="w-full md:w-auto">
            <ArrowRight className="mr-2 h-4 w-4" />
            Continue to Next Step
          </Button>
        </div>
      )}
    </div>
  );
}

const extractContactsFromResponses = (responses: Record<string, any>) => {
  const contacts = [];
  
  // Extract potential contacts from responses
  if (responses.executorName) {
    contacts.push({
      name: responses.executorName,
      role: 'Executor'
    });
  }
  
  if (responses.alternateExecutorName) {
    contacts.push({
      name: responses.alternateExecutorName,
      role: 'Alternate Executor'
    });
  }
  
  if (responses.guardianName) {
    contacts.push({
      name: responses.guardianName,
      role: 'Guardian'
    });
  }
  
  // Extract beneficiaries
  if (responses.beneficiaries && Array.isArray(responses.beneficiaries)) {
    responses.beneficiaries.forEach((beneficiary: string) => {
      contacts.push({
        name: beneficiary,
        role: 'Beneficiary'
      });
    });
  }
  
  return contacts;
};
