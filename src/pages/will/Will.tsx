import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { FileText, Download, Copy, Clock, Save, Edit, Plus, Loader2, Video, Eye, FileCheck, Lock, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { getWill, getWills, updateWill, Will as WillType } from '@/services/willService';
import { format } from 'date-fns';
import { WillAttachedVideosSection } from './components/WillAttachedVideosSection';
import { WillAttachedDocumentsSection } from './components/WillAttachedDocumentsSection';
import { DocumentPreview } from './components/DocumentPreview';
import { WillContent } from './components/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { downloadProfessionalDocument } from '@/utils/professionalDocumentUtils';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useRandomSubscriptionPrompts } from '@/hooks/useRandomSubscriptionPrompts';
import { RandomSubscriptionPrompt } from './components/RandomSubscriptionPrompt';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Will() {
  const [willContent, setWillContent] = useState("");
  const [willTitle, setWillTitle] = useState("Last Will and Testament");
  const [isEditing, setIsEditing] = useState(false);
  const [lastSaved, setLastSaved] = useState('');
  const [createdDate, setCreatedDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentWill, setCurrentWill] = useState<WillType | null>(null);
  const [noWillsAvailable, setNoWillsAvailable] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'formatted' | 'raw'>('formatted');
  const [signature, setSignature] = useState<string | null>(null);
  const [parsedWillContent, setParsedWillContent] = useState<WillContent | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams(); // Get will ID from URL params
  const [searchParams] = useSearchParams();
  const videoAdded = searchParams.get('videoAdded') === 'true';
  const docsAdded = searchParams.get('docsAdded') === 'true';

  // Add subscription status and prompts
  const { subscriptionStatus } = useSubscriptionStatus();
  const { 
    showPrompt, 
    urgencyLevel, 
    promptCount, 
    timeRemaining,
    formattedTimeRemaining,
    dismissPrompt,
    triggerPrompt 
  } = useRandomSubscriptionPrompts();

  useEffect(() => {
    const fetchWillData = async () => {
      try {
        setIsLoading(true);
        setLoadingError(null);
        setNoWillsAvailable(false);
        
        // If ID is provided in the URL, fetch that specific will
        if (id) {
          const will = await getWill(id);
          if (will) {
            setCurrentWill(will);
            setWillTitle(will.title || "Last Will and Testament");
            
            // Use actual content from the database
            setWillContent(will.content || "");
            
            // Try to parse the content as JSON to create a structured WillContent object
            try {
              // Check if the content is a JSON string
              if (will.content && will.content.trim().startsWith('{')) {
                const parsedContent = JSON.parse(will.content);
                setParsedWillContent(parsedContent);
              } else {
                // If not JSON, create a basic structure from the text content
                setParsedWillContent(createWillContentFromText(will.content || ""));
              }
            } catch (parseError) {
              console.error("Error parsing will content:", parseError);
              // Create a basic structure from the text content
              setParsedWillContent(createWillContentFromText(will.content || ""));
            }
            
            // If there's a signature stored, use it - but since it might be undefined, handle that case
            if (will.signature) {
              setSignature(will.signature);
            }
            
            // Set dates
            if (will.updated_at) {
              setLastSaved(format(new Date(will.updated_at), 'h:mm a'));
            } else {
              setLastSaved(format(new Date(), 'h:mm a'));
            }
            
            if (will.created_at) {
              setCreatedDate(format(new Date(will.created_at), 'MMMM dd, yyyy'));
            } else {
              setCreatedDate('N/A');
            }

            // If videoAdded or docsAdded is true, show success toast
            if (videoAdded && docsAdded) {
              toast({
                title: "Video and Documents Added",
                description: "Your video testament and supporting documents have been added to your will.",
              });
            } else if (videoAdded) {
              toast({
                title: "Video Added Successfully",
                description: "Your video testament has been added to your will.",
              });
            } else if (docsAdded) {
              toast({
                title: "Documents Added Successfully",
                description: "Your supporting documents have been added to your will.",
              });
            }
          } else {
            setLoadingError("Will not found");
            toast({
              title: "Will not found",
              description: "The requested will document could not be found.",
              variant: "destructive"
            });
          }
        } else {
          // No ID provided - try to get the most recently updated will
          const wills = await getWills();
          if (wills && wills.length > 0) {
            // Sort by updated_at in descending order
            const sortedWills = [...wills].sort((a, b) => 
              new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            );
            
            // Redirect to the most recent will
            navigate(`/will/${sortedWills[0].id}`, { replace: true });
            return;
          } else {
            // No wills available - this is not an error, just an empty state
            setNoWillsAvailable(true);
          }
        }
      } catch (error) {
        console.error("Error fetching will data:", error);
        setLoadingError("Error loading will");
        toast({
          title: "Error loading will",
          description: "Could not load your will document. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWillData();
  }, [id, toast, navigate, videoAdded, docsAdded]);

  // Create a WillContent object from text
  const createWillContentFromText = (text: string): WillContent => {
    // Try to extract basic information from the text to create a structured object
    const fullNameMatch = text.match(/I,\s+([^,]+)/);
    const addressMatch = text.match(/residing at\s+([^,\.]+)/);
    const dobMatch = text.match(/born on\s+([^,\.]+)/);
    
    return {
      personalInfo: {
        fullName: fullNameMatch ? fullNameMatch[1].trim() : "Unknown",
        address: addressMatch ? addressMatch[1].trim() : "",
        dateOfBirth: dobMatch ? dobMatch[1].trim() : "",
        email: "",
        phone: ""
      },
      executors: [],
      beneficiaries: [],
      specificBequests: "",
      residualEstate: "",
      finalArrangements: ""
    };
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setWillContent(e.target.value);
  };

  const handleSave = async () => {
    try {
      if (!currentWill) {
        toast({
          title: "Error",
          description: "No will found to update",
          variant: "destructive"
        });
        return;
      }
      
      setIsLoading(true);
      
      // Update existing will with new content, including signature if present
      const updated = await updateWill(currentWill.id, { 
        content: willContent,
        title: willTitle,
        signature: signature, // Include signature in the update
        updated_at: new Date().toISOString()
      });
      
      if (!updated) throw new Error("Failed to update will");
      
      setCurrentWill(updated);
      setIsEditing(false);
      setLastSaved(format(new Date(), 'h:mm a'));
      
      // Also update the parsed content if in raw mode
      if (activeView === 'raw') {
        try {
          if (willContent && willContent.trim().startsWith('{')) {
            setParsedWillContent(JSON.parse(willContent));
          } else {
            setParsedWillContent(createWillContentFromText(willContent));
          }
        } catch (parseError) {
          console.error("Error parsing updated will content:", parseError);
        }
      }
      
      toast({
        title: "Will saved",
        description: "Your will has been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving will:", error);
      toast({
        title: "Error saving will",
        description: "Could not save your will document. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(willContent);
    toast({
      title: "Copied to clipboard",
      description: "Will content has been copied to clipboard.",
    });
  };

  const handleCreateNewWill = () => {
    navigate('/will/create');
  };

  const handleViewAllWills = () => {
    navigate('/wills');
  };

  // Updated download function with subscription protection
  const handleDownloadProfessionalDocument = () => {
    if (!subscriptionStatus.isSubscribed && !subscriptionStatus.isTrial) {
      toast({
        title: "Upgrade Required",
        description: "Download functionality requires a WillTank subscription. Upgrade now to download your will!",
        variant: "destructive"
      });
      triggerPrompt();
      return;
    }

    if (parsedWillContent) {
      downloadProfessionalDocument(
        parsedWillContent,
        signature,
        `${parsedWillContent.personalInfo?.fullName || 'My'}'s Will`
      );
    } else {
      toast({
        title: "Cannot download",
        description: "Unable to generate professional document from this will.",
        variant: "destructive"
      });
    }
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  const isDownloadDisabled = !subscriptionStatus.isSubscribed && !subscriptionStatus.isTrial;

  // Render the will content based on the active view
  const renderWillContent = () => {
    if (activeView === 'formatted' && parsedWillContent) {
      return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <div className="flex items-center">
              <FileText className="text-willtank-700 mr-2" size={18} />
              <h3 className="font-medium">{willTitle}</h3>
            </div>
            <div className="text-xs text-gray-500 flex items-center">
              <Clock size={14} className="mr-1" />
              Last saved at {lastSaved}
            </div>
          </div>
          
          <div className="p-6">
            <DocumentPreview 
              willContent={parsedWillContent} 
              signature={signature}
              documentText={willContent}
            />
          </div>
        </div>
      );
    } else {
      // Raw text view
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <div className="flex items-center">
              <FileText className="text-willtank-700 mr-2" size={18} />
              <h3 className="font-medium">{willTitle}</h3>
            </div>
            <div className="text-xs text-gray-500 flex items-center">
              <Clock size={14} className="mr-1" />
              Last saved at {lastSaved}
            </div>
          </div>
          
          <div className="p-6">
            {isEditing ? (
              <textarea 
                className="w-full h-[500px] p-4 border border-gray-200 rounded-md font-mono text-sm"
                value={willContent}
                onChange={handleContentChange}
              />
            ) : (
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {willContent}
                </pre>
              </div>
            )}
          </div>
        </motion.div>
      );
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Will</h1>
              <p className="text-gray-600">Loading your will document...</p>
            </div>
          </div>
          
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-10 h-10 text-willtank-600 animate-spin" />
          </div>
        </div>
      </Layout>
    );
  }

  if (noWillsAvailable) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Will</h1>
              <p className="text-gray-600">You don't have any wills yet.</p>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleCreateNewWill} variant="default">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Will
              </Button>
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-lg border border-dashed border-gray-300"
          >
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No wills found</h3>
            <p className="mt-1 text-sm text-gray-500 text-center max-w-md">
              You don't have any wills yet. Get started by creating your first will document.
            </p>
            <Button onClick={handleCreateNewWill} className="mt-6">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Will
            </Button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (loadingError) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Will</h1>
              <p className="text-red-600">There was an error loading the will document.</p>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleViewAllWills} variant="outline">
                View All Wills
              </Button>
              <Button onClick={handleCreateNewWill} variant="default">
                <Plus className="mr-2 h-4 w-4" />
                Create New Will
              </Button>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-red-800">{loadingError}</h3>
            <p className="mt-2 text-sm text-red-700">
              Please try again or select a different will.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Layout>
        <div className="max-w-5xl mx-auto">
          {!subscriptionStatus.isSubscribed && !subscriptionStatus.isTrial && (
            <Alert className="mb-6 border-amber-200 bg-amber-50">
              <Clock className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">⏰ 24-Hour Free Access</p>
                    <p className="text-sm">Your will will be deleted after 24 hours. Upgrade to WillTank to keep it safe forever.</p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={handleUpgrade}
                    className="ml-4 bg-amber-600 hover:bg-amber-700"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade Now
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Will</h1>
              <p className="text-gray-600">View and edit your will document.</p>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleViewAllWills} variant="outline">
                View All Wills
              </Button>
              <Button onClick={handleCreateNewWill} variant="default">
                <Plus className="mr-2 h-4 w-4" />
                Create New Will
              </Button>
              {isEditing ? (
                <Button onClick={handleSave} variant="default">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              ) : (
                activeView === 'raw' && (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Will
                  </Button>
                )
              )}
              {activeView === 'raw' && (
                <Button variant="outline" onClick={copyToClipboard}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
              )}
              <Button 
                variant={isDownloadDisabled ? "outline" : "default"}
                onClick={handleDownloadProfessionalDocument}
                disabled={isDownloadDisabled}
                className={isDownloadDisabled ? 'opacity-50' : ''}
              >
                {isDownloadDisabled ? (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Download (Upgrade Required)
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="formatted" className="mb-6" onValueChange={(value) => setActiveView(value as 'formatted' | 'raw')}>
            <TabsList>
              <TabsTrigger value="formatted">
                <Eye className="h-4 w-4 mr-2" />
                Professional View
              </TabsTrigger>
              <TabsTrigger value="raw">
                <FileText className="h-4 w-4 mr-2" />
                Raw Content
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {renderWillContent()}

              {/* Add Video Testament Section */}
              {currentWill && !isLoading && (
                <div className="mt-6">
                  <WillAttachedVideosSection willId={currentWill.id} />
                </div>
              )}
              
              {/* Add Supporting Documents Section */}
              {currentWill && !isLoading && (
                <WillAttachedDocumentsSection willId={currentWill.id} />
              )}
            </div>
            
            <div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
              >
                <h3 className="text-lg font-medium mb-4">Will Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <div className="flex items-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
                      <p className="font-medium text-green-700">
                        {currentWill?.status || 'Draft'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Created On</p>
                    <p className="font-medium">{createdDate}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Last Modified</p>
                    <p className="font-medium">Today at {lastSaved}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Template Type</p>
                    <p className="font-medium">{currentWill?.template_type || 'Custom'}</p>
                  </div>
                  
                  {currentWill?.ai_generated && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Generation Method</p>
                      <div className="flex items-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-blue-500 mr-2"></div>
                        <p className="font-medium text-blue-700">AI Generated</p>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Encryption Status</p>
                    <div className="flex items-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-blue-500 mr-2"></div>
                      <p className="font-medium text-blue-700">AES-256 Encrypted</p>
                    </div>
                  </div>
                </div>
                
                {activeView === 'formatted' && parsedWillContent && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <Button 
                      onClick={handleDownloadProfessionalDocument}
                      disabled={isDownloadDisabled}
                      className={`w-full flex items-center gap-2 ${
                        isDownloadDisabled 
                          ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-willtank-500 to-willtank-600 hover:from-willtank-600 hover:to-willtank-700'
                      }`}
                    >
                      {isDownloadDisabled ? (
                        <>
                          <Lock className="h-4 w-4" />
                          Upgrade Required
                        </>
                      ) : (
                        <>
                          <FileCheck className="h-4 w-4" />
                          Download Official Will
                        </>
                      )}
                    </Button>
                    {isDownloadDisabled && (
                      <p className="text-xs text-center text-gray-600 mt-2">
                        Upgrade to WillTank to download your will
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-willtank-50 rounded-xl border border-willtank-100 p-6"
              >
                <h3 className="text-lg font-medium mb-4">AI Recommendations</h3>
                
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg border border-willtank-100 text-sm">
                    <p className="text-willtank-800 font-medium mb-1">Add digital executor details</p>
                    <p className="text-gray-600">Specify who will manage your online accounts and digital assets.</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-willtank-100 text-sm">
                    <p className="text-willtank-800 font-medium mb-1">Update property inventory</p>
                    <p className="text-gray-600">Your property inventory was last updated 6 months ago.</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-willtank-100 text-sm">
                    <p className="text-willtank-800 font-medium mb-1">Add video testimony</p>
                    <p className="text-gray-600">Recording a video testimony provides additional context to your will.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </Layout>

      <RandomSubscriptionPrompt
        isOpen={showPrompt}
        onClose={dismissPrompt}
        urgencyLevel={urgencyLevel}
        promptCount={promptCount}
        timeRemaining={timeRemaining}
        formattedTimeRemaining={formattedTimeRemaining}
      />
    </>
  );
}
