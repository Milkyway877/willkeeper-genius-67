
import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Bell, Moon, HardDrive } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface UserPreferences {
  notifications: boolean;
  darkMode: boolean;
  autoBackup: boolean;
}

interface PreferencesStepProps {
  onNext: () => void;
  onPreferenceSelection: (preferences: UserPreferences) => void;
  selectedPreferences: UserPreferences;
}

export function PreferencesStep({ 
  onNext,
  onPreferenceSelection,
  selectedPreferences
}: PreferencesStepProps) {
  const handlePreferenceChange = (key: keyof UserPreferences) => {
    onPreferenceSelection({
      ...selectedPreferences,
      [key]: !selectedPreferences[key]
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Your Preferences</h2>
        <p className="text-white/80">Customize your experience with WillTank</p>
      </div>

      <div className="space-y-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-full">
                <Bell className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <Label htmlFor="notifications" className="font-medium text-white">Notifications</Label>
                <p className="text-xs text-white/70">Receive important alerts and reminders</p>
              </div>
            </div>
            <Switch 
              id="notifications" 
              checked={selectedPreferences.notifications}
              onCheckedChange={() => handlePreferenceChange('notifications')}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-500/20 rounded-full">
                <Moon className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <Label htmlFor="darkMode" className="font-medium text-white">Dark Mode</Label>
                <p className="text-xs text-white/70">Use darker colors to reduce eye strain</p>
              </div>
            </div>
            <Switch 
              id="darkMode" 
              checked={selectedPreferences.darkMode}
              onCheckedChange={() => handlePreferenceChange('darkMode')}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-full">
                <HardDrive className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <Label htmlFor="autoBackup" className="font-medium text-white">Auto-Backup</Label>
                <p className="text-xs text-white/70">Automatically backup your important data</p>
              </div>
            </div>
            <Switch 
              id="autoBackup" 
              checked={selectedPreferences.autoBackup}
              onCheckedChange={() => handlePreferenceChange('autoBackup')}
            />
          </div>
        </motion.div>
      </div>

      <Button 
        onClick={onNext}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-4 py-6"
      >
        Continue <ArrowRight className="ml-2" />
      </Button>
    </div>
  );
}
