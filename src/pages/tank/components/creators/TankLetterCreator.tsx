
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  Sparkles, 
  Image, 
  ChevronRight, 
  FileSymlink, 
  RefreshCw,
  PanelLeftOpen,
  PanelRightOpen,
  Check,
  Send
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion } from 'framer-motion';

type LetterTemplate = 'elegant' | 'handwritten' | 'modern' | 'vintage';

type TankLetterCreatorProps = {
  onComplete: (letterContent: any) => void;
  isAiEnhanced: boolean;
};

export function TankLetterCreator({ onComplete, isAiEnhanced }: TankLetterCreatorProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [template, setTemplate] = useState<LetterTemplate>('elegant');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const aiSuggestions = [
    "Consider adding a personal memory that your recipient would cherish.",
    "You might want to include advice based on your life experiences.",
    "Express your feelings more deeply with specific examples.",
    "Add a quote that has meaning to both you and the recipient."
  ];
  
  const aiCompletions = [
    "I hope this letter finds you well. I wanted to take a moment to express my deepest gratitude for all that you've done...",
    "As I write this letter to you, I'm filled with emotions and memories. I remember when we first...",
    "There are certain moments in life that define us, and I wanted to share with you one of those moments from my journey..."
  ];
  
  const handleAiEnhance = () => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please write something before using AI enhancement",
        variant: "destructive"
      });
      return;
    }
    
    setIsEnhancing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setContent(content + "\n\nI want you to know how much you've meant to me throughout the years. Your support and kindness have been a constant source of strength, and I'm eternally grateful for our connection. As you read this, please know that you carry with you my deepest respect and fondest wishes for your future.");
      setIsEnhancing(false);
      
      toast({
        title: "Letter enhanced",
        description: "AI has improved your letter with emotional depth",
      });
    }, 2000);
  };
  
  const handleAiSuggestion = (suggestion: string) => {
    toast({
      title: "Suggestion applied",
      description: suggestion,
    });
    setShowSuggestions(false);
  };
  
  const handleAiCompletion = (completion: string) => {
    setContent(content + "\n\n" + completion);
    setShowSuggestions(false);
  };
  
  const handleSubmit = () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for your letter",
        variant: "destructive"
      });
      return;
    }
    
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please write your letter content",
        variant: "destructive"
      });
      return;
    }
    
    onComplete({
      type: 'letter',
      title,
      content,
      template
    });
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-medium">Letter Content</h3>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? (
                  <>
                    <PanelLeftOpen className="h-4 w-4 mr-2" />
                    Edit Mode
                  </>
                ) : (
                  <>
                    <PanelRightOpen className="h-4 w-4 mr-2" />
                    Preview
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-4">
              <Label htmlFor="letter-title" className="block mb-2">Letter Title</Label>
              <Input 
                id="letter-title" 
                placeholder="e.g., A Message for Your Graduation" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <Label htmlFor="letter-content" className="block mb-2">Your Message</Label>
              <Textarea 
                id="letter-content" 
                placeholder="Write your heartfelt message here..." 
                className="min-h-[300px] resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowSuggestions(!showSuggestions)} 
                disabled={isEnhancing}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI Suggestions
              </Button>
              
              {isAiEnhanced && (
                <Button 
                  variant="outline" 
                  onClick={handleAiEnhance}
                  disabled={isEnhancing}
                >
                  {isEnhancing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Enhance Writing
                    </>
                  )}
                </Button>
              )}
              
              <Button variant="outline" disabled={isEnhancing}>
                <Image className="h-4 w-4 mr-2" />
                Add Photo
              </Button>
              
              <Button variant="outline" disabled={isEnhancing}>
                <FileSymlink className="h-4 w-4 mr-2" />
                Attach File
              </Button>
            </div>
            
            {showSuggestions && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 border border-willtank-100 rounded-lg bg-willtank-50 p-4"
              >
                <h4 className="text-sm font-medium text-willtank-700 mb-3">AI Suggestions</h4>
                <div className="space-y-2">
                  {aiSuggestions.map((suggestion, index) => (
                    <div 
                      key={index}
                      className="bg-white rounded-md p-3 border border-willtank-100 hover:border-willtank-300 cursor-pointer transition-colors flex items-start"
                      onClick={() => handleAiSuggestion(suggestion)}
                    >
                      <Sparkles className="h-4 w-4 text-willtank-500 mr-2 mt-0.5" />
                      <p className="text-sm">{suggestion}</p>
                    </div>
                  ))}
                  
                  <div className="pt-2 mt-2 border-t border-willtank-100">
                    <h4 className="text-sm font-medium text-willtank-700 mb-2">AI Completions</h4>
                    {aiCompletions.map((completion, index) => (
                      <div 
                        key={index}
                        className="bg-white rounded-md p-3 border border-willtank-100 hover:border-willtank-300 cursor-pointer transition-colors mb-2 flex items-start"
                        onClick={() => handleAiCompletion(completion)}
                      >
                        <MessageSquare className="h-4 w-4 text-willtank-500 mr-2 mt-0.5" />
                        <p className="text-sm line-clamp-2">{completion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-medium">Template Style</h3>
          </div>
          
          <div className="p-6">
            <RadioGroup 
              value={template} 
              onValueChange={(value) => setTemplate(value as LetterTemplate)}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value="elegant" id="elegant" className="peer sr-only" />
                <Label 
                  htmlFor="elegant" 
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-willtank-200 peer-data-[state=checked]:border-willtank-500 peer-data-[state=checked]:bg-willtank-50 cursor-pointer transition-all"
                >
                  <div className="w-full h-20 bg-gradient-to-r from-blue-50 to-blue-100 rounded-md mb-3 flex items-center justify-center text-blue-500">
                    Elegant
                  </div>
                  <div className="font-medium">Elegant</div>
                </Label>
              </div>
              
              <div>
                <RadioGroupItem value="handwritten" id="handwritten" className="peer sr-only" />
                <Label 
                  htmlFor="handwritten" 
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-willtank-200 peer-data-[state=checked]:border-willtank-500 peer-data-[state=checked]:bg-willtank-50 cursor-pointer transition-all"
                >
                  <div className="w-full h-20 bg-gradient-to-r from-amber-50 to-amber-100 rounded-md mb-3 flex items-center justify-center text-amber-500">
                    Handwritten
                  </div>
                  <div className="font-medium">Handwritten</div>
                </Label>
              </div>
              
              <div>
                <RadioGroupItem value="modern" id="modern" className="peer sr-only" />
                <Label 
                  htmlFor="modern" 
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-willtank-200 peer-data-[state=checked]:border-willtank-500 peer-data-[state=checked]:bg-willtank-50 cursor-pointer transition-all"
                >
                  <div className="w-full h-20 bg-gradient-to-r from-purple-50 to-purple-100 rounded-md mb-3 flex items-center justify-center text-purple-500">
                    Modern
                  </div>
                  <div className="font-medium">Modern</div>
                </Label>
              </div>
              
              <div>
                <RadioGroupItem value="vintage" id="vintage" className="peer sr-only" />
                <Label 
                  htmlFor="vintage" 
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-willtank-200 peer-data-[state=checked]:border-willtank-500 peer-data-[state=checked]:bg-willtank-50 cursor-pointer transition-all"
                >
                  <div className="w-full h-20 bg-gradient-to-r from-orange-50 to-orange-100 rounded-md mb-3 flex items-center justify-center text-orange-500">
                    Vintage
                  </div>
                  <div className="font-medium">Vintage</div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
      
      <div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-medium">Preview</h3>
          </div>
          
          <div className="p-6">
            <div className={`p-8 min-h-[500px] rounded-lg mb-6 ${
              template === 'elegant' ? 'bg-gradient-to-br from-blue-50 to-white border border-blue-100 font-serif' :
              template === 'handwritten' ? 'bg-amber-50 border border-amber-100 font-handwritten' :
              template === 'modern' ? 'bg-gradient-to-br from-purple-50 to-white border border-purple-100' :
              'bg-orange-50 border border-orange-100 font-serif'
            }`}>
              {title && <h2 className={`text-2xl font-medium mb-6 text-center ${
                template === 'elegant' ? 'text-blue-800' :
                template === 'handwritten' ? 'text-amber-800' :
                template === 'modern' ? 'text-purple-800' :
                'text-orange-800'
              }`}>{title}</h2>}
              
              {content ? (
                <div className={`whitespace-pre-line ${
                  template === 'elegant' ? 'text-blue-900' :
                  template === 'handwritten' ? 'text-amber-900' :
                  template === 'modern' ? 'text-purple-900' :
                  'text-orange-900'
                }`}>
                  {content}
                </div>
              ) : (
                <div className="text-gray-400 italic">
                  Your letter content will appear here...
                </div>
              )}
            </div>
            
            <Button onClick={handleSubmit} className="w-full">
              <Check className="h-4 w-4 mr-2" />
              Continue to Delivery Options
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
