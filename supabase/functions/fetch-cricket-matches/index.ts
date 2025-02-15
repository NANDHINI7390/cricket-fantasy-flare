
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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
      console.error('Edge Function: Missing environment variables');
      throw new Error('Configuration is incomplete');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    // First try to get cached data
    console.log('Edge Function: Checking cache');
    const { data: cachedMatches, error: cacheError } = await supabase
      .from('cricket_matches')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (cacheError) {
      console.error('Edge Function: Cache error:', cacheError);
      throw cacheError;
    }

    if (cachedMatches && cachedMatches.length > 0) {
      console.log('Edge Function: Returning cached data');
      return new Response(JSON.stringify(cachedMatches), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If no cache, fetch from API
    console.log('Edge Function: Fetching fresh data');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    try {
      const response = await fetch(
        `https://api.cricapi.com/v1/matches?apikey=${CRICAPI_KEY}&offset=0&per_page=5`, 
        {
          method: 'GET',
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          console.error('Edge Function: Rate limit exceeded');
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded' }), 
            { 
              status: 429,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        throw new Error(`API request failed with status ${response.status}`);
      }

      const cricData = await response.json();
      
      if (!cricData.data || !Array.isArray(cricData.data)) {
        throw new Error('Invalid API response format');
      }

      // Process and store matches
      for (const match of cricData.data) {
        if (!match?.teams?.length || !match?.teamInfo?.length) continue;

        const team1Info = match.teamInfo.find((t: any) => t.name === match.teams[0]);
        const team2Info = match.teamInfo.find((t: any) => t.name === match.teams[1]);

        if (!team1Info || !team2Info) continue;

        const matchStatus = match.status === 'Match not started' ? 'UPCOMING' : 'LIVE';
        const scores = match.score || [];
        const team1Score = scores.find((s: any) => s.inning?.includes(team1Info.name));
        const team2Score = scores.find((s: any) => s.inning?.includes(team2Info.name));

        await supabase
          .from('cricket_matches')
          .upsert({
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
          }, {
            onConflict: 'match_id'
          });
      }

      // Return updated data
      const { data: matches, error: fetchError } = await supabase
        .from('cricket_matches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (fetchError) throw fetchError;

      console.log('Edge Function: Successfully completed');
      return new Response(JSON.stringify(matches), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }

  } catch (error) {
    console.error('Edge Function: Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch cricket matches',
        details: Deno.env.get('DENO_ENV') === 'development' ? error.message : undefined
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
