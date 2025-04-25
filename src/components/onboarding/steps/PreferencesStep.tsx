
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface PreferencesStepProps {
  onNext: () => void;
}

export function PreferencesStep({ onNext }: PreferencesStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Personalize Your Experience</h2>
        <p className="text-white/80">Help us customize WillTank for you</p>
      </div>

      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">What should we call you?</Label>
          <Input 
            id="name" 
            placeholder="Your preferred name"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone" className="text-white">Your Timezone</Label>
          <select 
            id="timezone"
            className="w-full h-10 rounded-md bg-white/5 border border-white/10 text-white px-3 focus:ring-2 focus:ring-blue-500"
          >
            <option value="UTC">UTC (Default)</option>
            <option value="EST">Eastern Time</option>
            <option value="PST">Pacific Time</option>
          </select>
        </div>
      </motion.div>

      <Button 
        onClick={onNext}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-4 py-6"
      >
        Next Step <ArrowRight className="ml-2" />
      </Button>
    </div>
  );
}
