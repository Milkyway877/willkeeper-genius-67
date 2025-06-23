
import React from 'react';
import { RotatingGlobe } from './RotatingGlobe';

export function RealisticEarthGlobe() {
  // Fallback to the existing RotatingGlobe component since Three.js dependencies are having issues
  return <RotatingGlobe />;
}
