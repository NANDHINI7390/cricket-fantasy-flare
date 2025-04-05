
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Use Deno.env.get to retrieve environment variables
const CRICKET_API_KEY = Deno.env.get('CRICAPI_KEY') || "a52ea237-09e7-4d69-b7cc-e4f0e79fb8ae";
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

console.log("Edge function started");
console.log("CRICKET_API_KEY:", CRICKET_API_KEY);
console.log("OPENAI_API_KEY set:", OPENAI_API_KEY ? "Yes" : "No");

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
    
    // Check if OpenAI API key is configured
    if (!OPENAI_API_KEY) {
      console.error("OpenAI API key is not configured");
      return new Response(
        JSON.stringify({ 
          message: "AI analysis is not available at the moment. Please ensure the OpenAI API key is properly configured.",
          error: "OPENAI_API_KEY not found"
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // 1. First fetch cricket data from API with detailed error handling
    let cricketData = [];
    try {
      cricketData = await fetchCricketData();
      console.log("Fetched cricket data successfully:", cricketData.length > 0 ? "Data available" : "No data");
    } catch (error) {
      console.error("Error fetching cricket data:", error);
      // Continue with empty data but don't fail completely
    }
    
    // 2. Get player stats if needed
    let playerStats = [];
    if (query.toLowerCase().includes("player") || 
        query.toLowerCase().includes("captain") || 
        query.toLowerCase().includes("team")) {
      try {
        playerStats = await fetchPlayerStats();
        console.log("Fetched player stats successfully:", playerStats.length > 0 ? "Data available" : "No data");
      } catch (error) {
        console.error("Error fetching player stats:", error);
        // Continue with empty data
      }
    }
    
    // 3. Get match schedules if requested
    let schedules = [];
    if (query.toLowerCase().includes("schedule") || 
        query.toLowerCase().includes("fixture") || 
        query.toLowerCase().includes("upcoming") ||
        query.toLowerCase().includes("today") ||
        query.toLowerCase().includes("match")) {
      try {
        schedules = await fetchMatchSchedules();
        console.log("Fetched match schedules successfully:", schedules.length > 0 ? "Data available" : "No data");
      } catch (error) {
        console.error("Error fetching match schedules:", error);
        // Continue with empty data
      }
    }
    
    // 4. Check if we have any data at all
    const hasAnyData = cricketData.length > 0 || playerStats.length > 0 || schedules.length > 0;
    
    if (!hasAnyData) {
      console.log("No cricket data available for analysis");
    }
    
    // 5. Prepare context for ChatGPT
    const context = {
      matches: cricketData,
      playerStats: playerStats,
      schedules: schedules,
      query: query,
      currentDate: new Date().toISOString().split('T')[0]
    };
    
    // 6. Get response from ChatGPT
    const aiResponse = await getChatGPTResponse(context, hasAnyData);
    console.log("Got AI response");
    
    return new Response(
      JSON.stringify({
        message: aiResponse.message,
        cricketData: cricketData,
        playerStats: playerStats,
        schedules: schedules,
        hasData: hasAnyData
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Edge Function Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        message: "Sorry, I couldn't process your request. Please try again later."
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function fetchCricketData() {
  try {
    // Fetch live matches with better error handling
    const matchesUrl = `https://api.cricapi.com/v1/currentMatches?apikey=${CRICKET_API_KEY}&offset=0&per_page=10`;
    console.log("Fetching cricket data from:", matchesUrl);
    
    const matchesResponse = await fetch(matchesUrl);
    
    if (!matchesResponse.ok) {
      const errorText = await matchesResponse.text();
      console.error(`Cricket API error (${matchesResponse.status}):`, errorText);
      throw new Error(`API response not ok: ${matchesResponse.status} - ${errorText}`);
    }
    
    const matchesData = await matchesResponse.json();
    
    if (matchesData.status !== "success") {
      console.error("Cricket API returned failure status:", matchesData);
      throw new Error(`Cricket API returned failure status: ${matchesData.status}`);
    }
    
    if (!matchesData.data || !Array.isArray(matchesData.data)) {
      console.error("Invalid data format received from Cricket API:", matchesData);
      throw new Error("Invalid data format received from Cricket API");
    }
    
    console.log(`Retrieved ${matchesData.data.length} matches from Cricket API`);
    
    // Check if we have any live matches
    const liveMatches = matchesData.data.filter(match => match.matchStarted && !match.matchEnded);
    console.log(`Number of live matches: ${liveMatches.length}`);
    
    // Fetch additional scorecard data for live matches
    const enhancedMatches = await Promise.all(
      liveMatches.map(async (match) => {
        try {
          const scorecardUrl = `https://api.cricapi.com/v1/match_info?apikey=${CRICKET_API_KEY}&id=${match.id}`;
          console.log(`Fetching scorecard for match ${match.id}`);
          
          const scorecardResponse = await fetch(scorecardUrl);
          
          if (scorecardResponse.ok) {
            const scorecardData = await scorecardResponse.json();
            if (scorecardData.status === "success") {
              console.log(`Successfully retrieved scorecard for match ${match.id}`);
              return {
                ...match,
                scorecard: scorecardData.data
              };
            } else {
              console.error(`Error fetching scorecard for match ${match.id}:`, scorecardData);
            }
          } else {
            console.error(`Error fetching scorecard for match ${match.id}: ${scorecardResponse.status}`);
          }
          
          return match;
        } catch (error) {
          console.error(`Error fetching scorecard for match ${match.id}:`, error);
          return match;
        }
      })
    );
    
    return enhancedMatches.length > 0 ? enhancedMatches : matchesData.data;
  } catch (error) {
    console.error("Error fetching cricket data:", error);
    throw error; // Re-throw to be handled by caller
  }
}

async function fetchPlayerStats() {
  try {
    // Fetch player statistics with better error handling
    const playersUrl = `https://api.cricapi.com/v1/players?apikey=${CRICKET_API_KEY}&offset=0&per_page=20`;
    console.log("Fetching player stats from:", playersUrl);
    
    const playersResponse = await fetch(playersUrl);
    
    if (!playersResponse.ok) {
      const errorText = await playersResponse.text();
      console.error(`Player API error (${playersResponse.status}):`, errorText);
      throw new Error(`API response not ok: ${playersResponse.status} - ${errorText}`);
    }
    
    const playersData = await playersResponse.json();
    
    if (playersData.status !== "success") {
      console.error("Player API returned failure status:", playersData);
      throw new Error(`Player API returned failure status: ${playersData.status}`);
    }
    
    if (!playersData.data || !Array.isArray(playersData.data)) {
      console.error("Invalid data format received from Player API:", playersData);
      throw new Error("Invalid data format received from Player API");
    }
    
    console.log(`Retrieved ${playersData.data.length} players from Cricket API`);
    
    // For top players, get detailed stats
    const topPlayers = playersData.data.slice(0, 5);
    const enhancedPlayers = await Promise.all(
      topPlayers.map(async (player) => {
        try {
          const playerStatsUrl = `https://api.cricapi.com/v1/players_info?apikey=${CRICKET_API_KEY}&id=${player.id}`;
          console.log(`Fetching detailed stats for player ${player.name}`);
          
          const statsResponse = await fetch(playerStatsUrl);
          
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            if (statsData.status === "success") {
              console.log(`Successfully retrieved stats for player ${player.name}`);
              return {
                ...player,
                stats: statsData.data
              };
            } else {
              console.error(`Error fetching stats for player ${player.name}:`, statsData);
            }
          } else {
            console.error(`Error fetching stats for player ${player.name}: ${statsResponse.status}`);
          }
          
          return player;
        } catch (error) {
          console.error(`Error fetching stats for player ${player.name}:`, error);
          return player;
        }
      })
    );
    
    return enhancedPlayers.length > 0 ? enhancedPlayers : playersData.data;
  } catch (error) {
    console.error("Error fetching player stats:", error);
    throw error; // Re-throw to be handled by caller
  }
}

async function fetchMatchSchedules() {
  try {
    // Fetch upcoming match schedules with better error handling
    const schedulesUrl = `https://api.cricapi.com/v1/matches?apikey=${CRICKET_API_KEY}&offset=0&per_page=10`;
    console.log("Fetching match schedules from:", schedulesUrl);
    
    const schedulesResponse = await fetch(schedulesUrl);
    
    if (!schedulesResponse.ok) {
      const errorText = await schedulesResponse.text();
      console.error(`Schedules API error (${schedulesResponse.status}):`, errorText);
      throw new Error(`API response not ok: ${schedulesResponse.status} - ${errorText}`);
    }
    
    const schedulesData = await schedulesResponse.json();
    
    if (schedulesData.status !== "success") {
      console.error("Schedules API returned failure status:", schedulesData);
      throw new Error(`Schedules API returned failure status: ${schedulesData.status}`);
    }
    
    if (!schedulesData.data || !Array.isArray(schedulesData.data)) {
      console.error("Invalid data format received from Schedules API:", schedulesData);
      throw new Error("Invalid data format received from Schedules API");
    }
    
    console.log(`Retrieved ${schedulesData.data.length} scheduled matches from Cricket API`);
    
    // Filter to only include upcoming matches
    const upcomingMatches = schedulesData.data.filter(match => 
      !match.matchStarted || (match.matchStarted && !match.matchEnded)
    );
    
    console.log(`Number of upcoming matches: ${upcomingMatches.length}`);
    
    return upcomingMatches;
  } catch (error) {
    console.error("Error fetching match schedules:", error);
    throw error; // Re-throw to be handled by caller
  }
}

async function getChatGPTResponse(context, hasData) {
  if (!OPENAI_API_KEY) {
    console.error("OpenAI API key is not configured or is invalid");
    return {
      message: "AI analysis is not available at the moment. The OpenAI API key is missing or invalid."
    };
  }
  
  try {
    // Prepare relevant data for ChatGPT
    const matchesSummary = context.matches.map(match => ({
      name: match.name,
      status: match.status,
      teams: match.teams,
      score: match.score || [],
      venue: match.venue,
      date: match.date,
      matchStarted: match.matchStarted,
      matchEnded: match.matchEnded
    }));
    
    const playerSummary = context.playerStats.map(player => ({
      name: player.name,
      country: player.country,
      role: player.typeofplayer || "Unknown",
      stats: player.stats ? {
        batting: player.stats.batting,
        bowling: player.stats.bowling
      } : "No detailed stats available"
    }));
    
    const schedulesSummary = context.schedules.map(match => ({
      name: match.name,
      date: match.date,
      teams: match.teams,
      venue: match.venue
    }));
    
    // Create a prompt based on the query
    let systemPrompt = `You are a cricket fantasy expert assistant. 
You analyze real-time cricket data and provide helpful advice to fantasy cricket players.
Be concise, insightful, and actionable in your responses.
Current date: ${context.currentDate}`;

    // Customize response based on data availability
    let userPrompt = "";
    
    if (!hasData) {
      userPrompt = `The user's query is: "${context.query}"
      
Unfortunately, I don't have any current cricket matches, player stats, or schedule data available from the API right now.

Please respond with some general advice about fantasy cricket related to their query. Acknowledge that you don't have current data but provide general tips that would be helpful. If they're asking specifically about today's matches or current players, apologize for not having real-time data and offer general strategy advice for fantasy cricket instead.`;
    } else {
      // Prepare match data summary
      const matchDataSummary = matchesSummary.length > 0 
        ? `Here's the current match data: ${JSON.stringify(matchesSummary)}` 
        : "There are no live matches at the moment.";
        
      // Player data summary
      const playerDataSummary = playerSummary.length > 0
        ? `Here's the current player data: ${JSON.stringify(playerSummary)}`
        : "No detailed player data is available.";
        
      // Schedule data summary
      const scheduleDataSummary = schedulesSummary.length > 0
        ? `Here's the upcoming match schedule data: ${JSON.stringify(schedulesSummary)}`
        : "No upcoming match schedule data is available.";
        
      // Combine with the user's specific query
      userPrompt = `The user's query is: "${context.query}"
      
Available cricket data:
${matchDataSummary}
${playerDataSummary}
${scheduleDataSummary}

Provide a helpful, relevant response to the user's query using this data. If the data doesn't contain what they're looking for, acknowledge that but provide the best advice you can with the available information. Make your response specific to cricket fantasy strategy.`;
    }

    console.log("Sending request to OpenAI API...");
    
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
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error (${response.status}):`, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Received OpenAI response successfully");
    
    return {
      message: data.choices[0].message.content
    };
  } catch (error) {
    console.error("Error getting ChatGPT response:", error);
    return {
      message: `Sorry, I couldn't analyze the cricket data at this moment. Error: ${error.message}`
    };
  }
}
