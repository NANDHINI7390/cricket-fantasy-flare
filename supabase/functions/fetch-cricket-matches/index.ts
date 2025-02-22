
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiUrl = `https://api.cricapi.com/v1/matches?apikey=${Deno.env.get('CRICAPI_KEY')}&offset=0&per_page=5`;
    
    console.log('Edge Function: Fetching from Cricket API');
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`API response not ok: ${response.status} - ${errorText}`);
    }

    const cricData = await response.json();
    console.log('Raw API Response:', JSON.stringify(cricData));

    if (!cricData.data || !Array.isArray(cricData.data)) {
      console.error('Invalid API response format:', cricData);
      throw new Error('Invalid API response format');
    }

    const processedMatches = cricData.data
      .filter(match => match?.teams?.length && match?.teamInfo?.length)
      .map(match => {
        const team1 = match.teamInfo.find(t => t.name === match.teams[0]) || {};
        const team2 = match.teamInfo.find(t => t.name === match.teams[1]) || {};
        const matchStatus = match.status === 'Match not started' ? 'UPCOMING' : 'LIVE';
        const team1Score = match.score?.find(s => s.inning?.includes(team1.name)) || {};
        const team2Score = match.score?.find(s => s.inning?.includes(team2.name)) || {};

        return {
          match_id: match.id,
          team1_name: team1.name || 'Unknown',
          team1_logo: team1.img || '',
          team2_name: team2.name || 'Unknown',
          team2_logo: team2.img || '',
          score1: team1Score.r ? `${team1Score.r}/${team1Score.w}` : null,
          score2: team2Score.r ? `${team2Score.r}/${team2Score.w}` : null,
          overs: team1Score.o || null,
          status: matchStatus,
          time: matchStatus === 'UPCOMING' ? new Date(match.dateTimeGMT).toLocaleString() : null,
        };
    });

    console.log('Processed matches:', JSON.stringify(processedMatches));

    return new Response(
      JSON.stringify(processedMatches),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge Function Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
