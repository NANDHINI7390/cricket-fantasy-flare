
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const CRICKET_API_KEY = Deno.env.get('CRICAPI_KEY') || "a52ea237-09e7-4d69-b7cc-e4f0e79fb8ae";
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query) {
      throw new Error("Query is required");
    }

    console.log("Received query:", query);
    
    // 1. First fetch cricket data from API
    const cricketData = await fetchCricketData();
    console.log("Fetched cricket data");
    
    // 2. Get player stats if needed
    let playerStats = {};
    if (query.toLowerCase().includes("player") || 
        query.toLowerCase().includes("captain") || 
        query.toLowerCase().includes("team")) {
      playerStats = await fetchPlayerStats();
      console.log("Fetched player stats");
    }
    
    // 3. Get match schedules if requested
    let schedules = {};
    if (query.toLowerCase().includes("schedule") || 
        query.toLowerCase().includes("fixture") || 
        query.toLowerCase().includes("upcoming")) {
      schedules = await fetchMatchSchedules();
      console.log("Fetched match schedules");
    }
    
    // 4. Prepare context for ChatGPT
    const context = {
      matches: cricketData,
      playerStats: playerStats,
      schedules: schedules,
      query: query
    };
    
    // 5. Get response from ChatGPT
    const aiResponse = await getChatGPTResponse(context);
    console.log("Got AI response");
    
    return new Response(
      JSON.stringify({
        message: aiResponse.message,
        cricketData: cricketData,
        playerStats: playerStats,
        schedules: schedules
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
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

async function fetchCricketData() {
  try {
    // Fetch live matches
    const matchesUrl = `https://api.cricapi.com/v1/currentMatches?apikey=${CRICKET_API_KEY}&offset=0&per_page=10`;
    const matchesResponse = await fetch(matchesUrl);
    
    if (!matchesResponse.ok) {
      throw new Error(`API response not ok: ${matchesResponse.status}`);
    }
    
    const matchesData = await matchesResponse.json();
    
    // Fetch additional scorecard data for live matches
    const enhancedMatches = await Promise.all(
      matchesData.data
        .filter(match => match.matchStarted && !match.matchEnded)
        .map(async (match) => {
          try {
            const scorecardUrl = `https://api.cricapi.com/v1/match_info?apikey=${CRICKET_API_KEY}&id=${match.id}`;
            const scorecardResponse = await fetch(scorecardUrl);
            
            if (scorecardResponse.ok) {
              const scorecardData = await scorecardResponse.json();
              return {
                ...match,
                scorecard: scorecardData.data
              };
            }
            
            return match;
          } catch (error) {
            console.error(`Error fetching scorecard for match ${match.id}:`, error);
            return match;
          }
        })
    );
    
    return enhancedMatches;
  } catch (error) {
    console.error("Error fetching cricket data:", error);
    return [];
  }
}

async function fetchPlayerStats() {
  try {
    // Fetch player statistics
    const playersUrl = `https://api.cricapi.com/v1/players?apikey=${CRICKET_API_KEY}&offset=0&per_page=20`;
    const playersResponse = await fetch(playersUrl);
    
    if (!playersResponse.ok) {
      throw new Error(`API response not ok: ${playersResponse.status}`);
    }
    
    const playersData = await playersResponse.json();
    
    // For top players, get detailed stats
    const topPlayers = playersData.data.slice(0, 5);
    const enhancedPlayers = await Promise.all(
      topPlayers.map(async (player) => {
        try {
          const playerStatsUrl = `https://api.cricapi.com/v1/players_info?apikey=${CRICKET_API_KEY}&id=${player.id}`;
          const statsResponse = await fetch(playerStatsUrl);
          
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            return {
              ...player,
              stats: statsData.data
            };
          }
          
          return player;
        } catch (error) {
          console.error(`Error fetching stats for player ${player.name}:`, error);
          return player;
        }
      })
    );
    
    return enhancedPlayers;
  } catch (error) {
    console.error("Error fetching player stats:", error);
    return [];
  }
}

async function fetchMatchSchedules() {
  try {
    // Fetch upcoming match schedules
    const schedulesUrl = `https://api.cricapi.com/v1/matches?apikey=${CRICKET_API_KEY}&offset=0&per_page=10`;
    const schedulesResponse = await fetch(schedulesUrl);
    
    if (!schedulesResponse.ok) {
      throw new Error(`API response not ok: ${schedulesResponse.status}`);
    }
    
    const schedulesData = await schedulesResponse.json();
    
    // Filter to only include upcoming matches
    const upcomingMatches = schedulesData.data.filter(match => 
      !match.matchStarted || (match.matchStarted && !match.matchEnded)
    );
    
    return upcomingMatches;
  } catch (error) {
    console.error("Error fetching match schedules:", error);
    return [];
  }
}

async function getChatGPTResponse(context) {
  // Use the OPENAI_API_KEY environment variable
  if (!OPENAI_API_KEY) {
    return {
      message: "AI analysis is not available at the moment. Here's the raw cricket data instead."
    };
  }
  
  try {
    // Prepare relevant data for ChatGPT
    const liveMatchesInfo = context.matches.map(match => ({
      name: match.name,
      status: match.status,
      teams: match.teams,
      score: match.score
    }));
    
    // Create a prompt based on the query
    let systemPrompt = `You are a cricket fantasy expert assistant. 
You analyze real-time cricket data and provide helpful advice to fantasy cricket players.
Be concise, insightful, and actionable in your responses.
Current date: ${new Date().toISOString().split('T')[0]}`;

    // Prepare match data summary
    const matchDataSummary = liveMatchesInfo.length > 0 
      ? `Here's the current match data: ${JSON.stringify(liveMatchesInfo)}` 
      : "There are no live matches at the moment.";
      
    // Player data summary
    const playerDataSummary = context.playerStats.length > 0
      ? `Here's the current player data: ${JSON.stringify(context.playerStats)}`
      : "No player data is available.";
      
    // Combine with the user's specific query
    const combinedPrompt = `Based on this cricket data: 
${matchDataSummary}
${playerDataSummary}
User query: "${context.query}"
Respond with the most relevant insights and advice based on the query.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: combinedPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API response not ok: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      message: data.choices[0].message.content
    };
  } catch (error) {
    console.error("Error getting ChatGPT response:", error);
    return {
      message: "Sorry, I couldn't analyze the cricket data at this moment. Please try again later."
    };
  }
}
