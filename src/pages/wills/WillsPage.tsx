
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FileText, Video, Upload, Check, Shield, Signature, Save } from 'lucide-react';
import { getWills } from '@/services/willService';
import { useQuery } from '@tanstack/react-query';
import WillTemplateSelector from './components/WillTemplateSelector';
import AIWillCreation from './components/AIWillCreation';
import VideoTestament from './components/VideoTestament';
import DocumentUploader from './components/DocumentUploader';
import AILegalCheck from './components/AILegalCheck';
import DigitalSigning from './components/DigitalSigning';

export default function WillsPage() {
  const [activeTab, setActiveTab] = useState('templates');
  const [willData, setWillData] = useState<any>(null);
  const [videoRecorded, setVideoRecorded] = useState(false);
  const [documentsUploaded, setDocumentsUploaded] = useState(false);
  const [legalCheckPassed, setLegalCheckPassed] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch existing wills
  const { data: wills, isLoading } = useQuery({
    queryKey: ['wills'],
    queryFn: getWills,
  });

  const handleTemplateSelect = (template: any) => {
    setWillData({ template });
    setActiveTab('ai-creation');
    toast({
      title: 'Template Selected',
      description: `You've selected the ${template.title} template.`,
    });
  };

  const handleAIWillCreation = (willInfo: any) => {
    setWillData({ ...willData, ...willInfo });
    setActiveTab('video-testament');
    toast({
      title: 'Will Information Saved',
      description: 'Your will information has been processed by our AI.',
    });
  };

  const handleVideoRecorded = (videoUrl: string) => {
    setWillData({ ...willData, videoTestament: videoUrl });
    setVideoRecorded(true);
    setActiveTab('document-upload');
    toast({
      title: 'Video Testament Recorded',
      description: 'Your video testament has been saved successfully.',
    });
  };

  const handleDocumentsUploaded = (documents: any[]) => {
    setWillData({ ...willData, supportingDocuments: documents });
    setDocumentsUploaded(true);
    setActiveTab('legal-check');
    toast({
      title: 'Documents Uploaded',
      description: 'Your supporting documents have been uploaded successfully.',
    });
  };

  const handleLegalCheckComplete = (results: any) => {
    setWillData({ ...willData, legalCheck: results });
    setLegalCheckPassed(true);
    setActiveTab('digital-signing');
    toast({
      title: 'Legal Check Complete',
      description: results.passed 
        ? 'Your will has passed our legal validation.' 
        : 'Your will needs some adjustments.',
    });
  };

  const handleWillSigned = (signature: string) => {
    setWillData({ ...willData, signature });
    toast({
      title: 'Will Signed Successfully',
      description: 'Your will has been signed and securely stored.',
    });
    navigate('/wills'); // Navigate back to the wills listing
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Will Creation</h1>
            <p className="mt-2 text-lg text-gray-600">
              Create a legally sound will to protect your assets and loved ones.
            </p>
          </div>
          
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-willtank-100 p-3 rounded-full">
                    <FileText className="h-6 w-6 text-willtank-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Will Creation Process</h3>
                    <p className="text-gray-500">Follow these steps to create your will</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => navigate('/wills')}>
                    Cancel
                  </Button>
                  <Button onClick={() => navigate('/wills')}>
                    Save & Exit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex gap-6">
              <div className={`flex items-center gap-2 ${activeTab === 'templates' ? 'text-willtank-600 font-medium' : 'text-gray-500'}`}>
                <div className={`h-6 w-6 rounded-full flex items-center justify-center ${activeTab === 'templates' ? 'bg-willtank-600 text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span>Choose Template</span>
              </div>
              <div className={`flex items-center gap-2 ${activeTab === 'ai-creation' ? 'text-willtank-600 font-medium' : 'text-gray-500'}`}>
                <div className={`h-6 w-6 rounded-full flex items-center justify-center ${activeTab === 'ai-creation' ? 'bg-willtank-600 text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <span>AI Creation</span>
              </div>
              <div className={`flex items-center gap-2 ${activeTab === 'video-testament' ? 'text-willtank-600 font-medium' : 'text-gray-500'}`}>
                <div className={`h-6 w-6 rounded-full flex items-center justify-center ${activeTab === 'video-testament' ? 'bg-willtank-600 text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <span>Video Testament</span>
              </div>
              <div className={`flex items-center gap-2 ${activeTab === 'document-upload' ? 'text-willtank-600 font-medium' : 'text-gray-500'}`}>
                <div className={`h-6 w-6 rounded-full flex items-center justify-center ${activeTab === 'document-upload' ? 'bg-willtank-600 text-white' : 'bg-gray-200'}`}>
                  4
                </div>
                <span>Documents</span>
              </div>
              <div className={`flex items-center gap-2 ${activeTab === 'legal-check' ? 'text-willtank-600 font-medium' : 'text-gray-500'}`}>
                <div className={`h-6 w-6 rounded-full flex items-center justify-center ${activeTab === 'legal-check' ? 'bg-willtank-600 text-white' : 'bg-gray-200'}`}>
                  5
                </div>
                <span>Legal Check</span>
              </div>
              <div className={`flex items-center gap-2 ${activeTab === 'digital-signing' ? 'text-willtank-600 font-medium' : 'text-gray-500'}`}>
                <div className={`h-6 w-6 rounded-full flex items-center justify-center ${activeTab === 'digital-signing' ? 'bg-willtank-600 text-white' : 'bg-gray-200'}`}>
                  6
                </div>
                <span>Sign & Save</span>
              </div>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="templates">
              <Card>
                <CardHeader>
                  <CardTitle>Select a Will Template</CardTitle>
                  <CardDescription>
                    Choose from our legally sound templates or create a custom will with AI assistance.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WillTemplateSelector onSelectTemplate={handleTemplateSelect} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai-creation">
              <Card>
                <CardHeader>
                  <CardTitle>AI-Powered Will Creation</CardTitle>
                  <CardDescription>
                    Our AI will guide you through creating a personalized will.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AIWillCreation 
                    templateData={willData?.template} 
                    onComplete={handleAIWillCreation} 
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="video-testament">
              <Card>
                <CardHeader>
                  <CardTitle>Record Your Video Testament</CardTitle>
                  <CardDescription>
                    Record a video testament to complement your written will.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <VideoTestament onComplete={handleVideoRecorded} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="document-upload">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Supporting Documents</CardTitle>
                  <CardDescription>
                    Add important documents like deeds, financial records, or other legal files.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentUploader onComplete={handleDocumentsUploaded} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="legal-check">
              <Card>
                <CardHeader>
                  <CardTitle>AI Legal Check</CardTitle>
                  <CardDescription>
                    Our AI will analyze your will for legal accuracy and potential issues.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AILegalCheck 
                    willData={willData} 
                    onComplete={handleLegalCheckComplete} 
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="digital-signing">
              <Card>
                <CardHeader>
                  <CardTitle>Digital Signing</CardTitle>
                  <CardDescription>
                    Sign your will digitally to complete the process.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DigitalSigning 
                    willData={willData} 
                    onComplete={handleWillSigned} 
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </Layout>
  );
}
