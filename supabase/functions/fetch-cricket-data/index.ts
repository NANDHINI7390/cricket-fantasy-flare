
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";

const CRICAPI_KEY = Deno.env.get("CRICAPI_KEY") || "a52ea237-09e7-4d69-b7cc-e4f0e79fb8ae";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Fetching cricket data with API key:", CRICAPI_KEY ? "Key present" : "No key");
    
    // Fetch current matches
    const currentMatchesResponse = await fetch(
      `https://api.cricapi.com/v1/currentMatches?apikey=${CRICAPI_KEY}&offset=0`
    );
    
    const currentMatches = await currentMatchesResponse.json();
    console.log("Current matches response:", currentMatches.status);

    // Fetch live scores
    const liveScoresResponse = await fetch(
      `https://api.cricapi.com/v1/cricScore?apikey=${CRICAPI_KEY}`
    );
    
    const liveScores = await liveScoresResponse.json();
    console.log("Live scores response:", liveScores.status);

    // Combine and return data
    const responseData = {
      currentMatches: currentMatches.status === "success" ? currentMatches.data : [],
      liveScores: liveScores.status === "success" ? liveScores.data : [],
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Error fetching cricket data:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to fetch cricket data", 
        message: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
