
import React, { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Check, Upload, Video, Save, FileText, Edit, ChevronRight, Loader2 } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import InfoField from '@/components/ui/InfoField';
import { Card } from '@/components/ui/card';

// Will document sections
const WILL_SECTIONS = {
  PERSONAL_INFO: "PERSONAL_INFO",
  ASSETS: "ASSETS", 
  BENEFICIARIES: "BENEFICIARIES",
  EXECUTORS: "EXECUTORS",
  GUARDIANS: "GUARDIANS",
  DIGITAL_ASSETS: "DIGITAL_ASSETS",
  FINAL_WISHES: "FINAL_WISHES",
};

// Define types for mock data
interface Document {
  id: string;
  name: string;
  size: string;
  type: string;
}

interface VideoRecording {
  id: string; 
  duration: string;
  thumbnail?: string;
  date: string;
}

interface WillTemplateData {
  personalInfo: {
    fullName: string;
    address: string;
    maritalStatus: string;
    spouseName?: string;
    dateOfBirth: string;
    email: string;
    phone: string;
  };
  assets: {
    realEstate: string;
    bankAccounts: string;
    investments: string;
    personalProperty: string;
    vehicles: string;
    otherAssets: string;
  };
  beneficiaries: {
    primaryBeneficiaries: string;
    contingentBeneficiaries: string;
    specificBequests: string;
  };
  executors: {
    primaryExecutor: string;
    primaryExecutorEmail: string;
    alternateExecutor: string;
    alternateExecutorEmail: string;
  };
  guardians: {
    primaryGuardian: string;
    alternateGuardian: string;
    childrenNames: string;
  };
  digitalAssets: {
    digitalAssetsList: string;
    digitalAssetsInstructions: string;
    socialMediaInstructions: string;
  };
  finalWishes: {
    funeralInstructions: string;
    burialPreferences: string;
    obituaryNotes: string;
    finalMessages: string;
  };
}

interface WillSectionConfig {
  id: string;
  title: string;
  description: string;
  fields: FieldConfig[];
  required: boolean;
}

interface FieldConfig {
  id: string;
  label: string;
  tooltip: string;
  type?: 'text' | 'email' | 'tel' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}

interface TemplateWillEditorProps {
  templateId: string;
  templateName: string;
  initialData?: Partial<WillTemplateData>;
  onSave: (data: WillTemplateData) => void;
  onPreview: (data: WillTemplateData) => void;
  onFinalize: (data: WillTemplateData, documents: Document[], videos: VideoRecording[]) => void;
}

