
// CORS headers for cross-origin requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, content-length, accept, Origin',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400',
};

// Helper function to handle CORS preflight requests
export function handleCorsRequest(req: Request): Response | null {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return null;
}

// Apply CORS headers to any response
export function applyCorsHeaders(response: Response): Response {
  // Create a new response with CORS headers
  const newResponse = new Response(response.body, response);
  
  // Add CORS headers to the response
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newResponse.headers.set(key, value);
  });
  
  return newResponse;
}
