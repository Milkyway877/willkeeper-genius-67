
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { WillPreview } from './WillPreview';
import { FileText, Save, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createWill } from '@/services/willService';
import { useNavigate } from 'react-router-dom';
import { useWillSubscriptionFlow } from '@/hooks/useWillSubscriptionFlow';
import { SubscriptionModal } from '@/components/subscription/SubscriptionModal';

interface DocumentWillEditorProps {
  onWillSaved?: (willId: string) => void;
}

export function DocumentWillEditor({ onWillSaved }: DocumentWillEditorProps) {
  const [title, setTitle] = useState('My Last Will and Testament');
  const [content, setContent] = useState(`LAST WILL AND TESTAMENT

I, [Your Full Name], of [Your Address], being of sound mind and disposing memory, do hereby make, publish, and declare this to be my Last Will and Testament.

ARTICLE I: REVOCATION
I hereby revoke all former wills and codicils made by me.

ARTICLE II: PERSONAL REPRESENTATIVE
I hereby nominate and appoint [Executor Name] as the Personal Representative of this my Last Will and Testament.

ARTICLE III: DISPOSITION OF PROPERTY
I give, devise, and bequeath all of my property, both real and personal, of whatever kind and wherever situated, to [Beneficiary Name].

IN WITNESS WHEREOF, I have hereunto set my hand this [Date].

_________________________
[Your Full Name], Testator`);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    showSubscriptionModal,
    handleWillSaved,
    handleSubscriptionSuccess,
    closeSubscriptionModal,
    subscriptionStatus
  } = useWillSubscriptionFlow();

  const handleGenerateOfficialWill = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both a title and content for your will.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate generation process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setHasGenerated(true);
      toast({
        title: "Will Generated",
        description: "Your will has been generated successfully. You can now review and save it.",
      });
    } catch (error) {
      console.error('Error generating will:', error);
      toast({
        title: "Generation Error",
        description: "There was an error generating your will. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveWill = async () => {
    // Check subscription before allowing save
    if (!subscriptionStatus.isSubscribed) {
      await handleWillSaved(true); // This will show the subscription modal
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both a title and content for your will.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const willData = {
        title: title.trim(),
        content: content.trim(),
        status: 'active',
        template_type: 'custom',
        ai_generated: false,
        document_url: ''
      };

      const savedWill = await createWill(willData);
      
      toast({
        title: "Will Saved",
        description: "Your will has been saved successfully.",
      });
      
      if (onWillSaved) {
        onWillSaved(savedWill.id);
      }
      
      // Navigate to wills page or tank
      navigate('/wills');
    } catch (error) {
      console.error('Error saving will:', error);
      toast({
        title: "Save Error",
        description: "There was an error saving your will. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadWill = () => {
    // Only allow download if user has subscription
    if (!subscriptionStatus.isSubscribed) {
      toast({
        title: "Subscription Required",
        description: "Please upgrade to download your will document.",
        variant: "destructive"
      });
      return;
    }

    if (!hasGenerated) {
      toast({
        title: "Generate First",
        description: "Please generate your will before downloading.",
        variant: "destructive"
      });
      return;
    }

    // Create and download the document
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Will Downloaded",
      description: "Your will has been downloaded successfully.",
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Will Editor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Will Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter will title"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="content">Will Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your will content here..."
                className="mt-1 min-h-[400px] font-mono text-sm"
              />
            </div>
            
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleGenerateOfficialWill}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Will...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Will
                  </>
                )}
              </Button>
              
              {hasGenerated && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveWill}
                    disabled={isSaving}
                    variant="default"
                    className="flex-1"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Will
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleDownloadWill}
                    variant="outline"
                    className="flex-1"
                    disabled={!subscriptionStatus.isSubscribed}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              )}
            </div>
            
            {hasGenerated && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Generated
                </Badge>
                <span className="text-sm text-green-700">
                  Your will is ready for review and saving
                </span>
              </div>
            )}
            
            {!subscriptionStatus.isSubscribed && hasGenerated && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Subscription Required:</strong> Upgrade to save and download your will, plus access Tank features.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <WillPreview title={title} content={content} />
          </CardContent>
        </Card>
      </div>
      
      <SubscriptionModal
        open={showSubscriptionModal}
        onClose={closeSubscriptionModal}
        onSubscriptionSuccess={handleSubscriptionSuccess}
      />
    </div>
  );
}
