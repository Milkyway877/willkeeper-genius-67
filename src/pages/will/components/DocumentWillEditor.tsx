
import React, { useState, useEffect, useRef } from 'react';
import { Logo } from '@/components/ui/logo/Logo';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check, Download, Save, Pen, MessageCircleQuestion, Eye, AlertCircle, Loader2, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { DigitalSignature } from './DigitalSignature';
import { downloadDocument } from '@/utils/documentUtils';
import { validateWillContent, generateWillContent } from '@/utils/willTemplateUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BeneficiaryField } from './DocumentFields/BeneficiaryField';
import { ExecutorField } from './DocumentFields/ExecutorField';
import { TextField } from './DocumentFields/TextField';
import { DocumentPreview } from './DocumentPreview';
import { createWill, updateWill } from '@/services/willService';
import { useFormAutoSave } from '@/hooks/use-form-auto-save';
import '../../../MobileStyles.css';

interface DocumentWillEditorProps {
  templateId: string;
  initialData?: any;
  willId?: string;
  onSave?: (data: any) => void;
}

export function DocumentWillEditor({ templateId, initialData = {}, willId, onSave }: DocumentWillEditorProps) {
  // State management
  const [willContent, setWillContent] = useState<Record<string, string>>({
    fullName: initialData?.fullName || '[Full Name]',
    dateOfBirth: initialData?.dateOfBirth || '[Date of Birth]',
    address: initialData?.homeAddress || '[Address]',
    executorName: initialData?.executors?.[0]?.name || '[Executor Name]',
    alternateExecutorName: initialData?.executors?.[1]?.name || '[Alternate Executor Name]',
    beneficiaries: initialData?.beneficiaries?.map((b: any) => 
      `- ${b.name || '[Beneficiary Name]'} (${b.relationship || 'Relationship'}): ${b.percentage || 0}% of the estate`
    ).join('\n') || '[Beneficiary details to be added]',
    specificBequests: initialData?.specificBequests || '[Specific bequests to be added]',
    residualEstate: initialData?.residualEstate || '[Beneficiary names and distribution details]',
    finalArrangements: initialData?.finalArrangements || '[Final arrangements to be added]'
  });
  
  const [signature, setSignature] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showAIHelper, setShowAIHelper] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [beneficiariesList, setBeneficiariesList] = useState<any[]>([]);
  const [executorsList, setExecutorsList] = useState<any[]>([]);
  const [showBeneficiaryPrompt, setShowBeneficiaryPrompt] = useState<boolean>(false);
  
  const editFieldRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Auto-save functionality
  const { saving: autoSaving, lastSaved, saveError } = useFormAutoSave({
    data: { willContent, signature },
    onSave: async (data) => {
      try {
        if (!willId && onSave) {
          onSave(data.willContent);
        } else if (willId) {
          await updateWill(willId, {
            content: JSON.stringify(data.willContent),
            title: `${data.willContent.fullName}'s Will`,
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
    debounceMs: 2000,
    enabled: true
  });

  // Check if the document is complete
  useEffect(() => {
    const documentText = generateDocumentText();
    setIsComplete(!documentText.includes('[') && !documentText.includes(']'));
  }, [willContent]);
  
  // Initialize beneficiaries and executors from willContent
  useEffect(() => {
    // Extract beneficiaries from the text content
    if (willContent.beneficiaries && willContent.beneficiaries !== '[Beneficiary details to be added]') {
      try {
        const lines = willContent.beneficiaries.split('\n');
        const extractedBeneficiaries = lines.map((line, index) => {
          const match = line.match(/- (.*?) \((.*?)\): ([\d.]+)%/);
          if (match) {
            return {
              id: `ben-${index}`,
              name: match[1],
              relationship: match[2],
              percentage: parseFloat(match[3])
            };
          }
          return {
            id: `ben-${index}`,
            name: '[Beneficiary Name]',
            relationship: 'Relationship',
            percentage: 0
          };
        });
        setBeneficiariesList(extractedBeneficiaries);
      } catch (error) {
        console.error("Error parsing beneficiaries:", error);
        setBeneficiariesList([{ id: 'ben-1', name: '[Beneficiary Name]', relationship: 'Relationship', percentage: 0 }]);
      }
    } else {
      setBeneficiariesList([{ id: 'ben-1', name: '[Beneficiary Name]', relationship: 'Relationship', percentage: 0 }]);
    }

    // Extract executors from content
    const primaryExecutor = {
      id: 'exec-1',
      name: willContent.executorName,
      isPrimary: true
    };
    
    const alternateExecutor = {
      id: 'exec-2',
      name: willContent.alternateExecutorName,
      isPrimary: false
    };
    
    setExecutorsList([primaryExecutor, alternateExecutor]);
  }, []);
  
  // Close edit field when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (editFieldRef.current && !editFieldRef.current.contains(event.target as Node)) {
        saveAndCloseEditField();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editingField, editValue]);
  
  // Generate complete document text
  const generateDocumentText = (): string => {
    return `
LAST WILL AND TESTAMENT

I, ${willContent.fullName}, residing at ${willContent.address}, being of sound mind, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all wills and codicils previously made by me.

ARTICLE I: PERSONAL INFORMATION
I declare that I was born on ${willContent.dateOfBirth} and that I am creating this will to ensure my wishes are carried out after my death.

ARTICLE II: APPOINTMENT OF EXECUTOR
I appoint ${willContent.executorName} to serve as the Executor of my estate. If they are unable or unwilling to serve, I appoint ${willContent.alternateExecutorName} to serve as alternate Executor.

ARTICLE III: BENEFICIARIES
I bequeath my assets to the following beneficiaries:
${willContent.beneficiaries}

ARTICLE IV: SPECIFIC BEQUESTS
${willContent.specificBequests}

ARTICLE V: RESIDUAL ESTATE
I give all the rest and residue of my estate to ${willContent.residualEstate}.

ARTICLE VI: FINAL ARRANGEMENTS
${willContent.finalArrangements}`;
  };

  // Handle opening a field for editing
  const handleEditField = (field: string) => {
    setEditingField(field);
    setEditValue(willContent[field]);
    setTimeout(() => {
      editFieldRef.current?.focus();
    }, 100);
  };
  
  // Handle saving an edited field
  const saveAndCloseEditField = () => {
    if (editingField) {
      setWillContent(prev => ({
        ...prev,
        [editingField]: editValue
      }));
      setEditingField(null);
      
      // Check if user just finished adding beneficiaries and might want to add more
      if (editingField === 'beneficiaries' && !showBeneficiaryPrompt && editValue.split('\n').length <= 2) {
        setTimeout(() => {
          setShowBeneficiaryPrompt(true);
        }, 500);
      }
    }
  };
  
  // Handle AI Assistant for a field
  const handleShowAIHelper = (field: string) => {
    setShowAIHelper(field === showAIHelper ? null : field);
    
    // Field-specific AI assistance
    const aiSuggestions: Record<string, string> = {
      fullName: "Enter your complete legal name as it appears on official documents. Don't use nicknames or abbreviations.",
      dateOfBirth: "Enter your date of birth in MM/DD/YYYY format. This helps identify you as the testator.",
      address: "Enter your current legal address, including city, state, and zip code. This should be your primary residence.",
      executorName: "Select someone trustworthy who is willing and able to manage your estate. Common choices include spouses, adult children, or trusted friends.",
      alternateExecutorName: "Choose a backup executor in case your first choice is unable or unwilling to serve.",
      beneficiaries: "List each beneficiary's full name, their relationship to you, and the percentage of your estate they should receive. The total should equal 100%.",
      specificBequests: "Detail any specific items or monetary amounts you want to leave to particular people or organizations. Be very specific about the item and recipient.",
      residualEstate: "Specify who receives the remainder of your estate after specific bequests are distributed. This often goes to primary heirs like a spouse or children.",
      finalArrangements: "Include any preferences for funeral services, burial or cremation, memorial requests, and any messages to loved ones."
    };
    
    toast({
      title: `AI Assistance: ${field.replace(/([A-Z])/g, ' $1').trim()}`,
      description: aiSuggestions[field] || "Let me help you complete this field with appropriate information.",
      duration: 8000,
    });
  };
  
  // Handle signature change
  const handleSignatureChange = (signatureData: string | null) => {
    setSignature(signatureData);
  };
  
  // Handle document save
  const handleSave = async () => {
    try {
      setSaving(true);
      
      const documentData = {
        title: `${willContent.fullName}'s Will`,
        content: JSON.stringify(willContent),
        status: 'draft',
        template_type: templateId,
      };
      
      if (willId) {
        await updateWill(willId, documentData);
      } else {
        const newWill = await createWill(documentData);
        if (newWill && onSave) {
          onSave({ ...willContent, id: newWill.id });
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
  
  // Handle document download
  const handleDownload = () => {
    const documentText = generateDocumentText();
    downloadDocument(documentText, `${willContent.fullName}'s Will`, signature);
  };
  
  // Handle adding a new beneficiary
  const handleAddBeneficiary = () => {
    const newBeneficiary = {
      id: `ben-${Date.now()}`,
      name: '[New Beneficiary]',
      relationship: 'Relationship',
      percentage: 0
    };
    
    const updatedBeneficiaries = [...beneficiariesList, newBeneficiary];
    setBeneficiariesList(updatedBeneficiaries);
    
    // Update the willContent.beneficiaries text
    const beneficiariesText = updatedBeneficiaries.map(b => 
      `- ${b.name} (${b.relationship}): ${b.percentage}% of the estate`
    ).join('\n');
    
    setWillContent(prev => ({
      ...prev,
      beneficiaries: beneficiariesText
    }));
    
    setShowBeneficiaryPrompt(false);
    
    toast({
      title: "Beneficiary Added",
      description: "You can now edit the beneficiary details.",
    });
  };
  
  // Handle updating a beneficiary
  const handleUpdateBeneficiary = (id: string, field: string, value: string | number) => {
    const updatedBeneficiaries = beneficiariesList.map(b => {
      if (b.id === id) {
        return { ...b, [field]: value };
      }
      return b;
    });
    
    setBeneficiariesList(updatedBeneficiaries);
    
    // Update the willContent.beneficiaries text
    const beneficiariesText = updatedBeneficiaries.map(b => 
      `- ${b.name} (${b.relationship}): ${b.percentage}% of the estate`
    ).join('\n');
    
    setWillContent(prev => ({
      ...prev,
      beneficiaries: beneficiariesText
    }));
  };
  
  // Render AI helper for the current field
  const renderAIHelper = () => {
    if (!showAIHelper) return null;
    
    const fieldHelpers: Record<string, string> = {
      fullName: "Enter your full legal name as it appears on official documents.",
      dateOfBirth: "Enter your date of birth in MM/DD/YYYY format.",
      address: "Enter your current legal address including city, state and zip code.",
      executorName: "An executor is responsible for carrying out the instructions in your will. Choose someone you trust.",
      alternateExecutorName: "This person will be your executor if your first choice is unable or unwilling to serve.",
      beneficiaries: "List each beneficiary with their name, relationship, and percentage of your estate they should receive.",
      specificBequests: "List specific items or amounts you want to leave to particular people or organizations.",
      residualEstate: "Specify who should receive whatever remains of your estate after specific bequests.",
      finalArrangements: "Include any funeral preferences, burial instructions, or messages you want to leave."
    };
    
    return (
      <div className="bg-willtank-50 border border-willtank-100 p-4 rounded-md mb-4">
        <h3 className="font-medium text-willtank-800 flex items-center gap-2">
          <MessageCircleQuestion className="h-4 w-4" />
          AI Assistance for {showAIHelper}
        </h3>
        <p className="text-sm mt-2">{fieldHelpers[showAIHelper]}</p>
      </div>
    );
  };
  
  // Render editable field
  const renderEditableField = (field: string, value: string) => {
    const isPlaceholder = value.includes('[') && value.includes(']');
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span 
              className={`cursor-pointer relative ${isPlaceholder ? 'bg-amber-50 text-amber-800 px-1 border border-amber-200 rounded' : 'border-b border-dashed border-gray-300 hover:border-willtank-400 px-1'} group`}
              onClick={() => handleEditField(field)}
            >
              {value}
              <span className="inline-block ml-1 opacity-50 group-hover:opacity-100">
                <Pen className="h-3 w-3 inline" />
              </span>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 inline-flex ml-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShowAIHelper(field);
                }}
              >
                <MessageCircleQuestion className="h-3 w-3 text-willtank-600" />
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Click to edit or use AI assistance</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="container mx-auto mb-16">
      <div className="grid grid-cols-1 gap-6">
        {/* Control panel */}
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={() => setShowPreview(true)} variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleDownload} disabled={!isComplete}>
              <Download className="h-4 w-4 mr-2" />
              Download Will
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
                Fill in all highlighted fields
              </div>
            )}
          </div>
        </div>
        
        {/* Document with letterhead */}
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
          <div className="font-serif space-y-6">
            <h1 className="text-3xl text-center font-bold mb-6">LAST WILL AND TESTAMENT</h1>
            
            <p className="text-lg">
              I, {renderEditableField('fullName', willContent.fullName)}, residing at {renderEditableField('address', willContent.address)}, being of sound mind, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all wills and codicils previously made by me.
            </p>
            
            <div>
              <h2 className="text-xl font-bold mt-6 mb-3">ARTICLE I: PERSONAL INFORMATION</h2>
              <p>
                I declare that I was born on {renderEditableField('dateOfBirth', willContent.dateOfBirth)} and that I am creating this will to ensure my wishes are carried out after my death.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-bold mt-6 mb-3">ARTICLE II: APPOINTMENT OF EXECUTOR</h2>
              <p>
                I appoint {renderEditableField('executorName', willContent.executorName)} to serve as the Executor of my estate. If they are unable or unwilling to serve, I appoint {renderEditableField('alternateExecutorName', willContent.alternateExecutorName)} to serve as alternate Executor.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-bold mt-6 mb-3">ARTICLE III: BENEFICIARIES</h2>
              <p className="mb-2">I bequeath my assets to the following beneficiaries:</p>
              <div className="whitespace-pre-line pl-4">
                {renderEditableField('beneficiaries', willContent.beneficiaries)}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold mt-6 mb-3">ARTICLE IV: SPECIFIC BEQUESTS</h2>
              <div className="whitespace-pre-line">
                {renderEditableField('specificBequests', willContent.specificBequests)}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold mt-6 mb-3">ARTICLE V: RESIDUAL ESTATE</h2>
              <p>
                I give all the rest and residue of my estate to {renderEditableField('residualEstate', willContent.residualEstate)}.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-bold mt-6 mb-3">ARTICLE VI: FINAL ARRANGEMENTS</h2>
              <div className="whitespace-pre-line">
                {renderEditableField('finalArrangements', willContent.finalArrangements)}
              </div>
            </div>
            
            {/* Digital Signature Section */}
            <div className="mt-12 pt-6 border-t border-gray-200">
              <h2 className="text-xl font-bold mb-3">SIGNATURE</h2>
              <p className="mb-4">
                By signing below, I confirm this document represents my last will and testament.
              </p>
              
              <DigitalSignature defaultOpen={true} onSignatureChange={handleSignatureChange} />
            </div>
          </div>
        </Card>
        
        {/* Editing overlay - appears when a field is being edited */}
        {editingField && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-lg p-6">
              <h3 className="font-medium mb-2">Edit {editingField}</h3>
              <textarea
                ref={editFieldRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full h-32 p-2 border rounded-md mb-4"
                placeholder={`Enter ${editingField}...`}
              />
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setEditingField(null)}>Cancel</Button>
                <Button onClick={saveAndCloseEditField}>Save Changes</Button>
              </div>
            </Card>
          </div>
        )}
        
        {/* AI Helper */}
        {renderAIHelper()}
        
        {/* Add Beneficiary Prompt */}
        {showBeneficiaryPrompt && (
          <Alert className="bg-willtank-50 border border-willtank-100">
            <MessageCircleQuestion className="h-4 w-4 text-willtank-800" />
            <AlertDescription className="text-willtank-800 flex justify-between items-center">
              <span>Would you like to add another beneficiary to your will?</span>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={() => setShowBeneficiaryPrompt(false)}>
                  No, Thanks
                </Button>
                <Button size="sm" onClick={handleAddBeneficiary}>
                  Yes, Add Beneficiary
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Document Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-3xl w-[90vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Will Document Preview</DialogTitle>
            </DialogHeader>
            <DocumentPreview 
              willContent={willContent} 
              signature={signature} 
              documentText={generateDocumentText()}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
