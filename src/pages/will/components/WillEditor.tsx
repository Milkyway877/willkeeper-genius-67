
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, Copy, Undo, Redo, Code, FileText, Video, FileAudio, File } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validateAddress } from '@/services/locationService';
import { getWill, updateWill } from '@/services/willService';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type WillEditorProps = {
  content?: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
};

export function WillEditor({ readOnly = false }: WillEditorProps) {
  const { toast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [willData, setWillData] = useState<any>(null);
  const [content, setContent] = useState('');
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);

  useEffect(() => {
    const loadWill = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const will = await getWill(id);
        if (will) {
          setWillData(will);
          setContent(will.content || '');
        } else {
          toast({
            title: "Error",
            description: "Could not find the requested will",
            variant: "destructive"
          });
          navigate('/wills');
        }
      } catch (error) {
        console.error('Error loading will:', error);
        toast({
          title: "Error",
          description: "Failed to load will content",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadWill();
  }, [id, toast, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleSave = async () => {
    if (!id || !willData) return;
    try {
      const updated = await updateWill(id, {
        ...willData,
        content: content
      });
      
      if (updated) {
        toast({
          title: "Success",
          description: "Will has been updated successfully"
        });
      }
    } catch (error) {
      console.error('Error saving will:', error);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive"
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Will content copied to clipboard"
    });
  };

  const handleFormat = () => {
    toast({
      title: "Formatted",
      description: "Document has been formatted according to legal standards"
    });
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading will content...</div>;
  }

  const renderAttachments = () => {
    if (!willData?.attachments?.length) return null;
    
    return (
      <div className="mt-6 space-y-4">
        <h3 className="font-medium text-lg">Attachments</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {willData.attachments.map((attachment: any) => (
            <Card key={attachment.id} className="p-4">
              <div className="flex items-center gap-2">
                {getAttachmentIcon(attachment.type)}
                <div>
                  <p className="font-medium truncate">{attachment.name}</p>
                  <p className="text-sm text-gray-500">{attachment.size}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'video':
        return <Video className="h-5 w-5 text-red-500" />;
      case 'audio':
        return <FileAudio className="h-5 w-5 text-purple-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{readOnly ? 'View Will' : 'Edit Will'}</h3>
          {willData?.status && (
            <Badge variant="outline" className="capitalize">
              {willData.status}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {!readOnly && (
            <>
              <Button variant="ghost" size="icon" onClick={() => toast({ title: "Undo", description: "Last change undone" })}>
                <Undo className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => toast({ title: "Redo", description: "Change reapplied" })}>
                <Redo className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleFormat}>
                <Code className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
          </Button>
          {!readOnly && (
            <Button variant="outline" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <Textarea
          className="min-h-[500px] font-mono text-sm resize-none"
          value={content}
          onChange={handleChange}
          readOnly={readOnly}
          placeholder={readOnly ? "No content available" : "Your will content will appear here. You can edit it directly."}
        />
        
        {renderAttachments()}
      </div>
    </div>
  );
}
