import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Logo } from '@/components/ui/logo/Logo';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check, Save, Pen, MessageCircleQuestion, Eye, AlertCircle, Loader2, Clock, FileCheck, BookOpen, Lightbulb, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { DigitalSignature } from './TemplateSections/DigitalSignature';
import { downloadDocument } from '@/utils/documentUtils';
import { validateWillContent, generateWillContent } from '@/utils/willTemplateUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BeneficiaryField } from './DocumentFields/BeneficiaryField';
import { ExecutorField } from './DocumentFields/ExecutorField';
import { GuardianField } from './DocumentFields/GuardianField';
import { AssetField } from './DocumentFields/AssetField';
import { TextField } from './DocumentFields/TextField';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DocumentPreview } from './DocumentPreview';
import { createWill, updateWill, Will } from '@/services/willService';
import { useFormAutoSave } from '@/hooks/use-form-auto-save';
import { AIFloatingIndicator } from './AIFloatingIndicator';
import { EnhancedAISuggestionsPanel } from './EnhancedAISuggestionsPanel';
import { ContactField } from './DocumentFields/ContactField';
import { WillCreationSuccess } from './WillCreationSuccess';
import { useWillSubscriptionFlow } from '@/hooks/useWillSubscriptionFlow';
import { useRandomSubscriptionPrompts } from '@/hooks/useRandomSubscriptionPrompts';
import { RandomSubscriptionPrompt } from './RandomSubscriptionPrompt';
import '../../../MobileStyles.css';
import { 
  Executor, 
  Beneficiary, 
  Guardian, 
  Property, 
  Vehicle, 
  FinancialAccount, 
  DigitalAsset,
  WillContent
} from './types';

interface DocumentWillEditorProps {
  templateId: string;
  initialData?: any;
  willId?: string;
  onSave?: (data: any) => void;
}

