
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

    // Parse request body
    const { action, will_id, file_path, title, duration, file_name, file_size, file_type } = await req.json()

    // Get user from JWT token
    const token = authorization.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    let result = null

    if (action === 'save_video') {
      // Save video metadata to will_videos table
      const { data, error } = await supabaseClient
        .from('will_videos')
        .insert({
          will_id,
          user_id: user.id,
          title: title || 'Video Testament',
          file_path,
          duration: duration || null
        })
        .select()
        .single()

      if (error) throw error
      result = data

    } else if (action === 'save_document') {
      // Save document metadata to will_documents table
      const { data, error } = await supabaseClient
        .from('will_documents')
        .insert({
          will_id,
          user_id: user.id,
          file_name,
          file_path,
          file_size,
          file_type
        })
        .select()
        .single()

      if (error) throw error
      result = data

    } else {
      throw new Error('Invalid action')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: result 
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
