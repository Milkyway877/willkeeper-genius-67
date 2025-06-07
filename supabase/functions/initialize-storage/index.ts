
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get authorization header
    const authorization = req.headers.get('Authorization')
    
    if (!authorization) {
      throw new Error('No authorization header')
    }

    // Check if buckets exist and create them if needed
    const buckets = ['will_videos', 'will_documents']
    
    for (const bucketName of buckets) {
      try {
        // Try to get bucket info
        const { data: bucket, error } = await supabaseClient.storage.getBucket(bucketName)
        
        if (error && error.message.includes('not found')) {
          // Create bucket if it doesn't exist
          const { error: createError } = await supabaseClient.storage.createBucket(bucketName, {
            public: true,
            allowedMimeTypes: bucketName === 'will_videos' 
              ? ['video/webm', 'video/mp4', 'video/avi', 'video/mov']
              : ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
          })
          
          if (createError) {
            console.error(`Error creating bucket ${bucketName}:`, createError)
          } else {
            console.log(`Created bucket: ${bucketName}`)
          }
        }
      } catch (err) {
        console.error(`Error checking/creating bucket ${bucketName}:`, err)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Storage buckets initialized successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
