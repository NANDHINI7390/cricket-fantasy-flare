import { serve } from "https://deno.land/std@0.170.0/http/server.ts";

interface RequestData {
  query: string;
  matchData?: any[];
  requestType?: string;
}

interface ApiResponse {
  status: string;
  data: any[];
}

const CRICAPI_KEY = Deno.env.get("CRICAPI_KEY") || "a52ea237-09e7-4d69-b7cc-e4f0e79fb8ae";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://yefrdovbporfjdhfojyx.supabase.co";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllZnJkb3ZicG9yZmpkaGZvanl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyNjU2OTgsImV4cCI6MjA1MDg0MTY5OH0.F08ETpra6hqV7486oYbhUQ68WfluufgkHncJWS89gf4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    const requestData: RequestData = await req.json();
    const userQuery = requestData.query || '';
    const requestType = requestData.requestType || 'general';
    
    if (!userQuery) {
      return new Response(
        JSON.stringify({ 
          error: "Missing query parameter", 
          message: "Please provide a question about cricket."
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log(`Processing ${requestType} query: ${userQuery}`);
    
    // Determine which APIs to call based on query
    const apiPlan = determineApiStrategy(userQuery);
    console.log("API execution plan:", apiPlan);
    
    // Fetch data from relevant APIs
    const cricketData = await fetchRelevantData(apiPlan, userQuery);
    console.log(`Fetched data from ${Object.keys(cricketData).length} API endpoints`);
    
    let message;
    let playerStats;
    
    // Generate AI response if OpenAI is available
    if (OPENAI_API_KEY) {
      try {
        const aiResponse = await generateEnhancedAIResponse(userQuery, cricketData, apiPlan);
        message = aiResponse.message;
        playerStats = aiResponse.playerStats;
      } catch (e) {
        console.error("Error generating AI response:", e);
        message = generateIntelligentResponse(userQuery, cricketData, apiPlan);
      }
    } else {
      message = generateIntelligentResponse(userQuery, cricketData, apiPlan);
    }
    
    return new Response(
      JSON.stringify({
        message,
        cricketData: cricketData.matches || [],
        playerStats,
        apiPlan,
        hasData: Object.keys(cricketData).length > 0,
        requestType
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error(`Error processing request: ${error.message}`);
    return new Response(
      JSON.stringify({ 
        error: "Server error", 
        message: "Sorry, there was an error processing your request." 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

// Enhanced API strategy determination
function determineApiStrategy(query: string): {
  endpoints: string[];
  queryType: string;
  intent: string;
  requiresChaining: boolean;
} {
  const queryLower = query.toLowerCase();
  
  // Squad search queries - prioritize this
  if (queryLower.includes('in the squad') || queryLower.includes('in squad') || 
      queryLower.includes('rohit') || queryLower.includes('kohli') ||
      (queryLower.includes('is ') && (queryLower.includes('playing') || queryLower.includes('selected')))) {
    return {
      endpoints: ['players'],
      queryType: 'squad_search',
      intent: 'Search for specific player in squad database',
      requiresChaining: false
    };
  }
  
  // Current matches queries
  if (queryLower.includes('today') || queryLower.includes('now') || 
      queryLower.includes('live') || queryLower.includes('happening') ||
      queryLower.includes('india playing') || queryLower.includes('matches')) {
    return {
      endpoints: ['currentMatches'],
      queryType: 'current_matches',
      intent: 'Show current/live cricket matches',
      requiresChaining: false
    };
  }
  
  // Fantasy team suggestions (requires chaining)
  if (queryLower.includes('suggest') || queryLower.includes('fantasy team') || 
      queryLower.includes('captain') || queryLower.includes('vice captain') ||
      queryLower.includes('pick') || queryLower.includes('recommend')) {
    return {
      endpoints: ['currentMatches', 'match_squad', 'match_scorecard'],
      queryType: 'fantasy_team',
      intent: 'Suggest fantasy team with detailed analysis',
      requiresChaining: true
    };
  }
  
  // Player performance queries
  if (queryLower.includes('perform') || queryLower.includes('stats') || 
      queryLower.includes('points') || queryLower.includes('last match') ||
      queryLower.includes('kohli') || queryLower.includes('rohit') ||
      queryLower.includes('hardik') || queryLower.includes('bumrah')) {
    return {
      endpoints: ['match_scorecard', 'players'],
      queryType: 'player_stats',
      intent: 'Show player performance and statistics',
      requiresChaining: true
    };
  }
  
  // Squad queries
  if (queryLower.includes('squad') || queryLower.includes('team players') || 
      queryLower.includes('who are') || queryLower.includes('players in')) {
    return {
      endpoints: ['match_squad', 'players'],
      queryType: 'squad_info',
      intent: 'Show squad and team information',
      requiresChaining: false
    };
  }
  
  // Fantasy scores from completed matches
  if (queryLower.includes('fantasy score') || queryLower.includes('points breakdown') || 
      queryLower.includes('yesterday') || queryLower.includes('last game')) {
    return {
      endpoints: ['currentMatches', 'match_scorecard'],
      queryType: 'fantasy_scores',
      intent: 'Show fantasy point breakdowns from recent matches',
      requiresChaining: true
    };
  }
  
  return {
    endpoints: ['currentMatches'],
    queryType: 'general',
    intent: 'General cricket information',
    requiresChaining: false
  };
}

// Enhanced data fetching with squad search
async function fetchRelevantData(apiPlan: any, userQuery?: string): Promise<any> {
  const data: any = {};
  
  try {
    // Handle squad search specifically
    if (apiPlan.queryType === 'squad_search') {
      try {
        const playersResponse = await fetch(
          `https://api.cricapi.com/v1/players?apikey=${CRICAPI_KEY}&offset=0`
        );
        const playersData = await playersResponse.json();
        data.players = playersData.status === "success" ? playersData.data : [];
        console.log(`Fetched ${data.players.length} players for squad search`);
        
        // Search for the specific player mentioned in query
        if (userQuery && data.players.length > 0) {
          const playerName = extractPlayerName(userQuery);
          data.searchResults = searchPlayerInSquad(playerName, data.players);
          console.log(`Found ${data.searchResults.length} matching players for "${playerName}"`);
        }
        
        return data;
      } catch (e) {
        console.warn("Could not fetch players data:", e);
        return data;
      }
    }
    
    // Always fetch current matches first for other queries
    if (apiPlan.endpoints.includes('currentMatches')) {
      const matchesResponse = await fetch(
        `https://api.cricapi.com/v1/currentMatches?apikey=${CRICAPI_KEY}&offset=0`
      );
      const matchesData = await matchesResponse.json();
      data.matches = matchesData.status === "success" ? matchesData.data : [];
      console.log(`Fetched ${data.matches.length} current matches`);
    }
    
    // If chaining is required, use match data to fetch additional info
    if (apiPlan.requiresChaining && data.matches && data.matches.length > 0) {
      const primaryMatch = data.matches.find((m: any) => 
        m.status?.toLowerCase().includes('live') || 
        m.matchStarted === true
      ) || data.matches[0];
      
      if (primaryMatch && apiPlan.endpoints.includes('match_squad')) {
        try {
          const squadResponse = await fetch(
            `https://api.cricapi.com/v1/match_squad?apikey=${CRICAPI_KEY}&id=${primaryMatch.id}`
          );
          const squadData = await squadResponse.json();
          data.squad = squadData.status === "success" ? squadData.data : null;
          console.log("Fetched squad data for match:", primaryMatch.name);
        } catch (e) {
          console.warn("Could not fetch squad data:", e);
        }
      }
      
      if (primaryMatch && apiPlan.endpoints.includes('match_scorecard')) {
        try {
          const scorecardResponse = await fetch(
            `https://api.cricapi.com/v1/match_scorecard?apikey=${CRICAPI_KEY}&id=${primaryMatch.id}`
          );
          const scorecardData = await scorecardResponse.json();
          data.scorecard = scorecardData.status === "success" ? scorecardData.data : null;
          console.log("Fetched scorecard data for match:", primaryMatch.name);
        } catch (e) {
          console.warn("Could not fetch scorecard data:", e);
        }
      }
    }
    
    // Fetch general players if needed
    if (apiPlan.endpoints.includes('players')) {
      try {
        const playersResponse = await fetch(
          `https://api.cricapi.com/v1/players?apikey=${CRICAPI_KEY}&offset=0`
        );
        const playersData = await playersResponse.json();
        data.players = playersData.status === "success" ? playersData.data.slice(0, 20) : [];
        console.log(`Fetched ${data.players.length} player profiles`);
      } catch (e) {
        console.warn("Could not fetch players data:", e);
      }
    }
    
  } catch (error) {
    console.error("Error fetching cricket data:", error);
  }
  
  return data;
}

// Helper functions
function extractPlayerName(query: string): string {
  const queryLower = query.toLowerCase();
  
  // Common player names to look for
  const playerNames = ['rohit', 'kohli', 'virat', 'hardik', 'bumrah', 'dhoni', 'sharma', 'pandya'];
  
  for (const name of playerNames) {
    if (queryLower.includes(name)) {
      return name;
    }
  }
  
  // Extract potential name after "is" or before "in"
  const isMatch = query.match(/is\s+(\w+)/i);
  if (isMatch) return isMatch[1];
  
  const beforeInMatch = query.match(/(\w+)\s+in/i);
  if (beforeInMatch) return beforeInMatch[1];
  
  return '';
}

function searchPlayerInSquad(playerName: string, squadData: any[]): any[] {
  if (!squadData || !Array.isArray(squadData)) return [];
  
  const searchTerm = playerName.toLowerCase();
  return squadData.filter(player => 
    player.name && player.name.toLowerCase().includes(searchTerm)
  );
}

// Enhanced response generation
function generateIntelligentResponse(query: string, cricketData: any, apiPlan: any): string {
  const queryLower = query.toLowerCase();
  
  // Handle squad search results
  if (apiPlan.queryType === 'squad_search') {
    if (!cricketData.players || cricketData.players.length === 0) {
      return "I couldn't fetch the player database at the moment. Please try again later.";
    }
    
    const playerName = extractPlayerName(query);
    const searchResults = cricketData.searchResults || [];
    
    if (searchResults.length > 0) {
      let response = `🏏 **Found ${searchResults.length} player(s) matching "${playerName}":**\n\n`;
      searchResults.slice(0, 5).forEach((player: any) => {
        response += `• **${player.name}** (${player.country})\n`;
      });
      
      if (searchResults.length > 5) {
        response += `\n...and ${searchResults.length - 5} more players found.`;
      }
      
      return response;
    } else {
      return `❌ No players found matching "${playerName}" in the current database. The player might not be in the system or try a different spelling.`;
    }
  }
  
  if (apiPlan.queryType === 'current_matches') {
    if (!cricketData.matches || cricketData.matches.length === 0) {
      return "No live cricket matches found at the moment. Please check back later for updates.";
    }
    
    const liveMatches = cricketData.matches.filter((m: any) => 
      m.status?.toLowerCase().includes('live') || m.matchStarted === true
    );
    
    if (liveMatches.length > 0) {
      const match = liveMatches[0];
      let response = `🏏 **${match.name}** is currently live!\n\n`;
      
      if (match.teams && match.teams.length >= 2) {
        response += `**Teams:** ${match.teams[0]} vs ${match.teams[1]}\n`;
      }
      
      if (match.venue) response += `**Venue:** ${match.venue}\n`;
      if (match.status) response += `**Status:** ${match.status}\n`;
      
      if (match.score && match.score.length > 0) {
        response += `**Live Score:**\n`;
        match.score.forEach((s: any) => {
          response += `${s.inning}: ${s.r || 0}/${s.w || 0} (${s.o || 0} overs)\n`;
        });
      }
      
      return response;
    } else {
      const upcomingMatch = cricketData.matches[0];
      return `⏰ **${upcomingMatch.name}** is scheduled to start soon.\n**Teams:** ${upcomingMatch.teams?.join(' vs ') || 'Teams TBD'}`;
    }
  }
  
  if (apiPlan.queryType === 'fantasy_team') {
    if (!cricketData.matches || cricketData.matches.length === 0) {
      return "No current matches available for fantasy team suggestions. Please check back when matches are live.";
    }
    
    const targetMatch = cricketData.matches.find((m: any) => 
      m.status?.toLowerCase().includes('live') || m.matchStarted === true
    ) || cricketData.matches[0];
    
    let response = `🎯 **Fantasy Team Suggestion for ${targetMatch.name}:**\n\n`;
    
    if (cricketData.squad && cricketData.squad.length > 0) {
      response += `**Available Players:** ${cricketData.squad.slice(0, 5).map((p: any) => p.name).join(', ')}...\n\n`;
    }
    
    response += `**Recommended Strategy:**\n`;
    response += `👑 **Captain:** Pick a reliable top-order batsman\n`;
    response += `⭐ **Vice-Captain:** Consider an all-rounder or in-form bowler\n`;
    response += `🏏 **Team Balance:** 6-7 batsmen, 3-4 bowlers, 1 wicket-keeper\n`;
    response += `📊 **Focus:** Players from both teams for balanced scoring`;
    
    return response;
  }
  
  if (apiPlan.queryType === 'player_stats') {
    if (cricketData.scorecard) {
      let response = `📊 **Player Performance Analysis:**\n\n`;
      
      // Extract player stats from scorecard
      if (cricketData.scorecard.scorecard && cricketData.scorecard.scorecard.length > 0) {
        const innings = cricketData.scorecard.scorecard[0];
        
        if (innings.batting && innings.batting.length > 0) {
          response += `**Top Batting Performances:**\n`;
          innings.batting.slice(0, 3).forEach((player: any) => {
            response += `• ${player.name}: ${player.runs} runs (${player.balls} balls, SR: ${player.strike_rate})\n`;
          });
        }
        
        if (innings.bowling && innings.bowling.length > 0) {
          response += `\n**Top Bowling Figures:**\n`;
          innings.bowling.slice(0, 3).forEach((player: any) => {
            response += `• ${player.name}: ${player.wickets}/${player.runs} (${player.overs} overs, ER: ${player.economy})\n`;
          });
        }
      }
      
      return response;
    } else {
      return "Player statistics are currently unavailable. Please try again when match data is available.";
    }
  }
  
  return "I can help you with live cricket scores, fantasy team suggestions, and player statistics. Try asking about current matches or fantasy picks!";
}

// Enhanced AI response generation
async function generateEnhancedAIResponse(query: string, cricketData: any, apiPlan: any): Promise<{ message: string; playerStats?: any[] }> {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  // Create comprehensive context
  let context = `Cricket Data Context:\n`;
  
  if (cricketData.matches) {
    context += `Current Matches (${cricketData.matches.length}):\n`;
    cricketData.matches.slice(0, 3).forEach((match: any) => {
      context += `- ${match.name}: ${match.status}\n`;
      if (match.teams) context += `  Teams: ${match.teams.join(' vs ')}\n`;
      if (match.score) {
        context += `  Score: `;
        match.score.forEach((s: any) => {
          context += `${s.inning}: ${s.r}/${s.w} (${s.o} overs) `;
        });
        context += `\n`;
      }
    });
  }
  
  if (cricketData.squad) {
    context += `\nSquad Information:\n`;
    cricketData.squad.slice(0, 10).forEach((player: any) => {
      context += `- ${player.name} (${player.role || 'Unknown role'})\n`;
    });
  }
  
  if (cricketData.scorecard) {
    context += `\nDetailed Match Statistics Available\n`;
  }
  
  // Generate specialized prompt
  const systemPrompt = `You are an expert Cricket Fantasy Assistant with access to live cricket data. Your role is to provide intelligent, data-driven responses about cricket matches, player statistics, and fantasy team recommendations.

IMPORTANT GUIDELINES:
- Use the provided cricket data to give specific, accurate information
- For fantasy suggestions, provide specific player names with reasoning
- Format responses with clear sections using markdown
- Include relevant statistics and match details
- Be conversational but informative

Query Type: ${apiPlan.queryType}
Intent: ${apiPlan.intent}`;

  const userPrompt = `${context}

User Query: "${query}"

Please provide a comprehensive response based on the cricket data above. Include specific player names, statistics, and actionable recommendations where relevant.`;

  try {
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
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Extract structured data for fantasy recommendations
    let playerStats: any[] = [];
    if (apiPlan.queryType === 'fantasy_team') {
      // Extract captain, vice-captain, and key players from response
      const captainMatch = aiResponse.match(/\*\*Captain[:\s]*\*\*[:\s]*([^:\n]+)/i);
      const vcMatch = aiResponse.match(/\*\*Vice[- ]Captain[:\s]*\*\*[:\s]*([^:\n]+)/i);
      
      if (captainMatch) {
        playerStats.push({
          name: captainMatch[1].trim(),
          role: 'Captain',
          details: 'AI recommended captain pick'
        });
      }
      
      if (vcMatch) {
        playerStats.push({
          name: vcMatch[1].trim(),
          role: 'Vice-Captain',
          details: 'AI recommended vice-captain pick'
        });
      }
    }
    
    return {
      message: aiResponse,
      playerStats: playerStats.length > 0 ? playerStats : undefined
    };
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw error;
  }
}
