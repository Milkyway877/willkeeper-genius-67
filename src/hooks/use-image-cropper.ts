
import { useState, useCallback } from 'react';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface UseImageCropperResult {
  previewUrl: string | null;
  cropArea: CropArea;
  isLoading: boolean;
  error: string | null;
  setCropArea: (area: CropArea) => void;
  loadImage: (file: File) => void;
  cropImage: () => Promise<Blob | null>;
  reset: () => void;
}

export function useImageCropper(): UseImageCropperResult {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadImage = useCallback((file: File) => {
    if (!file) return;
    
    setIsLoading(true);
    setError(null);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      setIsLoading(false);
      return;
    }
    
    // Create object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    // Load the image to get dimensions
    const img = new Image();
    img.onload = () => {
      setOriginalImage(img);
      // Set default crop area to center of image
      const minDim = Math.min(img.width, img.height);
      setCropArea({
        x: (img.width - minDim) / 2,
        y: (img.height - minDim) / 2,
        width: minDim,
        height: minDim
      });
      setIsLoading(false);
    };
    img.onerror = () => {
      setError('Failed to load image');
      setIsLoading(false);
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(null);
    };
    img.src = objectUrl;
  }, []);

  const cropImage = useCallback(async (): Promise<Blob | null> => {
    if (!originalImage || !previewUrl) return null;
    
    setIsLoading(true);
    
    try {
      // Create a canvas for cropping
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Set canvas size to crop area
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;
      
      // Draw the cropped portion of the image
      ctx.drawImage(
        originalImage,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        cropArea.width,
        cropArea.height
      );
      
      // Convert canvas to blob
      return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create image blob'));
          }
          setIsLoading(false);
        }, 'image/jpeg', 0.9);
      });
    } catch (err) {
      setError('Failed to crop image');
      setIsLoading(false);
      return null;
    }
  }, [cropArea, originalImage, previewUrl]);

  const reset = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setOriginalImage(null);
    setCropArea({ x: 0, y: 0, width: 100, height: 100 });
    setError(null);
  }, [previewUrl]);

  return {
    previewUrl,
    cropArea,
    isLoading,
    error,
    setCropArea,
    loadImage,
    cropImage,
    reset
  };
}
