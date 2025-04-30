
import { supabase } from '@/integrations/supabase/client';

// This is now a client-side function that makes a direct API call
// instead of being served via Deno
export default async function linkWillVideo(req: Request) {
  try {
    // Get query parameters
    const url = new URL(req.url);
    const willId = url.searchParams.get('willId');
    const videoPath = url.searchParams.get('videoPath');
    
    // Validate parameters
    if (!willId || !videoPath) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: willId and videoPath are required' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Get current user's session to verify they have permission
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify user has access to this will
    const { data: will, error: willError } = await supabase
      .from('wills')
      .select('id')
      .eq('id', willId)
      .eq('user_id', session.user.id)
      .single();
      
    if (willError || !will) {
      return new Response(
        JSON.stringify({ error: 'Will not found or unauthorized access' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Link video to will
    const { error } = await supabase
      .from('will_videos')
      .insert({
        will_id: willId,
        file_path: videoPath,
        duration: 0
      });
      
    if (error) {
      console.error('Error linking video to will:', error);
      return new Response(
        JSON.stringify({ error: `Error linking video: ${error.message}` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error: any) {
    console.error('Unexpected error in link-will-video:', error);
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error.message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
