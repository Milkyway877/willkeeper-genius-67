
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { FileUploader } from './will/components/FileUploader';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, Mail, Video, FileText, AtSign, Pencil, User, CalendarDays, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const messageSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.',
  }),
  recipient_name: z.string().min(2, {
    message: 'Recipient name is required.',
  }),
  recipient_email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  message_type: z.enum(['email', 'video', 'document']),
  delivery_date: z.date({
    required_error: 'Please select a delivery date.',
  }).refine(date => date > new Date(), {
    message: 'Delivery date must be in the future.',
  }),
  preview: z.string().min(10, {
    message: 'Preview/message content must be at least 10 characters.',
  }),
  add_encryption: z.boolean().default(false),
});

export default function FutureMessage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      title: '',
      recipient_name: '',
      recipient_email: '',
      message_type: 'email',
      preview: '',
      add_encryption: false,
    },
  });
  
  const messageType = form.watch('message_type');
  
  const onSubmit = async (values: z.infer<typeof messageSchema>) => {
    try {
      setIsSaving(true);
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to save your message",
          variant: "destructive"
        });
        setIsSaving(false);
        return;
      }
      
      // For document and video types, we need a file
      if ((messageType === 'document' || messageType === 'video') && uploadedFiles.length === 0) {
        toast({
          title: "File Required",
          description: `Please upload a ${messageType} before saving`,
          variant: "destructive"
        });
        setIsSaving(false);
        return;
      }
      
      // Upload file if present
      let fileUrl = '';
      if (uploadedFiles.length > 0) {
        const file = uploadedFiles[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
        
        // Upload to appropriate bucket based on message type
        const bucket = messageType === 'video' ? 'future_videos' : 'future_documents';
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file);
          
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(uploadData.path);
          
        fileUrl = publicUrlData.publicUrl;
      }
      
      // Save message to database
      const { data: message, error: messageError } = await supabase
        .from('future_messages')
        .insert({
          user_id: session.user.id,
          title: values.title,
          recipient_name: values.recipient_name,
          recipient_email: values.recipient_email,
          message_type: values.message_type,
          delivery_date: values.delivery_date.toISOString(),
          preview: values.preview,
          message_url: fileUrl,
          status: 'Scheduled'
        })
        .select()
        .single();
        
      if (messageError) throw messageError;
      
      // Create a notification about the created message
      await supabase.from('notifications').insert({
        user_id: session.user.id,
        title: 'Future Message Scheduled',
        description: `Your message "${values.title}" has been scheduled for delivery on ${format(values.delivery_date, 'PPP')}.`,
        type: 'info',
        read: false
      });
      
      toast({
        title: "Message Scheduled",
        description: `Your message will be delivered on ${format(values.delivery_date, 'PPP')}.`,
      });
      
      // Redirect to Tank page
      navigate("/tank");
    } catch (error) {
      console.error('Error creating future message:', error);
      toast({
        title: "Error",
        description: "Failed to schedule your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Future Message</h1>
          <p className="text-gray-600">Schedule a message to be delivered to someone in the future.</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-medium mb-4 flex items-center">
                  <Pencil className="h-5 w-5 mr-2 text-willtank-600" />
                  Message Details
                </h2>
                
                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. My Final Thoughts" {...field} />
                        </FormControl>
                        <FormDescription>
                          A descriptive title for your message
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="recipient_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recipient Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input className="pl-10" placeholder="John Doe" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="recipient_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recipient Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <AtSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input className="pl-10" placeholder="recipient@example.com" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="message_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a message type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="email">
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-2 text-willtank-600" />
                                <span>Email Message</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="video">
                              <div className="flex items-center">
                                <Video className="h-4 w-4 mr-2 text-willtank-600" />
                                <span>Video Message</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="document">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-willtank-600" />
                                <span>Document</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {messageType === 'email' && "Text message delivered via email"}
                          {messageType === 'video' && "Video message delivered via a secure link"}
                          {messageType === 'document' && "Document delivered via a secure link"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="delivery_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Delivery Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className="w-full pl-3 text-left font-normal flex justify-between items-center"
                              >
                                <div className="flex items-center">
                                  <CalendarDays className="mr-2 h-4 w-4 text-gray-500" />
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span className="text-gray-400">Pick a date</span>
                                  )}
                                </div>
                                <CalendarIcon className="h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          When the message should be delivered
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-medium mb-4">Message Content</h2>
                
                {messageType === 'email' && (
                  <FormField
                    control={form.control}
                    name="preview"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Type your message here..."
                            className="min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {messageType === 'video' && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="preview"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Video Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Add a description for this video..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div>
                      <Label>Upload Video</Label>
                      <div className="mt-2">
                        <FileUploader 
                          onFilesUploaded={(files) => {
                            setUploadedFiles(files);
                            toast({
                              title: "Video Uploaded",
                              description: "Your video has been uploaded successfully.",
                            });
                          }}
                        />
                      </div>
                      {uploadedFiles.length === 0 && (
                        <p className="text-sm text-amber-600 mt-2 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          A video file is required
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {messageType === 'document' && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="preview"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Document Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Add a description for this document..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div>
                      <Label>Upload Document</Label>
                      <div className="mt-2">
                        <FileUploader 
                          onFilesUploaded={(files) => {
                            setUploadedFiles(files);
                            toast({
                              title: "Document Uploaded",
                              description: "Your document has been uploaded successfully.",
                            });
                          }}
                        />
                      </div>
                      {uploadedFiles.length === 0 && (
                        <p className="text-sm text-amber-600 mt-2 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          A document file is required
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-medium mb-4">Security Options</h2>
                
                <FormField
                  control={form.control}
                  name="add_encryption"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enhanced Encryption</FormLabel>
                        <FormDescription>
                          Add additional encryption to your future message
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
              
              <div className="flex justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/tank')}
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>Schedule Message</>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
}
