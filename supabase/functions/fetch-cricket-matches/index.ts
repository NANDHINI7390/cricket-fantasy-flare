
import { serve } from 'https://deno.fresh.runtime.dev/server.ts';
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
    const apiUrl = 'https://api.cricapi.com/v1/matches?apikey=' + CRICAPI_KEY;
    console.log('Edge Function: Calling CricAPI URL:', apiUrl.replace(CRICAPI_KEY, '[HIDDEN]'));
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    console.log('Edge Function: CricAPI response status:', data.status);

    if (!data.status) {
      console.error('Edge Function: CricAPI error:', data.message);
      throw new Error(data.message || 'Failed to fetch matches from CricAPI');
    }

    // Process and store matches
    for (const match of data.data) {
      const matchData = match as CricAPIMatch;
      if (!matchData.teams || matchData.teams.length !== 2) continue;

      const team1Info = matchData.teamInfo?.find(t => t.name === matchData.teams[0]) || { name: matchData.teams[0], img: '' };
      const team2Info = matchData.teamInfo?.find(t => t.name === matchData.teams[1]) || { name: matchData.teams[1], img: '' };

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

      // Determine match status and time
      let status = matchData.status === 'Match not started' ? 'UPCOMING' : 'LIVE';
      let time = new Date(matchData.dateTimeGMT).toLocaleString();

      // Upsert match data into database
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

    // Fetch updated matches from database
    const { data: matches, error: fetchError } = await supabase
      .from('cricket_matches')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (fetchError) {
      console.error('Edge Function: Error fetching matches:', fetchError);
      throw fetchError;
    }

    console.log('Edge Function: Successfully completed');

    return new Response(JSON.stringify(matches), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Edge Function Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
