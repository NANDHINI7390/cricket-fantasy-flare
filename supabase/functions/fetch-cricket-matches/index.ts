
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function errorResponse(message: string, status = 500) {
  console.error(`Edge Function Error: ${message}`);
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Edge Function: Attempt ${i + 1} of ${retries}`);
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      }
      if (response.status === 429) {
        throw new Error('RATE_LIMIT');
      }
      console.log(`Edge Function: Attempt ${i + 1} failed with status ${response.status}`);
    } catch (error) {
      if (error.message === 'RATE_LIMIT' || i === retries - 1) {
        throw error;
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  throw new Error('All retry attempts failed');
}

serve(async (req) => {
  console.log('Edge Function: Starting execution');
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const CRICAPI_KEY = Deno.env.get('CRICAPI_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!CRICAPI_KEY || !supabaseUrl || !supabaseKey) {
      return errorResponse('Configuration is incomplete');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // First try to get cached data
    console.log('Edge Function: Checking cache');
    const { data: cachedMatches, error: cacheError } = await supabase
      .from('cricket_matches')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (cacheError) {
      console.error('Edge Function: Cache error:', cacheError);
      return errorResponse('Failed to fetch cached matches');
    }

    if (cachedMatches && cachedMatches.length > 0) {
      console.log('Edge Function: Returning cached data');
      return new Response(
        JSON.stringify(cachedMatches),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // If no cache, fetch from API
    console.log('Edge Function: Fetching fresh data');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // Increased timeout to 8 seconds

    try {
      const apiUrl = `https://api.cricapi.com/v1/matches?apikey=${CRICAPI_KEY}&offset=0&per_page=5`;
      console.log('Edge Function: Calling Cricket API');
      
      const response = await fetchWithRetry(
        apiUrl,
        {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Supabase Edge Function'
          }
        }
      );

      clearTimeout(timeoutId);

      const cricData = await response.json();
      
      if (!cricData.data || !Array.isArray(cricData.data)) {
        console.error('Edge Function: Invalid API response:', cricData);
        return errorResponse('Invalid API response format');
      }

      // Process and store matches
      const processedMatches = [];
      
      for (const match of cricData.data) {
        if (!match?.teams?.length || !match?.teamInfo?.length) continue;

        const team1Info = match.teamInfo.find((t: any) => t.name === match.teams[0]);
        const team2Info = match.teamInfo.find((t: any) => t.name === match.teams[1]);

        if (!team1Info || !team2Info) continue;

        const matchStatus = match.status === 'Match not started' ? 'UPCOMING' : 'LIVE';
        const scores = match.score || [];
        const team1Score = scores.find((s: any) => s.inning?.includes(team1Info.name));
        const team2Score = scores.find((s: any) => s.inning?.includes(team2Info.name));

        const matchData = {
          match_id: match.id,
          team1_name: team1Info.name,
          team1_logo: team1Info.img || '',
          team2_name: team2Info.name,
          team2_logo: team2Info.img || '',
          score1: team1Score ? `${team1Score.r}/${team1Score.w}` : null,
          score2: team2Score ? `${team2Score.r}/${team2Score.w}` : null,
          overs: team1Score ? `${team1Score.o}` : null,
          status: matchStatus,
          time: matchStatus === 'UPCOMING' ? new Date(match.dateTimeGMT).toLocaleString() : null,
        };

        processedMatches.push(matchData);

        const { error: upsertError } = await supabase
          .from('cricket_matches')
          .upsert(matchData, {
            onConflict: 'match_id'
          });

        if (upsertError) {
          console.error('Edge Function: Upsert error:', upsertError);
          continue;
        }
      }

      console.log('Edge Function: Successfully completed');
      return new Response(
        JSON.stringify(processedMatches),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.message === 'RATE_LIMIT') {
        return errorResponse('Rate limit exceeded', 429);
      }
      return errorResponse(`Failed to fetch from Cricket API: ${fetchError.message}`);
    }

  } catch (error) {
    return errorResponse(`Unexpected error: ${error.message}`);
  }
});
