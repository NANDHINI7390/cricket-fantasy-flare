
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

interface RequestData {
  query: string;
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
  players?: any[];
  tossWinner?: string;
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

    console.log(`Processing query: ${userQuery}`);
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Fetch cricket data
    const cricketData = await fetchCricketData();
    console.log(`Fetched ${cricketData.length} matches`);
    
    let message;
    let playerStats;
    
    // If OpenAI API key is available, use it for AI-powered responses
    if (OPENAI_API_KEY) {
      try {
        // Generate AI response
        const aiResponse = await generateAIResponse(userQuery, cricketData);
        message = aiResponse.message;
        playerStats = aiResponse.playerStats;
      } catch (e) {
        console.error("Error generating AI response:", e);
        // Fallback to basic response if AI fails
        message = generateBasicResponse(userQuery, cricketData);
      }
    } else {
      // If no OpenAI API key, use basic response
      message = generateBasicResponse(userQuery, cricketData);
    }
    
    return new Response(
      JSON.stringify({
        message,
        cricketData,
        playerStats,
        hasData: cricketData.length > 0
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
async function fetchCricketData(): Promise<MatchInfo[]> {
  try {
    // Fetch current matches
    const currentMatchesResponse = await fetch(
      `https://api.cricapi.com/v1/currentMatches?apikey=${CRICAPI_KEY}&offset=0`
    );
    const currentMatches: ApiResponse = await currentMatchesResponse.json();
    
    if (currentMatches.status !== "success" || !currentMatches.data) {
      console.error("Error fetching current matches:", currentMatches);
      return [];
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
        // Format date for IST display
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
      
      // If match date is specified, determine if it's in the past or future
      if (match.dateTimeGMT) {
        const matchTime = new Date(match.dateTimeGMT);
        const timeDiff = matchTime.getTime() - now.getTime();
        
        // Match is in the future
        if (timeDiff > 0) {
          category = "Upcoming";
        } 
        // Match should have started
        else {
          // Check status text to determine if it's live or completed
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
          // If started in the last 12 hours but no explicit status
          else if (timeDiff > -12 * 60 * 60 * 1000) {
            category = "Live";
          }
          // If started more than 12 hours ago but no explicit status
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
    
    return allMatches;
  } catch (error) {
    console.error("Error fetching cricket data:", error);
    return [];
  }
}

// Generate a basic response based on the query and cricket data
function generateBasicResponse(query: string, cricketData: MatchInfo[]): string {
  const queryLower = query.toLowerCase();
  
  // Match-related queries
  if (queryLower.includes("score") || 
      queryLower.includes("match") || 
      queryLower.includes("result") ||
      queryLower.includes("live")) {
    
    if (cricketData.length === 0) {
      return "I don't have any current match data available. Please check back later.";
    }
    
    // Find relevant matches
    const liveMatches = cricketData.filter(m => m.category === "Live");
    const upcomingMatches = cricketData.filter(m => m.category === "Upcoming");
    
    if (liveMatches.length > 0) {
      const match = liveMatches[0];
      let response = `${match.name} is currently live. `;
      
      if (match.score && match.score.length > 0) {
        match.score.forEach(s => {
          response += `${s.inning}: ${s.r || 0}/${s.w || 0} (${s.o || 0} overs). `;
        });
      }
      
      return response;
    } else if (upcomingMatches.length > 0) {
      const match = upcomingMatches[0];
      return `${match.name} is scheduled to start at ${match.localDateTime || match.dateTimeGMT}.`;
    } else {
      return "I have information about some completed matches. You can check the Matches tab for details.";
    }
  }
  
  // Player-related queries
  if (queryLower.includes("player") || 
      queryLower.includes("captain") || 
      queryLower.includes("pick")) {
    
    return "Based on recent performances, I recommend choosing a player who's in good form. For specific player suggestions, check out the top performers in recent matches.";
  }
  
  // Default response
  return "I can help you with cricket match scores, player suggestions, and fantasy tips. Try asking about current matches or captain recommendations.";
}

// Generate AI-powered response using OpenAI
async function generateAIResponse(query: string, cricketData: MatchInfo[]): Promise<{ message: string; playerStats?: any[] }> {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }
  
  // Prepare cricket data context for the AI
  let matchContext = "";
  
  if (cricketData.length > 0) {
    // Get live matches first
    const liveMatches = cricketData.filter(m => m.category === "Live");
    
    if (liveMatches.length > 0) {
      matchContext += "Currently live matches:\n";
      
      liveMatches.forEach(match => {
        matchContext += `- ${match.name}\n`;
        
        // Add score information
        if (match.score && match.score.length > 0) {
          match.score.forEach(s => {
            matchContext += `  ${s.inning}: ${s.r || 0}/${s.w || 0} (${s.o || 0} overs)\n`;
          });
        }
        
        // Add venue and match type
        if (match.venue || match.matchType) {
          matchContext += `  ${match.venue || ""} | ${match.matchType || ""}\n`;
        }
      });
    }
    
    // Add upcoming matches
    const upcomingMatches = cricketData.filter(m => m.category === "Upcoming");
    
    if (upcomingMatches.length > 0) {
      matchContext += "\nUpcoming matches:\n";
      
      upcomingMatches.slice(0, 3).forEach(match => {
        matchContext += `- ${match.name} (${match.localDateTime || match.dateTimeGMT})\n`;
      });
    }
  } else {
    matchContext = "No current cricket match data available.";
  }
  
  // Craft the system prompt for OpenAI
  const systemPrompt = `
You are a smart Cricket Fantasy Chatbot assistant. You provide expert advice on cricket fantasy teams and players based on real-time match data.

When responding to users, follow these guidelines:
1. Always analyze the real-time cricket data provided to make informed recommendations
2. When recommending captain or player picks, explain why they're good choices based on current form and match conditions
3. Format your responses in a clear, easy-to-read way
4. Be conversational and engaging
5. If match data is available, always include match information in your response
6. For captain recommendations, include their stats and why they're a good pick

Current cricket data:
${matchContext}

When making player recommendations, format your response like this:
**Match:** <match name> **Score:** <current score> **Captain Pick:** <player name> – <stats> **Top Bowling Pick:** <player name> – <stats>

If a user asks about scores or match information, provide the most recent data available.
If a user asks for player recommendations, suggest players who are likely to perform well based on the current match situation.
`;

  // Prepare the user's query with context
  const userPrompt = `User question: ${query}

Based on the cricket data provided, give the best possible answer. Include specific player recommendations if the query is about team selection or captains.`;

  try {
    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
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
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Extract player stats if the response includes recommendations
    let playerStats = undefined;
    
    if (aiResponse.includes("Captain Pick") || aiResponse.includes("captain pick")) {
      // Simple extraction of player recommendations
      // In a real implementation, this would be more sophisticated
      playerStats = [
        { name: "Unknown Player", role: "batsman" }
      ];
      
      // Extract captain name if available
      const captainMatch = aiResponse.match(/\*\*Captain Pick:\*\*\s*([^–\*]+)/i);
      if (captainMatch && captainMatch[1]) {
        playerStats[0].name = captainMatch[1].trim();
      }
    }
    
    return {
      message: aiResponse,
      playerStats
    };
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw error;
  }
}
