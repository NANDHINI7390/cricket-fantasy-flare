
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
      console.log("Fetching cricket data...");
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
        query.toLowerCase().includes("team") ||
        query.toLowerCase().includes("pick") ||
        query.toLowerCase().includes("recommend")) {
      try {
        console.log("Fetching player stats...");
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
        console.log("Fetching match schedules...");
        schedules = await fetchMatchSchedules();
        console.log("Fetched match schedules successfully:", schedules.length > 0 ? "Data available" : "No data");
      } catch (error) {
        console.error("Error fetching match schedules:", error);
        // Continue with empty data
      }
    }
    
    // 4. Get detailed match info for any ongoing matches
    const matchDetails = [];
    if (cricketData.length > 0) {
      try {
        console.log("Fetching match details for ongoing matches...");
        const liveMatches = cricketData.filter(match => 
          match.matchStarted && !match.matchEnded || 
          match.status.toLowerCase().includes("live"));
          
        for (const match of liveMatches.slice(0, 3)) { // Limit to 3 to avoid rate limits
          try {
            const details = await fetchMatchInfo(match.id);
            if (details) {
              matchDetails.push(details);
            }
          } catch (error) {
            console.error(`Error fetching details for match ${match.id}:`, error);
          }
        }
        console.log(`Fetched ${matchDetails.length} match details`);
      } catch (error) {
        console.error("Error processing match details:", error);
      }
    }
    
    // 5. Check if we have any data at all
    const hasAnyData = cricketData.length > 0 || playerStats.length > 0 || schedules.length > 0 || matchDetails.length > 0;
    
    if (!hasAnyData) {
      console.log("No cricket data available for analysis");
    }
    
    // 6. Prepare context for ChatGPT
    const context = {
      matches: cricketData,
      playerStats: playerStats,
      schedules: schedules,
      matchDetails: matchDetails,
      query: query,
      currentDate: new Date().toISOString().split('T')[0]
    };
    
    // 7. Get response from ChatGPT
    const aiResponse = await getChatGPTResponse(context, hasAnyData);
    console.log("Got AI response");
    
    return new Response(
      JSON.stringify({
        message: aiResponse.message,
        cricketData: cricketData,
        playerStats: playerStats,
        schedules: schedules,
        matchDetails: matchDetails,
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
    // Direct approach with specific parameters to ensure we get results
    const matchesUrl = `https://api.cricapi.com/v1/currentMatches?apikey=${CRICKET_API_KEY}&offset=0&per_page=25`;
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
    
    // Enhance match data with additional info
    const enhancedMatches = matchesData.data.map(match => {
      // Format match data for easier consumption
      return {
        ...match,
        formattedStartTime: match.dateTimeGMT ? formatDateTime(match.dateTimeGMT) : "Time unknown",
        isLive: match.matchStarted && !match.matchEnded || 
                match.status.toLowerCase().includes("live") ||
                (match.score && match.score.length > 0)
      };
    });
    
    return enhancedMatches;
  } catch (error) {
    console.error("Error fetching cricket data:", error);
    // Try alternate endpoint as fallback
    try {
      const fallbackUrl = `https://api.cricapi.com/v1/cricScore?apikey=${CRICKET_API_KEY}`;
      console.log("Trying fallback endpoint:", fallbackUrl);
      const fallbackResponse = await fetch(fallbackUrl);
      
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        if (fallbackData.status === "success" && Array.isArray(fallbackData.data)) {
          console.log(`Retrieved ${fallbackData.data.length} matches from fallback API`);
          
          // Transform fallback data to match the expected format
          const transformedData = fallbackData.data.map(match => {
            return {
              id: match.id,
              name: match.name || `${match.t1} vs ${match.t2}`,
              status: match.status || "Unknown",
              venue: match.venue || "Unknown venue",
              date: match.date || new Date().toISOString().split('T')[0],
              dateTimeGMT: match.dateTimeGMT || new Date().toISOString(),
              teams: [match.t1, match.t2],
              teamInfo: [
                { name: match.t1, img: match.t1img || "" },
                { name: match.t2, img: match.t2img || "" }
              ],
              score: parseScores(match.t1s, match.t2s, match.t1, match.t2),
              matchStarted: true,
              matchEnded: match.status.toLowerCase().includes("won") || match.status.toLowerCase().includes("complete"),
              formattedStartTime: formatDateTime(match.dateTimeGMT || new Date().toISOString()),
              isLive: !match.status.toLowerCase().includes("won") && !match.status.toLowerCase().includes("complete")
            };
          });
          
          return transformedData;
        }
      }
      throw new Error("Fallback API also failed");
    } catch (fallbackError) {
      console.error("Fallback fetch also failed:", fallbackError);
      return [];
    }
  }
}

