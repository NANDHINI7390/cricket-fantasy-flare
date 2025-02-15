
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CricAPIMatch {
  id: string;
  name: string;
  status: string;
  venue: string;
  date: string;
  dateTimeGMT: string;
  teams: string[];
  teamInfo: Array<{
    name: string;
    shortname: string;
    img: string;
  }>;
  score: Array<{
    r: number;
    w: number;
    o: number;
    inning: string;
  }>;
}

serve(async (req) => {
  console.log('Edge Function: Starting execution');
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('Edge Function: Handling CORS preflight');
    return new Response('ok', { headers: corsHeaders });
  }

  const FUNCTION_TIMEOUT = 3000; // 3 seconds total function timeout
  const API_TIMEOUT = 2000; // 2 seconds API timeout

  try {
    const CRICAPI_KEY = Deno.env.get('CRICAPI_KEY');
    if (!CRICAPI_KEY) {
      throw new Error('API configuration is incomplete');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Database configuration is incomplete');
    }

    // Create Supabase client with shorter timeout
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false
      }
    });

    // First, try to get cached data from Supabase
    console.log('Edge Function: Checking cached data');
    const { data: cachedMatches, error: cacheError } = await supabase
      .from('cricket_matches')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!cacheError && cachedMatches && cachedMatches.length > 0) {
      console.log('Edge Function: Returning cached data');
      return new Response(JSON.stringify(cachedMatches), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If no cached data, fetch from CricAPI
    console.log('Edge Function: Fetching fresh data');
    const params = new URLSearchParams({
      apikey: CRICAPI_KEY,
      offset: '0',
      per_page: '5' // Reduced to 5 matches for faster response
    }).toString();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(`https://api.cricapi.com/v1/matches?${params}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded' }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const cricData = await response.json();
      
      if (!cricData.data || !Array.isArray(cricData.data)) {
        throw new Error('Invalid data format received from API');
      }

      const validMatches = cricData.data.filter((match: any) => 
        match && 
        match.teams && 
        Array.isArray(match.teams) && 
        match.teams.length === 2 &&
        match.teamInfo
      );

      if (validMatches.length === 0) {
        return new Response(JSON.stringify([]), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Process matches in parallel for better performance
      await Promise.all(validMatches.map(async (match) => {
        try {
          const team1Info = match.teamInfo?.find((t: any) => t.name === match.teams[0]);
          const team2Info = match.teamInfo?.find((t: any) => t.name === match.teams[1]);

          if (!team1Info || !team2Info) return;

          const matchStatus = match.status === 'Match not started' ? 'UPCOMING' : 'LIVE';
          const matchTime = new Date(match.dateTimeGMT).toLocaleString();

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
              time: matchStatus === 'UPCOMING' ? matchTime : null,
            }, {
              onConflict: 'match_id'
            });
        } catch (matchError) {
          console.error('Edge Function: Match processing error:', matchError);
        }
      }));

      // Fetch final results
      const { data: matches, error: fetchError } = await supabase
        .from('cricket_matches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

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
        debug: Deno.env.get('DENO_ENV') === 'development' ? error.message : undefined
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
