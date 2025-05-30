
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { verificationRequestId, userId, executorDetails } = await req.json();
    
    if (!verificationRequestId || !userId || !executorDetails) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if verification is valid and not already downloaded
    const { data: verification, error: verificationError } = await supabase
      .from('death_verification_requests')
      .select('*')
      .eq('id', verificationRequestId)
      .eq('user_id', userId)
      .eq('status', 'completed')
      .single();

    if (verificationError || !verification) {
      return new Response(
        JSON.stringify({ error: "Invalid verification request" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (verification.downloaded) {
      return new Response(
        JSON.stringify({ error: "Will package already downloaded" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !userProfile) {
      return new Response(
        JSON.stringify({ error: "User profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get will data
    const { data: wills, error: willsError } = await supabase
      .from('wills')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (willsError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch will data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get beneficiaries and executors
    const { data: beneficiaries } = await supabase
      .from('will_beneficiaries')
      .select('*')
      .eq('user_id', userId);

    const { data: executors } = await supabase
      .from('will_executors')
      .select('*')
      .eq('user_id', userId);

    // Create a comprehensive will document
    const willDocument = {
      userProfile,
      wills: wills || [],
      beneficiaries: beneficiaries || [],
      executors: executors || [],
      verificationDetails: {
        verificationId: verificationRequestId,
        unlocked_at: verification.unlocked_at,
        executor_details: executorDetails
      },
      generatedAt: new Date().toISOString()
    };

    // Generate will document as JSON and text summary
    const willJson = JSON.stringify(willDocument, null, 2);
    
    const willSummary = `
LAST WILL AND TESTAMENT - DIGITAL COPY
=====================================

Testator: ${userProfile.first_name} ${userProfile.last_name}
Email: ${userProfile.email}
Generated: ${new Date().toLocaleDateString()}

EXECUTOR VERIFICATION
====================
Executor Name: ${executorDetails.executorName}
Deceased: ${executorDetails.deceasedName}
Death Certificate: ${executorDetails.deathCertificateNumber}
Date of Death: ${executorDetails.dateOfDeath}
Relationship: ${executorDetails.relationshipToDeceased}

BENEFICIARIES
=============
${beneficiaries?.map(b => `- ${b.name} (${b.email}) - ${b.relationship || 'Not specified'}`).join('\n') || 'None listed'}

EXECUTORS
=========
${executors?.map(e => `- ${e.name} (${e.email})`).join('\n') || 'None listed'}

WILLS
=====
${wills?.map(w => `
Title: ${w.title || 'Untitled Will'}
Created: ${new Date(w.created_at).toLocaleDateString()}
Status: ${w.status}
Content: ${w.content || 'No content available'}
`).join('\n---\n') || 'No wills found'}

ADDITIONAL NOTES
================
${executorDetails.additionalNotes || 'None'}

---
This digital will package was generated and downloaded on ${new Date().toLocaleDateString()} 
by verified executor ${executorDetails.executorName}.
Access to this package is permanently frozen after download for security purposes.
`;

    // For now, return the will data as JSON since we can't easily create ZIP files in Deno
    // In a production environment, you would use a ZIP library to create the actual package
    const packageData = {
      will_summary: willSummary,
      will_data: willDocument,
      metadata: {
        package_id: verificationRequestId,
        generated_at: new Date().toISOString(),
        executor: executorDetails.executorName,
        download_note: "This package contains all available will data and verification details."
      }
    };

    // Log the download for audit purposes
    await supabase.from('death_verification_logs').insert({
      user_id: userId,
      action: 'will_package_downloaded',
      details: {
        verification_request_id: verificationRequestId,
        executor_name: executorDetails.executorName,
        download_timestamp: new Date().toISOString()
      }
    });

    return new Response(
      JSON.stringify(packageData, null, 2),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="will-package-${userId}-${new Date().toISOString().split('T')[0]}.json"`
        } 
      }
    );

  } catch (error) {
    console.error("Error generating will package:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