// Helper function to parse scores from t1s and t2s strings
function parseScores(t1s, t2s, t1, t2) {
  const scores = [];
  
  if (t1s) {
    const match = t1s.match(/(\d+)\/(\d+)/);
    if (match) {
      const runs = parseInt(match[1]);
      const wickets = parseInt(match[2]);
      const oversMatch = t1s.match(/\(([^)]+)\)/);
      const overs = oversMatch ? parseFloat(oversMatch[1]) : 0;
      
      scores.push({
        r: runs,
        w: wickets,
        o: overs,
        inning: `${t1} Inning`
      });
    }
  }
  
  if (t2s) {
    const match = t2s.match(/(\d+)\/(\d+)/);
    if (match) {
      const runs = parseInt(match[1]);
      const wickets = parseInt(match[2]);
      const oversMatch = t2s.match(/\(([^)]+)\)/);
      const overs = oversMatch ? parseFloat(oversMatch[1]) : 0;
      
      scores.push({
        r: runs,
        w: wickets,
        o: overs,
        inning: `${t2} Inning`
      });
    }
  }
  
  return scores;
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
                stats: statsData.data,
                currentForm: calculatePlayerForm(statsData.data)
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

// Simple function to calculate player form based on recent stats
function calculatePlayerForm(playerData) {
  if (!playerData || !playerData.batting || !playerData.bowling) {
    return { rating: 0, description: "Unknown form" };
  }
  
  let formScore = 0;
  
  // Calculate batting form (prioritize recent average and strike rate)
  if (playerData.batting && playerData.batting.listA) {
    const avg = parseFloat(playerData.batting.listA.avg) || 0;
    const strikeRate = parseFloat(playerData.batting.listA.sr) || 0;
    
    if (avg > 40) formScore += 3;
    else if (avg > 30) formScore += 2;
    else if (avg > 20) formScore += 1;
    
    if (strikeRate > 140) formScore += 3;
    else if (strikeRate > 120) formScore += 2;
    else if (strikeRate > 100) formScore += 1;
  }
  
  // Calculate bowling form
  if (playerData.bowling && playerData.bowling.listA) {
    const avg = parseFloat(playerData.bowling.listA.avg) || 999;
    const economy = parseFloat(playerData.bowling.listA.econ) || 999;
    
    if (avg < 20) formScore += 3;
    else if (avg < 25) formScore += 2;
    else if (avg < 30) formScore += 1;
    
    if (economy < 6) formScore += 3;
    else if (economy < 7.5) formScore += 2;
    else if (economy < 9) formScore += 1;
  }
  
  // Determine form description
  let description = "Average form";
  if (formScore >= 8) description = "Excellent form";
  else if (formScore >= 6) description = "Very good form";
  else if (formScore >= 4) description = "Good form";
  else if (formScore >= 2) description = "Decent form";
  else if (formScore < 2) description = "Poor form";
  
  return { 
    rating: formScore,
    description
  };
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
    
    // Filter to only include upcoming matches and enhance with formatted times
    const upcomingMatches = schedulesData.data
      .filter(match => !match.matchStarted || (match.matchStarted && !match.matchEnded))
      .map(match => ({
        ...match,
        formattedStartTime: match.dateTimeGMT ? formatDateTime(match.dateTimeGMT) : "Time unknown"
      }));
    
    console.log(`Number of upcoming matches: ${upcomingMatches.length}`);
    
    return upcomingMatches;
  } catch (error) {
    console.error("Error fetching match schedules:", error);
    throw error; // Re-throw to be handled by caller
  }
}

// Helper function to format date and time clearly
function formatDateTime(dateTimeString) {
  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return "Invalid date";
    
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateTimeString;
  }
}

// Fetch detailed match info with player performances
async function fetchMatchInfo(matchId) {
  try {
    console.log(`Fetching detailed info for match ${matchId}`);
    const url = `https://api.cricapi.com/v1/match_info?apikey=${CRICKET_API_KEY}&id=${matchId}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Match info API returned ${response.status}`);
    }
    
    const data = await response.json();
    if (data.status !== "success" || !data.data) {
      throw new Error("Invalid match info data format");
    }
    
    console.log(`Successfully retrieved detailed info for match ${matchId}`);
    return {
      id: matchId,
      ...data.data,
      // Extract top performers
      topPerformers: extractTopPerformers(data.data)
    };
  } catch (error) {
    console.error(`Error fetching match info for ${matchId}:`, error);
    return null;
  }
}

