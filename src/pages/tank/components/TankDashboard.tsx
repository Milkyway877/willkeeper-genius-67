
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Video, Upload, Plus, FileText, Image, Link, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { VideoRecorder } from '@/pages/will/components/VideoRecorder';
import { AttachWillToMedia } from './AttachWillToMedia';

export function TankDashboard() {
  const [activeTab, setActiveTab] = useState('videos');
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [userVideos, setUserVideos] = useState<any[]>([]);
  const [userDocuments, setUserDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserMedia = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          throw new Error('User not authenticated');
        }

        // Fetch videos
        const { data: videos, error: videosError } = await supabase
          .from('will_videos')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
          
        if (videosError) {
          console.error('Error fetching videos:', videosError);
        } else {
          setUserVideos(videos || []);
        }

        // Fetch documents
        const { data: docs, error: docsError } = await supabase
          .from('will_documents')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
          
        if (docsError) {
          console.error('Error fetching documents:', docsError);
        } else {
          setUserDocuments(docs || []);
        }
      } catch (error) {
        console.error('Error fetching user media:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your stored media.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserMedia();
  }, [toast]);

  const handleVideoRecordingComplete = async (blob: Blob) => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      // Generate filename
      const userId = session.user.id;
      const filename = `${userId}/${Date.now()}.webm`;
      const bucketId = 'will_videos';
      
      // Upload to storage
      const { data, error } = await supabase.storage
        .from(bucketId)
        .upload(filename, blob, {
          contentType: 'video/webm',
          cacheControl: '3600'
        });
        
      if (error) {
        throw error;
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketId)
        .getPublicUrl(filename);
        
      // Create database entry
      const { data: videoRecord, error: dbError } = await supabase
        .from('will_videos')
        .insert({
          user_id: session.user.id,
          file_path: filename,
          duration: 0 // You could calculate actual duration if needed
        })
        .select()
        .single();
        
      if (dbError) {
        throw dbError;
      }
      
      setSelectedVideoId(videoRecord.id);
      setUserVideos(prev => [videoRecord, ...prev]);
      
      toast({
        title: 'Video Recorded Successfully',
        description: 'Your video has been saved. You can now attach it to a will.'
      });
      
      setShowVideoRecorder(false);
    } catch (error: any) {
      console.error('Error saving video:', error);
      toast({
        title: 'Error Saving Video',
        description: error.message || 'An error occurred while saving your video.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const attachVideoToWill = async (willId: string) => {
    if (!selectedVideoId) return;
    
    try {
      const { error } = await supabase
        .from('will_videos')
        .update({ will_id: willId })
        .eq('id', selectedVideoId);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error attaching video to will:', error);
      throw error;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('User not authenticated');
      }
      
      const file = files[0];
      const userId = session.user.id;
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/documents/${Date.now()}-${file.name}`;
      const bucketId = 'will_documents';
      
      // Upload file
      const { error: uploadError } = await supabase.storage
        .from(bucketId)
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketId)
        .getPublicUrl(filePath);
        
      // Create database entry
      const { data: docRecord, error: dbError } = await supabase
        .from('will_documents')
        .insert({
          user_id: session.user.id,
          name: file.name,
          document_type: fileExt,
          file_path: filePath,
          content_type: file.type,
          file_size: file.size
        })
        .select()
        .single();
        
      if (dbError) throw dbError;
      
      setUserDocuments(prev => [docRecord, ...prev]);
      
      toast({
        title: 'Document Uploaded Successfully',
        description: 'Your document has been saved. You can now attach it to a will.'
      });
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Error Uploading Document',
        description: error.message || 'An error occurred while uploading your document.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="videos">
            <Video className="h-4 w-4 mr-2" />
            Video Testimonials
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="videos" className="space-y-6">
          {showVideoRecorder ? (
            <Card>
              <CardHeader>
                <CardTitle>Record Video Testament</CardTitle>
              </CardHeader>
              <CardContent>
                <VideoRecorder onRecordingComplete={handleVideoRecordingComplete} />
              </CardContent>
            </Card>
          ) : (
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Video Testimonials</h2>
              <Button onClick={() => setShowVideoRecorder(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Record New Video
              </Button>
            </div>
          )}
          
          {selectedVideoId && (
            <AttachWillToMedia 
              mediaId={selectedVideoId} 
              mediaType="video" 
              onAttach={attachVideoToWill}
            />
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <Card className="p-6 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-willtank-200 border-t-willtank-600 rounded-full mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading videos...</p>
              </Card>
            ) : userVideos.length > 0 ? (
              userVideos.map((video) => (
                <Card key={video.id} className="overflow-hidden">
                  <div className="aspect-video bg-gray-100 relative">
                    {video.thumbnail_path ? (
                      <img 
                        src={supabase.storage.from('will_videos').getPublicUrl(video.thumbnail_path).data.publicUrl} 
                        alt="Video thumbnail" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <Video className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button 
                        variant="secondary" 
                        className="rounded-full h-12 w-12 flex items-center justify-center"
                        onClick={() => setSelectedVideoId(video.id)}
                      >
                        <Play className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Video Testament</p>
                        <p className="text-sm text-gray-500">
                          {new Date(video.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {video.will_id && (
                        <Badge variant="outline" className="ml-2">
                          <Link className="h-3 w-3 mr-1" />
                          Attached
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="p-6 text-center col-span-full">
                <Video className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-4 text-gray-500">No videos recorded yet</p>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => setShowVideoRecorder(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Record Your First Video Testament
                </Button>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="documents" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Documents</h2>
            <label htmlFor="document-upload" className="cursor-pointer">
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
              <input
                id="document-upload"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              />
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <Card className="p-6 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-willtank-200 border-t-willtank-600 rounded-full mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading documents...</p>
              </Card>
            ) : userDocuments.length > 0 ? (
              userDocuments.map((doc) => (
                <Card key={doc.id} className="overflow-hidden">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    {doc.document_type?.match(/jpe?g|png|gif|webp/i) ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={supabase.storage.from('will_documents').getPublicUrl(doc.file_path).data.publicUrl} 
                          alt={doc.name} 
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute bottom-2 right-2">
                          <Badge>
                            <Image className="h-3 w-3 mr-1" />
                            Image
                          </Badge>
                        </div>
                      </div>
                    ) : doc.document_type?.match(/pdf/i) ? (
                      <FileText className="h-16 w-16 text-red-400" />
                    ) : doc.document_type?.match(/docx?/i) ? (
                      <FileText className="h-16 w-16 text-blue-400" />
                    ) : (
                      <FileText className="h-16 w-16 text-gray-400" />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium truncate max-w-xs" title={doc.name}>
                          {doc.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {doc.will_id && (
                        <Badge variant="outline" className="ml-2">
                          <Link className="h-3 w-3 mr-1" />
                          Attached
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="p-6 text-center col-span-full">
                <FileText className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-4 text-gray-500">No documents uploaded yet</p>
                <label htmlFor="empty-document-upload" className="cursor-pointer">
                  <Button 
                    variant="outline" 
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Your First Document
                  </Button>
                  <input
                    id="empty-document-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  />
                </label>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
