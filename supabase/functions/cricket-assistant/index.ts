
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
  dateOfBirth?: string;
  role?: string;
  battingStyle?: string;
  bowlingStyle?: string;
}

interface Scorecard {
  match_id: string;
  scorecard: any[];
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
    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    // Parse request body
    const requestData: RequestData = await req.json();
    const userQuery = requestData.query || '';
    const providedMatchData = requestData.matchData || [];
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

    console.log(`Processing ${requestType} query: ${userQuery}`);
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Fetch fresh cricket data if not provided or if we need more comprehensive data
    let cricketData;
    if (providedMatchData.length > 0 && requestType === 'fantasy_analysis') {
      // Use provided match data for fantasy analysis
      cricketData = { matches: providedMatchData, scorecards: [], players: [] };
    } else {
      // Fetch fresh data
      cricketData = await fetchCricketData();
    }
    
    console.log(`Working with ${cricketData.matches?.length || 0} matches`);
    
    let message;
    let playerStats;
    
    // If OpenAI API key is available, use it for AI-powered responses
    if (OPENAI_API_KEY) {
      try {
        // Generate AI response
        const aiResponse = await generateAIResponse(userQuery, cricketData, requestType);
        message = aiResponse.message;
        playerStats = aiResponse.playerStats;
      } catch (e) {
        console.error("Error generating AI response:", e);
        // Fallback to basic response if AI fails
        message = generateBasicResponse(userQuery, cricketData.matches || []);
      }
    } else {
      // If no OpenAI API key, use basic response
      message = generateBasicResponse(userQuery, cricketData.matches || []);
    }
    
