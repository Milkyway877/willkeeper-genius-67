
import { supabase } from "@/integrations/supabase/client";
import UAParser from "ua-parser-js";

// Type for activity log data
export interface ActivityLog {
  id: string;
  action: string;
  device?: string;
  ip_address?: string;
  location?: string;
  details?: any;
  created_at: string;
}

// Log user activity
export const logUserActivity = async (action: string, details?: any): Promise<boolean> => {
  try {
    // Get device info
    const parser = new UAParser();
    const result = parser.getResult();
    const deviceInfo = {
      browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`,
      os: `${result.os.name || 'Unknown'} ${result.os.version || ''}`,
      device: result.device.type ? `${result.device.vendor || ''} ${result.device.model || ''} (${result.device.type})` : 'Desktop',
    };
    
    // Try to get location from IP
    let locationInfo = "";
    try {
      const { data: locationData, error: locationError } = await supabase.functions.invoke('get-ip-location');
      
      if (!locationError && locationData) {
        locationInfo = locationData.city && locationData.country 
          ? `${locationData.city}, ${locationData.country}`
          : locationData.country || locationData.city || "";
      }
    } catch (e) {
      console.error("Error getting location:", e);
    }
    
    // Log activity
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        action,
        device: `${deviceInfo.browser} on ${deviceInfo.os} (${deviceInfo.device})`,
        location: locationInfo,
        details: details || {},
      });
      
    if (error) {
      console.error('Error logging user activity:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in logUserActivity:', error);
    return false;
  }
};

// Get user activity logs
export const getUserActivityLogs = async (): Promise<ActivityLog[]> => {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching activity logs:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getUserActivityLogs:', error);
    return [];
  }
};
