
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

    // If no cache, fetch from API using native HTTP client
    console.log('Edge Function: Fetching fresh data');
    
    try {
      // Using HTTPS explicitly and encoding the API key
      const apiKey = encodeURIComponent(CRICAPI_KEY);
      const apiUrl = `https://api.cricapi.com/v1/matches`;
      const params = new URLSearchParams({
        apikey: apiKey,
        offset: '0',
        per_page: '5'
      });

      console.log('Edge Function: Calling Cricket API');

      const response = await fetch(`${apiUrl}?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0',
          'Origin': 'https://api.cricapi.com'
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge Function: API response not ok:', response.status, errorText);
        throw new Error(`API response not ok: ${response.status} - ${errorText}`);
      }

      const cricData = await response.json();
      console.log('Edge Function: Received API response:', JSON.stringify(cricData));
      
      if (!cricData.data || !Array.isArray(cricData.data)) {
        console.error('Edge Function: Invalid API response:', cricData);
        return errorResponse('Invalid API response format');
      }

      // Process and store matches
      const processedMatches = [];
      
      for (const match of cricData.data) {
        if (!match?.teams?.length || !match?.teamInfo?.length) {
          console.log('Edge Function: Skipping match due to missing data:', match.id);
          continue;
        }

        const team1Info = match.teamInfo.find((t: any) => t.name === match.teams[0]);
        const team2Info = match.teamInfo.find((t: any) => t.name === match.teams[1]);

        if (!team1Info || !team2Info) {
          console.log('Edge Function: Skipping match due to missing team info:', match.id);
          continue;
        }

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
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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
      console.error('Edge Function: Fetch error:', fetchError);
      return errorResponse(`Failed to fetch from Cricket API: ${fetchError.message}`);
    }

  } catch (error) {
    console.error('Edge Function: Unexpected error:', error);
    return errorResponse(`Unexpected error: ${error.message}`);
  }
});
