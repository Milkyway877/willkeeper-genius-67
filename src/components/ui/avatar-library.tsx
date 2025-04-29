
import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Default avatar options - in a real app, these would be loaded from a service
const DEFAULT_AVATARS = [
  '/placeholder.svg',
  'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&w=300&h=300',
  'https://images.unsplash.com/photo-1485833077593-4278bba3f11f?auto=format&fit=crop&w=300&h=300',
  'https://images.unsplash.com/photo-1501286353178-1ec881214838?auto=format&fit=crop&w=300&h=300',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&h=300',
  'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=300&h=300'
];

interface AvatarLibraryProps {
  onSelect: (url: string) => void;
  selectedUrl?: string | null;
}

export function AvatarLibrary({ onSelect, selectedUrl }: AvatarLibraryProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Choose from library</h3>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
        {DEFAULT_AVATARS.map((avatarUrl, index) => {
          const isSelected = selectedUrl === avatarUrl;
          
          return (
            <div 
              key={index} 
              className="relative"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <button
                type="button"
                onClick={() => onSelect(avatarUrl)}
                className={`
                  relative w-full aspect-square rounded-full overflow-hidden
                  ${isSelected ? 'ring-4 ring-willtank-500' : 'ring-2 ring-gray-200 hover:ring-willtank-300'}
                  transition-all duration-200
                `}
                aria-label={`Select avatar ${index + 1}`}
              >
                <Avatar className="w-full h-full">
                  <AvatarImage src={avatarUrl} alt={`Avatar option ${index + 1}`} className="object-cover" />
                  <AvatarFallback className="bg-willtank-100">
                    {index + 1}
                  </AvatarFallback>
                </Avatar>
                
                {isSelected && (
                  <div className="absolute inset-0 bg-willtank-500/20 flex items-center justify-center">
                    <Check className="text-white w-6 h-6 drop-shadow-md" />
                  </div>
                )}
                
                {hoveredIndex === index && !isSelected && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Check className="text-white w-5 h-5 opacity-80" />
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
