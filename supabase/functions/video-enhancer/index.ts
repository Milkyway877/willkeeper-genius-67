
// Follow Deno and Oak patterns for Supabase Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { formatError } from "../_shared/db-helper.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent";

async function enhanceVideoWithGemini(videoBase64: string, enhancements: any) {
  try {
    console.log("Enhancing video with Gemini API");
    
    // Construct the prompt based on the requested enhancements
    let enhancementPrompt = "Enhance this video";
    
    if (enhancements.music) {
      enhancementPrompt += ` with ${enhancements.music} music at ${enhancements.musicVolume || 50}% volume`;
    }
    
    if (enhancements.filters && enhancements.filters.length > 0) {
      enhancementPrompt += ` applying the following filters: ${enhancements.filters.join(", ")}`;
    }
    
    if (enhancements.useAI) {
      enhancementPrompt += ". Additionally, improve lighting, reduce background noise, and optimize audio levels.";
    }

    // Call Gemini API with the video data and enhancement prompt
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: enhancementPrompt
              },
              {
                inline_data: {
                  mime_type: "video/mp4",
                  data: videoBase64
                }
              }
            ]
          }
        ],
        generation_config: {
          temperature: 0.4,
          top_p: 0.95,
          top_k: 40,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract enhanced media content from the response
    // Note: This is simplified and would need to be adjusted based on the actual Gemini API response
    const enhancedVideo = data.candidates[0].content.parts[0].inline_data?.data;
    
    if (!enhancedVideo) {
      throw new Error("No enhanced video returned from API");
    }

    return {
      success: true,
      enhancedVideo,
      enhancementDetails: {
        applied: {
          music: enhancements.music || null,
          filters: enhancements.filters || [],
          aiEnhancements: enhancements.useAI ? ["lighting", "audio", "noise"] : []
        }
      }
    };
  } catch (error) {
    console.error("Error enhancing video:", error);
    return {
      success: false, 
      error: formatError(error)
    };
  }
}

serve(async (req) => {
  // Handle CORS for preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY");
    }

    // Only accept POST requests
    if (req.method !== "POST") {
      throw new Error(`Method ${req.method} not allowed`);
    }

    const { videoBlob, enhancements } = await req.json();
    
    if (!videoBlob) {
      throw new Error("Missing video data");
    }

    const result = await enhanceVideoWithGemini(videoBlob, enhancements);

    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error) {
    const errorMessage = formatError(error);
    console.error("Video enhancer function error:", errorMessage);
    
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 400,
    });
  }
});
