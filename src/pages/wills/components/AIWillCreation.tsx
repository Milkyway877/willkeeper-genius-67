
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { WillEditor } from '@/pages/will/components/WillEditor';
import { WillPreview } from '@/pages/will/components/WillPreview';
import { Loader2, Plus, Minus } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

interface AIWillCreationProps {
  templateData: any;
  onComplete: (data: any) => void;
}

// Define a schema for AI Will Creation form
const formSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().min(2, { message: 'Please enter your full name' }),
    address: z.string().min(5, { message: 'Please enter your address' }),
    maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
    spouseName: z.string().optional(),
    hasChildren: z.enum(['yes', 'no']),
    childrenDetails: z.array(z.object({
      name: z.string().min(1, { message: 'Please enter child name' }),
      age: z.string(),
    })).optional(),
  }),
  estateInfo: z.object({
    realEstate: z.array(z.object({
      address: z.string().min(5, { message: 'Please enter property address' }),
      ownership: z.string(),
    })).optional(),
    bankAccounts: z.array(z.object({
      institution: z.string(),
      accountType: z.string(),
    })).optional(),
    investments: z.array(z.object({
      type: z.string(),
      description: z.string(),
    })).optional(),
    personalItems: z.array(z.object({
      description: z.string(),
      estimatedValue: z.string(),
    })).optional(),
  }),
  distributionInfo: z.object({
    primaryBeneficiary: z.string().min(2, { message: 'Please enter primary beneficiary' }),
    specificBequests: z.array(z.object({
      item: z.string(),
      recipient: z.string(),
    })).optional(),
    residuaryEstate: z.string(),
    alternateDistribution: z.string(),
  }),
  executorInfo: z.object({
    executorName: z.string().min(2, { message: 'Please enter executor name' }),
    executorAddress: z.string().min(5, { message: 'Please enter executor address' }),
    executorRelationship: z.string(),
    alternateExecutorName: z.string(),
    alternateExecutorAddress: z.string(),
  }),
  additionalProvisions: z.object({
    guardianName: z.string().optional(),
    guardianAddress: z.string().optional(),
    digitalAssets: z.string().optional(),
    petCare: z.string().optional(),
    funeralWishes: z.string().optional(),
    additionalNotes: z.string().optional(),
  }),
});

