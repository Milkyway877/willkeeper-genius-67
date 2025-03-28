
import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WillEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
  autoSave?: boolean;
  autoSaveInterval?: number;
}

export function WillEditor({ 
  initialContent, 
  onChange,
  autoSave = true,
  autoSaveInterval = 5000
}: WillEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();
  
  // Handle content change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onChange(newContent);
  };
  
  // Auto-save feature
  useEffect(() => {
    if (!autoSave) return;
    
    const saveInterval = setInterval(() => {
      if (content !== initialContent) {
        onChange(content);
        setLastSaved(new Date());
        
        toast({
          title: "Draft saved",
          description: "Your will draft has been automatically saved.",
        });
      }
    }, autoSaveInterval);
    
    return () => clearInterval(saveInterval);
  }, [content, initialContent, onChange, autoSave, autoSaveInterval, toast]);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-end items-center mb-2">
        {lastSaved && (
          <div className="text-xs text-gray-500 flex items-center">
            <Save size={14} className="mr-1" />
            Last saved at {lastSaved.toLocaleTimeString()}
          </div>
        )}
      </div>
      
      <Textarea 
        className="w-full h-[500px] p-4 border border-gray-200 rounded-md font-mono text-sm"
        value={content}
        onChange={handleChange}
      />
    </div>
  );
}
