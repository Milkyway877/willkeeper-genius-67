
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Lightbulb, 
  BookOpen, 
  AlertCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getFieldHelp, getFieldImportanceLevel } from './AIFieldContent';

interface EnhancedAISuggestionsPanelProps {
  isVisible: boolean;
  activeField: string | null;
  onClose: () => void;
  onSuggestionAccept: (field: string, suggestion: string) => void;
}

export function EnhancedAISuggestionsPanel({ 
  isVisible, 
  activeField, 
  onClose, 
  onSuggestionAccept 
}: EnhancedAISuggestionsPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['explanation']));
  
  if (!isVisible) return null;

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const fieldContent = activeField ? getFieldHelp(activeField) : null;
  const importanceLevel = activeField ? getFieldImportanceLevel(activeField) : 'optional';

  const getImportanceBadge = (level: string) => {
    switch (level) {
      case 'critical':
        return <Badge variant="destructive" className="text-xs"><AlertCircle className="h-3 w-3 mr-1" />Critical</Badge>;
      case 'important':
        return <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800"><AlertTriangle className="h-3 w-3 mr-1" />Important</Badge>;
      default:
        return <Badge variant="outline" className="text-xs"><Info className="h-3 w-3 mr-1" />Optional</Badge>;
    }
  };

  if (!fieldContent) {
    return (
      <div className="fixed right-4 top-20 w-96 max-h-[80vh] z-50">
        <Card className="shadow-lg border-willtank-200">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                AI Document Assistant
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Click on any field in your will document to get detailed legal guidance and helpful tips.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>• Legal explanations and context</p>
                <p>• Real-world examples</p>
                <p>• Common mistakes to avoid</p>
                <p>• Professional tips and advice</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed right-4 top-20 w-96 max-h-[80vh] z-50">
      <Card className="shadow-lg border-willtank-200">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{fieldContent.title}</CardTitle>
              {getImportanceBadge(importanceLevel)}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <ScrollArea className="h-[70vh]">
          <CardContent className="space-y-4">
            {/* Explanation Section */}
            <Collapsible open={expandedSections.has('explanation')} onOpenChange={() => toggleSection('explanation')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">What This Means</span>
                  </div>
                  {expandedSections.has('explanation') ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-gray-700">{fieldContent.explanation}</p>
                </div>
              </CollapsibleContent>
            </Collapsible>
            
            <Separator />
            
            {/* Legal Context Section */}
            <Collapsible open={expandedSections.has('legal')} onOpenChange={() => toggleSection('legal')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span className="font-medium">Legal Context</span>
                  </div>
                  {expandedSections.has('legal') ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="bg-amber-50 p-3 rounded-md">
                  <p className="text-sm text-gray-700">{fieldContent.legalContext}</p>
                </div>
              </CollapsibleContent>
            </Collapsible>
            
            <Separator />
            
            {/* Examples Section */}
            <Collapsible open={expandedSections.has('examples')} onOpenChange={() => toggleSection('examples')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Good Examples</span>
                  </div>
                  {expandedSections.has('examples') ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="bg-green-50 p-3 rounded-md">
                  <ul className="space-y-2">
                    {fieldContent.examples.map((example, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">•</span>
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>
            
            <Separator />
            
            {/* Common Mistakes Section */}
            <Collapsible open={expandedSections.has('mistakes')} onOpenChange={() => toggleSection('mistakes')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="font-medium">Common Mistakes</span>
                  </div>
                  {expandedSections.has('mistakes') ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="bg-red-50 p-3 rounded-md">
                  <ul className="space-y-2">
                    {fieldContent.commonMistakes.map((mistake, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-red-600 mt-0.5">•</span>
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>
            
            <Separator />
            
            {/* Tips Section */}
            <Collapsible open={expandedSections.has('tips')} onOpenChange={() => toggleSection('tips')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">Professional Tips</span>
                  </div>
                  {expandedSections.has('tips') ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="bg-purple-50 p-3 rounded-md">
                  <ul className="space-y-2">
                    {fieldContent.tips.map((tip, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-purple-600 mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}
