
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";

const CRICAPI_KEY = Deno.env.get("CRICAPI_KEY");

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
    console.log("Fetching cricket data with API key:", CRICAPI_KEY ? "Key present" : "No key found");
    
    if (!CRICAPI_KEY) {
      console.error("CRICAPI_KEY not found in environment variables");
      return new Response(
        JSON.stringify({ 
          error: "API key not configured", 
          currentMatches: [],
          liveScores: [],
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }
    
    // Fetch current matches
    console.log("Fetching current matches...");
    const currentMatchesResponse = await fetch(
      `https://api.cricapi.com/v1/currentMatches?apikey=${CRICAPI_KEY}&offset=0`
    );
    
    const currentMatches = await currentMatchesResponse.json();
    console.log("Current matches response status:", currentMatches.status);
    console.log("Current matches count:", currentMatches.data?.length || 0);

    // Fetch live scores
    console.log("Fetching live scores...");
    const liveScoresResponse = await fetch(
      `https://api.cricapi.com/v1/cricScore?apikey=${CRICAPI_KEY}`
    );
    
    const liveScores = await liveScoresResponse.json();
    console.log("Live scores response status:", liveScores.status);
    console.log("Live scores count:", liveScores.data?.length || 0);

    // Combine and return data
    const responseData = {
      currentMatches: currentMatches.status === "success" ? (currentMatches.data || []) : [],
      liveScores: liveScores.status === "success" ? (liveScores.data || []) : [],
      timestamp: new Date().toISOString(),
      apiStatus: {
        currentMatches: currentMatches.status,
        liveScores: liveScores.status
      }
    };

    console.log("Returning combined data:", {
      currentMatchesCount: responseData.currentMatches.length,
      liveScoresCount: responseData.liveScores.length
    });

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
        message: error.message,
        currentMatches: [],
        liveScores: [],
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
