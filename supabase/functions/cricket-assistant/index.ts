
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

interface RequestData {
  query: string;
  matchData?: any[];
  requestType?: string;
}

interface ApiResponse {
  status: string;
  data: any[];
}

interface PlayerInfo {
  id: string;
  name: string;
  country?: string;
  role?: string;
  battingStyle?: string;
  bowlingStyle?: string;
}

interface MatchInfo {
  id: string;
  name: string;
  status: string;
  matchType?: string;
  venue?: string;
  dateTimeGMT?: string;
  teams?: string[];
  teamInfo?: { name: string; img: string }[];
  score?: {
    r?: number;
    w?: number;
    o?: number;
    inning: string;
  }[];
  players?: any[];
  tossChoice?: string;
}

// Use hardcoded API key as it works better
const CRICAPI_KEY = "a52ea237-09e7-4d69-b7cc-e4f0e79fb8ae";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://yefrdovbporfjdhfojyx.supabase.co";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllZnJkb3ZicG9yZmpkaGZvanl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyNjU2OTgsImV4cCI6MjA1MDg0MTY5OH0.F08ETpra6hqV7486oYbhUQ68WfluufgkHncJWS89gf4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Team information with flags
const teamFlags = [
  { team: "India", short: "IND", flag: "https://flagcdn.com/w320/in.png" },
  { team: "Australia", short: "AUS", flag: "https://flagcdn.com/w320/au.png" },
  { team: "England", short: "ENG", flag: "https://flagcdn.com/w320/gb-eng.png" },
  { team: "New Zealand", short: "NZ", flag: "https://flagcdn.com/w320/nz.png" },
  { team: "Pakistan", short: "PAK", flag: "https://flagcdn.com/w320/pk.png" },
  { team: "South Africa", short: "SA", flag: "https://flagcdn.com/w320/za.png" },
  { team: "Sri Lanka", short: "SL", flag: "https://flagcdn.com/w320/lk.png" },
  { team: "Bangladesh", short: "BAN", flag: "https://flagcdn.com/w320/bd.png" },
  { team: "Afghanistan", short: "AFG", flag: "https://flagcdn.com/w320/af.png" },
  { team: "West Indies", short: "WI", flag: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d5/Cricket_West_Indies_flag.svg/320px-Cricket_West_Indies_flag.svg.png" },
  { team: "Ireland", short: "IRE", flag: "https://flagcdn.com/w320/ie.png" },
  { team: "Netherlands", short: "NED", flag: "https://flagcdn.com/w320/nl.png" },
  { team: "Nepal", short: "NEP", flag: "https://flagcdn.com/w320/np.png" },
  { team: "Scotland", short: "SCO", flag: "https://flagcdn.com/w320/gb-sct.png" },
  { team: "Namibia", short: "NAM", flag: "https://flagcdn.com/w320/na.png" },
  { team: "Oman", short: "OMA", flag: "https://flagcdn.com/w320/om.png" },
  { team: "United Arab Emirates", short: "UAE", flag: "https://flagcdn.com/w320/ae.png" },
  { team: "USA", short: "USA", flag: "https://flagcdn.com/w320/us.png" },
  { team: "Canada", short: "CAN", flag: "https://flagcdn.com/w320/ca.png" }
];

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CRICKET-ASSISTANT] ${step}${detailsStr}`);
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
          message: "Please provide a question or query about cricket."
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    logStep(`Processing ${requestType} query: ${userQuery}`);
    
    let cricketData;
    let message;
    let playerStats;
    
    // Determine query intent and fetch appropriate data
    const queryLower = userQuery.toLowerCase();
    
    if (queryLower.includes('player') || queryLower.includes('squad') || queryLower.includes('rohit') || queryLower.includes('virat')) {
      // Fetch player data
      cricketData = await fetchPlayerData(queryLower);
      message = generatePlayerResponse(userQuery, cricketData);
    } else if (queryLower.includes('captain') || queryLower.includes('suggest') || queryLower.includes('fantasy') || queryLower.includes('team')) {
      // Fetch current matches for fantasy suggestions
      cricketData = await fetchMatchData();
      
      if (OPENAI_API_KEY) {
        try {
          const aiResponse = await generateAIResponse(userQuery, cricketData, requestType);
          message = aiResponse.message;
          playerStats = aiResponse.playerStats;
        } catch (e) {
          logStep("AI Error, using fallback", e.message);
          message = generateFantasyResponse(userQuery, cricketData);
        }
      } else {
        message = generateFantasyResponse(userQuery, cricketData);
      }
    } else {
      // Fetch general match data
      cricketData = await fetchMatchData();
      message = generateMatchResponse(userQuery, cricketData);
    }
    
    return new Response(
      JSON.stringify({
        message,
        cricketData: cricketData?.matches || cricketData || [],
        playerStats,
        hasData: (cricketData?.matches?.length || cricketData?.length || 0) > 0,
        requestType
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    logStep(`Error processing request: ${error.message}`);
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

// Fetch current match data
async function fetchMatchData(): Promise<{ matches: MatchInfo[] }> {
  try {
    logStep("Fetching current matches");
    
    const currentMatchesResponse = await fetch(
      `https://api.cricapi.com/v1/currentMatches?apikey=${CRICAPI_KEY}&offset=0`
    );
    const currentMatches: ApiResponse = await currentMatchesResponse.json();
    
    if (currentMatches.status !== "success" || !currentMatches.data) {
      logStep("No current matches found");
      return { matches: [] };
    }

    // Process matches and add team flags
    const processedMatches = currentMatches.data.map(match => {
      const teams = match.teams || [];
      const teamInfo = teams.map((teamName: string) => {
        const teamData = teamFlags.find(t => 
          t.team === teamName || 
          t.short === teamName || 
          teamName.toLowerCase().includes(t.team.toLowerCase())
        );
        return {
          name: teamName,
          img: teamData?.flag || 'https://flagcdn.com/w320/in.png'
        };
      });

      return {
        ...match,
        teamInfo,
        localDateTime: match.dateTimeGMT ? new Date(match.dateTimeGMT).toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        }) : null
      };
    });

    logStep(`Processed ${processedMatches.length} matches`);
    return { matches: processedMatches };
  } catch (error) {
    logStep("Error fetching match data", error.message);
    return { matches: [] };
  }
}

