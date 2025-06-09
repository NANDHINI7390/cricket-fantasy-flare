
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";

interface RequestData {
  query: string;
  matchData?: any[];
  requestType?: string;
  matchId?: string;
}

interface ApiResponse {
  status: string;
  data: any[];
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
  category?: string;
  localDateTime?: string;
}

const CRICAPI_KEY = Deno.env.get("CRICAPI_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

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
    console.log("API Keys status:", {
      cricapi: CRICAPI_KEY ? "Available" : "Missing",
      openai: OPENAI_API_KEY ? "Available" : "Missing"
    });
    
    // Fetch fresh cricket data if not provided
    let cricketData;
    if (providedMatchData.length > 0 && requestType === 'fantasy_analysis') {
      cricketData = { matches: providedMatchData };
    } else {
      cricketData = await fetchCricketData();
    }
    
    console.log(`Working with ${cricketData.matches?.length || 0} matches`);
    
    let message;
    let playerStats;
    
    // Generate response based on available APIs
    if (OPENAI_API_KEY) {
      try {
        const aiResponse = await generateAIResponse(userQuery, cricketData, requestType);
        message = aiResponse.message;
        playerStats = aiResponse.playerStats;
      } catch (e) {
        console.error("Error generating AI response:", e);
        message = generateBasicResponse(userQuery, cricketData.matches || []);
      }
    } else {
      console.log("OpenAI API key not available, using basic response");
      message = generateBasicResponse(userQuery, cricketData.matches || []);
    }
    
    return new Response(
      JSON.stringify({
        message,
        cricketData: cricketData.matches || [],
        playerStats,
        hasData: (cricketData.matches?.length || 0) > 0,
        requestType,
        timestamp: new Date().toISOString()
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
        message: "Sorry, there was an error processing your request.",
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function fetchCricketData(): Promise<{ matches: MatchInfo[] }> {
  try {
    if (!CRICAPI_KEY) {
      console.error("CRICAPI_KEY not available");
      return { matches: [] };
    }

    console.log("Fetching fresh cricket data...");
    
    const currentMatchesResponse = await fetch(
      `https://api.cricapi.com/v1/currentMatches?apikey=${CRICAPI_KEY}&offset=0`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Cricket-Fantasy-Assistant/1.0'
        }
      }
    );
    
    if (!currentMatchesResponse.ok) {
      throw new Error(`API request failed: ${currentMatchesResponse.status}`);
    }
    
    const currentMatches: ApiResponse = await currentMatchesResponse.json();
    console.log("Cricket API response:", currentMatches.status, currentMatches.data?.length || 0, "matches");
    
    if (currentMatches.status !== "success" || !currentMatches.data) {
      console.error("Invalid cricket API response:", currentMatches);
      return { matches: [] };
    }
    
    // Process matches with categories and local time
    const processedMatches = currentMatches.data.map(match => {
      let localDateTime = '';
      if (match.dateTimeGMT) {
        try {
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
          localDateTime = istFormatter.format(matchDate);
        } catch (err) {
          localDateTime = match.dateTimeGMT;
        }
      }
      
      // Determine category
      let category = "Upcoming";
      const now = new Date();
      
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
                  statusLower.includes("completed") ||
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
        localDateTime,
        category
      };
    });
    
    return { matches: processedMatches };
  } catch (error) {
    console.error("Error fetching cricket data:", error);
    return { matches: [] };
  }
}

function generateBasicResponse(query: string, cricketData: MatchInfo[]): string {
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes("suggest") || queryLower.includes("fantasy") || 
      queryLower.includes("team") || queryLower.includes("pick")) {
    
    if (cricketData.length === 0) {
      return "No current match data available for fantasy suggestions. Please check back later when matches are live.";
    }
    
    const liveMatch = cricketData.find(m => m.category === "Live") || cricketData[0];
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
  
  if (queryLower.includes("score") || queryLower.includes("match") || 
      queryLower.includes("result") || queryLower.includes("live")) {
    
    if (cricketData.length === 0) {
      return "I don't have any current match data available. Please check back later.";
    }
    
    const liveMatches = cricketData.filter(m => m.category === "Live");
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
  
  return "I can help you with cricket match scores, fantasy team suggestions, and player recommendations. Try asking about current matches or fantasy team picks for today's games.";
}

async function generateAIResponse(query: string, cricketData: any, requestType: string): Promise<{ message: string; playerStats?: any[] }> {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  let matchContext = "";
  
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

Use the provided live match data to make informed suggestions.`;

    userPrompt = `Based on the current cricket match data below, provide fantasy team recommendations for this user query: "${query}"

${matchContext}

Please provide specific, actionable fantasy cricket advice with player names and clear reasoning.`;
  } else {
    systemPrompt = `You are a knowledgeable Cricket Assistant specializing in match analysis and player insights. Provide helpful, accurate information about cricket matches, scores, and player performances.

Guidelines:
- Use the provided match data to answer questions
- Be conversational and engaging
- Provide specific details when available
- If asked about fantasy cricket, give general strategic advice
- Focus on current/live matches when relevant`;

    userPrompt = `${matchContext}

User question: ${query}

Please provide a helpful response based on the cricket data above.`;
  }

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
