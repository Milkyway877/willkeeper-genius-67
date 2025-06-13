
import { supabase } from '@/integrations/supabase/client';

export interface ContentStatus {
  id: string;
  status: 'active' | 'grace_period' | 'expired';
  created_at: string;
  grace_period_end: string;
  expires_in_hours: number;
}

export const getContentStatus = async (contentId: string, contentType: 'will' | 'video' | 'document'): Promise<ContentStatus | null> => {
  try {
    const { data, error } = await supabase
      .from(contentType === 'will' ? 'wills' : 'tank_messages')
      .select('id, created_at, status')
      .eq('id', contentId)
      .single();

    if (error || !data) return null;

    const createdAt = new Date(data.created_at);
    const gracePeriodEnd = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    const now = new Date();
    const expiresInHours = Math.max(0, Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60)));

    let status: 'active' | 'grace_period' | 'expired' = 'grace_period';
    
    if (now > gracePeriodEnd) {
      status = 'expired';
    } else if (expiresInHours > 0) {
      status = 'grace_period';
    }

    return {
      id: data.id,
      status,
      created_at: data.created_at,
      grace_period_end: gracePeriodEnd.toISOString(),
      expires_in_hours: expiresInHours
    };
  } catch (error) {
    console.error('Error getting content status:', error);
    return null;
  }
};

export const checkUserHasExpiredContent = async (): Promise<{
  hasExpiredContent: boolean;
  expiredWills: ContentStatus[];
  expiredVideos: ContentStatus[];
  gracePeriodContent: ContentStatus[];
}> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        hasExpiredContent: false,
        expiredWills: [],
        expiredVideos: [],
        gracePeriodContent: []
      };
    }

    // Get user's wills
    const { data: wills } = await supabase
      .from('wills')
      .select('id, created_at, status')
      .eq('user_id', user.id);

    // Get user's videos
    const { data: videos } = await supabase
      .from('tank_messages')
      .select('id, created_at, status')
      .eq('user_id', user.id);

    const expiredWills: ContentStatus[] = [];
    const expiredVideos: ContentStatus[] = [];
    const gracePeriodContent: ContentStatus[] = [];

    const now = new Date();

    // Process wills
    wills?.forEach(will => {
      const createdAt = new Date(will.created_at);
      const gracePeriodEnd = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
      const expiresInHours = Math.max(0, Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60)));

      const contentStatus: ContentStatus = {
        id: will.id,
        status: now > gracePeriodEnd ? 'expired' : 'grace_period',
        created_at: will.created_at,
        grace_period_end: gracePeriodEnd.toISOString(),
        expires_in_hours: expiresInHours
      };

      if (contentStatus.status === 'expired') {
        expiredWills.push(contentStatus);
      } else if (expiresInHours > 0) {
        gracePeriodContent.push(contentStatus);
      }
    });

    // Process videos
    videos?.forEach(video => {
      const createdAt = new Date(video.created_at);
      const gracePeriodEnd = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
      const expiresInHours = Math.max(0, Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60)));

      const contentStatus: ContentStatus = {
        id: video.id,
        status: now > gracePeriodEnd ? 'expired' : 'grace_period',
        created_at: video.created_at,
        grace_period_end: gracePeriodEnd.toISOString(),
        expires_in_hours: expiresInHours
      };

      if (contentStatus.status === 'expired') {
        expiredVideos.push(contentStatus);
      } else if (expiresInHours > 0) {
        gracePeriodContent.push(contentStatus);
      }
    });

    return {
      hasExpiredContent: expiredWills.length > 0 || expiredVideos.length > 0,
      expiredWills,
      expiredVideos,
      gracePeriodContent
    };
  } catch (error) {
    console.error('Error checking expired content:', error);
    return {
      hasExpiredContent: false,
      expiredWills: [],
      expiredVideos: [],
      gracePeriodContent: []
    };
  }
};
