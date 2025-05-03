import React, { useState, useEffect, useCallback } from 'react';
import { WillContent } from './types';
import { Button } from '@/components/ui/button';
import { TemplateWillHeader } from '@/components/will/TemplateWillHeader';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { Checkbox } from '@/components/ui/checkbox';

interface DocumentWillEditorProps {
  templateId: string;
  initialData?: any;
  willId?: string;
  onSave?: (data: any) => void;
  onComplete?: (content: WillContent, signature: string | null) => void;
}

export function DocumentWillEditor({
  templateId,
  initialData,
  willId,
  onSave,
  onComplete
}: DocumentWillEditorProps) {
  const [willContent, setWillContent] = useState<WillContent>({
    personalInfo: {
      fullName: '',
      dateOfBirth: '',
      address: '',
      email: '',
      phone: ''
    },
    executors: [],
    beneficiaries: [],
    specificBequests: '',
    residualEstate: '',
    finalArrangements: ''
  });
  const [signature, setSignature] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setWillContent(prev => ({
        ...prev,
        personalInfo: initialData.personalInfo || prev.personalInfo,
        executors: initialData.executors || prev.executors,
        beneficiaries: initialData.beneficiaries || prev.beneficiaries,
        specificBequests: initialData.specificBequests || prev.specificBequests,
        residualEstate: initialData.residualEstate || prev.residualEstate,
        finalArrangements: initialData.finalArrangements || prev.finalArrangements
      }));
    }
  }, [initialData]);

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setWillContent(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [name]: value
      }
    }));
  };

  const handleExecutorChange = (id: string, field: string, value: string | boolean) => {
    setWillContent(prev => ({
      ...prev,
      executors: prev.executors.map(executor =>
        executor.id === id ? { ...executor, [field]: value } : executor
      )
    }));
  };

  const handleAddExecutor = () => {
    setWillContent(prev => ({
      ...prev,
      executors: [...prev.executors, { id: uuidv4(), name: '', relationship: '', email: '', phone: '', address: '', isPrimary: false }]
    }));
  };

  const handleRemoveExecutor = (id: string) => {
    setWillContent(prev => ({
      ...prev,
      executors: prev.executors.filter(executor => executor.id !== id)
    }));
  };

  const handleBeneficiaryChange = (id: string, field: string, value: string | number) => {
    setWillContent(prev => ({
      ...prev,
      beneficiaries: prev.beneficiaries.map(beneficiary =>
        beneficiary.id === id ? { ...beneficiary, [field]: value } : beneficiary
      )
    }));
  };

  const handleAddBeneficiary = () => {
    setWillContent(prev => ({
      ...prev,
      beneficiaries: [...prev.beneficiaries, { id: uuidv4(), name: '', relationship: '', percentage: 0, email: '', phone: '', address: '' }]
    }));
  };

  const handleRemoveBeneficiary = (id: string) => {
    setWillContent(prev => ({
      ...prev,
      beneficiaries: prev.beneficiaries.filter(beneficiary => beneficiary.id !== id)
    }));
  };

  const handleBequestsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setWillContent(prev => ({ ...prev, specificBequests: e.target.value }));
  };

  const handleEstateChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setWillContent(prev => ({ ...prev, residualEstate: e.target.value }));
  };

  const handleArrangementsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setWillContent(prev => ({ ...prev, finalArrangements: e.target.value }));
  };

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignature(e.target.value);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(willContent);
        toast({
          title: "Will Saved",
          description: "Your will has been saved successfully.",
        });
      }
    } catch (error) {
      console.error("Error saving will:", error);
      toast({
        title: "Error",
        description: "There was an error saving your will. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Call this function when the will is complete
  const handleFinalize = () => {
    if (onComplete) {
      // Pass the full will content and signature to the parent component
      onComplete(willContent, signature);
    }
  };

  const renderPersonalInfo = () => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Enter your personal details</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input type="text" id="fullName" name="fullName" value={willContent.personalInfo.fullName} onChange={handlePersonalInfoChange} />
          </div>
          <div>
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input type="date" id="dateOfBirth" name="dateOfBirth" value={willContent.personalInfo.dateOfBirth} onChange={handlePersonalInfoChange} />
          </div>
        </div>
        <Label htmlFor="address">Address</Label>
        <Input type="text" id="address" name="address" value={willContent.personalInfo.address} onChange={handlePersonalInfoChange} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input type="email" id="email" name="email" value={willContent.personalInfo.email} onChange={handlePersonalInfoChange} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input type="tel" id="phone" name="phone" value={willContent.personalInfo.phone} onChange={handlePersonalInfoChange} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderExecutors = () => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Executors</CardTitle>
        <CardDescription>Appoint one or more executors to manage your estate</CardDescription>
      </CardHeader>
      <CardContent>
        {willContent.executors.map((executor, index) => (
          <div key={executor.id} className="mb-4 p-4 border rounded">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`executorName-${executor.id}`}>Name</Label>
                <Input type="text" id={`executorName-${executor.id}`} value={executor.name} onChange={(e) => handleExecutorChange(executor.id, 'name', e.target.value)} />
              </div>
              <div>
                <Label htmlFor={`executorRelationship-${executor.id}`}>Relationship</Label>
                <Input type="text" id={`executorRelationship-${executor.id}`} value={executor.relationship} onChange={(e) => handleExecutorChange(executor.id, 'relationship', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <Label htmlFor={`executorEmail-${executor.id}`}>Email</Label>
                <Input type="email" id={`executorEmail-${executor.id}`} value={executor.email} onChange={(e) => handleExecutorChange(executor.id, 'email', e.target.value)} />
              </div>
              <div>
                <Label htmlFor={`executorPhone-${executor.id}`}>Phone</Label>
                <Input type="tel" id={`executorPhone-${executor.id}`} value={executor.phone} onChange={(e) => handleExecutorChange(executor.id, 'phone', e.target.value)} />
              </div>
            </div>
            <Label htmlFor={`executorAddress-${executor.id}`}>Address</Label>
            <Input type="text" id={`executorAddress-${executor.id}`} value={executor.address} onChange={(e) => handleExecutorChange(executor.id, 'address', e.target.value)} />
            {willContent.executors.length > 1 && (
              <Button type="button" variant="destructive" size="sm" className="mt-3" onClick={() => handleRemoveExecutor(executor.id)}>
                Remove Executor
              </Button>
            )}
            {willContent.executors.length === 1 && (
              <div className="mt-3">
                <Label htmlFor={`executorIsPrimary-${executor.id}`} className="mr-2">Primary Executor</Label>
                <Checkbox
                  id={`executorIsPrimary-${executor.id}`}
                  checked={executor.isPrimary}
                  onCheckedChange={(checked) => handleExecutorChange(executor.id, 'isPrimary', !!checked)}
                />
              </div>
            )}
          </div>
        ))}
        <Button type="button" onClick={handleAddExecutor}>
          Add Executor
        </Button>
      </CardContent>
    </Card>
  );

  const renderBeneficiaries = () => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Beneficiaries</CardTitle>
        <CardDescription>List the beneficiaries who will inherit your assets</CardDescription>
      </CardHeader>
      <CardContent>
        {willContent.beneficiaries.map((beneficiary, index) => (
          <div key={beneficiary.id} className="mb-4 p-4 border rounded">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`beneficiaryName-${beneficiary.id}`}>Name</Label>
                <Input type="text" id={`beneficiaryName-${beneficiary.id}`} value={beneficiary.name} onChange={(e) => handleBeneficiaryChange(beneficiary.id, 'name', e.target.value)} />
              </div>
              <div>
                <Label htmlFor={`beneficiaryRelationship-${beneficiary.id}`}>Relationship</Label>
                <Input type="text" id={`beneficiaryRelationship-${beneficiary.id}`} value={beneficiary.relationship} onChange={(e) => handleBeneficiaryChange(beneficiary.id, 'relationship', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <Label htmlFor={`beneficiaryPercentage-${beneficiary.id}`}>Percentage of Estate</Label>
                <Input
                  type="number"
                  id={`beneficiaryPercentage-${beneficiary.id}`}
                  value={beneficiary.percentage}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    handleBeneficiaryChange(beneficiary.id, 'percentage', isNaN(value) ? 0 : value);
                  }}
                />
              </div>
              <div>
                <Label htmlFor={`beneficiaryEmail-${beneficiary.id}`}>Email</Label>
                <Input type="email" id={`beneficiaryEmail-${beneficiary.id}`} value={beneficiary.email} onChange={(e) => handleBeneficiaryChange(beneficiary.id, 'email', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <Label htmlFor={`beneficiaryPhone-${beneficiary.id}`}>Phone</Label>
                <Input type="tel" id={`beneficiaryPhone-${beneficiary.id}`} value={beneficiary.phone} onChange={(e) => handleBeneficiaryChange(beneficiary.id, 'phone', e.target.value)} />
              </div>
              <div>
                <Label htmlFor={`beneficiaryAddress-${beneficiary.id}`}>Address</Label>
                <Input type="text" id={`beneficiaryAddress-${beneficiary.id}`} value={beneficiary.address} onChange={(e) => handleBeneficiaryChange(beneficiary.id, 'address', e.target.value)} />
              </div>
            </div>
            <Button type="button" variant="destructive" size="sm" className="mt-3" onClick={() => handleRemoveBeneficiary(beneficiary.id)}>
              Remove Beneficiary
            </Button>
          </div>
        ))}
        <Button type="button" onClick={handleAddBeneficiary}>
          Add Beneficiary
        </Button>
      </CardContent>
    </Card>
  );

  const renderSpecificBequests = () => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Specific Bequests</CardTitle>
        <CardDescription>Detail any specific gifts or bequests</CardDescription>
      </CardHeader>
      <CardContent>
        <Label htmlFor="specificBequests">Specific Bequests</Label>
        <Textarea id="specificBequests" value={willContent.specificBequests} onChange={handleBequestsChange} />
      </CardContent>
    </Card>
  );

  const renderResidualEstate = () => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Residual Estate</CardTitle>
        <CardDescription>Instructions for the remainder of your estate</CardDescription>
      </CardHeader>
      <CardContent>
        <Label htmlFor="residualEstate">Residual Estate</Label>
        <Textarea id="residualEstate" value={willContent.residualEstate} onChange={handleEstateChange} />
      </CardContent>
    </Card>
  );

  const renderFinalArrangements = () => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Final Arrangements</CardTitle>
        <CardDescription>Specify your wishes for funeral arrangements</CardDescription>
      </CardHeader>
      <CardContent>
        <Label htmlFor="finalArrangements">Final Arrangements</Label>
        <Textarea id="finalArrangements" value={willContent.finalArrangements} onChange={handleArrangementsChange} />
      </CardContent>
    </Card>
  );

  const renderSignature = () => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Signature</CardTitle>
        <CardDescription>Sign your will to make it legally binding</CardDescription>
      </CardHeader>
      <CardContent>
        <Label htmlFor="signature">Digital Signature</Label>
        <Input type="text" id="signature" value={signature || ''} onChange={handleSignatureChange} />
      </CardContent>
    </Card>
  );

  const renderActions = () => {
    return (
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Progress'}
        </Button>
        
        <Button
          type="button"
          onClick={handleFinalize}
          className="bg-willtank-600 hover:bg-willtank-700"
        >
          Finalize Will
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <TemplateWillHeader templateId={templateId} />
      {renderPersonalInfo()}
      {renderExecutors()}
      {renderBeneficiaries()}
      {renderSpecificBequests()}
      {renderResidualEstate()}
      {renderFinalArrangements()}
      {renderSignature()}
      {renderActions()}
    </div>
  );
}
