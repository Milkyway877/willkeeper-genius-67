
import React, { useState, useEffect } from 'react';
import { TemplateWillSection } from '@/components/will/TemplateWillSection';
import { FileText, Download, RefreshCw, Bot, MessageCircleQuestion, FileCheck, Loader2 } from 'lucide-react';
import { WillPreview } from '@/pages/will/components/WillPreview';
import { Button } from '@/components/ui/button';
import { downloadDocument } from '@/utils/documentUtils';
import { downloadProfessionalDocument } from '@/utils/professionalDocumentUtils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { WillContent } from './types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useToast } from '@/hooks/use-toast';

interface WillPreviewSectionProps {
  content: string;
  signature?: string | null;
  title?: string;
  defaultOpen?: boolean;
  onRefresh?: () => void;
  onHelp?: () => void;
  liveUpdate?: boolean;
  useProfessionalFormat?: boolean;
  isWillFinalized?: boolean; // Add prop to track if will is finalized
}

export function WillPreviewSection({ 
  content, 
  signature = null,
  title = "Last Will and Testament",
  defaultOpen = false,
  onRefresh,
  onHelp,
  liveUpdate = false,
  useProfessionalFormat = true,
  isWillFinalized = false // Default to false for drafts
}: WillPreviewSectionProps) {
  const [isFormatted, setIsFormatted] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { subscriptionStatus } = useSubscriptionStatus();
  const { toast } = useToast();
  
  // Function to download the draft document - only for subscribed users with finalized wills
  const handleDownload = () => {
    if (!content) {
      console.error("No content to download");
      return;
    }
    
    if (!subscriptionStatus.isSubscribed) {
      toast({
        title: "Subscription Required",
        description: "Please subscribe to download your will document.",
        variant: "destructive"
      });
      return;
    }
    
    if (!isWillFinalized) {
      toast({
        title: "Will Not Finalized",
        description: "Please finalize your will before downloading.",
        variant: "destructive"
      });
      return;
    }
    
    setIsDownloading(true);
    try {
      downloadDocument(content, title, signature);
      
      toast({
        title: "Download Started",
        description: "Your will document is being downloaded.",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Error",
        description: "There was an error downloading your will. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };
  
  // Function to generate professional will document - only for subscribed users with finalized wills
  const handleGenerateProfessionalDocument = () => {
    if (!subscriptionStatus.isSubscribed) {
      toast({
        title: "Subscription Required",
        description: "Please subscribe to generate professional documents.",
        variant: "destructive"
      });
      return;
    }
    
    if (!isWillFinalized) {
      toast({
        title: "Will Not Finalized",
        description: "Please finalize your will before generating professional documents.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsDownloading(true);
      
      // Create a mock WillContent object from the text content
      const mockWillContent: WillContent = {
        personalInfo: {
          fullName: title.replace(/'s Will$/, '') || "Unknown",
          dateOfBirth: "",
          address: "",
          email: "",
          phone: ""
        },
        executors: [{ id: "exec-1", name: "", relationship: "", email: "", phone: "", address: "", isPrimary: true }],
        beneficiaries: [{ id: "ben-1", name: "", relationship: "", email: "", phone: "", address: "", percentage: 0 }],
        specificBequests: "",
        residualEstate: "",
        finalArrangements: ""
      };
      
      // Try to extract some basic information from the content
      const fullNameMatch = content.match(/I,\s+([^,]+)/);
      if (fullNameMatch && fullNameMatch[1]) {
        mockWillContent.personalInfo.fullName = fullNameMatch[1].trim();
      }
      
      const addressMatch = content.match(/residing at\s+([^,]+)/);
      if (addressMatch && addressMatch[1]) {
        mockWillContent.personalInfo.address = addressMatch[1].trim();
      }
      
      downloadProfessionalDocument(mockWillContent, signature, title);
      
      toast({
        title: "Professional Document Generated",
        description: "Your professional will document has been generated and downloaded.",
      });
    } catch (error) {
      console.error("Error generating professional document:", error);
      toast({
        title: "Generation Error",
        description: "There was an error generating the professional document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Toggle formatting option
  const toggleFormatting = () => {
    setIsFormatted(!isFormatted);
  };

  return (
    <TemplateWillSection 
      title="Document Preview" 
      icon={<FileText className="h-5 w-5" />}
      defaultOpen={defaultOpen}
      actions={
        <div className="flex items-center space-x-2">
          {onRefresh && (
            <Button variant="ghost" size="sm" onClick={onRefresh} title="Refresh Preview">
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          {onHelp && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setShowHelp(!showHelp);
                onHelp();
              }} 
              title="Get Help"
              className={showHelp ? 'text-willtank-600' : ''}
            >
              <MessageCircleQuestion className="h-4 w-4" />
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4 pb-4">
        <div className="flex items-center space-x-2">
          <Switch id="format-toggle" checked={isFormatted} onCheckedChange={toggleFormatting} />
          <Label htmlFor="format-toggle">Show formatted preview</Label>
        </div>
        
        <div className="border rounded-md p-4 bg-white">
          <ScrollArea className="max-h-[50vh]">
            <WillPreview 
              content={content} 
              formatted={isFormatted} 
              signature={signature}
              useProfessionalFormat={useProfessionalFormat && isFormatted}
            />
          </ScrollArea>
        </div>
        
        <div className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2"
            onClick={handleDownload}
            disabled={isDownloading || !subscriptionStatus.isSubscribed || !isWillFinalized}
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download Draft
              </>
            )}
          </Button>
          
          <Button 
            className="w-full bg-gradient-to-r from-willtank-500 to-willtank-600 hover:from-willtank-600 hover:to-willtank-700 text-white font-medium py-2 px-4 rounded shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            onClick={handleGenerateProfessionalDocument}
            disabled={isDownloading || !subscriptionStatus.isSubscribed || !isWillFinalized}
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileCheck className="h-5 w-5" />
                Generate Professional Document
              </>
            )}
          </Button>
          
          {(!subscriptionStatus.isSubscribed || !isWillFinalized) && (
            <div className="text-center text-xs text-gray-500 mt-2">
              {!subscriptionStatus.isSubscribed && "Subscription required for downloads"}
              {!subscriptionStatus.isSubscribed && !isWillFinalized && " • "}
              {!isWillFinalized && "Will must be finalized first"}
            </div>
          )}
          
          {showHelp && (
            <div className="bg-willtank-50 p-3 text-sm rounded border border-willtank-100 text-willtank-700">
              <p className="flex items-start gap-2">
                <Bot className="h-4 w-4 mt-0.5 flex-shrink-0 text-willtank-500" />
                Want to improve your will? Ask our AI assistant for help with specific sections.
              </p>
            </div>
          )}
        </div>
      </div>
    </TemplateWillSection>
  );
}
