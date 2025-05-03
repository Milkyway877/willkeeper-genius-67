
import React, { useState, useEffect } from 'react';
import { TemplateWillSection } from '@/components/will/TemplateWillSection';
import { FileText, Download, RefreshCw, Bot, MessageCircleQuestion, FileCheck } from 'lucide-react';
import { WillPreview } from '@/pages/will/components/WillPreview';
import { Button } from '@/components/ui/button';
import { downloadDocument } from '@/utils/documentUtils';
import { downloadProfessionalDocument } from '@/utils/professionalDocumentUtils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { WillContent } from './types';

interface WillPreviewSectionProps {
  content: string;
  signature?: string | null;
  title?: string;
  defaultOpen?: boolean;
  onRefresh?: () => void;
  onHelp?: () => void;
  liveUpdate?: boolean; // Added liveUpdate prop
}

export function WillPreviewSection({ 
  content, 
  signature = null,
  title = "Last Will and Testament",
  defaultOpen = false,
  onRefresh,
  onHelp,
  liveUpdate = false // Added with default value
}: WillPreviewSectionProps) {
  const [isFormatted, setIsFormatted] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  
  // Function to download the draft document
  const handleDownload = () => {
    if (!content) {
      console.error("No content to download");
      return;
    }
    
    downloadDocument(content, title, signature);
  };
  
  // Function to generate official will document
  const handleGenerateOfficialWill = () => {
    try {
      // Create a mock WillContent object from the text content
      // This is just a basic implementation - in reality you'd want proper parsing
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
    } catch (error) {
      console.error("Error generating official will:", error);
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
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch id="format-toggle" checked={isFormatted} onCheckedChange={toggleFormatting} />
          <Label htmlFor="format-toggle">Show formatted preview</Label>
        </div>
        
        <div className="border rounded-md p-4 bg-white">
          <WillPreview 
            content={content} 
            formatted={isFormatted} 
            signature={signature}
          />
        </div>
        
        <div className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
            Download Draft
          </Button>
          
          <Button 
            className="w-full bg-gradient-to-r from-willtank-500 to-willtank-600 hover:from-willtank-600 hover:to-willtank-700 text-white font-medium py-2 px-4 rounded shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            onClick={handleGenerateOfficialWill}
          >
            <FileCheck className="h-5 w-5" />
            Generate Official Will
          </Button>
          
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
