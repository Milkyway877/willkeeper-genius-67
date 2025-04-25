
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { createWill } from '@/services/willService';
import { motion } from 'framer-motion';
import { FileText, ArrowRight, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type WillTemplate = {
  id: string;
  name: string;
  description: string;
  content: string;
};

const WILL_TEMPLATES: WillTemplate[] = [
  {
    id: 'basic',
    name: 'Basic Will',
    description: 'A simple will covering essential elements of asset distribution.',
    content: `LAST WILL AND TESTAMENT OF [YOUR NAME]

I, [YOUR NAME], residing at [YOUR ADDRESS], being of sound mind and memory, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all Wills and Codicils previously made by me.

ARTICLE I: PERSONAL INFORMATION
I am married to [SPOUSE NAME] and we have [NUMBER] children, namely [CHILDREN NAMES AND AGES].

ARTICLE II: APPOINTMENT OF EXECUTOR
I appoint [EXECUTOR NAME] to serve as Executor of my estate. If [EXECUTOR NAME] is unable or unwilling to serve, I appoint [ALTERNATE EXECUTOR NAME] to serve as alternate Executor.

ARTICLE III: PAYMENT OF DEBTS AND EXPENSES
I direct that all of my legally enforceable debts, funeral expenses, and expenses in connection with the administration of my estate be paid as soon as practicable after my death.

ARTICLE IV: DISTRIBUTION OF PROPERTY
I give, devise, and bequeath all of my property, real, personal, and mixed, of whatever kind and wherever situated, which I may own or have the right to dispose of at the time of my death as follows:

1. To my spouse, [SPOUSE NAME], I give [SPECIFIC PROPERTY OR PERCENTAGE].
2. To my children, [CHILDREN NAMES], I give [SPECIFIC PROPERTY OR PERCENTAGE].
3. [ADDITIONAL BENEFICIARIES AND THEIR DISTRIBUTIONS]

ARTICLE V: GUARDIAN FOR MINOR CHILDREN
If at my death, any of my children are minors and have no surviving parent, I appoint [GUARDIAN NAME] as guardian of the person and property of my minor children. If [GUARDIAN NAME] is unable or unwilling to serve, I appoint [ALTERNATE GUARDIAN NAME] as alternate guardian.

ARTICLE VI: MISCELLANEOUS PROVISIONS
If any beneficiary under this Will does not survive me by 30 days, then any bequest to such beneficiary shall lapse and shall pass as part of the residue of my estate.

IN WITNESS WHEREOF, I have hereunto set my hand to this, my Last Will and Testament, on this [DAY] day of [MONTH], [YEAR].

[YOUR NAME]`
  },
  {
    id: 'comprehensive',
    name: 'Comprehensive Will',
    description: 'A detailed will with extensive coverage of assets, trusts, and specific instructions.',
    content: `LAST WILL AND TESTAMENT OF [YOUR NAME]

I, [YOUR NAME], residing at [YOUR ADDRESS], declare this to be my Last Will and Testament, revoking all prior wills and codicils.

ARTICLE I: REVOCATION AND DECLARATION
I revoke all prior wills and codicils. I declare that I am married to [SPOUSE NAME], and we have [NUMBER] children: [NAMES AND BIRTH DATES OF CHILDREN].

ARTICLE II: EXECUTOR APPOINTMENT
I appoint [EXECUTOR NAME] as Executor. If they cannot serve, I appoint [ALTERNATE EXECUTOR] as successor Executor. My Executor shall have all powers granted by law and may serve without bond.

ARTICLE III: DEBTS AND EXPENSES
I direct my Executor to pay all legally enforceable debts, funeral expenses, and estate administration expenses from my estate.

ARTICLE IV: SPECIFIC BEQUESTS
I make the following specific bequests:
1. To [NAME]: [SPECIFIC ITEM OR AMOUNT]
2. To [NAME]: [SPECIFIC ITEM OR AMOUNT]
3. [ADDITIONAL SPECIFIC BEQUESTS]

ARTICLE V: RESIDUARY ESTATE
I give my residuary estate to [BENEFICIARY NAME(S) AND RELATIONSHIP(S)] in the following proportions: [LIST PERCENTAGES]. If any beneficiary predeceases me, their share shall [ALTERNATE DISTRIBUTION INSTRUCTIONS].

ARTICLE VI: TRUST PROVISIONS
[IF APPLICABLE] I establish the [TRUST NAME] for the benefit of [BENEFICIARY NAME(S)]. The trustee shall be [TRUSTEE NAME]. The trust shall be administered according to the following terms: [TRUST TERMS].

ARTICLE VII: GUARDIAN FOR MINOR CHILDREN
If my children are minors at my death and have no surviving parent, I nominate [GUARDIAN NAME] as guardian of their persons and estates. If [GUARDIAN NAME] cannot serve, I nominate [ALTERNATE GUARDIAN].

ARTICLE VIII: DIGITAL ASSETS
I grant my Executor access to my digital assets, including email accounts, social media, financial accounts, and digital files. My Executor may access, control, transfer, delete, or close these accounts as needed.

ARTICLE IX: POWERS OF EXECUTOR
In addition to powers granted by law, I grant my Executor these specific powers: [LIST SPECIFIC POWERS].

ARTICLE X: NO CONTEST PROVISION
If any beneficiary contests this Will or any provision herein, that beneficiary shall receive nothing under this Will.

ARTICLE XI: SIMULTANEOUS DEATH
If my spouse and I die under circumstances where it cannot be determined who died first, I shall be deemed to have survived my spouse.

IN WITNESS WHEREOF, I sign this Will on [DATE].

[SIGNATURE]
[YOUR NAME]

[WITNESS ATTESTATION AND SIGNATURES]`
  },
  {
    id: 'custom',
    name: 'Custom Will',
    description: 'Start with a blank document and create your will from scratch.',
    content: `LAST WILL AND TESTAMENT

[Enter your custom will content here]`
  }
];

export function WillWizard() {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('My Last Will and Testament');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('basic');
  const [isCreating, setIsCreating] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleTemplateSelection = (templateId: string) => {
    setSelectedTemplate(templateId);
  };
  
  const getSelectedTemplate = () => {
    return WILL_TEMPLATES.find(template => template.id === selectedTemplate) || WILL_TEMPLATES[0];
  };
  
  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const handleCreateWill = async () => {
    try {
      setIsCreating(true);
      
      const template = getSelectedTemplate();
      
      const newWill = await createWill({
        title: title,
        content: template.content,
        status: 'draft',
        document_url: '',
        template_type: template.id,
        ai_generated: false
      });
      
      if (newWill) {
        toast({
          title: "Will created successfully",
          description: "Your new will has been created. You can now edit it.",
        });
        
        // Navigate to the will editor
        navigate(`/will/edit/${newWill.id}`);
      } else {
        throw new Error('Failed to create will');
      }
    } catch (error) {
      console.error('Error creating will:', error);
      toast({
        title: "Error creating will",
        description: "There was a problem creating your will. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Choose a Template</h2>
              <p className="text-gray-600">Select a template for your new will document</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {WILL_TEMPLATES.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedTemplate === template.id 
                      ? 'border-2 border-willtank-500 ring-2 ring-willtank-200' 
                      : 'border border-gray-200'
                  }`}
                  onClick={() => handleTemplateSelection(template.id)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <FileText className="h-6 w-6 text-willtank-600" />
                      {selectedTemplate === template.id && (
                        <div className="bg-willtank-500 text-white rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-medium mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6 max-w-xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Will Details</h2>
              <p className="text-gray-600">Provide basic information about your will</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="will-title">Will Title</Label>
                <Input 
                  id="will-title" 
                  placeholder="Enter a title for your will" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="will-template">Selected Template</Label>
                <Select
                  value={selectedTemplate}
                  onValueChange={(value) => setSelectedTemplate(value)}
                >
                  <SelectTrigger id="will-template">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {WILL_TEMPLATES.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6 max-w-xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Review & Create</h2>
              <p className="text-gray-600">Review your will settings before creating</p>
            </div>
            
            <Card className="border border-gray-200 p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm text-gray-500 font-medium">Will Title</h3>
                  <p>{title}</p>
                </div>
                
                <div>
                  <h3 className="text-sm text-gray-500 font-medium">Template</h3>
                  <p>{getSelectedTemplate().name}</p>
                </div>
                
                <div>
                  <h3 className="text-sm text-gray-500 font-medium">Template Description</h3>
                  <p className="text-sm">{getSelectedTemplate().description}</p>
                </div>
              </div>
            </Card>
            
            <div className="bg-willtank-50 border border-willtank-100 rounded-lg p-4 text-sm">
              <p>
                After creation, you'll be able to edit your will's content, add beneficiaries, 
                and specify other details in the will editor.
              </p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Will</h1>
        <p className="text-gray-600 mt-2">
          Follow the steps below to create your customized will document.
        </p>
      </div>
      
      {/* Step progress indicator */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= stepNumber
                    ? 'bg-willtank-600 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {stepNumber}
              </div>
              <span 
                className={`mt-2 text-sm ${
                  step >= stepNumber ? 'text-gray-800' : 'text-gray-400'
                }`}
              >
                {stepNumber === 1 ? 'Template' : stepNumber === 2 ? 'Details' : 'Review'}
              </span>
            </div>
          ))}
        </div>
        
        <div className="relative mt-2">
          <div className="absolute top-0 h-1 w-full bg-gray-200 rounded"></div>
          <div 
            className="absolute top-0 h-1 bg-willtank-600 rounded transition-all"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Step content */}
      <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm mb-6">
        {renderStepContent()}
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 1}
        >
          Back
        </Button>
        
        {step === 3 ? (
          <Button 
            onClick={handleCreateWill}
            disabled={isCreating}
          >
            {isCreating && <span className="animate-spin mr-2">◌</span>}
            Create Will
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
