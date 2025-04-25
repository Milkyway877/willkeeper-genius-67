
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, File, Trash2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadWillDocument, getWillDocuments } from '@/services/willStorageService';
import { bytesToSize } from '@/lib/utils';

interface DocumentsUploaderProps {
  willId: string;
  onComplete: (documents: any[]) => void;
}

export function DocumentsUploader({ willId, onComplete }: DocumentsUploaderProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of files) {
        const uploadedDoc = await uploadWillDocument(willId, file);
        setDocuments(prev => [...prev, uploadedDoc]);
      }
      
      toast({
        title: "Success",
        description: `${files.length} document(s) uploaded successfully.`
      });
    } catch (error) {
      console.error('Error uploading documents:', error);
      toast({
        title: "Error",
        description: "Failed to upload documents. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleComplete = () => {
    onComplete(documents);
  };

  return (
    <div className="space-y-4">
      <div className="bg-willtank-50 border border-willtank-100 rounded-lg p-4">
        <h3 className="font-medium text-willtank-700">Supporting Documents</h3>
        <p className="text-sm text-gray-600">
          Upload any supporting documents for your will, such as property deeds, 
          financial statements, or other important papers.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex justify-center">
              <Button
                variant="outline"
                className="relative"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Select Files
                  </>
                )}
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileUpload}
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  disabled={isUploading}
                />
              </Button>
            </div>

            {documents.length > 0 && (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          {bytesToSize(doc.file_size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleComplete}
          disabled={documents.length === 0}
          className="w-full md:w-auto"
        >
          <Check className="mr-2 h-4 w-4" />
          Continue
        </Button>
      </div>
    </div>
  );
}
