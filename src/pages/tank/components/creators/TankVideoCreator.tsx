
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

// Import refactored components
import { VideoMetadataForm } from './video-creator/VideoMetadataForm';
import { VideoRecordingPanel } from './video-creator/VideoRecordingPanel';
import { VideoEnhancementPanel } from './video-creator/VideoEnhancementPanel';
import { VideoUploader } from './video-creator/VideoUploader';
import { VideoScriptPanel } from './video-creator/VideoScriptPanel';
import { useVideoCreator } from './video-creator/useVideoCreator';

import { MessageCategory } from '../../types';

interface TankVideoCreatorProps {
  onContentChange: (content: string) => void;
  onTitleChange: (title: string) => void;
  onRecipientChange: (recipient: string) => void;
  onCategoryChange: (category: MessageCategory) => void;
  onVideoUrlChange?: (url: string | null) => void;
}

export const TankVideoCreator: React.FC<TankVideoCreatorProps> = ({ 
  onContentChange, 
  onTitleChange,
  onRecipientChange,
  onCategoryChange,
  onVideoUrlChange
}) => {
  const {
    // State
    title,
    recipient,
    isRecording,
    recordingTime,
    videoBlob,
    videoPreviewUrl,
    isPlaying,
    isPreparing,
    isCameraReady,
    activeTab,
    scriptContent,
    musicVolume,
    selectedMusic,
    filters,
    isUploading,
    isEnhancing,
    enhancementProgress,
    enhancedVideoBlob,
    
    // Refs
    videoRef,
    
    // Handlers
    handleTitleChange,
    handleRecipientChange,
    handleScriptChange,
    startRecording,
    stopRecording,
    handlePlayPause,
    resetRecording,
    handleFileUpload,
    handleMusicSelect,
    toggleFilter,
    applyEnhancements,
    handleUseVideo,
    handleRemoveVideo,
    handleMusicVolumeChange,
    setActiveTab
  } = useVideoCreator({
    onContentChange,
    onTitleChange,
    onRecipientChange,
    onCategoryChange,
    onVideoUrlChange
  });

  return (
    <div className="space-y-6">
      <VideoMetadataForm
        title={title}
        recipient={recipient}
        onTitleChange={handleTitleChange}
        onRecipientChange={handleRecipientChange}
      />
      
      <Tabs defaultValue="record" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="record">Record Video</TabsTrigger>
          <TabsTrigger value="upload">Upload Video</TabsTrigger>
          <TabsTrigger value="script">Script & Prep</TabsTrigger>
        </TabsList>
        
        <TabsContent value="record" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VideoRecordingPanel
              videoPreviewUrl={videoPreviewUrl}
              isPlaying={isPlaying}
              isRecording={isRecording}
              isPreparing={isPreparing}
              isCameraReady={isCameraReady}
              recordingTime={recordingTime}
              isUploading={isUploading}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              onPlayPause={handlePlayPause}
              onResetRecording={resetRecording}
              onUseVideo={handleUseVideo}
              videoRef={videoRef}
            />
            
            <VideoEnhancementPanel
              selectedMusic={selectedMusic}
              filters={filters}
              isEnhancing={isEnhancing}
              enhancementProgress={enhancementProgress}
              musicVolume={musicVolume}
              enhancedVideoBlob={enhancedVideoBlob}
              onMusicSelect={handleMusicSelect}
              onToggleFilter={toggleFilter}
              onMusicVolumeChange={handleMusicVolumeChange}
              onApplyEnhancements={applyEnhancements}
              videoBlob={videoBlob}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="upload" className="mt-0">
          <VideoUploader
            videoPreviewUrl={videoPreviewUrl}
            isUploading={isUploading}
            onFileUpload={handleFileUpload}
            onRemoveVideo={handleRemoveVideo}
            onUseVideo={handleUseVideo}
            videoRef={videoRef}
          />
        </TabsContent>
        
        <TabsContent value="script" className="mt-0">
          <VideoScriptPanel
            scriptContent={scriptContent}
            recipient={recipient}
            onScriptChange={handleScriptChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
