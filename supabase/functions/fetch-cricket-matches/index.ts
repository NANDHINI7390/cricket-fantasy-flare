
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
    console.log('Edge Function: CRICAPI_KEY present:', !!CRICAPI_KEY);
    
    if (!CRICAPI_KEY) {
      throw new Error('CRICAPI_KEY is not set');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Edge Function: Fetching matches from CricAPI');
    
    // Construct the request
    const cricApiUrl = 'https://api.cricapi.com/v1/matches';
    const requestHeaders = new Headers({
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json'
    });

    // Construct URL with parameters
    const params = new URLSearchParams({
      apikey: CRICAPI_KEY,
      offset: '0',
      per_page: '10'
    });

    const fullUrl = `${cricApiUrl}?${params}`;
    console.log('Edge Function: Calling CricAPI...');

    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: requestHeaders,
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.status) {
        throw new Error(data.message || 'API returned unsuccessful status');
      }

      console.log('Edge Function: Successfully fetched matches');

      // Process matches
      const matches = (data.data || []).filter((match: any) => 
        match.teams && match.teams.length === 2
      );

      for (const match of matches) {
        const matchData = match as CricAPIMatch;
        const team1Info = matchData.teamInfo?.find(t => t.name === matchData.teams[0]) || 
          { name: matchData.teams[0], img: '' };
        const team2Info = matchData.teamInfo?.find(t => t.name === matchData.teams[1]) || 
          { name: matchData.teams[1], img: '' };

        // Format scores
        let score1 = '';
        let score2 = '';
        let overs = '';

        matchData.score?.forEach(s => {
          const scoreText = `${s.r}/${s.w}`;
          if (s.inning.includes(team1Info.name)) {
            score1 = scoreText;
            overs = `${s.o}`;
          } else if (s.inning.includes(team2Info.name)) {
            score2 = scoreText;
          }
        });

        const status = matchData.status === 'Match not started' ? 'UPCOMING' : 'LIVE';
        const time = new Date(matchData.dateTimeGMT).toLocaleString();

        // Upsert match data
        const { error: upsertError } = await supabase
          .from('cricket_matches')
          .upsert({
            match_id: matchData.id,
            team1_name: team1Info.name,
            team1_logo: team1Info.img,
            team2_name: team2Info.name,
            team2_logo: team2Info.img,
            score1,
            score2,
            overs,
            status,
            time: status === 'UPCOMING' ? time : undefined,
          }, {
            onConflict: 'match_id'
          });

        if (upsertError) {
          console.error('Edge Function: Error upserting match:', upsertError);
        }
      }

      // Fetch updated matches
      const { data: dbMatches, error: fetchError } = await supabase
        .from('cricket_matches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (fetchError) {
        throw fetchError;
      }

      return new Response(JSON.stringify(dbMatches), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (apiError) {
      console.error('Edge Function: CricAPI request failed:', apiError.message);
      throw new Error('Failed to fetch data from CricAPI');
    }

  } catch (error) {
    console.error('Edge Function Error:', error.message);
    // Don't expose internal error details in the response
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch cricket matches. Please try again later.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