// Fetch player data
async function fetchPlayerData(query: string): Promise<PlayerInfo[]> {
  try {
    logStep("Fetching player data");
    
    const playersResponse = await fetch(
      `https://api.cricapi.com/v1/players?apikey=${CRICAPI_KEY}&offset=0`
    );
    const playersData: ApiResponse = await playersResponse.json();
    
    if (playersData.status !== "success" || !playersData.data) {
      logStep("No player data found");
      return [];
    }

    // Filter players based on query
    const players = playersData.data.filter((player: PlayerInfo) => 
      player.name.toLowerCase().includes(query) ||
      query.includes(player.name.toLowerCase().split(' ')[0])
    );

    logStep(`Found ${players.length} matching players`);
    return players;
  } catch (error) {
    logStep("Error fetching player data", error.message);
    return [];
  }
}

// Generate player response
function generatePlayerResponse(query: string, players: PlayerInfo[]): string {
  if (!players || players.length === 0) {
    return "🏏 I couldn't find specific player information at the moment. The player database might be updating. Try asking about current matches or fantasy team suggestions instead!";
  }

  if (players.length === 1) {
    const player = players[0];
    return `🏏 **${player.name}** from ${player.country || 'Unknown'}\n\n` +
           `🏗️ Role: ${player.role || 'Not specified'}\n` +
           `🏏 Batting: ${player.battingStyle || 'Not specified'}\n` +
           `⚡ Bowling: ${player.bowlingStyle || 'Not specified'}\n\n` +
           `This player could be a good choice for your fantasy team depending on current form and match conditions!`;
  }

  let response = `🏏 Found ${players.length} players matching your search:\n\n`;
  players.slice(0, 5).forEach(player => {
    response += `• **${player.name}** (${player.country || 'Unknown'})\n`;
  });
  
  if (players.length > 5) {
    response += `\n...and ${players.length - 5} more players`;
  }
  
  return response;
}

