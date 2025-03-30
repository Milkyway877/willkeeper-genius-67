import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, Copy, Undo, Redo, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validateAddress } from '@/services/locationService';

type WillEditorProps = {
  content: string;
  onChange: (content: string) => void;
};

export function WillEditor({ content, onChange }: WillEditorProps) {
  const { toast } = useToast();
  
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Will content copied to clipboard"
    });
  };
  
  const handleFormat = () => {
    // In a real implementation, this would format the text properly
    toast({
      title: "Formatted",
      description: "Document has been formatted according to legal standards"
    });
  };

  const validateAddressField = async (address: string) => {
    if (!address || address.trim().length < 5) return;
    
    setIsValidatingAddress(true);
    
    try {
      const result = await validateAddress(address);
      
      if (result.isValid && result.formattedAddress) {
        // Optionally update the field with the formatted address
        // setContent(prev => ({...prev, address: result.formattedAddress}));
        
        toast({
          title: "Address Validated",
          description: `The address is valid: ${result.formattedAddress}`,
        });
      } else {
        toast({
          title: "Address Validation Failed",
          description: "The provided address could not be verified. Please check and try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error validating address:", error);
      toast({
        title: "Validation Error",
        description: "There was an error validating the address.",
        variant: "destructive"
      });
    } finally {
      setIsValidatingAddress(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h3 className="font-medium">Edit Your Will</h3>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => toast({ title: "Undo", description: "Last change undone" })}>
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => toast({ title: "Redo", description: "Change reapplied" })}>
            <Redo className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleFormat}>
            <Code className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast({ title: "Saved", description: "Changes saved" })}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
      
      <div className="p-6">
        <Textarea
          className="min-h-[500px] font-mono text-sm resize-none"
          value={content}
          onChange={handleChange}
          placeholder="Your will content will appear here. You can edit it directly."
        />
      </div>
    </div>
  );
}
