import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentPreview } from './DocumentPreview';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Save, Eye, EyeOff, FileText, Users, Shield, Heart, Smartphone, Banknote, Home, Car } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SignatureCanvas from 'react-signature-canvas';
import { generateWillContent } from '@/utils/willTemplateUtils';

// Define interfaces for form data
interface PersonalInfo {
  fullName: string;
  dateOfBirth: string;
  address: string;
  email: string;
  phoneNumber: string;
}

interface Executor {
  id: string;
  name: string;
  relationship: string;
  email: string;
  phone: string;
  address: string;
  isPrimary: boolean;
}

interface Beneficiary {
  id: string;
  name: string;
  relationship: string;
  email: string;
  phone: string;
  address: string;
  percentage: number;
}

interface Guardian {
  id: string;
  name: string;
  relationship: string;
  email: string;
  phone: string;
  address: string;
}

interface Property {
  id: string;
  description: string;
  address: string;
  approximateValue: number;
  ownershipType: string;
  mortgageDetails?: string;
  insuranceInfo?: string;
}

interface Vehicle {
  id: string;
  description: string;
  registrationNumber: string;
  approximateValue: number;
  loanInfo?: string;
  insuranceInfo?: string;
}

interface FinancialAccount {
  id: string;
  accountType: string;
  institution: string;
  accountNumber: string;
  approximateValue: number;
  beneficiaryDesignation?: string;
}

interface DigitalAsset {
  id: string;
  description: string;
  accessInformation: string;
  approximateValue: number;
  platform?: string;
}

interface WillContent {
  personalInfo: PersonalInfo;
  executors: Executor[];
  beneficiaries: Beneficiary[];
  guardians: Guardian[];
  assets: {
    properties: Property[];
    vehicles: Vehicle[];
    financialAccounts: FinancialAccount[];
    digitalAssets: DigitalAsset[];
  };
  funeralPreferences: string;
  memorialService: string;
  obituary: string;
  charitableDonations: string;
  specialInstructions: string;
}

interface DocumentWillEditorProps {
  templateId: string;
  initialData?: any;
  willId?: string;
  onSave?: (data: any) => void;
}

