
import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Default avatar options with reliable sources - adding local images for better reliability
const DEFAULT_AVATARS = [
  '/placeholder.svg',
  'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&w=300&h=300&q=80',
  'https://images.unsplash.com/photo-1485833077593-4278bba3f11f?auto=format&fit=crop&w=300&h=300&q=80',
  'https://images.unsplash.com/photo-1501286353178-1ec871214838?auto=format&fit=crop&w=300&h=300&q=80',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&h=300&q=80',
  'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=300&h=300&q=80'
];

interface AvatarLibraryProps {
  onSelect: (url: string) => void;
  selectedUrl?: string | null;
}

export function AvatarLibrary({ onSelect, selectedUrl }: AvatarLibraryProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [loadErrors, setLoadErrors] = useState<Record<number, boolean>>({});
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});
  
  // Pre-load images to check availability
  useEffect(() => {
    DEFAULT_AVATARS.forEach((url, index) => {
      const img = new Image();
      img.onload = () => {
        setImageLoaded(prev => ({...prev, [index]: true}));
      };
      img.onerror = () => {
        setLoadErrors(prev => ({...prev, [index]: true}));
      };
      img.src = `${url}?t=${Date.now()}`;
    });
  }, []);
  
  const handleImageError = (index: number) => {
    console.error(`Avatar image ${index} failed to load:`, DEFAULT_AVATARS[index]);
    setLoadErrors(prev => ({
      ...prev,
      [index]: true
    }));
  };
  
  const handleImageLoaded = (index: number) => {
    setImageLoaded(prev => ({
      ...prev,
      [index]: true
    }));
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Choose from library</h3>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
        {DEFAULT_AVATARS.map((avatarUrl, index) => {
          const isSelected = selectedUrl === avatarUrl;
          const hasError = loadErrors[index];
          const isLoaded = imageLoaded[index];
          
          return (
            <div 
              key={index} 
              className="relative"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <button
                type="button"
                onClick={() => !hasError && onSelect(avatarUrl)}
                className={`
                  relative w-full aspect-square rounded-full overflow-hidden
                  ${isSelected ? 'ring-4 ring-willtank-500' : 'ring-2 ring-gray-200 hover:ring-willtank-300'}
                  ${hasError ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  transition-all duration-200
                `}
                aria-label={`Select avatar ${index + 1}`}
                disabled={hasError}
              >
                <Avatar className="w-full h-full">
                  {!hasError && (
                    <>
                      {!isLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
                          <span className="text-xs text-gray-500">Loading...</span>
                        </div>
                      )}
                      <AvatarImage 
                        src={`${avatarUrl}?t=${Date.now()}`} 
                        alt={`Avatar option ${index + 1}`} 
                        className={`object-cover ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onError={() => handleImageError(index)}
                        onLoad={() => handleImageLoaded(index)}
                      />
                    </>
                  )}
                  <AvatarFallback className="bg-willtank-100 text-willtank-700">
                    {index + 1}
                  </AvatarFallback>
                </Avatar>
                
                {isSelected && !hasError && (
                  <div className="absolute inset-0 bg-willtank-500/20 flex items-center justify-center">
                    <Check className="text-white w-6 h-6 drop-shadow-md" />
                  </div>
                )}
                
                {hoveredIndex === index && !isSelected && !hasError && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Check className="text-white w-5 h-5 opacity-80" />
                  </div>
                )}
                
                {hasError && (
                  <div className="absolute inset-0 bg-gray-200/80 flex items-center justify-center">
                    <span className="text-xs text-gray-600">Unavailable</span>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
