
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, type } = await req.json()
    
    // Craft a specific system prompt based on the type of legacy item
    const systemPrompt = {
      'story': 'You are helping users write meaningful personal stories for their legacy vault. Focus on memorable life events, family history, and personal achievements.',
      'confession': 'You are helping users write sincere confessions or revealing important truths they want to share. Be respectful and thoughtful.',
      'wishes': 'You are helping users express their special wishes and hopes for their loved ones. Focus on heartfelt messages and meaningful guidance.',
      'advice': 'You are helping users write valuable life advice and wisdom they want to pass down. Focus on practical guidance and personal insights.'
    }[type] || 'You are helping users write meaningful content for their digital legacy.';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    })

    const data = await response.json()
    const suggestion = data.choices[0].message.content

    return new Response(
      JSON.stringify({ suggestion }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
