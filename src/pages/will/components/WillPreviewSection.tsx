
import React, { useState, useEffect } from 'react';
import { TemplateWillSection } from '@/components/will/TemplateWillSection';
import { FileText, Download, RefreshCw, Bot } from 'lucide-react';
import { WillPreview } from '@/pages/will/components/WillPreview';
import { Button } from '@/components/ui/button';
import { downloadDocument } from '@/utils/documentUtils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { validateWillContent } from '@/utils/willTemplateUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WillPreviewSectionProps {
  defaultOpen?: boolean;
  content: string;
  signature?: string | null;
  title?: string;
  onRefresh?: () => void;
  liveUpdate?: boolean;
  onSectionClick?: (section: string) => void;
  interactive?: boolean;
}

export function WillPreviewSection({ 
  defaultOpen = true, 
  content,
  signature = null,
  title = "My Last Will and Testament",
  onRefresh,
  liveUpdate = false,
  onSectionClick,
  interactive = false,
}: WillPreviewSectionProps) {
  const [showFormatted, setShowFormatted] = useState(true);
  const [isComplete, setIsComplete] = useState(true);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showAiHint, setShowAiHint] = useState(false);
  
  // Detect when the user has interacted with the form
  useEffect(() => {
    const handleInteraction = () => {
      if (isInitialLoad) setIsInitialLoad(false);
      setUserHasInteracted(true);
    };
    
    document.addEventListener('input', handleInteraction);
    document.addEventListener('change', handleInteraction);
    
    // After 5 seconds, we'll consider that the initial load phase is over
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 5000);
    
    return () => {
      document.removeEventListener('input', handleInteraction);
      document.removeEventListener('change', handleInteraction);
      clearTimeout(timer);
    };
  }, [isInitialLoad]);
  
  // Check if will content is complete, but only if content is not an initial placeholder
  useEffect(() => {
    if (content && 
        !content.includes('Start chatting') && 
        !content.includes('Your will document will appear here') &&
        // Only validate after user interaction or after initial load phase
        (userHasInteracted || !isInitialLoad)) {
      setIsComplete(validateWillContent(content));
    } else {
      // Don't show incomplete state for initial/placeholder content
      setIsComplete(true);
    }
  }, [content, userHasInteracted, isInitialLoad]);
  
  const handleDownload = () => {
    downloadDocument(content, title, signature);
  };

  const handleSectionClick = (section: string) => {
    if (onSectionClick) {
      onSectionClick(section);
    } else {
      setShowAiHint(true);
      setTimeout(() => setShowAiHint(false), 3000);
    }
  };

  const hasRealContent = content && 
    !content.includes('Start chatting') && 
    !content.includes('Your will document will appear here');
  
  // Determine if we should show warning (only after user has interacted and content is incomplete)
  const shouldShowWarning = hasRealContent && !isComplete && (userHasInteracted || !isInitialLoad);
  
  return (
    <TemplateWillSection 
      title={liveUpdate ? "Live Preview" : "Will Preview"} 
      description={liveUpdate ? "Real-time preview of your will document" : "Preview how your will document will look"}
      defaultOpen={defaultOpen}
      icon={<FileText className="h-5 w-5" />}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="preview-format"
            checked={showFormatted}
            onCheckedChange={setShowFormatted}
          />
          <Label htmlFor="preview-format">Formatted View</Label>
          <InfoTooltip text="Toggle between formatted document view and plain text view" />
        </div>
        
        <div className="flex items-center space-x-2">
          {onRefresh && (
            <Button onClick={onRefresh} size="sm" variant="ghost">
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          )}
          
          {hasRealContent && (
            <Button onClick={handleDownload} size="sm" variant="outline" className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Download Draft
            </Button>
          )}
        </div>
      </div>
      
      <div className={`bg-gray-50 border rounded-md p-4 mb-4 max-h-96 overflow-y-auto ${showFormatted ? 'font-serif' : 'font-mono'} relative`}>
        {liveUpdate && hasRealContent && (
          <div className="bg-willtank-50 text-willtank-700 text-xs px-2 py-1 mb-3 rounded-sm inline-block">
            Live updating as you chat
          </div>
        )}
        
        {/* AI assistance hint for interactive mode */}
        {interactive && showAiHint && (
          <div className="absolute top-2 right-2 bg-willtank-100 text-willtank-800 text-xs px-3 py-2 rounded-md flex items-center animate-fade-in">
            <Bot className="h-4 w-4 mr-1 text-willtank-600" />
            Click on a section title to get AI assistance
            <button 
              className="ml-2 text-willtank-600 hover:text-willtank-800" 
              onClick={() => setShowAiHint(false)}
            >
              ×
            </button>
          </div>
        )}
        
        <WillPreview 
          content={content} 
          formatted={showFormatted} 
          signature={signature} 
          interactive={interactive}
          onSectionClick={handleSectionClick}
        />
      </div>
      
      {shouldShowWarning && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mb-4 text-sm text-amber-800">
          Your will has incomplete information. Please continue filling out the form to complete all sections.
        </div>
      )}
      
      {hasRealContent && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleDownload} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Draft Will
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download a copy of your will document in its current state</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </TemplateWillSection>
  );
}
