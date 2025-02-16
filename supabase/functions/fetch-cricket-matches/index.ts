import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const CRICAPI_KEY = Deno.env.get('CRICAPI_KEY') || 'a52ea237-09e7-4d69-b7cc-e4f0e79fb8ae';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://yefrdovbporfjdhfojyx.supabase.co';

const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllZnJkb3ZicG9yZmpkaGZvanl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTcyMTEyMiwiZXhwIjoyMDU1Mjk3MTIyfQ.tL7zkXPLRawQramWG97vRAdO8vQz8R283rWhr3IhRew';


if (!supabaseKey) {
  console.error('Supabase key is missing. Ensure you set it as an environment variable.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

function errorResponse(message, status = 500) {
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

  if (!CRICAPI_KEY || !supabaseUrl || !supabaseKey) {
    return errorResponse('Configuration is incomplete');
  }

  try {
    console.log('Edge Function: Checking cache');
    const { data: cachedMatches, error: cacheError } = await supabase
      .from('cricket_matches')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (cacheError) {
      console.error('Cache error:', cacheError);
      return errorResponse('Failed to fetch cached matches');
    }

    if (cachedMatches?.length) {
      console.log('Returning cached data');
      return new Response(JSON.stringify(cachedMatches), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log('Fetching fresh data');
const apiUrl = `https://api.cricapi.com/v1/matches?apikey=a52ea237-09e7-4d69-b7cc-e4f0e79fb8ae&offset=0&per_page=5`;

    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0',
        'Origin': 'https://api.cricapi.com'
      },
    });

    if (!response.ok) {
      throw new Error(`API response error: ${response.status} - ${await response.text()}`);
    }

    const cricData = await response.json();
    console.log('API response received:', JSON.stringify(cricData));

    if (!Array.isArray(cricData.data)) {
      return errorResponse('Invalid API response format');
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
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      });

    for (const match of processedMatches) {
      const { error: upsertError } = await supabase
        .from('cricket_matches')
        .upsert(match, { onConflict: 'match_id' });
      if (upsertError) {
        console.error('Upsert error:', upsertError);
      }
    }

    console.log('Successfully completed');
    return new Response(JSON.stringify(processedMatches), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Unexpected error:', error);
    return errorResponse(`Unexpected error: ${error.message}`);
  }
});
