
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Image, 
  Sparkles, 
  MessageCircle, 
  Heart, 
  FileUp, 
  Save, 
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface TankLetterCreatorProps {
  onContentChange: (content: string) => void;
  onTitleChange: (title: string) => void;
  onRecipientChange: (recipient: string) => void;
}

export const TankLetterCreator: React.FC<TankLetterCreatorProps> = ({ 
  onContentChange, 
  onTitleChange,
  onRecipientChange
}) => {
  const { toast } = useToast();
  const [letterContent, setLetterContent] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('elegant');
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [showSuggestion, setShowSuggestion] = useState<boolean>(false);
  
  useEffect(() => {
    onContentChange(letterContent);
  }, [letterContent, onContentChange]);
  
  useEffect(() => {
    onTitleChange(title);
  }, [title, onTitleChange]);
  
  useEffect(() => {
    onRecipientChange(recipient);
  }, [recipient, onRecipientChange]);
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLetterContent(e.target.value);
    
    // Show AI suggestion after some typing
    if (e.target.value.length > 50 && !showSuggestion) {
      setTimeout(() => {
        setShowSuggestion(true);
      }, 1500);
    }
  };
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  
  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipient(e.target.value);
  };
  
  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template);
    toast({
      title: "Template Applied",
      description: `The ${template} template has been applied.`
    });
  };
  
  const handleEnhanceContent = () => {
    setIsEnhancing(true);
    
    // Simulate AI enhancement
    setTimeout(() => {
      const enhancedContent = `Dear ${recipient || '[Recipient]'},

I hope this message finds you well. As I write this letter to be delivered to you in the future, I'm filled with a deep sense of emotion and reflection.

${letterContent}

There are so many things I wish to share with you, and I hope this letter captures the depth of my feelings. Life is a precious journey, and I'm grateful that you've been a part of mine.

With all my love and best wishes for your future,
[Your Name]`;
      
      setLetterContent(enhancedContent);
      setIsEnhancing(false);
      
      toast({
        title: "Content Enhanced",
        description: "AI has improved the emotional resonance of your letter."
      });
    }, 2000);
  };
  
  const handleAddAttachment = () => {
    toast({
      title: "Attachment Feature",
      description: "You can add photos and documents to your letter."
    });
  };
  
  const handleSaveDraft = () => {
    toast({
      title: "Draft Saved",
      description: "Your letter has been saved as a draft."
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Message Title</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input 
                  id="title"
                  placeholder="e.g. Birthday Wishes for Sarah" 
                  className="pl-10"
                  value={title}
                  onChange={handleTitleChange}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input 
                  id="recipient"
                  placeholder="e.g. Sarah Williams" 
                  className="pl-10"
                  value={recipient}
                  onChange={handleRecipientChange}
                />
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
            <Textarea 
              id="content"
              placeholder="Type your heartfelt message here. Our AI will help enhance the emotional impact..." 
              className="min-h-[300px] resize-none"
              value={letterContent}
              onChange={handleContentChange}
            />
          </div>
          
          {showSuggestion && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-willtank-50 border border-willtank-200 rounded-lg p-3 text-sm"
            >
              <div className="flex items-start">
                <Sparkles className="h-5 w-5 text-willtank-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-willtank-700 mb-1">AI Writing Suggestion</p>
                  <p className="text-gray-600 mb-2">Try adding more personal memories or specific qualities you admire about the recipient to make your message more meaningful.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-willtank-600 border-willtank-200 hover:bg-willtank-50"
                    onClick={handleEnhanceContent}
                    disabled={isEnhancing}
                  >
                    {isEnhancing ? 'Enhancing...' : 'Enhance My Message'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleAddAttachment}>
              <Image size={16} className="mr-2" />
              Add Photo
            </Button>
            <Button variant="outline" size="sm" onClick={handleAddAttachment}>
              <FileUp size={16} className="mr-2" />
              Attach Document
            </Button>
            <Button variant="outline" size="sm" onClick={handleEnhanceContent} disabled={isEnhancing}>
              <Sparkles size={16} className="mr-2" />
              {isEnhancing ? 'Enhancing...' : 'AI Enhance'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleSaveDraft}>
              <Save size={16} className="mr-2" />
              Save Draft
            </Button>
          </div>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Template Selection</CardTitle>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="elegant" className="w-full" onValueChange={handleTemplateSelect}>
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="elegant">Elegant</TabsTrigger>
                  <TabsTrigger value="handwritten">Handwritten</TabsTrigger>
                  <TabsTrigger value="galactic">Galactic</TabsTrigger>
                  <TabsTrigger value="vintage">Vintage</TabsTrigger>
                </TabsList>
                
                <TabsContent value="elegant" className="mt-0">
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-blue-100 rounded-xl p-6 min-h-[300px] font-serif">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-medium text-blue-800">{title || "Your Message Title"}</h3>
                      <p className="text-blue-600">For: {recipient || "Recipient Name"}</p>
                    </div>
                    
                    <div className="border-t border-b border-blue-200 py-4 my-4 whitespace-pre-line">
                      {letterContent || "Your elegant message will appear here..."}
                    </div>
                    
                    <div className="text-right text-blue-600 italic">
                      With love and care,
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="handwritten" className="mt-0">
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 min-h-[300px] font-handwriting">
                    <div className="mb-4">
                      <h3 className="text-xl font-medium text-amber-800">{title || "Your Message Title"}</h3>
                      <p className="text-amber-700">Dear {recipient || "Friend"},</p>
                    </div>
                    
                    <div className="py-4 my-4 whitespace-pre-line leading-relaxed text-amber-900">
                      {letterContent || "Your handwritten-style message will appear here..."}
                    </div>
                    
                    <div className="text-right text-amber-800">
                      Yours truly,
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="galactic" className="mt-0">
                  <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white border border-purple-700 rounded-xl p-6 min-h-[300px] font-futuristic">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-medium text-purple-300">{title || "Your Message Title"}</h3>
                      <p className="text-indigo-300">Transmission for: {recipient || "Recipient Name"}</p>
                    </div>
                    
                    <div className="border-t border-b border-purple-700 py-4 my-4 whitespace-pre-line">
                      {letterContent || "Your futuristic message will appear here..."}
                    </div>
                    
                    <div className="text-right text-purple-300">
                      Transmitted with care,
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="vintage" className="mt-0">
                  <div className="bg-amber-100 border-4 border-double border-amber-800 rounded-xl p-6 min-h-[300px] font-oldstyle">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-medium text-amber-900">{title || "Your Message Title"}</h3>
                      <p className="text-amber-800">For the attention of: {recipient || "Recipient Name"}</p>
                    </div>
                    
                    <div className="border-t border-b border-amber-800 py-4 my-4 whitespace-pre-line text-amber-950">
                      {letterContent || "Your vintage-style message will appear here..."}
                    </div>
                    
                    <div className="text-right text-amber-800">
                      With fondest regards,
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
