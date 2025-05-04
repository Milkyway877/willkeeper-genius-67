
// CORS headers for cross-origin requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, content-length, accept',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Helper function to handle OPTIONS requests
export function handleCorsOptions(req: Request): Response {
  if (req.method === 'OPTIONS') {
    // This is a preflight request
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  return null;
}