export default function AIWillCreation({ templateData, onComplete }: AIWillCreationProps) {
  const [step, setStep] = useState<string>("personalInfo");
  const [children, setChildren] = useState<{ name: string; age: string }[]>([]);
  const [realEstate, setRealEstate] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [personalItems, setPersonalItems] = useState<any[]>([]);
  const [specificBequests, setSpecificBequests] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWill, setGeneratedWill] = useState<string>("");
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personalInfo: {
        fullName: "",
        address: "",
        maritalStatus: "single",
        spouseName: "",
        hasChildren: "no",
        childrenDetails: [],
      },
      estateInfo: {
        realEstate: [],
        bankAccounts: [],
        investments: [],
        personalItems: [],
      },
      distributionInfo: {
        primaryBeneficiary: "",
        specificBequests: [],
        residuaryEstate: "",
        alternateDistribution: "",
      },
      executorInfo: {
        executorName: "",
        executorAddress: "",
        executorRelationship: "",
        alternateExecutorName: "",
        alternateExecutorAddress: "",
      },
      additionalProvisions: {
        guardianName: "",
        guardianAddress: "",
        digitalAssets: "",
        petCare: "",
        funeralWishes: "",
        additionalNotes: "",
      },
    },
  });

  const addChild = () => {
    setChildren([...children, { name: "", age: "" }]);
  };

  const removeChild = (index: number) => {
    const newChildren = [...children];
    newChildren.splice(index, 1);
    setChildren(newChildren);
  };

  const addRealEstate = () => {
    setRealEstate([...realEstate, { address: "", ownership: "" }]);
  };

  const removeRealEstate = (index: number) => {
    const newRealEstate = [...realEstate];
    newRealEstate.splice(index, 1);
    setRealEstate(newRealEstate);
  };

  const addBankAccount = () => {
    setBankAccounts([...bankAccounts, { institution: "", accountType: "" }]);
  };

  const removeBankAccount = (index: number) => {
    const newBankAccounts = [...bankAccounts];
    newBankAccounts.splice(index, 1);
    setBankAccounts(newBankAccounts);
  };

  const addInvestment = () => {
    setInvestments([...investments, { type: "", description: "" }]);
  };

  const removeInvestment = (index: number) => {
    const newInvestments = [...investments];
    newInvestments.splice(index, 1);
    setInvestments(newInvestments);
  };

  const addPersonalItem = () => {
    setPersonalItems([...personalItems, { description: "", estimatedValue: "" }]);
  };

  const removePersonalItem = (index: number) => {
    const newPersonalItems = [...personalItems];
    newPersonalItems.splice(index, 1);
    setPersonalItems(newPersonalItems);
  };

  const addSpecificBequest = () => {
    setSpecificBequests([...specificBequests, { item: "", recipient: "" }]);
  };

  const removeSpecificBequest = (index: number) => {
    const newSpecificBequests = [...specificBequests];
    newSpecificBequests.splice(index, 1);
    setSpecificBequests(newSpecificBequests);
  };

  const generateWill = async (data: z.infer<typeof formSchema>) => {
    setIsGenerating(true);
    try {
      // In a real implementation, this would call an AI service
      // For demo purposes, we'll simulate the AI generation
      setTimeout(() => {
        const templateWill = templateData?.sample || '';
        
        // Very simple placeholder replacement - would be more sophisticated in real implementation
        const generatedText = templateWill
          .replace('[Your Name]', data.personalInfo.fullName)
          .replace('[Executor Name]', data.executorInfo.executorName)
          .replace('[Beneficiary Name]', data.distributionInfo.primaryBeneficiary)
          .replace('[Alternate Beneficiary]', data.distributionInfo.alternateDistribution);
        
        setGeneratedWill(generatedText);
        setIsGenerating(false);
        setStep('review');
        
        toast({
          title: "Will Generated",
          description: "Your will has been generated based on your information.",
        });
      }, 2000);
    } catch (error) {
      console.error("Error generating will:", error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating your will. Please try again.",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };

  const handleWillContentChange = (content: string) => {
    setGeneratedWill(content);
  };

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    if (step === 'review') {
      // Final submission
      onComplete({
        ...data,
        willContent: generatedWill,
      });
    } else {
      // Advance to next step or generate will
      switch (step) {
        case 'personalInfo':
          setStep('estateInfo');
          break;
        case 'estateInfo':
          setStep('distributionInfo');
          break;
        case 'distributionInfo':
          setStep('executorInfo');
          break;
        case 'executorInfo':
          setStep('additionalProvisions');
          break;
        case 'additionalProvisions':
          generateWill(data);
          break;
      }
    }
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="personalInfo.fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Legal Name</FormLabel>
            <FormControl>
              <Input {...field} placeholder="John Michael Doe" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="personalInfo.address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Current Address</FormLabel>
            <FormControl>
              <Textarea {...field} placeholder="123 Main St, Anytown, ST 12345" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="personalInfo.maritalStatus"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Marital Status</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="single" />
                  </FormControl>
                  <FormLabel className="font-normal">Single</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="married" />
                  </FormControl>
                  <FormLabel className="font-normal">Married</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="divorced" />
                  </FormControl>
                  <FormLabel className="font-normal">Divorced</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="widowed" />
                  </FormControl>
                  <FormLabel className="font-normal">Widowed</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {form.watch('personalInfo.maritalStatus') === 'married' && (
        <FormField
          control={form.control}
          name="personalInfo.spouseName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Spouse's Full Legal Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Jane Elizabeth Doe" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      <FormField
        control={form.control}
        name="personalInfo.hasChildren"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Do you have children?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex space-x-4"
              >
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="yes" />
                  </FormControl>
                  <FormLabel className="font-normal">Yes</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="no" />
                  </FormControl>
                  <FormLabel className="font-normal">No</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {form.watch('personalInfo.hasChildren') === 'yes' && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <FormLabel>Children Details</FormLabel>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={addChild}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Child
            </Button>
          </div>
          
          {children.map((child, index) => (
            <div key={index} className="flex gap-4 items-start mb-4">
              <div className="flex-1">
                <FormItem>
                  <FormLabel className="text-xs">Name</FormLabel>
                  <Input 
                    value={child.name}
                    onChange={(e) => {
                      const newChildren = [...children];
                      newChildren[index].name = e.target.value;
                      setChildren(newChildren);
                    }}
                    placeholder="Child's name"
                  />
                </FormItem>
              </div>
              
              <div className="w-24">
                <FormItem>
                  <FormLabel className="text-xs">Age</FormLabel>
                  <Input 
                    value={child.age}
                    onChange={(e) => {
                      const newChildren = [...children];
                      newChildren[index].age = e.target.value;
                      setChildren(newChildren);
                    }}
                    placeholder="Age"
                  />
                </FormItem>
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="mt-6"
                onClick={() => removeChild(index)}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderEstateInfo = () => (
    <div className="space-y-8">
      <div>
        <div className="flex justify-between items-center mb-2">
          <FormLabel>Real Estate Properties</FormLabel>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={addRealEstate}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Property
          </Button>
        </div>
        
        {realEstate.map((property, index) => (
          <Card key={index} className="mb-4">
            <CardContent className="pt-4">
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <FormItem>
                    <FormLabel className="text-xs">Property Address</FormLabel>
                    <Input 
                      value={property.address}
                      onChange={(e) => {
                        const newProperties = [...realEstate];
                        newProperties[index].address = e.target.value;
                        setRealEstate(newProperties);
                      }}
                      placeholder="Property address"
                    />
                  </FormItem>
                </div>
                
                <div className="w-36">
                  <FormItem>
                    <FormLabel className="text-xs">Ownership Type</FormLabel>
                    <Input 
                      value={property.ownership}
                      onChange={(e) => {
                        const newProperties = [...realEstate];
                        newProperties[index].ownership = e.target.value;
                        setRealEstate(newProperties);
                      }}
                      placeholder="Joint/Sole"
                    />
                  </FormItem>
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="mt-6"
                  onClick={() => removeRealEstate(index)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Separator />
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <FormLabel>Bank Accounts</FormLabel>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={addBankAccount}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Account
          </Button>
        </div>
        
        {bankAccounts.map((account, index) => (
          <div key={index} className="flex gap-4 items-start mb-4">
            <div className="flex-1">
              <FormItem>
                <FormLabel className="text-xs">Financial Institution</FormLabel>
                <Input 
                  value={account.institution}
                  onChange={(e) => {
                    const newAccounts = [...bankAccounts];
                    newAccounts[index].institution = e.target.value;
                    setBankAccounts(newAccounts);
                  }}
                  placeholder="Bank name"
                />
              </FormItem>
            </div>
            
            <div className="w-36">
              <FormItem>
                <FormLabel className="text-xs">Account Type</FormLabel>
                <Input 
                  value={account.accountType}
                  onChange={(e) => {
                    const newAccounts = [...bankAccounts];
                    newAccounts[index].accountType = e.target.value;
                    setBankAccounts(newAccounts);
                  }}
                  placeholder="Checking/Savings"
                />
              </FormItem>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="mt-6"
              onClick={() => removeBankAccount(index)}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      
      {/* Simplified - more fields would be included in a real implementation */}
    </div>
  );

  const renderDistributionInfo = () => (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="distributionInfo.primaryBeneficiary"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Primary Beneficiary (who will inherit most of your estate)</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Full legal name" />
            </FormControl>
            <FormDescription>
              This person will receive most of your estate unless specified otherwise.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <FormLabel>Specific Bequests (particular items to specific people)</FormLabel>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={addSpecificBequest}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Bequest
          </Button>
        </div>
        
        {specificBequests.map((bequest, index) => (
          <div key={index} className="flex gap-4 items-start mb-4">
            <div className="flex-1">
              <FormItem>
                <FormLabel className="text-xs">Item Description</FormLabel>
                <Input 
                  value={bequest.item}
                  onChange={(e) => {
                    const newBequests = [...specificBequests];
                    newBequests[index].item = e.target.value;
                    setSpecificBequests(newBequests);
                  }}
                  placeholder="Diamond ring, family heirloom, etc."
                />
              </FormItem>
            </div>
            
            <div className="flex-1">
              <FormItem>
                <FormLabel className="text-xs">Recipient</FormLabel>
                <Input 
                  value={bequest.recipient}
                  onChange={(e) => {
                    const newBequests = [...specificBequests];
                    newBequests[index].recipient = e.target.value;
                    setSpecificBequests(newBequests);
                  }}
                  placeholder="Full legal name"
                />
              </FormItem>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="mt-6"
              onClick={() => removeSpecificBequest(index)}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      
      <FormField
        control={form.control}
        name="distributionInfo.residuaryEstate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Residuary Estate Distribution</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="How should the remainder of your estate be distributed?"
                className="min-h-[100px]"
              />
            </FormControl>
            <FormDescription>
              Specify how you want the remainder of your estate to be distributed.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="distributionInfo.alternateDistribution"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Alternate Distribution Plan</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="If your primary beneficiaries do not survive you..."
                className="min-h-[100px]"
              />
            </FormControl>
            <FormDescription>
              Describe what should happen if your primary beneficiaries do not survive you.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderExecutorInfo = () => (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="executorInfo.executorName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Executor Name</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Full legal name" />
            </FormControl>
            <FormDescription>
              This person will be responsible for carrying out the terms of your will.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="executorInfo.executorAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Executor Address</FormLabel>
            <FormControl>
              <Textarea {...field} placeholder="Full mailing address" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="executorInfo.executorRelationship"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Relationship to Executor</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Spouse, Child, Friend, etc." />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <Separator />
      
      <FormField
        control={form.control}
        name="executorInfo.alternateExecutorName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Alternate Executor Name</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Full legal name" />
            </FormControl>
            <FormDescription>
              This person will serve if your primary executor cannot.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="executorInfo.alternateExecutorAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Alternate Executor Address</FormLabel>
            <FormControl>
              <Textarea {...field} placeholder="Full mailing address" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderAdditionalProvisions = () => (
    <div className="space-y-6">
      {form.watch('personalInfo.hasChildren') === 'yes' && (
        <>
          <FormField
            control={form.control}
            name="additionalProvisions.guardianName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Guardian for Minor Children</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Full legal name" />
                </FormControl>
                <FormDescription>
                  This person will be responsible for the care of your minor children.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="additionalProvisions.guardianAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Guardian Address</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Full mailing address" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Separator />
        </>
      )}
      
      <FormField
        control={form.control}
        name="additionalProvisions.digitalAssets"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Digital Assets</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Instructions for digital assets, social media accounts, etc."
                className="min-h-[100px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="additionalProvisions.petCare"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pet Care Provisions</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Instructions for the care of your pets"
                className="min-h-[100px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="additionalProvisions.funeralWishes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Funeral Wishes</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Any specific wishes regarding funeral arrangements"
                className="min-h-[100px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="additionalProvisions.additionalNotes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Notes or Instructions</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Any other information you want to include in your will"
                className="min-h-[100px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderWillReview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Edit Your Will</h3>
          <WillEditor content={generatedWill} onChange={handleWillContentChange} />
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4">Preview</h3>
          <WillPreview content={generatedWill} />
        </div>
      </div>
    </div>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {step === 'personalInfo' && renderPersonalInfo()}
        {step === 'estateInfo' && renderEstateInfo()}
        {step === 'distributionInfo' && renderDistributionInfo()}
        {step === 'executorInfo' && renderExecutorInfo()}
        {step === 'additionalProvisions' && renderAdditionalProvisions()}
        {step === 'review' && renderWillReview()}
        
        <div className="flex justify-between mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (step === 'estateInfo') setStep('personalInfo');
              else if (step === 'distributionInfo') setStep('estateInfo');
              else if (step === 'executorInfo') setStep('distributionInfo');
              else if (step === 'additionalProvisions') setStep('executorInfo');
              else if (step === 'review') setStep('additionalProvisions');
            }}
            disabled={step === 'personalInfo' || isGenerating}
          >
            Back
          </Button>
          
          <Button type="submit" disabled={isGenerating}>
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {step === 'review' ? 'Save & Continue' : 
             step === 'additionalProvisions' ? 'Generate Will' : 'Continue'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