// Generate match response
function generateMatchResponse(query: string, data: { matches: MatchInfo[] }): string {
  if (!data.matches || data.matches.length === 0) {
    return "🏏 No current matches available at the moment. Check back later for live cricket action!";
  }

  const liveMatches = data.matches.filter(m => 
    m.status?.toLowerCase().includes('live') || 
    m.status?.toLowerCase().includes('innings')
  );
  
  const upcomingMatches = data.matches.filter(m => 
    !liveMatches.includes(m) && 
    (m.status?.toLowerCase().includes('toss') || 
     m.status?.toLowerCase().includes('scheduled'))
  );

  let response = "🏏 **Current Cricket Matches:**\n\n";

  if (liveMatches.length > 0) {
    response += "🔴 **LIVE NOW:**\n";
    liveMatches.slice(0, 3).forEach(match => {
      const teams = match.teams?.join(' vs ') || match.name;
      response += `• ${teams}\n  Status: ${match.status}\n`;
      if (match.score && match.score.length > 0) {
        match.score.forEach(s => {
          response += `  ${s.inning}: ${s.r}/${s.w} (${s.o} overs)\n`;
        });
      }
      response += "\n";
    });
  }

  if (upcomingMatches.length > 0) {
    response += "⏰ **UPCOMING:**\n";
    upcomingMatches.slice(0, 3).forEach(match => {
      const teams = match.teams?.join(' vs ') || match.name;
      response += `• ${teams}\n  ${match.localDateTime || 'Time TBD'}\n\n`;
    });
  }

  response += "Ask me for fantasy team suggestions or player recommendations!";
  return response;
}

// Generate fantasy response
function generateFantasyResponse(query: string, data: { matches: MatchInfo[] }): string {
  if (!data.matches || data.matches.length === 0) {
    return "🏏 No current match data available for fantasy suggestions. Please check back when matches are live!";
  }

  const match = data.matches[0];
  const teams = match.teams || [];
  
  let response = `🏏 **Fantasy Team Suggestions for ${match.name}:**\n\n`;
  
  if (teams.length >= 2) {
    response += `👑 **Captain Pick:** Choose a reliable top-order batsman from ${teams[0]} or ${teams[1]}\n\n`;
    response += `⭐ **Vice-Captain:** Consider an all-rounder or in-form wicket-keeper\n\n`;
    response += `🎯 **Key Strategy:**\n`;
    response += `• Pick 6-7 batsmen from both teams\n`;
    response += `• Select 3-4 bowlers based on pitch conditions\n`;
    response += `• Include 1 wicket-keeper\n`;
    response += `• Focus on players in good recent form\n\n`;
    response += `💡 **Tip:** Monitor toss decision and team news before finalizing your team!`;
  } else {
    response += `🎯 **General Fantasy Tips:**\n`;
    response += `• Always pick players in current good form\n`;
    response += `• Consider pitch and weather conditions\n`;
    response += `• Balance your team across all departments\n`;
    response += `• Keep an eye on recent head-to-head records`;
  }
  
  return response;
}

// Generate AI response using OpenAI
async function generateAIResponse(query: string, cricketData: any, requestType: string): Promise<{ message: string; playerStats?: any[] }> {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  let matchContext = "";
  if (cricketData?.matches && cricketData.matches.length > 0) {
    matchContext += "Current Cricket Matches:\n";
    cricketData.matches.slice(0, 3).forEach((match: any) => {
      matchContext += `- ${match.name}\n`;
      matchContext += `  Status: ${match.status}\n`;
      matchContext += `  Teams: ${match.teams?.join(' vs ') || 'Teams TBD'}\n`;
      if (match.score && match.score.length > 0) {
        matchContext += `  Live Score: `;
        match.score.forEach((s: any) => {
          matchContext += `${s.inning}: ${s.r}/${s.w} (${s.o} overs) `;
        });
        matchContext += `\n`;
      }
      matchContext += `\n`;
    });
  }

  const systemPrompt = requestType === 'fantasy_analysis' 
    ? `You are an expert Fantasy Cricket Assistant. Provide specific player recommendations with clear reasoning. Always suggest Captain, Vice-Captain, and key players with justification.`
    : `You are a Cricket Assistant. Provide helpful information about matches, scores, and players based on the provided data.`;

  const userPrompt = `${matchContext}\n\nUser question: ${query}\n\nProvide a helpful cricket response.`;

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
        max_tokens: 600
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    return { message: aiResponse };
  } catch (error) {
    logStep("Error generating AI response", error);
    throw error;
  }
}
