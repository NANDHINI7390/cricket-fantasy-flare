
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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Edge Function: Starting fetch-cricket-matches');
    
    const CRICAPI_KEY = Deno.env.get('CRICAPI_KEY');
    if (!CRICAPI_KEY) {
      console.error('Edge Function: CRICAPI_KEY is not set');
      throw new Error('API configuration is incomplete');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Edge Function: Supabase configuration is incomplete');
      throw new Error('Database configuration is incomplete');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Edge Function: Preparing CricAPI request');
    
    // Using URLSearchParams for proper encoding
    const params = new URLSearchParams({
      apikey: CRICAPI_KEY,
      offset: '0',
      per_page: '10'
    }).toString();

    // Construct request with minimal options and timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      const response = await fetch(`https://api.cricapi.com/v1/matches?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('Edge Function: CricAPI response status:', response.status);

      // Handle rate limiting explicitly
      if (response.status === 429) {
        console.error('Edge Function: Rate limit exceeded');
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      if (!response.ok) {
        console.error('Edge Function: CricAPI error response:', response.status, response.statusText);
        throw new Error(`API request failed with status ${response.status}`);
      }

      const cricData = await response.json();
      
      if (!cricData.data || !Array.isArray(cricData.data)) {
        console.error('Edge Function: Invalid data format from CricAPI', cricData);
        throw new Error('Invalid data format received from API');
      }

      // Filter valid matches and log count
      const validMatches = cricData.data.filter((match: any) => 
        match && 
        match.teams && 
        Array.isArray(match.teams) && 
        match.teams.length === 2 &&
        match.teamInfo
      );

      console.log('Edge Function: Processing', validMatches.length, 'valid matches out of', cricData.data.length, 'total matches');

      if (validMatches.length === 0) {
        console.log('Edge Function: No valid matches found');
        // Return empty array instead of throwing error
        return new Response(JSON.stringify([]), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Process each match with error handling for each step
      for (const match of validMatches) {
        try {
          const team1Info = match.teamInfo?.find((t: any) => t.name === match.teams[0]);
          const team2Info = match.teamInfo?.find((t: any) => t.name === match.teams[1]);

          if (!team1Info || !team2Info) {
            console.error('Edge Function: Missing team info for match:', match.id);
            continue;
          }

          const matchStatus = match.status === 'Match not started' ? 'UPCOMING' : 'LIVE';
          const matchTime = new Date(match.dateTimeGMT).toLocaleString();

          // Format scores with null checks
          const scores = match.score || [];
          const team1Score = scores.find((s: any) => s.inning?.includes(team1Info.name));
          const team2Score = scores.find((s: any) => s.inning?.includes(team2Info.name));

          const { error: upsertError } = await supabase
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

          if (upsertError) {
            console.error('Edge Function: Error upserting match:', match.id, upsertError);
          }
        } catch (matchError) {
          console.error('Edge Function: Error processing match:', match.id, matchError);
          // Continue processing other matches
          continue;
        }
      }

      // Fetch updated matches
      const { data: matches, error: fetchError } = await supabase
        .from('cricket_matches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (fetchError) {
        console.error('Edge Function: Error fetching matches from DB:', fetchError);
        throw fetchError;
      }

      console.log('Edge Function: Successfully completed with', matches?.length || 0, 'matches');
      return new Response(JSON.stringify(matches), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('API request timed out');
      }
      throw fetchError;
    }

  } catch (error) {
    console.error('Edge Function: Fatal error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch cricket matches. Please try again later.',
        debug: Deno.env.get('DENO_ENV') === 'development' ? error.message : undefined
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
