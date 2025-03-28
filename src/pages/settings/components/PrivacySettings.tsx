
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from "@/components/ui/switch";
import { Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function PrivacySettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    analyticsTracking: true,
    personalizedRecommendations: true,
    thirdPartySharing: false,
    restrictExecutorAccess: true,
    twoFactorForDocuments: true
  });
  
  // Fetch user preferences when component mounts
  useEffect(() => {
    async function fetchUserPreferences() {
      try {
        setLoading(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) throw new Error('User not authenticated');
        
        const { data, error } = await supabase
          .from('user_preferences')
          .select('privacy_settings')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data?.privacy_settings) {
          // Safely cast the data to an object before spreading
          const savedSettings = typeof data.privacy_settings === 'object' && data.privacy_settings !== null 
            ? data.privacy_settings 
            : {};
            
          setPrivacySettings({
            ...privacySettings,
            ...(savedSettings as Record<string, boolean>)
          });
        } else {
          // If no preferences exist, create default ones
          const { error: insertError } = await supabase
            .from('user_preferences')
            .insert({
              user_id: user.id,
              privacy_settings: privacySettings
            });
          
          if (insertError) throw insertError;
        }
      } catch (error) {
        console.error("Error fetching privacy settings:", error);
        toast({
          title: "Error Loading Settings",
          description: "There was an error loading your privacy settings.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserPreferences();
  }, [toast]);
  
  // Toggle privacy setting
  const togglePrivacySetting = async (setting: keyof typeof privacySettings) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      // Create a new privacy settings object with the toggled value
      const updatedSettings = {
        ...privacySettings,
        [setting]: !privacySettings[setting]
      };
      
      // Update local state immediately for better UX
      setPrivacySettings(updatedSettings);
      
      // Update the database
      const { error } = await supabase
        .from('user_preferences')
        .update({
          privacy_settings: updatedSettings
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Setting Updated",
        description: `${privacySettings[setting] ? 'Disabled' : 'Enabled'} ${setting.replace(/([A-Z])/g, ' $1').toLowerCase()}.`
      });
    } catch (error) {
      console.error("Error updating privacy setting:", error);
      
      // Revert the change in case of error
      setPrivacySettings(privacySettings);
      
      toast({
        title: "Update Failed",
        description: "There was an error updating your privacy settings.",
        variant: "destructive"
      });
    }
  };
  
  // Handle privacy action button clicks
  const handlePrivacyAction = (action: string) => {
    toast({
      title: action,
      description: `Your ${action.toLowerCase()} request has been submitted successfully.`,
    });
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
          <Lock className="text-willtank-700 mr-2" size={18} />
          <h3 className="font-medium">Privacy Settings</h3>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-4">Data Sharing</h4>
              <p className="text-sm text-gray-600 mb-4">
                Control how your information is used and shared with our services.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium">Analytics Tracking</h5>
                    <p className="text-xs text-gray-500">
                      Allow anonymous usage data to help us improve our service
                    </p>
                  </div>
                  <Switch 
                    checked={privacySettings.analyticsTracking}
                    onCheckedChange={() => togglePrivacySetting('analyticsTracking')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium">Personalized Recommendations</h5>
                    <p className="text-xs text-gray-500">
                      Receive suggestions based on your will creation history
                    </p>
                  </div>
                  <Switch 
                    checked={privacySettings.personalizedRecommendations}
                    onCheckedChange={() => togglePrivacySetting('personalizedRecommendations')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium">Third-Party Sharing</h5>
                    <p className="text-xs text-gray-500">
                      Allow sharing of anonymized data with trusted partners
                    </p>
                  </div>
                  <Switch 
                    checked={privacySettings.thirdPartySharing}
                    onCheckedChange={() => togglePrivacySetting('thirdPartySharing')}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Document Privacy</h4>
              <p className="text-sm text-gray-600 mb-4">
                Control who can access your documents and when.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium">Restrict Executor Access</h5>
                    <p className="text-xs text-gray-500">
                      Only allow executors to access documents after verification
                    </p>
                  </div>
                  <Switch 
                    checked={privacySettings.restrictExecutorAccess}
                    onCheckedChange={() => togglePrivacySetting('restrictExecutorAccess')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium">Two-Factor Authentication for Documents</h5>
                    <p className="text-xs text-gray-500">
                      Require additional verification for sensitive documents
                    </p>
                  </div>
                  <Switch 
                    checked={privacySettings.twoFactorForDocuments}
                    onCheckedChange={() => togglePrivacySetting('twoFactorForDocuments')}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6"
      >
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-medium">Privacy Documentation</h3>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Privacy Policy</h4>
              <p className="text-sm text-gray-600 mt-1 mb-2">
                Review our privacy policy to understand how we handle your data.
              </p>
              <Button variant="outline" size="sm" onClick={() => window.open('/privacy', '_blank')}>
                View Privacy Policy
              </Button>
            </div>
            
            <div>
              <h4 className="font-medium">Data Request</h4>
              <p className="text-sm text-gray-600 mt-1 mb-2">
                Request a copy of all the data we have stored about you.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePrivacyAction('Data Request')}
              >
                Request My Data
              </Button>
            </div>
            
            <div>
              <h4 className="font-medium">Data Deletion</h4>
              <p className="text-sm text-gray-600 mt-1 mb-2">
                Request deletion of specific data we have stored about you.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePrivacyAction('Data Deletion')}
              >
                Request Data Deletion
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
