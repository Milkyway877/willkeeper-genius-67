
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(JSON.stringify({ error: "Server configuration error" }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log("Starting will deletion execution...");

    // Get wills scheduled for deletion where the grace period has passed
    const { data: willsToDelete, error: willsError } = await supabase
      .from('will_monitoring')
      .select(`
        id, user_id, will_id, scheduled_deletion,
        wills!inner(id, title, user_id),
        profiles!inner(email)
      `)
      .eq('monitoring_status', 'deletion_pending')
      .not('scheduled_deletion', 'is', null)
      .lte('scheduled_deletion', new Date().toISOString());

    if (willsError) {
      throw new Error(`Failed to fetch wills for deletion: ${willsError.message}`);
    }

    console.log(`Found ${willsToDelete?.length || 0} wills to delete`);

    for (const monitoringRecord of willsToDelete || []) {
      try {
        const willId = monitoringRecord.will_id;
        const userId = monitoringRecord.user_id;
        const userEmail = monitoringRecord.profiles.email;
        const willTitle = monitoringRecord.wills.title;

        console.log(`Deleting will ${willId} for user ${userEmail}`);

        // Delete associated documents from storage
        const { data: documents } = await supabase
          .from('will_documents')
          .select('file_path')
          .eq('will_id', willId);

        if (documents && documents.length > 0) {
          const filePaths = documents.map(doc => doc.file_path);
          await supabase.storage
            .from('future-documents')
            .remove(filePaths);
          
          console.log(`Deleted ${filePaths.length} documents from storage`);
        }

        // Delete will documents metadata
        await supabase
          .from('will_documents')
          .delete()
          .eq('will_id', willId);

        // Delete will executors
        await supabase
          .from('will_executors')
          .delete()
          .eq('will_id', willId);

        // Delete will beneficiaries
        await supabase
          .from('will_beneficiaries')
          .delete()
          .eq('will_id', willId);

        // Delete the will itself
        await supabase
          .from('wills')
          .delete()
          .eq('id', willId);

        // Update monitoring record
        await supabase
          .from('will_monitoring')
          .update({
            monitoring_status: 'deleted',
            updated_at: new Date().toISOString()
          })
          .eq('id', monitoringRecord.id);

        // Send deletion confirmation notification
        await supabase.functions.invoke('send-deletion-notifications', {
          body: {
            user_id: userId,
            will_id: willId,
            notification_type: 'deleted',
            user_email: userEmail,
            will_title: willTitle
          }
        });

        // Create system notification
        await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            type: 'will_deleted',
            title: 'Will Permanently Deleted',
            message: `Your will "${willTitle}" has been permanently deleted due to expired free access. Upgrade to WillTank to prevent future deletions.`,
            created_at: new Date().toISOString()
          });

        console.log(`Successfully deleted will ${willId}`);

      } catch (error) {
        console.error(`Error deleting will ${monitoringRecord.will_id}:`, error);
      }
    }

    console.log("Will deletion execution completed");

    return new Response(JSON.stringify({ 
      success: true, 
      deleted: willsToDelete?.length || 0,
      timestamp: new Date().toISOString()
    }), { 
      status: 200, 
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('Execute will deletions error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
