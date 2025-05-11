
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Download, File, Clock, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
}

export default function ExecutorDocuments() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  const [error, setError] = useState('');
  
  // Get state passed from the PIN verification page
  const executorEmail = location.state?.executorEmail || '';
  const deceasedName = location.state?.deceasedName || '';
  
  useEffect(() => {
    // If no email or deceased name, redirect back to login
    if (!executorEmail || !deceasedName) {
      navigate('/executor');
      return;
    }
    
    // Load documents
    loadDocuments();
    
    // Set up countdown timer
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Session expired - redirect to expired page
          toast({
            title: 'Session Expired',
            description: 'Your access to these documents has expired for security purposes.',
            variant: 'destructive'
          });
          navigate('/executor/expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [executorEmail, deceasedName, navigate]);
  
  const loadDocuments = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch documents from the database
      
      // For demo purposes, simulate document loading
      setTimeout(() => {
        setDocuments([
          {
            id: 'doc-1',
            name: 'Last Will and Testament',
            type: 'PDF',
            size: '2.4 MB'
          },
          {
            id: 'doc-2',
            name: 'Medical Directives',
            type: 'PDF',
            size: '1.1 MB'
          },
          {
            id: 'doc-3',
            name: 'Digital Asset Instructions',
            type: 'PDF',
            size: '3.2 MB'
          }
        ]);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error loading documents:', error);
      setError('Failed to load documents. Please try again.');
      setLoading(false);
    }
  };
  
  const handleDownload = (documentId: string, documentName: string) => {
    // In a real implementation, this would download the document
    toast({
      title: 'Document Downloaded',
      description: `${documentName} has been downloaded.`
    });
  };
  
  const handleDownloadAll = () => {
    // In a real implementation, this would download all documents as a zip
    toast({
      title: 'Documents Downloaded',
      description: 'All documents have been downloaded as a ZIP file.'
    });
  };
  
  // Format time remaining as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="mx-auto mb-4">
            <Shield className="h-12 w-12 text-willtank-600" />
          </div>
          <CardTitle className="text-center">Will Documents</CardTitle>
          <CardDescription className="text-center">
            Documents for {deceasedName}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex justify-between mb-6">
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertTitle>Limited Access</AlertTitle>
              <AlertDescription>
                Your access expires in <span className="font-medium">{formatTime(timeRemaining)}</span>
              </AlertDescription>
            </Alert>
            
            <Button onClick={handleDownloadAll} variant="default">
              <Download className="mr-2 h-4 w-4" />
              Download All
            </Button>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-3">
            {loading ? (
              <p className="text-center py-10">Loading documents...</p>
            ) : documents.length === 0 ? (
              <div className="text-center py-10">
                <AlertTriangle className="mx-auto h-8 w-8 text-amber-500 mb-2" />
                <p>No documents available.</p>
              </div>
            ) : (
              documents.map(doc => (
                <div key={doc.id} className="flex justify-between items-center border p-4 rounded-md">
                  <div className="flex items-center">
                    <File className="h-6 w-6 mr-3 text-willtank-600" />
                    <div>
                      <h3 className="font-medium">{doc.name}</h3>
                      <p className="text-sm text-gray-500">{doc.type} • {doc.size}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(doc.id, doc.name)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center text-sm">
          <p className="text-center text-gray-500">
            This is a secure access session. These documents are available to you
            as the executor of {deceasedName}'s will.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