export function DocumentWillEditor({ templateId, initialData = {}, willId, onSave }: DocumentWillEditorProps) {
  // State for personal information
  const [personalInfo, setPersonalInfo] = useState({
    fullName: initialData?.fullName || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    address: initialData?.homeAddress || '',
    email: initialData?.email || '',
    phone: initialData?.phoneNumber || '',
  });

  // State for structured contact data
  const [executors, setExecutors] = useState<Executor[]>(
    initialData?.executors || [
      { id: 'exec-1', name: '', relationship: '', email: '', phone: '', address: '', isPrimary: true }
    ]
  );

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(
    initialData?.beneficiaries || [
      { id: 'ben-1', name: '', relationship: '', email: '', phone: '', address: '', percentage: 0 }
    ]
  );

  const [guardians, setGuardians] = useState<Guardian[]>(
    initialData?.guardians || [
      { id: 'guard-1', name: '', relationship: '', email: '', phone: '', address: '', forChildren: [] }
    ]
  );

  // State for assets
  const [properties, setProperties] = useState<Property[]>(
    initialData?.properties || []
  );

  const [vehicles, setVehicles] = useState<Vehicle[]>(
    initialData?.vehicles || []
  );

  const [financialAccounts, setFinancialAccounts] = useState<FinancialAccount[]>(
    initialData?.financialAccounts || []
  );

  const [digitalAssets, setDigitalAssets] = useState<DigitalAsset[]>(
    initialData?.digitalAssets || []
  );

  // State for other will content
  const [specificBequests, setSpecificBequests] = useState(
    initialData?.specificBequests || ''
  );
  
  const [residualEstate, setResidualEstate] = useState(
    initialData?.residualEstate || ''
  );
  
  const [finalArrangements, setFinalArrangements] = useState(
    initialData?.finalArrangements || ''
  );
  
  // Enhanced signature state with debugging
  const [signature, setSignature] = useState<string | null>(initialData?.signature || null);
  
  // UI state
  const [showAIHelper, setShowAIHelper] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [showBeneficiaryPrompt, setShowBeneficiaryPrompt] = useState<boolean>(false);
  const [showAISuggestionsPanel, setShowAISuggestionsPanel] = useState(true);
  const [showSuccessScreen, setShowSuccessScreen] = useState<boolean>(false);
  const [generatedWill, setGeneratedWill] = useState<Will | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [finalizedWillId, setFinalizedWillId] = useState<string | null>(willId || null);
  
  // Add random subscription prompts
  const { 
    showPrompt, 
    urgencyLevel, 
    promptCount, 
    timeRemaining,
    formattedTimeRemaining,
    dismissPrompt 
  } = useRandomSubscriptionPrompts();

  const documentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Debug signature state changes
  useEffect(() => {
    console.log('DocumentWillEditor: Signature state changed:', signature ? 'Has signature' : 'No signature');
    if (signature) {
      console.log('DocumentWillEditor: Signature data length:', signature.length);
      console.log('DocumentWillEditor: Signature starts with:', signature.substring(0, 30));
    }
  }, [signature]);

  // Generate document text function - Enhanced with signature debugging
  const generateDocumentText = (): string => {
    console.log('DocumentWillEditor: Generating document text with signature:', signature ? 'Yes' : 'No');
    
    const primaryExecutor = executors.find(e => e.isPrimary);
    const alternateExecutors = executors.filter(e => !e.isPrimary);
    
    const beneficiariesText = beneficiaries.map(b => 
      `- ${b.name || '[Beneficiary Name]'} (${b.relationship || 'relation'}): ${b.percentage || 0}% of estate`
    ).join('\n');
    
    const documentText = `
LAST WILL AND TESTAMENT

I, ${personalInfo.fullName || '[Full Name]'}, residing at ${personalInfo.address || '[Address]'}, being of sound mind, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all wills and codicils previously made by me.

ARTICLE I: PERSONAL INFORMATION
I declare that I was born on ${personalInfo.dateOfBirth || '[Date of Birth]'} and that I am creating this will to ensure my wishes are carried out after my death.

ARTICLE II: APPOINTMENT OF EXECUTOR
I appoint ${primaryExecutor?.name || '[Primary Executor]'} to serve as the Executor of my estate. ${
  alternateExecutors.length > 0 
    ? `If they are unable or unwilling to serve, I appoint ${alternateExecutors[0].name} to serve as alternate Executor.` 
    : ''
}

ARTICLE III: BENEFICIARIES
I bequeath my assets to the following beneficiaries:
${beneficiariesText}

ARTICLE IV: ASSETS & SPECIFIC BEQUESTS
I own the following assets:

${properties.map(prop => 
  `- ${prop.description || '[Property Description]'} at ${prop.address || '[Address]'}: ${prop.approximateValue || '[Value]'}`
).join('\n')}

${vehicles.map(vehicle => 
  `- ${vehicle.description || '[Vehicle Description]'} (${vehicle.registrationNumber || 'registration'}): ${vehicle.approximateValue || '[Value]'}`
).join('\n')}

${financialAccounts.map(account => 
  `- ${account.accountType || '[Account Type]'} at ${account.institution || '[Institution]'}: ${account.approximateValue || '[Value]'}`
).join('\n')}

${digitalAssets.map(asset => 
  `- ${asset.description || '[Asset Description]'} (${asset.platform || 'platform'}): ${asset.approximateValue || '[Value]'}`
).join('\n')}

ARTICLE IV: SPECIFIC BEQUESTS
${specificBequests || '[No specific bequests specified]'}

ARTICLE V: RESIDUAL ESTATE
I give all the rest and residue of my estate to ${residualEstate || 'my beneficiaries in the proportions specified above'}.

ARTICLE VI: GUARDIANSHIP
${guardians.length > 0 ? (
  `I appoint the following guardian(s) for my minor children:\n${guardians.map(g => `- ${g.name} (${g.relationship})`).join('\n')}`
) : (
  'I do not have minor children at this time.'
)}

ARTICLE VII: FINAL ARRANGEMENTS
${finalArrangements || '[No specific final arrangements specified]'}

${signature ? `\nDigitally signed on: ${new Date().toLocaleDateString()}` : ''}
    `;
    
    console.log('DocumentWillEditor: Generated document includes signature reference:', documentText.includes('Digitally signed'));
    return documentText;
  };

  // Prepare combined will content for auto-save and completeness check
  const willContent: WillContent = {
    personalInfo,
    executors,
    beneficiaries,
    guardians,
    assets: {
      properties,
      vehicles,
      financialAccounts,
      digitalAssets
    },
    specificBequests,
    residualEstate,
    finalArrangements
  };

  // Enhanced auto-save functionality for real-time updates
  const { saving: autoSaving, lastSaved, saveError } = useFormAutoSave({
    data: { willContent, signature },
    onSave: async (data) => {
      try {
        console.log('DocumentWillEditor: Auto-saving with signature:', data.signature ? 'Yes' : 'No');
        
        if (!willId && onSave) {
          onSave({ ...data.willContent, signature: data.signature });
        } else if (willId) {
          await updateWill(willId, {
            content: JSON.stringify({ ...data.willContent, signature: data.signature }),
            title: `${data.willContent.personalInfo.fullName}'s Will`,
            updated_at: new Date().toISOString()
          });
        }
        setLastAutoSave(new Date());
        return true;
      } catch (error) {
        console.error("Auto-save error:", error);
        return false;
      }
    },
    debounceMs: 1000,
    enabled: true
  });

  // Check if the document is complete - REMOVED signature requirement
  useEffect(() => {
    const checkCompleteness = () => {
      // Basic completeness check
      if (!personalInfo.fullName || !personalInfo.dateOfBirth || !personalInfo.address) {
        return false;
      }
      
      // Check primary executor
      const primaryExecutor = executors.find(e => e.isPrimary);
      if (!primaryExecutor || !primaryExecutor.name) {
        return false;
      }
      
      // Check beneficiaries
      if (!beneficiaries.length || !beneficiaries[0].name) {
        return false;
      }
      
      // Check if beneficiary percentages add up to 100%
      const totalPercentage = beneficiaries.reduce((sum, b) => sum + (b.percentage || 0), 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        return false;
      }
      
      // REMOVED: Signature requirement check
      
      return true;
    };
    
    const complete = checkCompleteness();
    console.log('DocumentWillEditor: Document completeness check:', complete);
    setIsComplete(complete);
  }, [personalInfo, executors, beneficiaries]);

  // Handle AI Assistant for a field
  const handleShowAIHelper = (field: string, position?: { x: number, y: number }) => {
    setShowAIHelper(field === showAIHelper ? null : field);
    setShowAISuggestionsPanel(true);
    
    const fieldName = field.replace(/([A-Z])/g, ' $1')
                          .replace(/_/g, ' ')
                          .trim();
    
    toast({
      title: `AI Assistant activated for ${fieldName}`,
      description: "Check the suggestions panel for help."
    });
  };
  
  // Enhanced signature change handler with comprehensive debugging
  const handleSignatureChange = (signatureData: string | null) => {
    console.log('DocumentWillEditor: handleSignatureChange called with:', signatureData ? 'signature data' : 'null');
    
    if (signatureData) {
      console.log('DocumentWillEditor: Signature data length:', signatureData.length);
      console.log('DocumentWillEditor: Signature starts with:', signatureData.substring(0, 30));
    }
    
    setSignature(signatureData);
    
    // Show feedback to user
    if (signatureData) {
      toast({
        title: "Signature Captured",
        description: "Your signature has been successfully captured and will be included in your will."
      });
    } else {
      toast({
        title: "Signature Cleared",
        description: "Your signature has been removed from the will."
      });
    }
  };
  
  // Handle document save
  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('DocumentWillEditor: Saving will with signature:', signature ? 'Yes' : 'No');
      
      const documentData = {
        title: `${personalInfo.fullName}'s Will`,
        content: JSON.stringify({ ...willContent, signature }),
        status: 'draft',
        template_type: templateId,
        document_url: '',
      };
      
      if (willId) {
        await updateWill(willId, documentData);
      } else {
        const newWill = await createWill(documentData);
        if (newWill && onSave) {
          onSave({ ...willContent, signature, id: newWill.id });
        }
      }
      
      toast({
        title: "Draft Saved",
        description: "Your will document has been saved as a draft.",
      });
    } catch (error) {
      console.error("Error saving document:", error);
      toast({
        title: "Save Error",
        description: "There was an error saving your document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Handle AI assistance request from floating indicator
  const handleAIAssistanceRequest = (field?: string) => {
    setShowAISuggestionsPanel(true);
    
    if (field) {
      handleShowAIHelper(field);
    } else {
      toast({
        title: "AI Document Assistant",
        description: "I can help you complete your will. Click on any field that needs assistance or on the question mark icon next to it.",
        duration: 6000,
      });
    }
  };
  
  // Handle accepting an AI suggestion
  const handleAcceptAISuggestion = (field: string, suggestion: string) => {
    let extractedContent = suggestion;
    
    if (suggestion.includes('For example:')) {
      const exampleMatch = suggestion.match(/For example:(.*?)(?:$|\n)/s);
      if (exampleMatch && exampleMatch[1]) {
        extractedContent = exampleMatch[1].trim();
      }
    }
    
    if (field.startsWith('personal_')) {
      const personalField = field.replace('personal_', '') as keyof typeof personalInfo;
      setPersonalInfo(prev => ({
        ...prev,
        [personalField]: extractedContent
      }));
    } else if (field === 'specificBequests') {
      setSpecificBequests(extractedContent);
    } else if (field === 'residualEstate') {
      setResidualEstate(extractedContent);
    } else if (field === 'finalArrangements') {
      setFinalArrangements(extractedContent);
    }
    
    toast({
      title: "AI Suggestion Applied",
      description: `Updated ${field.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()} with the AI suggestion.`
    });
  };

  // Enhanced will finalization - REMOVED signature validation
  const handleGenerateOfficialWill = async () => {
    try {
      console.log('DocumentWillEditor: Starting will finalization...');
      console.log('DocumentWillEditor: Is complete:', isComplete);
      
      if (!isComplete) {
        toast({
          title: "Document Incomplete",
          description: "Please complete all required sections before finalizing your will.",
          variant: "destructive"
        });
        return;
      }
      
      // REMOVED: Signature requirement check

      setIsGenerating(true);
      
      const title = `${personalInfo.fullName}'s Will`;
      const documentText = generateDocumentText();
      const contentWithSignature = documentText + (signature ? `\n\nDigitally signed on: ${new Date().toLocaleDateString()}` : '');
      
      console.log('DocumentWillEditor: Final content includes signature text:', contentWithSignature.includes('Digitally signed'));
      
      let finalWill: Will | null = null;
      
      if (willId) {
        finalWill = await updateWill(willId, {
          status: 'active',
          content: JSON.stringify({ willContent, signature, documentText: contentWithSignature }),
          title: title
        });
      } else if (onSave) {
        const documentData = {
          title: title,
          content: JSON.stringify({ willContent, signature, documentText: contentWithSignature }),
          status: 'active',
          template_type: templateId,
          document_url: '',
        };
        
        finalWill = await createWill(documentData);
        if (finalWill && onSave) {
          onSave({ ...willContent, signature, id: finalWill.id });
        }
      }
      
      if (finalWill) {
        console.log('DocumentWillEditor: Will finalized successfully with ID:', finalWill.id);
        setGeneratedWill(finalWill);
        setFinalizedWillId(finalWill.id);
        setShowSuccessScreen(true);
        
        toast({
          title: "Will Finalized Successfully!",
          description: "Your will has been created. You have 24 hours of free access before upgrade is required.",
        });
      }
      
    } catch (error) {
      console.error("Error generating official will:", error);
      toast({
        title: "Finalization Error",
        description: "There was an error finalizing your will. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto mb-28">
      {/* Random Subscription Prompt */}
      <RandomSubscriptionPrompt
        isOpen={showPrompt}
        onClose={dismissPrompt}
        urgencyLevel={urgencyLevel}
        promptCount={promptCount}
        timeRemaining={timeRemaining}
        formattedTimeRemaining={formattedTimeRemaining}
      />
      
      {showSuccessScreen && generatedWill && (
        <WillCreationSuccess 
          will={generatedWill} 
          onClose={() => setShowSuccessScreen(false)} 
        />
      )}
      
      {/* Main document area with scrolling */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* AI Suggestions Panel */}
        <EnhancedAISuggestionsPanel
          isVisible={showAISuggestionsPanel}
          activeField={showAIHelper}
          onClose={() => setShowAISuggestionsPanel(false)}
          onSuggestionAccept={handleAcceptAISuggestion}
        />
        
        {/* Control panel */}
        <div className="col-span-12 flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {autoSaving && (
              <div className="text-gray-500 flex items-center text-sm">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" /> 
                Saving...
              </div>
            )}
            {lastSaved && !autoSaving && (
              <div className="text-gray-500 flex items-center text-sm">
                <Clock className="h-3 w-3 mr-1" /> 
                Auto-saved {new Date(lastSaved).toLocaleTimeString()}
              </div>
            )}
            {isComplete ? (
              <div className="text-green-600 flex items-center text-sm">
                <Check className="h-4 w-4 mr-1" /> Document Complete
              </div>
            ) : (
              <div className="text-amber-600 flex items-center text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                Fill in all required fields
              </div>
            )}
            
            {/* AI Helper toggle button */}
            <Button 
              variant="outline" 
              size="sm"
              className={`${showAISuggestionsPanel ? 'bg-willtank-50 text-willtank-800' : ''}`}
              onClick={() => setShowAISuggestionsPanel(!showAISuggestionsPanel)}
            >
              <MessageCircleQuestion className="h-4 w-4 mr-2" />
              AI Assistant
            </Button>
          </div>
        </div>
        
        {/* Main document area with scrolling */}
        <div className="col-span-12 md:col-span-8 relative">
          <ScrollArea className="h-auto max-h-[80vh]">
            <Card className="p-8 border-2 shadow-sm">
              {/* Letterhead */}
              <div className="flex justify-between items-center border-b border-gray-200 pb-6 mb-8">
                <Logo size="lg" variant="default" showSlogan={true} />
                <div className="text-right text-gray-500 text-sm">
                  <p>Official Legal Document</p>
                  <p>Generated on {new Date().toLocaleDateString()}</p>
                </div>
              </div>
              
              {/* Document content */}
              <div className="font-serif space-y-6" ref={documentRef}>
                <h1 className="text-3xl text-center font-bold mb-6">LAST WILL AND TESTAMENT</h1>
                
                <p className="text-lg">
                  I, {' '}
                  <span className="inline-block">
                    <ContactField 
                      label="Full Name"
                      value={personalInfo.fullName}
                      onChange={(value) => setPersonalInfo(prev => ({ ...prev, fullName: value }))}
                      placeholder="Enter your full legal name"
                      required={true}
                      onAiHelp={(position) => handleShowAIHelper('personal_fullName', position)}
                    />
                  </span>
                  , residing at {' '}
                  <span className="inline-block">
                    <ContactField 
                      label="Address"
                      value={personalInfo.address}
                      onChange={(value) => setPersonalInfo(prev => ({ ...prev, address: value }))}
                      placeholder="Enter your full address"
                      required={true}
                      onAiHelp={(position) => handleShowAIHelper('personal_address', position)}
                    />
                  </span>
                  , being of sound mind, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all wills and codicils previously made by me.
                </p>
                
                <div>
                  <h2 className="text-xl font-bold mt-6 mb-3">ARTICLE I: PERSONAL INFORMATION</h2>
                  <p>
                    I declare that I was born on {' '}
                    <span className="inline-block">
                      <ContactField 
                        label="Date of Birth" 
                        value={personalInfo.dateOfBirth}
                        onChange={(value) => setPersonalInfo(prev => ({ ...prev, dateOfBirth: value }))}
                        placeholder="MM/DD/YYYY"
                        required={true}
                        onAiHelp={(position) => handleShowAIHelper('personal_dateOfBirth', position)}
                      />
                    </span>
                    {' '} and that I am creating this will to ensure my wishes are carried out after my death.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <ContactField 
                      label="Email Address"
                      value={personalInfo.email}
                      onChange={(value) => setPersonalInfo(prev => ({ ...prev, email: value }))}
                      type="email"
                      placeholder="your@email.com"
                      onAiHelp={(position) => handleShowAIHelper('personal_email', position)}
                    />
                    
                    <ContactField 
                      label="Phone Number"
                      value={personalInfo.phone}
                      onChange={(value) => setPersonalInfo(prev => ({ ...prev, phone: value }))}
                      type="tel"
                      placeholder="(123) 456-7890"
                      onAiHelp={(position) => handleShowAIHelper('personal_phone', position)}
                    />
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-bold mt-6 mb-3">ARTICLE II: APPOINTMENT OF EXECUTOR</h2>
                  <p>
                    I appoint {' '}
                    <span className="inline-block">
                      <ExecutorField
                        executors={executors}
                        onUpdate={setExecutors}
                        onAiHelp={handleShowAIHelper}
                      />
                    </span>
                    {' '} to serve as the Executor of my estate.
                  </p>
                </div>
                
                <div>
                  <h2 className="text-xl font-bold mt-6 mb-3">ARTICLE III: BENEFICIARIES</h2>
                  <p className="mb-2">I bequeath my assets to the following beneficiaries:</p>
                  <div className="pl-4">
                    <BeneficiaryField
                      beneficiaries={beneficiaries}
                      onUpdate={setBeneficiaries}
                      onAiHelp={handleShowAIHelper}
                    />
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-bold mt-6 mb-3">ARTICLE IV: ASSETS & SPECIFIC BEQUESTS</h2>
                  <p className="mb-4">I own the following assets:</p>
                  
                  <AssetField
                    properties={properties}
                    vehicles={vehicles}
                    financialAccounts={financialAccounts}
                    digitalAssets={digitalAssets}
                    onUpdateProperties={setProperties}
                    onUpdateVehicles={setVehicles}
                    onUpdateFinancialAccounts={setFinancialAccounts}
                    onUpdateDigitalAssets={setDigitalAssets}
                    onAiHelp={handleShowAIHelper}
                  />
                  
                  <h3 className="font-medium mt-6 mb-2">Specific Bequests</h3>
                  <p className="mb-2">I make the following specific gifts:</p>
                  <TextField 
                    value={specificBequests} 
                    multiline={true}
                    label="specificBequests" 
                    onEdit={(value) => setSpecificBequests(value)}
                    onAiHelp={() => handleShowAIHelper('specificBequests')}
                  />
                </div>
                
                <div>
                  <h2 className="text-xl font-bold mt-6 mb-3">ARTICLE V: RESIDUAL ESTATE</h2>
                  <p>
                    I give all the rest and residue of my estate to {' '}
                    <TextField 
                      value={residualEstate} 
                      label="residualEstate" 
                      onEdit={(value) => setResidualEstate(value)}
                      onAiHelp={() => handleShowAIHelper('residualEestate')}
                    />
                    .
                  </p>
                </div>
                
                <div>
                  <h2 className="text-xl font-bold mt-6 mb-3">ARTICLE VI: GUARDIANSHIP</h2>
                  {guardians.length > 0 ? (
                    <div>
                      <p className="mb-2">I appoint the following guardian(s) for my minor children:</p>
                      <GuardianField
                        guardians={guardians}
                        onUpdate={setGuardians}
                        onAiHelp={handleShowAIHelper}
                        children={['Child 1', 'Child 2']}
                      />
                    </div>
                  ) : (
                    <p>
                      I do not have minor children at this time. If I should have children in the future, I appoint {' '}
                      <span 
                        className="cursor-pointer border-b border-dashed border-gray-300 hover:border-willtank-400 px-1"
                        onClick={() => setGuardians([{ id: 'guard-1', name: '', relationship: '', email: '', phone: '', address: '', forChildren: [] }])}
                      >
                        [Click to add guardians]
                      </span>
                      {' '} as their guardian.
                    </p>
                  )}
                </div>
                
                <div>
                  <h2 className="text-xl font-bold mt-6 mb-3">ARTICLE VII: FINAL ARRANGEMENTS</h2>
                  <TextField 
                    value={finalArrangements} 
                    multiline={true}
                    label="finalArrangements" 
                    onEdit={(value) => setFinalArrangements(value)}
                    onAiHelp={() => handleShowAIHelper('finalArrangements')}
                  />
                </div>
                
                {/* Enhanced Digital Signature Section with debugging */}
                <div className="mt-12 pt-6 border-t border-gray-200">
                  <h2 className="text-xl font-bold mb-3">SIGNATURE</h2>
                  <p className="mb-4">
                    By signing below, I confirm this document represents my last will and testament.
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800 mb-2">
                      <strong>Optional:</strong> Your digital signature can be added to enhance your will.
                    </p>
                    <div className="text-xs text-blue-600">
                      Current status: {signature ? '✅ Signature captured' : '❌ No signature'}
                    </div>
                  </div>
                  
                  <DigitalSignature 
                    defaultOpen={true} 
                    onSignatureChange={handleSignatureChange}
                  />
                  
                  {signature && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 mb-2 font-medium">✅ Digital signature captured successfully!</p>
                      <div className="bg-white p-2 border border-green-300 rounded">
                        <img src={signature} alt="Digital signature" className="max-w-xs border rounded" />
                      </div>
                      <p className="text-xs text-green-600 mt-2">
                        Signed on: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                  
                  {!signature && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800">
                        ℹ️ You can add your signature above if desired. This is optional for will finalization.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </ScrollArea>
        </div>
        
        {/* Document information sidebar - with enhanced signature status */}
        <div className="col-span-12 md:col-span-4 space-y-4">
          <div className="md:sticky md:top-6">
            <Card className="p-4">
              <h3 className="font-medium mb-3">Document Progress</h3>
              <div className="space-y-2 text-sm">
                <div className="space-y-1">
                  <h4 className="font-medium">Personal Information</h4>
                  <ul className="ml-2 space-y-1">
                    <li className="flex items-center justify-between">
                      <span>Full Name</span>
                      {personalInfo.fullName ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-amber-600"
                          onClick={() => handleShowAIHelper('personal_fullName')}
                        >
                          <Pen className="h-3 w-3 mr-1" /> Edit
                        </Button>
                      )}
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Date of Birth</span>
                      {personalInfo.dateOfBirth ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-amber-600"
                          onClick={() => handleShowAIHelper('personal_dateOfBirth')}
                        >
                          <Pen className="h-3 w-3 mr-1" /> Edit
                        </Button>
                      )}
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Address</span>
                      {personalInfo.address ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-amber-600"
                          onClick={() => handleShowAIHelper('personal_address')}
                        >
                          <Pen className="h-3 w-3 mr-1" /> Edit
                        </Button>
                      )}
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-1">
                  <h4 className="font-medium">Executors</h4>
                  <ul className="ml-2 space-y-1">
                    <li className="flex items-center justify-between">
                      <span>Primary Executor</span>
                      {executors.some(e => e.isPrimary && e.name) ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-amber-600"
                          onClick={() => handleShowAIHelper('executor')}
                        >
                          <Pen className="h-3 w-3 mr-1" /> Edit
                        </Button>
                      )}
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-1">
                  <h4 className="font-medium">Beneficiaries</h4>
                  <ul className="ml-2 space-y-1">
                    <li className="flex items-center justify-between">
                      <span>Named Beneficiaries</span>
                      {beneficiaries.some(b => b.name) ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-amber-600"
                          onClick={() => handleShowAIHelper('beneficiary')}
                        >
                          <Pen className="h-3 w-3 mr-1" /> Edit
                        </Button>
                      )}
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Allocation (100%)</span>
                      {Math.abs(beneficiaries.reduce((sum, b) => sum + (b.percentage || 0), 0) - 100) < 0.01 ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-amber-600"
                          onClick={() => handleShowAIHelper('beneficiary')}
                        >
                          <Pen className="h-3 w-3 mr-1" /> Edit
                        </Button>
                      )}
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-1">
                  <h4 className="font-medium">Assets</h4>
                  <ul className="ml-2 space-y-1">
                    <li className="flex items-center justify-between">
                      <span>Properties</span>
                      <span className="text-xs">{properties.length || 0} added</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Vehicles</span>
                      <span className="text-xs">{vehicles.length || 0} added</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Financial Accounts</span>
                      <span className="text-xs">{financialAccounts.length || 0} added</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Digital Assets</span>
                      <span className="text-xs">{digitalAssets.length || 0} added</span>
                    </li>
                  </ul>
                </div>
                
                {/* Updated Signature Section - now optional */}
                <div className="space-y-1">
                  <h4 className="font-medium">Digital Signature (Optional)</h4>
                  <div className="ml-2">
                    {signature ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Signature Status</span>
                          <Check className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded p-2">
                          <div className="text-xs text-green-700 font-medium">✅ Signature captured</div>
                          <div className="text-xs text-green-600 mt-1">Will be included in final document</div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Signature Status</span>
                          <span className="text-xs text-gray-500">Optional</span>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded p-2">
                          <div className="text-xs text-gray-700 font-medium">No signature</div>
                          <div className="text-xs text-gray-600 mt-1">Can be added if desired</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
                <Button 
                  onClick={() => setShowPreview(true)} 
                  variant="outline"
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Will
                </Button>
                
                <Button 
                  onClick={handleGenerateOfficialWill} 
                  className="w-full"
                  disabled={!isComplete || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Finalizing Will...
                    </>
                  ) : (
                    <>
                      <FileCheck className="h-4 w-4 mr-2" />
                      Finalize Will
                    </>
                  )}
                </Button>
                
                <div className="text-xs text-gray-500 mt-2 text-center">
                  Free will creation - 24 hours secure access included
                </div>
                
                {/* Updated Debug Information */}
                <div className="text-xs text-gray-400 border-t pt-2 space-y-1">
                  <div>Signature: {signature ? '✓ Optional - Captured' : '✗ Optional - Not added'}</div>
                  <div>Document Complete: {isComplete ? '✓ Yes' : '✗ No'}</div>
                  <div>Can Finalize: {isComplete ? '✓ Yes' : '✗ No'}</div>
                </div>
              </div>
            </Card>
            
            {/* Document Preview Dialog */}
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
              <DialogContent className="max-w-5xl h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Will Document Preview</DialogTitle>
                </DialogHeader>
                <div className="mt-2 h-full overflow-y-auto">
                  <DocumentPreview 
                    documentText={generateDocumentText()} 
                    willContent={willContent}
                    signature={signature}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