// Extract top performers from match data
function extractTopPerformers(matchData) {
  const performers = {
    batsmen: [],
    bowlers: []
  };
  
  try {
    // Extract from scorecard if available
    if (matchData.scorecard) {
      matchData.scorecard.forEach(inning => {
        // Top batsmen
        if (inning.batting) {
          inning.batting.forEach(batsman => {
            if (parseInt(batsman.r) > 20) {
              performers.batsmen.push({
                name: batsman.batsman,
                team: inning.inning.split(" Inning")[0],
                runs: parseInt(batsman.r),
                balls: parseInt(batsman.b),
                fours: parseInt(batsman["4s"]),
                sixes: parseInt(batsman["6s"]),
                strikeRate: parseFloat(batsman.sr),
                isDismissed: batsman.dismissal !== "not out"
              });
            }
          });
        }
        
        // Top bowlers
        if (inning.bowling) {
          inning.bowling.forEach(bowler => {
            if (parseInt(bowler.w) > 0) {
              performers.bowlers.push({
                name: bowler.bowler,
                team: inning.inning.includes("Inning 1") ? matchData.teams[1] : matchData.teams[0],
                wickets: parseInt(bowler.w),
                overs: parseFloat(bowler.o),
                runs: parseInt(bowler.r),
                economy: parseFloat(bowler.eco),
                maidens: parseInt(bowler.m)
              });
            }
          });
        }
      });
    }
    
    // Sort by performance
    performers.batsmen.sort((a, b) => b.runs - a.runs);
    performers.bowlers.sort((a, b) => b.wickets - a.wickets || a.economy - b.economy);
    
    return performers;
  } catch (error) {
    console.error("Error extracting top performers:", error);
    return performers;
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
    // Prepare relevant match data for ChatGPT
    const matchesSummary = context.matches.map(match => ({
      name: match.name,
      status: match.status,
      teams: match.teams,
      score: match.score || [],
      venue: match.venue,
      date: match.date,
      formattedStartTime: match.formattedStartTime,
      matchStarted: match.matchStarted,
      matchEnded: match.matchEnded,
      isLive: match.isLive
    }));
    
    // Prepare relevant player data
    const playerSummary = context.playerStats.map(player => ({
      name: player.name,
      country: player.country,
      role: player.typeofplayer || "Unknown",
      currentForm: player.currentForm || { rating: 0, description: "Unknown form" },
      stats: player.stats ? {
        batting: player.stats.batting,
        bowling: player.stats.bowling
      } : "No detailed stats available"
    }));
    
    // Prepare schedule data
    const schedulesSummary = context.schedules.map(match => ({
      name: match.name,
      teams: match.teams,
      venue: match.venue,
      formattedStartTime: match.formattedStartTime
    }));
    
    // Prepare top performers data if available
    const matchDetailsSummary = context.matchDetails.map(match => ({
      id: match.id,
      name: match.name,
      status: match.status,
      topPerformers: match.topPerformers
    }));
    
    // Create a detailed system prompt
    let systemPrompt = `You are an expert cricket fantasy assistant that helps users make decisions for their fantasy cricket teams. 
You analyze real-time cricket data and provide helpful advice to fantasy cricket players.
Be conversational, specific, and actionable in your responses.
Current date: ${context.currentDate}

Important guidelines:
1. Always base your recommendations on the ACTUAL LIVE DATA provided, not general knowledge
2. When suggesting captains or players, include their SPECIFIC STATS from the current match (runs, wickets, strike rate, etc.)
3. Format match scores and player stats clearly using this format:
   **Match:** IND vs AUS **Score:** IND 145/3 (17.2 ov) **Captain Pick:** Virat Kohli – 56* (35 balls) **Top Bowling Pick:** Bumrah – 3/18 in 4 overs
4. For each recommendation, briefly explain WHY you're suggesting that player (current form, matchup advantages, etc.)
5. Be conversational and engaging - respond like a knowledgeable friend
6. If a user asks about a specific match, focus your response on that match
7. If the data doesn't contain what they're looking for, be honest about it`;

    // Customize response based on data availability
    let userPrompt = "";
    
    if (!hasData) {
      userPrompt = `The user's query is: "${context.query}"
      
Unfortunately, I don't have any current cricket matches, player stats, or schedule data available from the API right now.

Please respond with some general advice about fantasy cricket related to their query. Acknowledge that you don't have current data but provide general tips that would be helpful. If they're asking specifically about today's matches or current players, apologize for not having real-time data and offer general strategy advice for fantasy cricket instead.`;
    } else {
      // Prepare match data summary
      const liveMatchesSummary = matchesSummary.filter(m => m.isLive);
      const matchDataSection = liveMatchesSummary.length > 0 
        ? `LIVE MATCHES (${liveMatchesSummary.length}):\n${JSON.stringify(liveMatchesSummary, null, 2)}` 
        : "There are no live matches at the moment.";
        
      // Player data summary
      const playerDataSection = playerSummary.length > 0
        ? `PLAYER DATA:\n${JSON.stringify(playerSummary, null, 2)}`
        : "No detailed player data is available.";
        
      // Schedule data summary
      const scheduleDataSection = schedulesSummary.length > 0
        ? `UPCOMING MATCHES:\n${JSON.stringify(schedulesSummary, null, 2)}`
        : "No upcoming match schedule data is available.";
        
      // Match details with top performers
      const matchDetailsSection = matchDetailsSummary.length > 0
        ? `DETAILED MATCH DATA WITH TOP PERFORMERS:\n${JSON.stringify(matchDetailsSummary, null, 2)}`
        : "No detailed match data with player performances is available.";
        
      // Combine with the user's specific query
      userPrompt = `The user's query is: "${context.query}"
      
Available cricket data:
${matchDataSection}

${playerDataSection}

${scheduleDataSection}

${matchDetailsSection}

Based on this REAL-TIME DATA, provide a helpful and specific response to the user's query. 
If they're asking about captains or player picks, recommend specific players with their current stats.
Format match scores clearly and explain WHY each player is a good pick.
Be conversational and engaging - respond like a knowledgeable friend who's watching the matches live.`;
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
        max_tokens: 800
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
