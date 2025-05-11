
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileText, Download, Folder, FileArchive, Clock, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface UserDetails {
  id: string;
  name: string;
  email?: string;
}

export function ExecutorDocumentsPage() {
  const navigate = useNavigate();
  const { verificationId } = useParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [willContent, setWillContent] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [accessExpiration, setAccessExpiration] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  
  useEffect(() => {
    if (!verificationId) {
      navigate('/executor/login');
      return;
    }
    
    fetchDocuments();
    
    // Set up timer to check session expiration
    const interval = setInterval(checkAccessStatus, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [verificationId]);
  
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('get-executor-documents', {
        body: { verificationId }
      });
      
      if (error || !data?.success) {
        throw new Error(error?.message || data?.error || "Failed to retrieve documents");
      }
      
      setDocuments(data.documents || []);
      setWillContent(data.willContent || null);
      setUserDetails(data.userDetails || null);
      setAccessExpiration(data.expiresAt || null);
      
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to retrieve documents",
        variant: "destructive"
      });
      
      // If serious error, redirect back to login
      setTimeout(() => {
        navigate('/executor/login');
      }, 3000);
    } finally {
      setLoading(false);
    }
  };
  
  const checkAccessStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-executor-access', {
        body: { verificationId }
      });
      
      if (error || !data?.success || data?.expired) {
        toast({
          title: "Access Expired",
          description: "Your access to these documents has expired. Please restart the verification process if needed.",
          variant: "destructive"
        });
        
        setTimeout(() => {
          navigate('/executor/login');
        }, 3000);
      }
    } catch (error) {
      console.error('Error checking access status:', error);
    }
  };
  
  const handleDownloadDocument = async (document: Document) => {
    try {
      // Get a temporary download URL
      const { data, error } = await supabase.functions.invoke('get-document-download-url', {
        body: { 
          verificationId,
          documentId: document.id
        }
      });
      
      if (error || !data?.url) {
        throw new Error(error?.message || data?.error || "Failed to generate download link");
      }
      
      // Create an invisible anchor and trigger download
      const a = document.createElement('a');
      a.href = data.url;
      a.download = document.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: `Downloading ${document.name}`
      });
      
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download document",
        variant: "destructive"
      });
    }
  };
  
  const handleDownloadAllDocuments = async () => {
    try {
      setDownloading(true);
      
      // Request a ZIP of all documents
      const { data, error } = await supabase.functions.invoke('get-all-documents-zip', {
        body: { verificationId }
      });
      
      if (error || !data?.url) {
        throw new Error(error?.message || data?.error || "Failed to generate ZIP download");
      }
      
      // Create an invisible anchor and trigger download
      const a = document.createElement('a');
      a.href = data.url;
      a.download = `${userDetails?.name || 'WillTank'}_Documents.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: "Downloading all documents as ZIP file"
      });
      
      // Notify that access will be revoked
      toast({
        title: "Access Notice",
        description: "Your access will be revoked once the download is complete."
      });
      
      // Wait a bit then redirect
      setTimeout(() => {
        navigate('/executor/download-complete');
      }, 5000);
      
    } catch (error) {
      console.error('Error downloading all documents:', error);
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download documents",
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
    }
  };
  
  // Format expiration time
  const formatExpiresAt = (isoString: string | null) => {
    if (!isoString) return 'Unknown';
    
    try {
      const expiresDate = new Date(isoString);
      return expiresDate.toLocaleString();
    } catch (e) {
      return 'Unknown';
    }
  };
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <RefreshCw className="animate-spin h-8 w-8 text-willtank-600 mb-4" />
        <p>Loading documents...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5 text-willtank-600" />
            {userDetails?.name ? `${userDetails.name}'s Documents` : 'Will Documents'}
          </CardTitle>
          <CardDescription>
            Temporary access to download will and related documents
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Access expiration warning */}
          <Alert variant="default" className="bg-amber-50 border-amber-200">
            <Clock className="h-4 w-4 text-amber-500" />
            <AlertTitle>Limited Access</AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <span>Your access expires at {formatExpiresAt(accessExpiration)}</span>
              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 mt-2 sm:mt-0">
                Temporary Access
              </Badge>
            </AlertDescription>
          </Alert>
          
          {/* Download all button */}
          <div className="flex justify-center">
            <Button 
              size="lg" 
              onClick={handleDownloadAllDocuments} 
              disabled={downloading || !documents.length}
              className="gap-2"
            >
              {downloading ? (
                <>
                  <RefreshCw className="animate-spin h-4 w-4" />
                  Preparing Download...
                </>
              ) : (
                <>
                  <FileArchive className="h-5 w-5" />
                  Download All Documents (ZIP)
                </>
              )}
            </Button>
          </div>
          
          {/* Document tabs */}
          <Tabs defaultValue="will" className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="will">Will</TabsTrigger>
              <TabsTrigger value="documents">Supporting Documents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="will" className="p-4">
              {willContent ? (
                <div className="border rounded-md p-4 bg-white">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Will Document</h3>
                    <Button variant="outline" size="sm" onClick={() => {/* Download will */}}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: willContent }} />
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>No Will Document</AlertTitle>
                  <AlertDescription>
                    No will document was found for this user.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="documents">
              {documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <Folder className="h-5 w-5 text-blue-500 mr-3" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadDocument(doc)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>No Supporting Documents</AlertTitle>
                  <AlertDescription>
                    No additional documents were found.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default ExecutorDocumentsPage;
