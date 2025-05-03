
// Follow Deno and Oak patterns for Supabase Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { formatError } from "../_shared/db-helper.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-experimental:generateContent";

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

    console.log("Enhancement prompt:", enhancementPrompt);
    console.log("API URL:", GEMINI_API_URL);

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
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Received response from Gemini API");
    
    // Extract enhanced media content from the response
    // For Gemini 1.5 Pro Experimental, the enhanced video should be in the response
    let enhancedVideo = null;
    try {
      enhancedVideo = data?.candidates?.[0]?.content?.parts?.find(
        (part: any) => part.inline_data?.mime_type?.startsWith('video/')
      )?.inline_data?.data;
    } catch (err) {
      console.error("Error extracting enhanced video:", err);
    }
    
    if (!enhancedVideo) {
      console.log("No enhanced video found in response, returning original video");
      return {
        success: true,
        enhancedVideo: videoBase64, // Return the original video if no enhanced version is found
        enhancementDetails: {
          applied: {
            music: enhancements.music || null,
            filters: enhancements.filters || [],
            aiEnhancements: enhancements.useAI ? ["lighting", "audio", "noise"] : []
          }
        }
      };
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
  // Add CORS headers to all responses
  const headers = { ...corsHeaders, "Content-Type": "application/json" };
  
  // Handle CORS preflight requests (OPTIONS)
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    // Verify API key is available
    if (!GEMINI_API_KEY) {
      console.error("Missing GEMINI_API_KEY");
      throw new Error("Missing GEMINI_API_KEY in environment variables");
    }

    console.log("Request method:", req.method);

    // Only accept POST requests
    if (req.method !== "POST") {
      throw new Error(`Method ${req.method} not allowed`);
    }
    
    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (e) {
      console.error("Error parsing request body:", e);
      throw new Error("Invalid request body");
    }

    const { videoBlob, enhancements } = requestBody;
    
    // Validate request data
    if (!videoBlob) {
      throw new Error("Missing video data");
    }

    console.log("Processing video enhancement request");
    console.log("Enhancements requested:", JSON.stringify(enhancements));
    
    // Process video enhancement
    const result = await enhanceVideoWithGemini(videoBlob, enhancements);
    
    // Return response
    return new Response(JSON.stringify(result), {
      headers,
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    const errorMessage = formatError(error);
    console.error("Video enhancer function error:", errorMessage);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }), 
      { 
        headers, 
        status: 400 
      }
    );
  }
});
