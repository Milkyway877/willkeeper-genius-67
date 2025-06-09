
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
      console.error('No authorization header provided')
      throw new Error('No authorization header')
    }

    // Parse request body
    const requestBody = await req.json()
    console.log('Request body received:', JSON.stringify(requestBody, null, 2))
    
    const { action, will_id, file_path, title, duration, file_name, file_size, file_type } = requestBody

    if (!action) {
      console.error('No action specified in request')
      throw new Error('Action is required')
    }

    if (!file_path) {
      console.error('No file_path specified in request')
      throw new Error('File path is required')
    }

    // Get user from JWT token
    const token = authorization.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError) {
      console.error('Auth error:', authError)
      throw new Error(`Authentication failed: ${authError.message}`)
    }
    
    if (!user) {
      console.error('No user found from token')
      throw new Error('Invalid authentication - no user found')
    }

    console.log('User authenticated:', user.id)

    let result = null

    if (action === 'save_video') {
      console.log('Processing save_video action')
      
      // Validate will_id if provided (it's optional now)
      if (will_id) {
        const { data: willData, error: willError } = await supabaseClient
          .from('wills')
          .select('id')
          .eq('id', will_id)
          .eq('user_id', user.id)
          .single()
        
        if (willError || !willData) {
          console.error('Will validation error:', willError)
          throw new Error('Invalid will ID or access denied')
        }
        console.log('Will validated:', will_id)
      } else {
        console.log('No will_id provided - creating video without will association')
      }

      // Save video metadata to will_videos table
      const videoData = {
        will_id: will_id || null, // Allow null will_id
        user_id: user.id,
        title: title || 'Video Testament',
        file_path,
        duration: duration || null
      }

      console.log('Inserting video data:', JSON.stringify(videoData, null, 2))

      const { data, error } = await supabaseClient
        .from('will_videos')
        .insert(videoData)
        .select()
        .single()

      if (error) {
        console.error('Database insert error:', error)
        throw new Error(`Failed to save video metadata: ${error.message}`)
      }
      
      console.log('Video metadata saved successfully:', data)
      result = data

    } else if (action === 'save_document') {
      console.log('Processing save_document action')
      
      // Validate required fields for documents
      if (!file_name || !file_size || !file_type) {
        throw new Error('Missing required document fields: file_name, file_size, or file_type')
      }

      // Validate will_id for documents (required)
      if (!will_id) {
        throw new Error('will_id is required for document uploads')
      }

      const { data: willData, error: willError } = await supabaseClient
        .from('wills')
        .select('id')
        .eq('id', will_id)
        .eq('user_id', user.id)
        .single()
      
      if (willError || !willData) {
        console.error('Will validation error for document:', willError)
        throw new Error('Invalid will ID or access denied')
      }

      // Save document metadata to will_documents table
      const documentData = {
        will_id,
        user_id: user.id,
        file_name,
        file_path,
        file_size,
        file_type
      }

      console.log('Inserting document data:', JSON.stringify(documentData, null, 2))

      const { data, error } = await supabaseClient
        .from('will_documents')
        .insert(documentData)
        .select()
        .single()

      if (error) {
        console.error('Database insert error for document:', error)
        throw new Error(`Failed to save document metadata: ${error.message}`)
      }
      
      console.log('Document metadata saved successfully:', data)
      result = data

    } else {
      console.error('Invalid action provided:', action)
      throw new Error(`Invalid action: ${action}`)
    }

    console.log('Operation completed successfully')
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
        error: error.message,
        details: error.stack || 'No stack trace available'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
