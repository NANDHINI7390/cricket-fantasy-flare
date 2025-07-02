
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";

interface RequestData {
  query: string;
  cricketData?: any;
  requestType?: string;
  useSmartPrompting?: boolean;
}

const CRICAPI_KEY = Deno.env.get("CRICAPI_KEY") || "a52ea237-09e7-4d69-b7cc-e4f0e79fb8ae";
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
    const { query, cricketData, requestType = 'general', useSmartPrompting = false } = requestData;
    
    if (!query) {
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

    console.log(`Processing ${requestType} query with smart prompting: ${useSmartPrompting}`);

    let message: string;
    let playerStats: any;

    // Use OpenAI with smart prompting if API key is available
    if (OPENAI_API_KEY && useSmartPrompting) {
      try {
        const aiResponse = await generateSmartAIResponse(query, cricketData, requestType);
        message = aiResponse.message;
        playerStats = aiResponse.playerStats;
      } catch (error) {
        console.error("Error with OpenAI:", error);
        // Fallback to basic response
        message = generateBasicResponse(query, cricketData);
      }
    } else {
      // Basic response without OpenAI
      message = generateBasicResponse(query, cricketData);
    }
    
    return new Response(
      JSON.stringify({
        message,
        playerStats,
        hasData: cricketData?.matches?.length > 0,
        requestType,
        aiEnhanced: !!OPENAI_API_KEY
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
        message: "Sorry, I encountered an error processing your request." 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

// Smart AI response generation using OpenAI with enhanced prompting
async function generateSmartAIResponse(query: string, cricketData: any, requestType: string): Promise<{ message: string; playerStats?: any[] }> {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  // Create smart prompting structure
  const messages = [
    {
      role: "system",
      content: `You are a cricket fantasy assistant that uses live match/player data when available. If live data is missing, provide the best intelligent guess using your cricket knowledge.

IMPORTANT GUIDELINES:
- Always provide specific, actionable advice
- Use data when available, cricket knowledge when not
- Be confident but explain your reasoning
- Focus on fantasy cricket optimization
- Provide captain, vice-captain, and strategic insights
- Consider recent form, match conditions, and value picks

Response Style: Be conversational, engaging, and provide clear recommendations with reasoning.`
    },
    {
      role: "user",
      content: `User asked: '${query}'`
    }
  ];

  // Add cricket data context if available
  if (cricketData && Object.keys(cricketData).length > 0) {
    let dataContext = "Here is the current cricket data:\n\n";
    
    if (cricketData.matches?.length > 0) {
      dataContext += "**Live Matches:**\n";
      cricketData.matches.slice(0, 3).forEach((match: any) => {
        dataContext += `- ${match.name || 'Match'}: ${match.status || 'Status unknown'}\n`;
        if (match.teams) {
          dataContext += `  Teams: ${match.teams.join(' vs ')}\n`;
        }
        if (match.score && match.score.length > 0) {
          dataContext += `  Score: `;
          match.score.forEach((s: any) => {
            dataContext += `${s.inning}: ${s.r}/${s.w} (${s.o} overs) `;
          });
          dataContext += `\n`;
        }
      });
    }

    if (cricketData.fantasyData?.length > 0) {
      dataContext += "\n**Fantasy Data Available:**\n";
      cricketData.fantasyData.forEach((data: any) => {
        if (data.squad) {
          dataContext += `- Squad data for match ${data.matchId}\n`;
        }
        if (data.points) {
          dataContext += `- Fantasy points data for match ${data.matchId}\n`;
        }
      });
    }

    if (cricketData.players?.length > 0) {
      dataContext += `\n**Player Information:** ${cricketData.players.length} players available\n`;
    }

    messages.push({
      role: "user",
      content: dataContext
    });
  } else {
    messages.push({
      role: "user",
      content: "Live data from CrickAPI is currently unavailable. Please use your best cricket knowledge to provide helpful advice."
    });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    const aiMessage = data.choices[0].message.content;
    
    // Extract player recommendations for structured display
    let playerStats: any[] = [];
    
    if (requestType === 'captain_suggestion' || requestType === 'fantasy_analysis') {
      const captainMatch = aiMessage.match(/(?:captain|cap)[:\s]*([a-zA-Z\s]+)/i);
      const vcMatch = aiMessage.match(/(?:vice.captain|vc)[:\s]*([a-zA-Z\s]+)/i);
      
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
      message: aiMessage,
      playerStats: playerStats.length > 0 ? playerStats : undefined
    };
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}

// Basic response fallback when OpenAI is not available
function generateBasicResponse(query: string, cricketData: any): string {
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes("captain") || queryLower.includes("team")) {
    return "🏏 For captain picks, I recommend focusing on top-order batsmen who are in good form. Look for players with consistent run-scoring ability and consider the pitch conditions. All-rounders can also be excellent captain choices as they contribute with both bat and ball.";
  }
  
  if (queryLower.includes("score") || queryLower.includes("live")) {
    if (cricketData?.matches?.length > 0) {
      const match = cricketData.matches[0];
      return `📺 ${match.name || 'Current match'} - Status: ${match.status || 'In progress'}. Check the live scores for detailed information.`;
    }
    return "⚠️ No live matches found at the moment. Please check back later for live updates.";
  }
  
  if (queryLower.includes("player") || queryLower.includes("stats")) {
    return "👤 For player analysis, consider recent form, playing conditions, and head-to-head records. Look for players who have been consistent in similar match situations.";
  }
  
  return "🤖 I'm here to help with cricket fantasy strategies! Ask me about captain picks, player analysis, live scores, or team building tips. I work best when you ask specific questions about players or matches.";
}
