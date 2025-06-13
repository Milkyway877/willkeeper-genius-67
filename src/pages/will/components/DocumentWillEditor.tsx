
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Users, 
  UserCog, 
  Building2, 
  ShieldCheck, 
  Heart,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Edit3
} from 'lucide-react';
import { TextField } from './DocumentFields/TextField';
import { BeneficiaryField } from './DocumentFields/BeneficiaryField';
import { ExecutorField } from './DocumentFields/ExecutorField';
import { GuardianField } from './DocumentFields/GuardianField';
import { AssetField } from './DocumentFields/AssetField';
import { AIAssistantPopup } from './AIAssistantPopup';
import { cn } from '@/lib/utils';

interface DocumentSection {
  id: string;
  title: string;
  icon: React.ElementType;
  isComplete: boolean;
  isExpanded: boolean;
  fields: string[];
}

interface DocumentWillEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  className?: string;
}

export function DocumentWillEditor({ 
  content, 
  onContentChange, 
  className 
}: DocumentWillEditorProps) {
  const [sections, setSections] = useState<DocumentSection[]>([
    {
      id: 'personal',
      title: 'Personal Information',
      icon: FileText,
      isComplete: false,
      isExpanded: true,
      fields: ['fullName', 'dateOfBirth', 'address']
    },
    {
      id: 'beneficiaries',
      title: 'Beneficiaries',
      icon: Users,
      isComplete: false,
      isExpanded: false,
      fields: ['beneficiaries']
    },
    {
      id: 'executors',
      title: 'Executors',
      icon: UserCog,
      isComplete: false,
      isExpanded: false,
      fields: ['executors']
    },
    {
      id: 'assets',
      title: 'Assets & Property',
      icon: Building2,
      isComplete: false,
      isExpanded: false,
      fields: ['assets']
    },
    {
      id: 'guardians',
      title: 'Guardians',
      icon: ShieldCheck,
      isComplete: false,
      isExpanded: false,
      fields: ['guardians']
    },
    {
      id: 'finalWishes',
      title: 'Final Wishes',
      icon: Heart,
      isComplete: false,
      isExpanded: false,
      fields: ['finalWishes']
    }
  ]);

  const [aiPopup, setAiPopup] = useState({
    isVisible: false,
    field: '',
    position: { x: 0, y: 0 }
  });

  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    address: '',
    beneficiaries: [],
    executors: [],
    assets: [],
    guardians: [],
    finalWishes: ''
  });

  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const toggleSection = (sectionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, isExpanded: !section.isExpanded }
        : section
    ));
  };

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleAiHelp = (field: string, position?: { x: number, y: number }) => {
    setAiPopup({
      isVisible: true,
      field,
      position: position || { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    });
  };

  const handleAiAccept = (suggestion: string) => {
    // Apply AI suggestion to the appropriate field
    console.log(`Applying AI suggestion for ${aiPopup.field}:`, suggestion);
    setAiPopup(prev => ({ ...prev, isVisible: false }));
  };

  const handleAiDismiss = () => {
    setAiPopup(prev => ({ ...prev, isVisible: false }));
  };

  const completionPercentage = sections.filter(s => s.isComplete).length / sections.length * 100;

  return (
    <div className={cn("flex gap-6 max-w-7xl mx-auto p-6", className)}>
      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        {/* Progress Header */}
        <Card className="bg-gradient-to-r from-willtank-50 to-blue-50 border-willtank-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-willtank-800">Create Your Will</h2>
                <p className="text-willtank-600">Complete each section to build your personalized will</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-willtank-700">{Math.round(completionPercentage)}%</div>
                <div className="text-sm text-willtank-600">Complete</div>
              </div>
            </div>
            <Progress value={completionPercentage} className="h-3" />
          </CardContent>
        </Card>

        {/* Document Sections */}
        <div className="space-y-4">
          {sections.map((section) => {
            const IconComponent = section.icon;
            
            return (
              <Card 
                key={section.id}
                ref={(el) => sectionRefs.current[section.id] = el}
                className={cn(
                  "border-2 transition-all duration-200",
                  section.isExpanded ? "border-willtank-300 shadow-lg" : "border-gray-200 hover:border-willtank-200",
                  section.isComplete && "border-green-300 bg-green-50/30"
                )}
              >
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        section.isComplete ? "bg-green-100 text-green-600" : "bg-willtank-100 text-willtank-600"
                      )}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {section.title}
                          {section.isComplete && (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          )}
                          {!section.isComplete && (
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                          )}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {section.isComplete ? 'Section completed' : 'Click to expand and complete'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAiHelp(section.id, { x: e.clientX, y: e.clientY });
                        }}
                        className="text-willtank-600 hover:text-willtank-700"
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        AI Help
                      </Button>
                      
                      {section.isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {section.isExpanded && (
                  <CardContent className="pt-0 pb-6">
                    <div className="border-t pt-4">
                      {section.id === 'personal' && (
                        <div className="space-y-4">
                          <TextField
                            label="Full Legal Name"
                            value={formData.fullName}
                            onChange={(value) => setFormData(prev => ({ ...prev, fullName: value }))}
                            placeholder="Enter your complete legal name"
                            required
                            onAiHelp={handleAiHelp}
                          />
                          <TextField
                            label="Date of Birth"
                            value={formData.dateOfBirth}
                            onChange={(value) => setFormData(prev => ({ ...prev, dateOfBirth: value }))}
                            placeholder="MM/DD/YYYY"
                            type="date"
                            required
                            onAiHelp={handleAiHelp}
                          />
                          <TextField
                            label="Current Address"
                            value={formData.address}
                            onChange={(value) => setFormData(prev => ({ ...prev, address: value }))}
                            placeholder="Enter your full address"
                            required
                            onAiHelp={handleAiHelp}
                          />
                        </div>
                      )}

                      {section.id === 'beneficiaries' && (
                        <BeneficiaryField
                          beneficiaries={formData.beneficiaries}
                          onUpdate={(beneficiaries) => setFormData(prev => ({ ...prev, beneficiaries }))}
                          onAiHelp={handleAiHelp}
                        />
                      )}

                      {section.id === 'executors' && (
                        <ExecutorField
                          executors={formData.executors}
                          onUpdate={(executors) => setFormData(prev => ({ ...prev, executors }))}
                          onAiHelp={handleAiHelp}
                        />
                      )}

                      {section.id === 'assets' && (
                        <AssetField
                          assets={formData.assets}
                          onUpdate={(assets) => setFormData(prev => ({ ...prev, assets }))}
                          onAiHelp={handleAiHelp}
                        />
                      )}

                      {section.id === 'guardians' && (
                        <GuardianField
                          guardians={formData.guardians}
                          onUpdate={(guardians) => setFormData(prev => ({ ...prev, guardians }))}
                          onAiHelp={handleAiHelp}
                        />
                      )}

                      {section.id === 'finalWishes' && (
                        <TextField
                          label="Final Wishes & Instructions"
                          value={formData.finalWishes}
                          onChange={(value) => setFormData(prev => ({ ...prev, finalWishes: value }))}
                          placeholder="Describe your final wishes, funeral preferences, etc."
                          multiline
                          onAiHelp={handleAiHelp}
                        />
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Enhanced Sidebar */}
      <div className="w-80 space-y-4">
        <Card className="sticky top-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {sections.map((section) => {
                  const IconComponent = section.icon;
                  
                  return (
                    <div
                      key={section.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                        section.isComplete 
                          ? "bg-green-50 border-green-200 hover:bg-green-100" 
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      )}
                      onClick={() => scrollToSection(section.id)}
                    >
                      <div className="flex items-center gap-2">
                        <IconComponent className={cn(
                          "h-4 w-4",
                          section.isComplete ? "text-green-600" : "text-gray-500"
                        )} />
                        <span className="text-sm font-medium">{section.title}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {section.isComplete ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAiHelp(section.id, { x: e.clientX, y: e.clientY });
                          }}
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant Popup */}
      <AIAssistantPopup
        field={aiPopup.field}
        isVisible={aiPopup.isVisible}
        onAccept={handleAiAccept}
        onDismiss={handleAiDismiss}
        position={aiPopup.position}
      />
    </div>
  );
}