export function DocumentWillEditor({ 
  templateId, 
  initialData, 
  willId, 
  onSave 
}: DocumentWillEditorProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('personal');
  const [showPreview, setShowPreview] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [signatureRef, setSignatureRef] = useState<SignatureCanvas | null>(null);

  const [formData, setFormData] = useState<WillContent>({
    personalInfo: {
      fullName: '',
      dateOfBirth: '',
      address: '',
      email: '',
      phoneNumber: ''
    },
    executors: [],
    beneficiaries: [],
    guardians: [],
    assets: {
      properties: [],
      vehicles: [],
      financialAccounts: [],
      digitalAssets: []
    },
    funeralPreferences: '',
    memorialService: '',
    obituary: '',
    charitableDonations: '',
    specialInstructions: ''
  });

  const [documentText, setDocumentText] = useState('');

  useEffect(() => {
    if (initialData) {
      console.log('Loading initial data:', initialData);
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  // Generate document text whenever form data changes
  useEffect(() => {
    try {
      const templateContent = `LAST WILL AND TESTAMENT

I, [Full Name], residing at [Address], being of sound mind, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all wills and codicils previously made by me.

ARTICLE I: PERSONAL INFORMATION
I declare that I was born on [Date of Birth] and that I am creating this will to ensure my wishes are carried out after my death.

ARTICLE II: APPOINTMENT OF EXECUTOR
I appoint [Executor Name] to serve as the Executor of my estate.

ARTICLE III: BENEFICIARIES
I bequeath my assets to the following beneficiaries:
[Beneficiary details to be added]

ARTICLE IV: SPECIFIC BEQUESTS
[Specific bequests to be added]

ARTICLE V: RESIDUAL ESTATE
[Beneficiary names and distribution details]

ARTICLE VI: FINAL ARRANGEMENTS
[Final arrangements to be added]`;

      const generatedText = generateWillContent(formData, templateContent);
      setDocumentText(generatedText);
      console.log('Generated document text:', generatedText);
    } catch (error) {
      console.error('Error generating document text:', error);
    }
  }, [formData]);

  const handleSave = async () => {
    try {
      console.log('Saving form data:', formData);
      
      if (onSave) {
        await onSave({
          personalInfo: formData.personalInfo,
          executors: formData.executors,
          beneficiaries: formData.beneficiaries,
          guardians: formData.guardians,
          assets: formData.assets,
          funeralPreferences: formData.funeralPreferences,
          memorialService: formData.memorialService,
          obituary: formData.obituary,
          charitableDonations: formData.charitableDonations,
          specialInstructions: formData.specialInstructions,
          documentText: documentText,
          signature: signature
        });
      }
      
      toast({
        title: "Success",
        description: "Will has been saved successfully"
      });
    } catch (error) {
      console.error('Error saving will:', error);
      toast({
        title: "Error",
        description: "Failed to save will. Please try again.",
        variant: "destructive"
      });
    }
  };

  const addExecutor = () => {
    const newExecutor: Executor = {
      id: Date.now().toString(),
      name: '',
      relationship: '',
      email: '',
      phone: '',
      address: '',
      isPrimary: formData.executors.length === 0
    };
    setFormData(prev => ({
      ...prev,
      executors: [...prev.executors, newExecutor]
    }));
  };

  const removeExecutor = (id: string) => {
    setFormData(prev => ({
      ...prev,
      executors: prev.executors.filter(executor => executor.id !== id)
    }));
  };

  const updateExecutor = (id: string, field: keyof Executor, value: any) => {
    setFormData(prev => ({
      ...prev,
      executors: prev.executors.map(executor =>
        executor.id === id ? { ...executor, [field]: value } : executor
      )
    }));
  };

  const addBeneficiary = () => {
    const newBeneficiary: Beneficiary = {
      id: Date.now().toString(),
      name: '',
      relationship: '',
      email: '',
      phone: '',
      address: '',
      percentage: 0
    };
    setFormData(prev => ({
      ...prev,
      beneficiaries: [...prev.beneficiaries, newBeneficiary]
    }));
  };

  const removeBeneficiary = (id: string) => {
    setFormData(prev => ({
      ...prev,
      beneficiaries: prev.beneficiaries.filter(beneficiary => beneficiary.id !== id)
    }));
  };

  const updateBeneficiary = (id: string, field: keyof Beneficiary, value: any) => {
    setFormData(prev => ({
      ...prev,
      beneficiaries: prev.beneficiaries.map(beneficiary =>
        beneficiary.id === id ? { ...beneficiary, [field]: value } : beneficiary
      )
    }));
  };

  const clearSignature = () => {
    if (signatureRef) {
      signatureRef.clear();
    }
    setSignature(null);
  };

  const saveSignature = () => {
    if (signatureRef && !signatureRef.isEmpty()) {
      const signatureData = signatureRef.getTrimmedCanvas().toDataURL('image/png');
      setSignature(signatureData);
      toast({
        title: "Signature Saved",
        description: "Your signature has been captured successfully"
      });
    } else {
      toast({
        title: "No Signature",
        description: "Please draw your signature first",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Create Your Will</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Will
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="people">People</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="wishes">Wishes</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Legal Name</Label>
                      <Input
                        id="fullName"
                        value={formData.personalInfo.fullName}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                        }))}
                        placeholder="Enter your full legal name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.personalInfo.dateOfBirth}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, dateOfBirth: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.personalInfo.address}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, address: e.target.value }
                      }))}
                      placeholder="Enter your full address"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.personalInfo.email}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, email: e.target.value }
                        }))}
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.personalInfo.phoneNumber}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, phoneNumber: e.target.value }
                        }))}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="people" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Executors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.executors.map((executor) => (
                    <div key={executor.id} className="p-4 border rounded-lg space-y-4">
                      <div className="flex justify-between items-center">
                        <Badge variant={executor.isPrimary ? "default" : "secondary"}>
                          {executor.isPrimary ? "Primary Executor" : "Alternate Executor"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExecutor(executor.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Name</Label>
                          <Input
                            value={executor.name}
                            onChange={(e) => updateExecutor(executor.id, 'name', e.target.value)}
                            placeholder="Executor's full name"
                          />
                        </div>
                        <div>
                          <Label>Relationship</Label>
                          <Input
                            value={executor.relationship}
                            onChange={(e) => updateExecutor(executor.id, 'relationship', e.target.value)}
                            placeholder="e.g., Spouse, Child, Friend"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button onClick={addExecutor} variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Executor
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Beneficiaries
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.beneficiaries.map((beneficiary) => (
                    <div key={beneficiary.id} className="p-4 border rounded-lg space-y-4">
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">Beneficiary</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBeneficiary(beneficiary.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Name</Label>
                          <Input
                            value={beneficiary.name}
                            onChange={(e) => updateBeneficiary(beneficiary.id, 'name', e.target.value)}
                            placeholder="Beneficiary's full name"
                          />
                        </div>
                        <div>
                          <Label>Relationship</Label>
                          <Input
                            value={beneficiary.relationship}
                            onChange={(e) => updateBeneficiary(beneficiary.id, 'relationship', e.target.value)}
                            placeholder="e.g., Child, Spouse"
                          />
                        </div>
                        <div>
                          <Label>Percentage (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={beneficiary.percentage}
                            onChange={(e) => updateBeneficiary(beneficiary.id, 'percentage', parseInt(e.target.value) || 0)}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button onClick={addBeneficiary} variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Beneficiary
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assets" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Banknote className="h-5 w-5" />
                    Assets & Property
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    List your major assets including real estate, vehicles, and financial accounts.
                  </p>
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      Asset management features will be available in the next update.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wishes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Final Wishes & Arrangements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="funeral">Funeral Preferences</Label>
                    <Textarea
                      id="funeral"
                      value={formData.funeralPreferences}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        funeralPreferences: e.target.value
                      }))}
                      placeholder="Describe your funeral preferences..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="memorial">Memorial Service</Label>
                    <Textarea
                      id="memorial"
                      value={formData.memorialService}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        memorialService: e.target.value
                      }))}
                      placeholder="Describe your memorial service wishes..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="special">Special Instructions</Label>
                    <Textarea
                      id="special"
                      value={formData.specialInstructions}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        specialInstructions: e.target.value
                      }))}
                      placeholder="Any special instructions or wishes..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Digital Signature</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <SignatureCanvas
                      ref={(ref) => setSignatureRef(ref)}
                      canvasProps={{
                        width: 400,
                        height: 150,
                        className: 'signature-canvas w-full'
                      }}
                      backgroundColor="white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveSignature} variant="outline">
                      Save Signature
                    </Button>
                    <Button onClick={clearSignature} variant="ghost">
                      Clear
                    </Button>
                  </div>
                  {signature && (
                    <div className="p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-green-800">✓ Signature saved successfully</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {showPreview && (
          <div className="lg:sticky lg:top-4">
            <Card>
              <CardHeader>
                <CardTitle>Document Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentPreview
                  willContent={formData}
                  signature={signature}
                  documentText={documentText}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
