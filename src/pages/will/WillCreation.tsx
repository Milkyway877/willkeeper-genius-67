
import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { DigitalSignature } from './components/DigitalSignature';
import { FileUploader } from './components/FileUploader';
import { VideoRecorder } from './components/VideoRecorder';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { File, Upload, Video, Signature, CheckCircle, ChevronRight, Loader2, Save, ArrowRight, X, Check } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { AIQuestionFlow } from './components/AIQuestionFlow';
import { format } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Define the schema for our will form
const willFormSchema = z.object({
  title: z.string().min(2, {
    message: "Will title must be at least 2 characters.",
  }),
  content: z.string().min(50, {
    message: "Will content must be at least 50 characters.",
  }),
  is_public: z.boolean().default(false),
  ai_generated: z.boolean().default(false),
});

export default function WillCreation() {
  const [activeTab, setActiveTab] = useState("content");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [videoRecorded, setVideoRecorded] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [signatureData, setSignatureData] = useState("");
  const [questions, setQuestions] = useState([
    { id: 1, question: "What are your main assets?", answer: "" },
    { id: 2, question: "Who are your primary beneficiaries?", answer: "" },
    { id: 3, question: "Do you have any specific bequests?", answer: "" },
    { id: 4, question: "Who would you like to name as executor?", answer: "" },
    { id: 5, question: "Do you have any funeral preferences?", answer: "" },
  ]);
  
  const navigate = useNavigate();
  const params = useParams();
  const willId = params.id;
  const contentRef = useRef<HTMLTextAreaElement>(null);
  
  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof willFormSchema>>({
    resolver: zodResolver(willFormSchema),
    defaultValues: {
      title: "",
      content: "",
      is_public: false,
      ai_generated: false,
    },
  });
  
  // Check if all questions have been answered
  const allQuestionsAnswered = questions.every(q => q.answer.trim().length > 0);
  
  useEffect(() => {
    // If we have a will ID, fetch the will data
    if (willId) {
      fetchWillData();
    }
  }, [willId]);
  
  const fetchWillData = async () => {
    try {
      const { data, error } = await supabase
        .from('wills')
        .select('*')
        .eq('id', willId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        // Populate the form with existing data
        form.reset({
          title: data.title || "",
          content: data.content || "",
          is_public: data.is_public || false,
          ai_generated: data.ai_generated || false,
        });
        
        // If it's AI generated, update the questions and generated content
        if (data.ai_generated && data.metadata?.questions) {
          setQuestions(data.metadata.questions);
          setGeneratedContent(data.content || "");
        }
        
        // If there's a signature, set it
        if (data.metadata?.signature) {
          setSignatureData(data.metadata.signature);
        }
        
        // If there's a video recording, mark it as recorded
        if (data.metadata?.video_url) {
          setVideoRecorded(true);
        }
      }
    } catch (error) {
      console.error('Error fetching will data:', error);
      toast({
        title: "Error",
        description: "Failed to load will data. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const generateWillContent = async () => {
    try {
      setIsGenerating(true);
      
      // Check if all questions have been answered
      if (!allQuestionsAnswered) {
        toast({
          title: "Incomplete Information",
          description: "Please answer all questions to generate your will.",
          variant: "destructive"
        });
        setIsGenerating(false);
        return;
      }
      
      // Create content based on questions and answers
      const content = `
Last Will and Testament of ${questions.find(q => q.question.includes("name"))?.answer || "[Your Name]"}

I, ${questions.find(q => q.question.includes("name"))?.answer || "[Your Name]"}, being of sound mind and disposing memory, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking any and all wills and codicils by me heretofore made.

ARTICLE I: PERSONAL INFORMATION
I am currently residing at ${questions.find(q => q.question.includes("address"))?.answer || "[Your Address]"}.

ARTICLE II: APPOINTMENT OF EXECUTOR
I hereby appoint ${questions.find(q => q.question.includes("executor"))?.answer || "[Executor Name]"} as Executor of this, my Last Will and Testament. If this person is unable or unwilling to serve, then I appoint [Alternate Executor] as alternate Executor.

ARTICLE III: DISTRIBUTION OF ASSETS
My primary assets include: ${questions.find(q => q.question.includes("assets"))?.answer || "[List of Assets]"}.

I hereby give, devise, and bequeath my assets as follows:
${questions.find(q => q.question.includes("beneficiaries"))?.answer || "[Beneficiary Information]"}

Specific bequests:
${questions.find(q => q.question.includes("bequests"))?.answer || "[Specific Bequests]"}

ARTICLE IV: FUNERAL ARRANGEMENTS
My funeral preferences are as follows:
${questions.find(q => q.question.includes("funeral"))?.answer || "[Funeral Preferences]"}

IN WITNESS WHEREOF, I have hereunto set my hand and seal this ${format(new Date(), "do 'day of' MMMM, yyyy")}.

Signed: ________________________
      `;
      
      // Set the generated content
      setGeneratedContent(content);
      
      // Update the form value
      form.setValue("content", content);
      form.setValue("ai_generated", true);
      
      // Move to the content tab
      setActiveTab("content");
      
      toast({
        title: "Will Generated",
        description: "Your will has been generated based on your answers. You can now review and edit it."
      });
      
      // Scroll to content if it exists
      if (contentRef.current) {
        contentRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error('Error generating will content:', error);
      toast({
        title: "Error",
        description: "Failed to generate will content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const onSubmit = async (values: z.infer<typeof willFormSchema>) => {
    try {
      setIsSaving(true);
      
      // Get the current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to save your will.",
          variant: "destructive"
        });
        setIsSaving(false);
        return;
      }
      
      // Prepare will data
      const willData = {
        user_id: session.user.id,
        title: values.title,
        content: values.content,
        is_public: values.is_public,
        ai_generated: values.ai_generated,
        status: "draft",
        metadata: {
          questions: questions,
          signature: signatureData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
      
      let response;
      
      if (willId) {
        // Update existing will
        response = await supabase
          .from('wills')
          .update(willData)
          .eq('id', willId);
      } else {
        // Create new will
        response = await supabase
          .from('wills')
          .insert(willData);
      }
      
      if (response.error) throw response.error;
      
      // Create a notification
      await supabase.from('notifications').insert({
        user_id: session.user.id,
        title: willId ? 'Will Updated' : 'Will Created',
        description: `Your will "${values.title}" has been ${willId ? 'updated' : 'created'}.`,
        type: 'info',
        read: false
      });
      
      toast({
        title: willId ? "Will Updated" : "Will Created",
        description: `Your will has been ${willId ? 'updated' : 'created'} successfully.`,
      });
      
      // Navigate back to the will dashboard
      navigate('/dashboard/will');
    } catch (error) {
      console.error('Error saving will:', error);
      toast({
        title: "Error",
        description: "Failed to save your will. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const updateQuestion = (id: number, answer: string) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, answer } : q
    ));
  };
  
  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{willId ? "Edit Will" : "Create New Will"}</h1>
          <p className="text-gray-600">Create your legal will by filling out the form below.</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="p-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Will Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. My Last Will and Testament" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive title for your will
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="ai">AI Assistant</TabsTrigger>
                <TabsTrigger value="content">Will Content</TabsTrigger>
                <TabsTrigger value="attachments">Attachments</TabsTrigger>
                <TabsTrigger value="signature">Signature</TabsTrigger>
              </TabsList>
              
              <TabsContent value="ai" className="mt-4">
                <Card className="p-6">
                  <h2 className="text-xl font-medium mb-4">Create Your Will with AI Assistance</h2>
                  <p className="mb-6 text-gray-600">
                    Answer the questions below and our AI will help you create a basic will. You can edit the generated content afterward.
                  </p>
                  
                  <AIQuestionFlow 
                    questions={questions} 
                    onUpdateAnswer={updateQuestion} 
                  />
                  
                  <div className="mt-6 flex justify-between">
                    <div>
                      {!allQuestionsAnswered && (
                        <p className="text-amber-600 text-sm flex items-center">
                          <X className="mr-1 h-4 w-4" />
                          Please answer all questions before generating
                        </p>
                      )}
                      
                      {allQuestionsAnswered && (
                        <p className="text-green-600 text-sm flex items-center">
                          <Check className="mr-1 h-4 w-4" />
                          All questions answered
                        </p>
                      )}
                    </div>
                    
                    <Button 
                      type="button" 
                      onClick={generateWillContent} 
                      disabled={isGenerating || !allQuestionsAnswered}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          Generate Will
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="content" className="mt-4">
                <Card className="p-6">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Will Content</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter the content of your will here..."
                            className="min-h-[400px] font-mono"
                            ref={contentRef}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Write or edit the content of your will. Be specific about your assets, beneficiaries, and wishes.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name="is_public"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Make Will Public</FormLabel>
                            <FormDescription>
                              Allow your will to be viewed by designated individuals even before activation.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="attachments" className="mt-4">
                <Card className="p-6">
                  <h2 className="text-xl font-medium mb-4">Attachments & Video Testament</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Upload Documents</h3>
                      <p className="text-gray-600 mb-4">
                        Upload any supporting documents such as asset inventories, property deeds, etc.
                      </p>
                      
                      <FileUploader 
                        onFilesUploaded={(files) => {
                          setUploadedFiles(files);
                          toast({
                            title: "Files Uploaded",
                            description: `${files.length} files uploaded successfully.`,
                          });
                        }}
                      />
                      
                      {uploadedFiles.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium">Uploaded Files:</p>
                          <ul className="list-disc pl-5 mt-2">
                            {uploadedFiles.map((file, index) => (
                              <li key={index} className="text-sm text-gray-600">
                                {file.name} ({(file.size / 1024).toFixed(2)} KB)
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Video Testament</h3>
                      <p className="text-gray-600 mb-4">
                        Record a video explaining your wishes to add clarity to your written will.
                      </p>
                      
                      <VideoRecorder 
                        onRecordingComplete={() => {
                          setVideoRecorded(true);
                          toast({
                            title: "Video Recorded",
                            description: "Your video testament has been recorded.",
                          });
                        }}
                        isRecorded={videoRecorded}
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="signature" className="mt-4">
                <Card className="p-6">
                  <h2 className="text-xl font-medium mb-4">Digital Signature</h2>
                  <p className="text-gray-600 mb-6">
                    Sign your will by drawing your signature below. This will be digitally attached to your will.
                  </p>
                  
                  <DigitalSignature 
                    onSignatureCapture={(data) => {
                      setSignatureData(data);
                      toast({
                        title: "Signature Captured",
                        description: "Your digital signature has been saved.",
                      });
                    }}
                    existingSignature={signatureData}
                  />
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/dashboard/will')}
              >
                Cancel
              </Button>
              
              <div className="flex space-x-2">
                <Button 
                  type="submit"
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
                      {willId ? "Update Will" : "Save Will"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
}