    return new Response(
      JSON.stringify({
        message,
        cricketData: cricketData.matches || [],
        playerStats,
        hasData: (cricketData.matches?.length || 0) > 0,
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

// Fetch cricket matches data from CricAPI
async function fetchCricketData(): Promise<{ matches: MatchInfo[], scorecards: Scorecard[], players: PlayerInfo[] }> {
  try {
    // Fetch current matches
    const currentMatchesResponse = await fetch(
      `https://api.cricapi.com/v1/currentMatches?apikey=${CRICAPI_KEY}&offset=0`
    );
    const currentMatches: ApiResponse = await currentMatchesResponse.json();
    console.log("currentMatches", currentMatches);
    
    if (currentMatches.status !== "success" || !currentMatches.data) {
      console.error("Error fetching current matches:", currentMatches);
      return { matches: [], scorecards: [], players: [] };
    }
    
    // Fetch live scores
    const scoresResponse = await fetch(
      `https://api.cricapi.com/v1/cricScore?apikey=${CRICAPI_KEY}`
    );
    const scores: ApiResponse = await scoresResponse.json();
    
    // Combine and process data
    let allMatches = [...currentMatches.data];
    
    // Format match times to IST (Indian Standard Time)
    allMatches = allMatches.map(match => {
      if (match.dateTimeGMT) {
        const matchDate = new Date(match.dateTimeGMT);
        const istFormatter = new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        });
        const localDateTime = istFormatter.format(matchDate);
        
        return {
          ...match,
          localDateTime
        };
      }
      return match;
    });
    
    // Categorize matches (Upcoming, Live, Completed)
    const now = new Date();
    allMatches = allMatches.map(match => {
      let category = "Upcoming";
      
      if (match.dateTimeGMT) {
        const matchTime = new Date(match.dateTimeGMT);
        const timeDiff = matchTime.getTime() - now.getTime();
        
        if (timeDiff > 0) {
          category = "Upcoming";
        } else {
          const statusLower = (match.status || "").toLowerCase();
          
          if (statusLower.includes("live") || 
              match.matchStarted === true && !match.matchEnded) {
            category = "Live";
          } 
          else if (statusLower.includes("won") || 
                  statusLower.includes("drawn") || 
                  statusLower.includes("match ended") ||
                  match.matchEnded === true) {
            category = "Completed";
          }
          else if (timeDiff > -12 * 60 * 60 * 1000) {
            category = "Live";
          }
          else {
            category = "Completed";
          }
        }
      }
      
      return {
        ...match,
        category
      };
    });
    
    // Filter live and upcoming matches for fetching scorecards
    const liveMatches = allMatches.filter(m => m.category === "Live");
    const upcomingMatches = allMatches
      .filter(m => m.category === "Upcoming")
      .sort((a, b) => new Date(a.dateTimeGMT || 0).getTime() - new Date(b.dateTimeGMT || 0).getTime())
      .slice(0, 3);

    const matchesToFetchScorecards = [...liveMatches, ...upcomingMatches];
    const scorecards: Scorecard[] = [];
    const playerIds = new Set<string>();

    // Fetch scorecards and collect player IDs
    for (const match of matchesToFetchScorecards) {
      try {
        const scorecardResponse = await fetch(
          `https://api.cricapi.com/v1/match_scorecard?apikey=${CRICAPI_KEY}&id=${match.id}`
        );
        const scorecardData: ApiResponse = await scorecardResponse.json();
        console.log(`scorecardData for match ${match.id}`, scorecardData);

        if (scorecardData.status === "success" && scorecardData.data && scorecardData.data.length > 0) {
          const scorecard = scorecardData.data[0];
          scorecards.push(scorecard);

          if (scorecard.scorecard) {
            scorecard.scorecard.forEach((inning: any) => {
              if (inning.batting) {
                inning.batting.forEach((batsman: any) => {
                  if (batsman.player_id) playerIds.add(batsman.player_id);
                });
              }
              if (inning.bowling) {
                inning.bowling.forEach((bowler: any) => {
                  if (bowler.player_id) playerIds.add(bowler.player_id);
                });
              }
            });
          }
        } else {
          console.warn(`Could not fetch scorecard for match ID ${match.id}`);
        }
      } catch (error) {
        console.error(`Error fetching scorecard for match ID ${match.id}:`, error);
      }
    }

    const players: PlayerInfo[] = [];
    // Fetch player information for collected player IDs (limit to avoid timeout)
    const playerIdArray = Array.from(playerIds).slice(0, 20);
    for (const playerId of playerIdArray) {
      try {
        const playerInfoResponse = await fetch(
          `https://api.cricapi.com/v1/players_info?apikey=${CRICAPI_KEY}&id=${playerId}`
        );
        const playerInfoData: ApiResponse = await playerInfoResponse.json();
        console.log(`playerInfoData for player ${playerId}`, playerInfoData);

        if (playerInfoData.status === "success" && playerInfoData.data && playerInfoData.data.length > 0) {
          players.push(playerInfoData.data[0]);
        } else {
          console.warn(`Could not fetch player info for player ID ${playerId}`);
        }
      } catch (error) {
        console.error(`Error fetching player info for player ID ${playerId}:`, error);
      }
    }

    return { matches: allMatches, scorecards, players };
  } catch (error) {
    console.error("Error fetching cricket data:", error);
    return { matches: [], scorecards: [], players: [] };
  }
}

// Generate a basic response based on the query and cricket data
function generateBasicResponse(query: string, cricketData: MatchInfo[]): string {
  const queryLower = query.toLowerCase();
  
  // Fantasy team suggestions
  if (queryLower.includes("suggest") || queryLower.includes("fantasy") || 
      queryLower.includes("team") || queryLower.includes("pick")) {
    
    if (cricketData.length === 0) {
      return "No current match data available for fantasy suggestions. Please check back later when matches are live.";
    }
    
    const liveMatch = cricketData.find(m => m.status?.toLowerCase().includes('live')) || cricketData[0];
    const teams = liveMatch.teams || [];
    
    let response = `🏏 Fantasy Team Suggestions for ${liveMatch.name}:\n\n`;
    
    if (teams.length >= 2) {
      response += `👑 Captain: Pick a reliable top-order batsman from ${teams[0]} or ${teams[1]}\n`;
      response += `⭐ Vice-Captain: Consider an all-rounder or wicket-keeper\n`;
      response += `🎯 Key Players: Focus on in-form players from both teams\n`;
      response += `📊 Strategy: Balance your team with 6-7 batsmen, 3-4 bowlers, and 1 wicket-keeper`;
    }
    
    return response;
  }
  
  // Match-related queries
  if (queryLower.includes("score") || queryLower.includes("match") || 
      queryLower.includes("result") || queryLower.includes("live")) {
    
    if (cricketData.length === 0) {
      return "I don't have any current match data available. Please check back later.";
    }
    
    const liveMatches = cricketData.filter(m => m.status?.toLowerCase().includes('live'));
    const upcomingMatches = cricketData.filter(m => m.category === "Upcoming");
    
    if (liveMatches.length > 0) {
      const match = liveMatches[0];
      let response = `📺 ${match.name} is currently live. `;
      
      if (match.score && match.score.length > 0) {
        match.score.forEach(s => {
          response += `${s.inning}: ${s.r || 0}/${s.w || 0} (${s.o || 0} overs). `;
        });
      }
      
      return response;
    } else if (upcomingMatches.length > 0) {
      const match = upcomingMatches[0];
      return `⏰ ${match.name} is scheduled to start at ${match.localDateTime || match.dateTimeGMT}.`;
    } else {
      return "I have information about some completed matches. Check the Matches tab for details.";
    }
  }
  
  // Player-related queries
  if (queryLower.includes("player") || queryLower.includes("captain") || 
      queryLower.includes("who should")) {
    
    return "For the best player recommendations, I need live match data. Try asking about specific ongoing matches or refresh the data to get current player insights.";
  }
  
  // Default response
  return "I can help you with cricket match scores, fantasy team suggestions, and player recommendations. Try asking about current matches or fantasy team picks for today's games.";
}

// Generate AI-powered response using OpenAI
async function generateAIResponse(query: string, cricketData: any, requestType: string): Promise<{ message: string; playerStats?: any[] }> {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  // Create comprehensive context for AI
  let matchContext = "";
  let playerContext = "";
  
  if (cricketData.matches && cricketData.matches.length > 0) {
    matchContext += "Current Cricket Matches:\n";
    cricketData.matches.slice(0, 5).forEach((match: any) => {
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
      if (match.venue) matchContext += `  Venue: ${match.venue}\n`;
      matchContext += `\n`;
    });
  }

  if (cricketData.players && cricketData.players.length > 0) {
    playerContext += "Player Information:\n";
    cricketData.players.slice(0, 10).forEach((player: any) => {
      playerContext += `- ${player.name}: ${player.role || 'Role unknown'}\n`;
      if (player.battingStyle) playerContext += `  Batting: ${player.battingStyle}\n`;
      if (player.bowlingStyle) playerContext += `  Bowling: ${player.bowlingStyle}\n`;
    });
  }

  // Create specialized prompts based on request type
  let systemPrompt = "";
  let userPrompt = "";

  if (requestType === 'fantasy_analysis') {
    systemPrompt = `You are an expert Fantasy Cricket Assistant with deep knowledge of player analysis and team strategy. Your role is to provide data-driven fantasy cricket recommendations.

IMPORTANT GUIDELINES:
- Always provide specific player names when making recommendations
- Justify picks with recent form, match conditions, or historical performance
- Structure responses with clear Captain, Vice-Captain, and key player suggestions
- Consider team balance (batsmen, bowlers, all-rounders, wicket-keepers)
- Factor in recent performances, pitch conditions, and head-to-head records
- Be confident in your recommendations but explain the reasoning

Format your fantasy recommendations like this:
**Captain Pick:** [Player Name] - [Specific reason with stats/form]
**Vice-Captain Pick:** [Player Name] - [Specific reason with stats/form]
**Key Players:**
- [Player Name] ([Role]): [Reason for selection]
- [Player Name] ([Role]): [Reason for selection]

Use the provided live match data and player information to make informed suggestions.`;

    userPrompt = `Based on the current cricket match data below, provide fantasy team recommendations for this user query: "${query}"

${matchContext}
${playerContext}

Please provide specific, actionable fantasy cricket advice with player names and clear reasoning.`;
  } else {
    systemPrompt = `You are a knowledgeable Cricket Assistant specializing in match analysis and player insights. Provide helpful, accurate information about cricket matches, scores, and player performances.

Guidelines:
- Use the provided match and player data to answer questions
- Be conversational and engaging
- Provide specific details when available
- If asked about fantasy cricket, give general strategic advice
- Focus on current/live matches when relevant`;

    userPrompt = `${matchContext}
${playerContext}

User question: ${query}

Please provide a helpful response based on the cricket data above.`;
  }

  try {
    // Call OpenAI API
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
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Extract player stats if the response includes recommendations
    let playerStats: any[] = [];

    if (requestType === 'fantasy_analysis') {
      // Extract Captain and Vice-Captain
      const captainMatch = aiResponse.match(/\*\*Captain Pick:\*\*\s*(.+?)(?:\n|$)/i);
      if (captainMatch && captainMatch[1]) {
        const captainText = captainMatch[1].trim();
        const nameMatch = captainText.match(/^([^-]+)/);
        if (nameMatch) {
          playerStats.push({ 
            name: nameMatch[1].trim(), 
            role: 'Captain', 
            details: captainText
          });
        }
      }

      const viceCaptainMatch = aiResponse.match(/\*\*Vice-Captain Pick:\*\*\s*(.+?)(?:\n|$)/i);
      if (viceCaptainMatch && viceCaptainMatch[1]) {
        const vcText = viceCaptainMatch[1].trim();
        const nameMatch = vcText.match(/^([^-]+)/);
        if (nameMatch) {
          playerStats.push({ 
            name: nameMatch[1].trim(), 
            role: 'Vice-Captain', 
            details: vcText
          });
        }
      }

      // Extract other key players
      const keyPlayersSection = aiResponse.match(/\*\*Key Players:\*\*([\s\S]*?)(?:\n\n|$)/i);
      if (keyPlayersSection) {
        const playersText = keyPlayersSection[1];
        const playerLines = playersText.split('\n').filter(line => line.trim().startsWith('-'));
        
        playerLines.forEach(line => {
          const playerMatch = line.match(/- (.+?) \((.+?)\): (.+)/);
          if (playerMatch) {
            playerStats.push({
              name: playerMatch[1].trim(),
              role: playerMatch[2].trim(),
              details: playerMatch[3].trim()
            });
          }
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