export const TemplateWillEditor: React.FC<TemplateWillEditorProps> = ({
  templateId,
  templateName,
  initialData,
  onSave,
  onPreview,
  onFinalize
}) => {
  // Default empty data structure
  const emptyData: WillTemplateData = {
    personalInfo: {
      fullName: '',
      address: '',
      maritalStatus: '',
      spouseName: '',
      dateOfBirth: '',
      email: '',
      phone: '',
    },
    assets: {
      realEstate: '',
      bankAccounts: '',
      investments: '',
      personalProperty: '',
      vehicles: '',
      otherAssets: '',
    },
    beneficiaries: {
      primaryBeneficiaries: '',
      contingentBeneficiaries: '',
      specificBequests: '',
    },
    executors: {
      primaryExecutor: '',
      primaryExecutorEmail: '',
      alternateExecutor: '',
      alternateExecutorEmail: '',
    },
    guardians: {
      primaryGuardian: '',
      alternateGuardian: '',
      childrenNames: '',
    },
    digitalAssets: {
      digitalAssetsList: '',
      digitalAssetsInstructions: '',
      socialMediaInstructions: '',
    },
    finalWishes: {
      funeralInstructions: '',
      burialPreferences: '',
      obituaryNotes: '',
      finalMessages: '',
    },
  };

  // State for form data
  const [willData, setWillData] = useState<WillTemplateData>(initialData ? { ...emptyData, ...initialData } : emptyData);
  const [isDataValid, setIsDataValid] = useState(false);
  const [activeAccordionItem, setActiveAccordionItem] = useState<string>(WILL_SECTIONS.PERSONAL_INFO);
  const [sectionCompletionStatus, setSectionCompletionStatus] = useState<Record<string, boolean>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [documents, setDocuments] = useState<Document[]>([]);
  const [videos, setVideos] = useState<VideoRecording[]>([]);
  const [showPreviewPane, setShowPreviewPane] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const { toast } = useToast();

  // Configure sections based on template type
  const getSectionConfig = (): WillSectionConfig[] => {
    const commonSections: WillSectionConfig[] = [
      {
        id: WILL_SECTIONS.PERSONAL_INFO,
        title: 'Personal Information',
        description: 'Basic information about yourself',
        required: true,
        fields: [
          {
            id: 'fullName',
            label: 'Full Legal Name',
            tooltip: 'Enter your complete legal name as it appears on official documents',
            required: true,
            placeholder: 'e.g., John Michael Smith',
          },
          {
            id: 'address',
            label: 'Legal Address',
            tooltip: 'Your current permanent residential address',
            required: true,
            placeholder: 'e.g., 123 Main Street, Anytown, State, ZIP',
            type: 'textarea',
          },
          {
            id: 'maritalStatus',
            label: 'Marital Status',
            tooltip: 'Your current legal marital status',
            required: true,
            type: 'select',
            options: [
              { value: 'single', label: 'Single' },
              { value: 'married', label: 'Married' },
              { value: 'divorced', label: 'Divorced' },
              { value: 'widowed', label: 'Widowed' },
              { value: 'separated', label: 'Separated' }
            ],
          },
          {
            id: 'spouseName',
            label: 'Spouse Name',
            tooltip: 'Full legal name of your spouse (if applicable)',
            placeholder: 'e.g., Jane Elizabeth Smith',
          },
          {
            id: 'dateOfBirth',
            label: 'Date of Birth',
            tooltip: 'Your legal date of birth',
            required: true,
            placeholder: 'MM/DD/YYYY',
          },
          {
            id: 'email',
            label: 'Email Address',
            tooltip: 'Your primary email address for contact purposes',
            required: true,
            type: 'email',
            placeholder: 'your.email@example.com',
          },
          {
            id: 'phone',
            label: 'Phone Number',
            tooltip: 'Your primary phone number for contact purposes',
            type: 'tel',
            placeholder: 'e.g., (555) 123-4567',
          },
        ]
      },
      {
        id: WILL_SECTIONS.ASSETS,
        title: 'Assets',
        description: 'List your major assets and properties',
        required: true,
        fields: [
          {
            id: 'realEstate',
            label: 'Real Estate',
            tooltip: 'List all real estate properties you own, including addresses and approximate values',
            type: 'textarea',
            placeholder: 'e.g., Primary residence at 123 Main St., Vacation home at 456 Beach Rd.',
          },
          {
            id: 'bankAccounts',
            label: 'Bank Accounts',
            tooltip: 'List your bank accounts by institution (no account numbers needed)',
            type: 'textarea',
            placeholder: 'e.g., Checking at First National Bank, Savings at Credit Union',
          },
          {
            id: 'investments',
            label: 'Investments',
            tooltip: 'List your investment accounts, retirement funds, stocks, etc.',
            type: 'textarea',
            placeholder: 'e.g., 401k with Fidelity, Brokerage account with Charles Schwab',
          },
          {
            id: 'personalProperty',
            label: 'Valuable Personal Property',
            tooltip: 'List valuable items such as jewelry, art, collectibles',
            type: 'textarea',
            placeholder: 'e.g., Diamond ring, antique furniture, coin collection',
          },
          {
            id: 'vehicles',
            label: 'Vehicles',
            tooltip: 'List automobiles, boats, or other vehicles you own',
            type: 'textarea',
            placeholder: 'e.g., 2020 Honda Accord, 2018 Sea Ray boat',
          },
          {
            id: 'otherAssets',
            label: 'Other Assets',
            tooltip: 'Any other significant assets not covered in the categories above',
            type: 'textarea',
            placeholder: 'e.g., Business ownership, intellectual property, royalties',
          },
        ]
      },
      {
        id: WILL_SECTIONS.BENEFICIARIES,
        title: 'Beneficiaries',
        description: 'Who will receive your assets',
        required: true,
        fields: [
          {
            id: 'primaryBeneficiaries',
            label: 'Primary Beneficiaries',
            tooltip: 'The main people or organizations who will inherit your assets',
            required: true,
            type: 'textarea',
            placeholder: 'e.g., Spouse: Jane Smith (100% of residual estate), Children: equally divided among John Jr. and Sarah',
          },
          {
            id: 'contingentBeneficiaries',
            label: 'Contingent Beneficiaries',
            tooltip: 'People or organizations who will inherit if your primary beneficiaries cannot',
            type: 'textarea',
            placeholder: 'e.g., Brother: Michael Smith, Sister: Elizabeth Johnson - equally divided',
          },
          {
            id: 'specificBequests',
            label: 'Specific Bequests',
            tooltip: 'Particular items or amounts you want to leave to specific people',
            type: 'textarea',
            placeholder: 'e.g., Diamond ring to daughter Sarah, Stamp collection to nephew Robert',
          },
        ]
      },
      {
        id: WILL_SECTIONS.EXECUTORS,
        title: 'Executors',
        description: 'People who will execute your will',
        required: true,
        fields: [
          {
            id: 'primaryExecutor',
            label: 'Primary Executor',
            tooltip: 'The main person responsible for executing your will',
            required: true,
            placeholder: 'e.g., Jane Smith (spouse)',
          },
          {
            id: 'primaryExecutorEmail',
            label: 'Primary Executor Email',
            tooltip: 'Email address of your primary executor',
            required: true,
            type: 'email',
            placeholder: 'executor@example.com',
          },
          {
            id: 'alternateExecutor',
            label: 'Alternate Executor',
            tooltip: 'Person who will execute your will if your primary executor cannot',
            placeholder: 'e.g., Michael Smith (brother)',
          },
          {
            id: 'alternateExecutorEmail',
            label: 'Alternate Executor Email',
            tooltip: 'Email address of your alternate executor',
            type: 'email',
            placeholder: 'alt.executor@example.com',
          },
        ]
      },
    ];
    
    // Template-specific sections
    const templateSpecificSections: Record<string, WillSectionConfig[]> = {
      traditional: [
        {
          id: WILL_SECTIONS.GUARDIANS,
          title: 'Guardians for Minor Children',
          description: 'Who will care for your minor children',
          required: false,
          fields: [
            {
              id: 'childrenNames',
              label: 'Children\'s Names and Ages',
              tooltip: 'List all minor children who would need guardians',
              type: 'textarea',
              placeholder: 'e.g., John Jr (8), Sarah (6)',
            },
            {
              id: 'primaryGuardian',
              label: 'Primary Guardian',
              tooltip: 'Person who would become guardian of your children',
              placeholder: 'e.g., Michael and Elizabeth Smith (brother and sister-in-law)',
            },
            {
              id: 'alternateGuardian',
              label: 'Alternate Guardian',
              tooltip: 'Person who would become guardian if your primary guardian cannot',
              placeholder: 'e.g., Robert and Mary Johnson (sister and brother-in-law)',
            },
          ]
        },
        {
          id: WILL_SECTIONS.FINAL_WISHES,
          title: 'Final Wishes',
          description: 'Funeral arrangements and final messages',
          required: false,
          fields: [
            {
              id: 'funeralInstructions',
              label: 'Funeral Instructions',
              tooltip: 'Your preferences for funeral services',
              type: 'textarea',
              placeholder: 'e.g., I prefer cremation with a simple memorial service',
            },
            {
              id: 'burialPreferences',
              label: 'Burial Preferences',
              tooltip: 'Where and how you would like to be buried or your ashes scattered',
              type: 'textarea',
              placeholder: 'e.g., Ashes scattered at family lake house',
            },
            {
              id: 'obituaryNotes',
              label: 'Obituary Notes',
              tooltip: 'Information you would like included in your obituary',
              type: 'textarea',
              placeholder: 'e.g., Career highlights, charitable work, major life accomplishments',
            },
            {
              id: 'finalMessages',
              label: 'Final Messages',
              tooltip: 'Personal messages to loved ones',
              type: 'textarea',
              placeholder: 'e.g., Words of wisdom, expressions of love, personal reflections',
            },
          ]
        }
      ],
      'digital-assets': [
        {
          id: WILL_SECTIONS.DIGITAL_ASSETS,
          title: 'Digital Assets',
          description: 'Instructions for your online accounts and digital property',
          required: true,
          fields: [
            {
              id: 'digitalAssetsList',
              label: 'Digital Assets List',
              tooltip: 'List your important digital assets (no passwords)',
              type: 'textarea',
              required: true,
              placeholder: 'e.g., Email accounts, social media profiles, cryptocurrency accounts, cloud storage',
            },
            {
              id: 'digitalAssetsInstructions',
              label: 'Digital Assets Instructions',
              tooltip: 'Instructions on how your digital assets should be handled',
              type: 'textarea',
              required: true,
              placeholder: 'e.g., Close Facebook account, transfer cryptocurrency to beneficiaries',
            },
            {
              id: 'socialMediaInstructions',
              label: 'Social Media Instructions',
              tooltip: 'Specific instructions for social media accounts',
              type: 'textarea',
              placeholder: 'e.g., Post final message on Facebook, memorialize Instagram account',
            },
          ]
        }
      ],
    };
    
    // Combine common sections with template-specific sections
    return [
      ...commonSections,
      ...(templateSpecificSections[templateId] || [])
    ];
  };

  const sectionConfig = getSectionConfig();

  // Update field value in the state
  const handleFieldChange = (section: string, field: string, value: string) => {
    setWillData(prevData => {
      const sectionData = { ...prevData[section as keyof WillTemplateData] as Record<string, string> };
      sectionData[field] = value;
      
      return {
        ...prevData,
        [section]: sectionData
      };
    });
    
    // Clear validation error when user types
    if (validationErrors[`${section}.${field}`]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${section}.${field}`];
        return newErrors;
      });
    }
  };

  // Check if a section is complete (all required fields filled)
  const validateSection = (sectionId: string): boolean => {
    const section = sectionConfig.find(s => s.id === sectionId);
    if (!section) return true;
    
    const sectionData = willData[sectionId.toLowerCase() as keyof WillTemplateData] as Record<string, string>;
    
    for (const field of section.fields) {
      if (field.required && (!sectionData[field.id] || sectionData[field.id].trim() === '')) {
        return false;
      }
    }
    
    return true;
  };

  // Validate entire form data
  const validateAllData = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;
    
    // Validate only required sections
    const requiredSections = sectionConfig.filter(section => section.required);
    
    requiredSections.forEach(section => {
      const sectionKey = section.id.toLowerCase() as keyof WillTemplateData;
      const sectionData = willData[sectionKey] as Record<string, string>;
      
      section.fields
        .filter(field => field.required)
        .forEach(field => {
          const value = sectionData[field.id];
          if (!value || value.trim() === '') {
            errors[`${sectionKey}.${field.id}`] = 'This field is required';
            isValid = false;
          }
        });
    });
    
    setValidationErrors(errors);
    return isValid;
  };

  // Calculate completion status
  useEffect(() => {
    const newSectionStatus: Record<string, boolean> = {};
    
    sectionConfig.forEach(section => {
      newSectionStatus[section.id] = validateSection(section.id);
    });
    
    setSectionCompletionStatus(newSectionStatus);
    
    // Check if all required sections are complete
    const allRequiredSectionsComplete = sectionConfig
      .filter(section => section.required)
      .every(section => newSectionStatus[section.id]);
      
    setIsDataValid(allRequiredSectionsComplete);
  }, [willData, sectionConfig]);

  // Handle save
  const handleSave = async () => {
    if (validateAllData()) {
      setIsSaving(true);
      
      try {
        onSave(willData);
        
        toast({
          title: 'Will saved successfully',
          description: 'Your will has been saved as a draft.',
        });
      } catch (error) {
        console.error('Error saving will:', error);
        
        toast({
          title: 'Error saving will',
          description: 'There was a problem saving your will. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsSaving(false);
      }
    } else {
      // Find first section with errors
      for (const section of sectionConfig) {
        const sectionKey = section.id.toLowerCase();
        const hasErrors = Object.keys(validationErrors).some(key => key.startsWith(sectionKey));
        
        if (hasErrors) {
          setActiveAccordionItem(section.id);
          
          toast({
            title: 'Please complete required fields',
            description: `There are missing required fields in the ${section.title} section.`,
            variant: 'destructive',
          });
          
          break;
        }
      }
    }
  };

  // Handle preview
  const handlePreview = () => {
    setShowPreviewPane(!showPreviewPane);
    if (!showPreviewPane) {
      onPreview(willData);
    }
  };

  // Handle file upload mock
  const handleFileUpload = () => {
    const newDocument: Document = {
      id: `doc-${Date.now()}`,
      name: `Document-${documents.length + 1}.pdf`,
      size: '1.2 MB',
      type: 'application/pdf'
    };
    
    setDocuments([...documents, newDocument]);
    
    toast({
      title: 'Document uploaded',
      description: `${newDocument.name} has been added to your will.`,
    });
  };

  // Handle video recording mock
  const handleRecordVideo = () => {
    const newVideo: VideoRecording = {
      id: `video-${Date.now()}`,
      duration: '2:34',
      date: new Date().toLocaleDateString(),
    };
    
    setVideos([...videos, newVideo]);
    
    toast({
      title: 'Video recorded',
      description: `A ${newVideo.duration} video testimony has been recorded.`,
    });
  };

  // Handle finalize
  const handleFinalize = async () => {
    if (!validateAllData()) {
      toast({
        title: 'Cannot finalize will',
        description: 'Please complete all required fields before finalizing.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsCompiling(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onFinalize(willData, documents, videos);
      
      toast({
        title: 'Will finalized successfully',
        description: 'Your will has been finalized and is ready for review.',
      });
    } catch (error) {
      console.error('Error finalizing will:', error);
      
      toast({
        title: 'Error finalizing will',
        description: 'There was a problem finalizing your will. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCompiling(false);
    }
  };

  // Calculate overall completion percentage
  const calculateCompletionPercentage = (): number => {
    const requiredSections = sectionConfig.filter(section => section.required);
    const completedSections = requiredSections.filter(section => sectionCompletionStatus[section.id]);
    
    return Math.round((completedSections.length / requiredSections.length) * 100);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">{templateName} Will</h1>
          <p className="text-gray-600">Complete the sections below to create your will document</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Progress value={calculateCompletionPercentage()} className="w-32 h-2" />
          <span className="text-sm text-gray-600">{calculateCompletionPercentage()}% complete</span>
        </div>
      </div>
      
      {/* Introduction Alert */}
      <Alert className="bg-willtank-50 border border-willtank-200">
        <AlertDescription>
          Fill out each section below to create your will. Click the (i) icon next to each field for guidance.
          All fields marked with * are required. You can save your progress at any time.
        </AlertDescription>
      </Alert>
      
      {/* Main form with accordion sections */}
      <div className={`grid ${showPreviewPane ? 'grid-cols-1 md:grid-cols-2 gap-6' : 'grid-cols-1'}`}>
        <div className="space-y-6">
          <Accordion 
            type="single" 
            collapsible 
            value={activeAccordionItem}
            onValueChange={(value) => setActiveAccordionItem(value)}
            className="space-y-4"
          >
            {sectionConfig.map((section) => (
              <AccordionItem 
                key={section.id} 
                value={section.id}
                className="border rounded-lg overflow-hidden shadow-sm bg-white"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold">{section.title}</span>
                    {section.required && (
                      <Badge variant="outline" className="text-xs">Required</Badge>
                    )}
                    {sectionCompletionStatus[section.id] && (
                      <Badge className="bg-green-500 text-white ml-auto">
                        <Check className="h-3 w-3 mr-1" /> Complete
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 pt-0 border-t">
                  <p className="text-sm text-gray-600 mb-4">{section.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.fields.map((field) => {
                      const sectionKey = section.id.toLowerCase();
                      const fieldId = field.id;
                      const errorKey = `${sectionKey}.${fieldId}`;
                      
                      return (
                        <InfoField
                          key={`${sectionKey}-${fieldId}`}
                          id={`${sectionKey}-${fieldId}`}
                          label={field.label}
                          tooltip={field.tooltip}
                          type={field.type || 'text'}
                          value={
                            ((willData[sectionKey as keyof WillTemplateData] as Record<string, string>)[fieldId]) || ''
                          }
                          onChange={(value) => handleFieldChange(sectionKey, fieldId, value)}
                          placeholder={field.placeholder}
                          required={field.required}
                          options={field.options}
                          error={validationErrors[errorKey]}
                          className={field.type === 'textarea' ? 'col-span-1 md:col-span-2' : ''}
                        />
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Attachments section */}
          <Card className="p-5">
            <h3 className="text-lg font-bold mb-3">Supporting Documents</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload important documents to support your will, such as property deeds, 
              insurance policies, or financial statements.
            </p>
            
            <div className="grid grid-cols-1 gap-3 mb-4">
              {documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded bg-gray-50">
                  <div className="flex items-center gap-3">
                    <FileText className="text-willtank-600" />
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.size}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              onClick={handleFileUpload} 
              variant="outline" 
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </Card>
          
          {/* Video Testimony section */}
          <Card className="p-5">
            <h3 className="text-lg font-bold mb-3">Video Testimony</h3>
            <p className="text-sm text-gray-600 mb-4">
              Record a video to express your intentions and provide additional context for your will.
            </p>
            
            <div className="grid grid-cols-1 gap-3 mb-4">
              {videos.map(video => (
                <div key={video.id} className="flex items-center justify-between p-3 border rounded bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Video className="text-willtank-600" />
                    <div>
                      <p className="font-medium">Video Testimony</p>
                      <p className="text-xs text-gray-500">
                        {video.duration} • Recorded on {video.date}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              onClick={handleRecordVideo} 
              variant="outline" 
              className="w-full"
            >
              <Video className="mr-2 h-4 w-4" />
              Record Video Testimony
            </Button>
          </Card>
          
          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Draft
                </>
              )}
            </Button>
            
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={handlePreview}
              >
                <Edit className="mr-2 h-4 w-4" />
                {showPreviewPane ? 'Hide Preview' : 'Show Preview'}
              </Button>
              
              <Button 
                variant="default"
                onClick={handleFinalize}
                disabled={!isDataValid || isCompiling}
                className="bg-willtank-600 hover:bg-willtank-700"
              >
                {isCompiling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finalizing...
                  </>
                ) : (
                  <>
                    Finalize Will
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Preview pane */}
        {showPreviewPane && (
          <div className="bg-white p-6 border rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Document Preview</h2>
            <div className="prose max-w-none">
              <h1 className="text-center text-2xl font-serif">LAST WILL AND TESTAMENT</h1>
              <h2 className="text-center font-serif">OF {willData.personalInfo.fullName.toUpperCase() || '[YOUR NAME]'}</h2>
              
              <p>
                I, {willData.personalInfo.fullName || '[YOUR NAME]'}, residing at {willData.personalInfo.address || '[YOUR ADDRESS]'}, 
                being of sound mind, do hereby make, publish, and declare this to be my Last Will and Testament, 
                revoking all previous wills and codicils made by me.
              </p>
              
              <h3>ARTICLE I: PERSONAL INFORMATION</h3>
              <p>
                I am {willData.personalInfo.maritalStatus || '[MARITAL STATUS]'}
                {willData.personalInfo.maritalStatus === 'married' && willData.personalInfo.spouseName 
                  ? ` to ${willData.personalInfo.spouseName}` 
                  : ''
                }.
                {willData.guardians?.childrenNames 
                  ? ` I have the following children: ${willData.guardians.childrenNames}.` 
                  : ''
                }
              </p>
              
              <h3>ARTICLE II: APPOINTMENT OF EXECUTOR</h3>
              <p>
                I appoint {willData.executors.primaryExecutor || '[PRIMARY EXECUTOR]'} to serve as Executor of my estate. 
                {willData.executors.alternateExecutor 
                  ? ` If ${willData.executors.primaryExecutor || '[PRIMARY EXECUTOR]'} is unable or unwilling to serve, I appoint ${willData.executors.alternateExecutor} to serve as alternate Executor.` 
                  : ''
                }
              </p>
              
              <h3>ARTICLE III: DISTRIBUTION OF PROPERTY</h3>
              <p>
                {willData.beneficiaries.primaryBeneficiaries 
                  ? `I give, devise, and bequeath my property as follows: ${willData.beneficiaries.primaryBeneficiaries}` 
                  : 'I give, devise, and bequeath my property as follows: [PRIMARY BENEFICIARIES]'
                }
              </p>
              
              {willData.beneficiaries.specificBequests && (
                <p>
                  I make the following specific bequests: {willData.beneficiaries.specificBequests}
                </p>
              )}
              
              {willData.guardians?.primaryGuardian && (
                <>
                  <h3>ARTICLE IV: GUARDIAN FOR MINOR CHILDREN</h3>
                  <p>
                    If at my death, any of my children are minors and have no surviving parent, 
                    I appoint {willData.guardians.primaryGuardian} as guardian of the person and property of my minor children.
                    {willData.guardians.alternateGuardian 
                      ? ` If ${willData.guardians.primaryGuardian} is unable or unwilling to serve, I appoint ${willData.guardians.alternateGuardian} as alternate guardian.` 
                      : ''
                    }
                  </p>
                </>
              )}
              
              {willData.digitalAssets?.digitalAssetsList && (
                <>
                  <h3>ARTICLE {willData.guardians?.primaryGuardian ? 'V' : 'IV'}: DIGITAL ASSETS</h3>
                  <p>
                    My digital assets include: {willData.digitalAssets.digitalAssetsList}
                  </p>
                  <p>
                    I direct my Executor regarding my digital assets as follows: {willData.digitalAssets.digitalAssetsInstructions}
                  </p>
                </>
              )}
              
              {willData.finalWishes?.funeralInstructions && (
                <>
                  <h3>ARTICLE {(willData.guardians?.primaryGuardian ? 'VI' : (willData.digitalAssets?.digitalAssetsList ? 'V' : 'IV'))}: FINAL WISHES</h3>
                  <p>
                    {willData.finalWishes.funeralInstructions}
                  </p>
                </>
              )}
              
              <div className="mt-10">
                <p>IN WITNESS WHEREOF, I have hereunto set my hand this _____ day of ___________, 20___.</p>
                <div className="mt-10 border-t border-black pt-2">
                  <p>{willData.personalInfo.fullName}</p>
                </div>
                
                <p className="mt-6">
                  Signed, published and declared by {willData.personalInfo.fullName} as their Last Will and Testament, 
                  in our presence, who at their request, in their presence, and in the presence of each other, 
                  have subscribed our names as witnesses.
                </p>
                
                <div className="grid grid-cols-2 gap-8 mt-10">
                  <div>
                    <div className="border-t border-black pt-2">
                      <p>Witness Signature</p>
                    </div>
                    <p className="mt-2">Name: ___________________________</p>
                    <p>Address: ___________________________</p>
                  </div>
                  
                  <div>
                    <div className="border-t border-black pt-2">
                      <p>Witness Signature</p>
                    </div>
                    <p className="mt-2">Name: ___________________________</p>
                    <p>Address: ___________________________</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
