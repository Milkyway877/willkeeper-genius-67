
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Music, Sparkles, RefreshCw, Check } from 'lucide-react';

interface VideoEnhancementPanelProps {
  selectedMusic: string | null;
  filters: string[];
  isEnhancing: boolean;
  enhancementProgress: number;
  musicVolume: number;
  enhancedVideoBlob: Blob | null;
  onMusicSelect: (music: string) => void;
  onToggleFilter: (filter: string) => void;
  onMusicVolumeChange: (volume: number) => void;
  onApplyEnhancements: () => Promise<void>;
  videoBlob: Blob | null;
}

export const VideoEnhancementPanel: React.FC<VideoEnhancementPanelProps> = ({
  selectedMusic,
  filters,
  isEnhancing,
  enhancementProgress,
  musicVolume,
  enhancedVideoBlob,
  onMusicSelect,
  onToggleFilter,
  onMusicVolumeChange,
  onApplyEnhancements,
  videoBlob
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Sparkles className="mr-2 h-5 w-5 text-amber-500" />
          Video Enhancements
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Background Music</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Button 
              variant="outline" 
              size="sm"
              className={selectedMusic === 'Inspirational' ? 'border-amber-500 bg-amber-50' : ''}
              onClick={() => onMusicSelect('Inspirational')}
              disabled={isEnhancing}
            >
              <Music className="mr-2 h-4 w-4" />
              Inspirational
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className={selectedMusic === 'Emotional' ? 'border-amber-500 bg-amber-50' : ''}
              onClick={() => onMusicSelect('Emotional')}
              disabled={isEnhancing}
            >
              <Music className="mr-2 h-4 w-4" />
              Emotional
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className={selectedMusic === 'Nostalgic' ? 'border-amber-500 bg-amber-50' : ''}
              onClick={() => onMusicSelect('Nostalgic')}
              disabled={isEnhancing}
            >
              <Music className="mr-2 h-4 w-4" />
              Nostalgic
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className={selectedMusic === 'Celebratory' ? 'border-amber-500 bg-amber-50' : ''}
              onClick={() => onMusicSelect('Celebratory')}
              disabled={isEnhancing}
            >
              <Music className="mr-2 h-4 w-4" />
              Celebratory
            </Button>
          </div>
        </div>
        
        {selectedMusic && (
          <div>
            <Label className="text-sm font-medium">Music Volume: {musicVolume}%</Label>
            <Slider
              defaultValue={[50]}
              max={100}
              step={5}
              value={[musicVolume]}
              onValueChange={(value) => onMusicVolumeChange(value[0])}
              className="mt-2"
              disabled={isEnhancing}
            />
          </div>
        )}
        
        <div>
          <Label className="text-sm font-medium">Video Filters</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Button 
              variant="outline" 
              size="sm"
              className={filters.includes('Warm') ? 'border-amber-500 bg-amber-50' : ''}
              onClick={() => onToggleFilter('Warm')}
              disabled={isEnhancing}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Warm
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className={filters.includes('Vintage') ? 'border-amber-500 bg-amber-50' : ''}
              onClick={() => onToggleFilter('Vintage')}
              disabled={isEnhancing}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Vintage
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className={filters.includes('Dramatic') ? 'border-amber-500 bg-amber-50' : ''}
              onClick={() => onToggleFilter('Dramatic')}
              disabled={isEnhancing}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Dramatic
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className={filters.includes('Soft') ? 'border-amber-500 bg-amber-50' : ''}
              onClick={() => onToggleFilter('Soft')}
              disabled={isEnhancing}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Soft
            </Button>
          </div>
        </div>
        
        <div className="bg-willtank-50 rounded-lg p-3 border border-willtank-100">
          <div className="flex">
            <Sparkles className="h-5 w-5 text-willtank-600 mr-2 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-willtank-700 mb-1">AI Enhancement Ready</h4>
              <p className="text-sm text-gray-600">
                Our AI can enhance your video by adjusting lighting, reducing background noise, and optimizing audio levels using Google Gemini.
              </p>
            </div>
          </div>
          
          {isEnhancing && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-willtank-600">Enhancing video...</span>
                <span className="text-xs font-medium">{enhancementProgress}%</span>
              </div>
              <Progress 
                value={enhancementProgress} 
                className="h-2" 
                indicatorClassName="bg-willtank-500"
              />
            </div>
          )}
          
          <Button 
            className="mt-3 w-full" 
            size="sm"
            onClick={onApplyEnhancements}
            disabled={!videoBlob || isEnhancing}
          >
            {isEnhancing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Applying Gemini AI Enhancements...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Apply AI Enhancements with Gemini
              </>
            )}
          </Button>
        </div>
        
        {enhancedVideoBlob && (
          <div className="bg-green-50 rounded-lg p-3 border border-green-100 mt-4">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">Video Successfully Enhanced</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Your video has been enhanced with {filters.length > 0 ? `${filters.join(", ")} filters` : ""}
              {filters.length > 0 && selectedMusic ? " and " : ""}
              {selectedMusic ? `${selectedMusic} music` : ""}.
              {filters.length === 0 && !selectedMusic ? "AI enhancements" : ""}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
