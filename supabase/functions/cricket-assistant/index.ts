
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

    console.log(`Processing ${requestType} query:`, query);
    console.log(`Smart prompting enabled:`, useSmartPrompting);
    console.log(`OpenAI API Key available:`, !!OPENAI_API_KEY);

    let message: string;
    let playerStats: any;

    // Use OpenAI if API key is available
    if (OPENAI_API_KEY && useSmartPrompting) {
      try {
        console.log("Calling OpenAI with cricket data:", !!cricketData);
        const aiResponse = await generateOpenAIResponse(query, cricketData, requestType);
        message = aiResponse.message;
        playerStats = aiResponse.playerStats;
      } catch (error) {
        console.error("OpenAI API error:", error);
        // Fallback to basic response
        message = generateBasicResponse(query, cricketData);
      }
    } else {
      console.log("Using basic response (no OpenAI key or smart prompting disabled)");
      message = generateBasicResponse(query, cricketData);
    }
    
    return new Response(
      JSON.stringify({
        message,
        playerStats,
        hasData: cricketData?.matches?.length > 0 || cricketData?.currentMatches?.length > 0,
        requestType,
        aiEnhanced: !!OPENAI_API_KEY && useSmartPrompting
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error(`Edge function error:`, error);
    return new Response(
      JSON.stringify({ 
        error: "Server error", 
        message: "Sorry, I encountered an error processing your request. Please try again." 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

// OpenAI response generation
async function generateOpenAIResponse(query: string, cricketData: any, requestType: string): Promise<{ message: string; playerStats?: any[] }> {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  console.log("Preparing OpenAI request...");

  const messages = [
    {
      role: "system",
      content: `You are an expert cricket fantasy assistant. Provide specific, actionable advice for fantasy cricket.

GUIDELINES:
- Give clear captain/vice-captain recommendations with reasoning
- Consider recent form, pitch conditions, and match context
- Provide value picks and strategy tips
- Be confident but explain your logic
- Focus on fantasy points optimization

If live data is available, use it. If not, use your cricket knowledge to give the best possible advice.`
    },
    {
      role: "user",
      content: `User question: "${query}"`
    }
  ];

  // Add cricket data context if available
  if (cricketData && Object.keys(cricketData).length > 0) {
    let dataContext = "Current cricket data:\n\n";
    
    if (cricketData.matches?.length > 0) {
      dataContext += "**Live Matches:**\n";
      cricketData.matches.slice(0, 3).forEach((match: any) => {
        dataContext += `- ${match.name || 'Match'}: ${match.status || 'Status unknown'}\n`;
        if (match.teams) {
          dataContext += `  Teams: ${match.teams.join(' vs ')}\n`;
        }
        if (match.score?.length > 0) {
          dataContext += `  Score: `;
          match.score.forEach((s: any) => {
            dataContext += `${s.inning}: ${s.r}/${s.w} (${s.o} overs) `;
          });
          dataContext += `\n`;
        }
      });
    }

    if (cricketData.currentMatches?.length > 0) {
      dataContext += "\n**Current Matches:**\n";
      cricketData.currentMatches.slice(0, 3).forEach((match: any) => {
        dataContext += `- ${match.name || 'Match'}: ${match.status || 'Status unknown'}\n`;
      });
    }

    messages.push({
      role: "user",
      content: dataContext
    });
  } else {
    messages.push({
      role: "user",
      content: "Live cricket data is currently unavailable. Please use your extensive cricket knowledge to provide the best possible fantasy advice."
    });
  }

  try {
    console.log("Making OpenAI API call...");
    
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
        max_tokens: 800
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error response:", errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log("OpenAI response received successfully");
    
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
    console.error("Error in OpenAI API call:", error);
    throw error;
  }
}

// Basic response fallback
function generateBasicResponse(query: string, cricketData: any): string {
  const queryLower = query.toLowerCase();
  
  console.log("Generating basic response for query:", queryLower);
  
  if (queryLower.includes("captain") || queryLower.includes("team")) {
    return "🏏 **Captain Recommendation Strategy:**\n\nFor fantasy captain picks, consider:\n• Top-order batsmen in good form\n• All-rounders who contribute with bat and ball\n• Bowlers on bowling-friendly pitches\n• Players with consistent recent performances\n\nLook for players who are likely to get more overs/chances to perform!";
  }
  
  if (queryLower.includes("score") || queryLower.includes("live")) {
    if (cricketData?.matches?.length > 0 || cricketData?.currentMatches?.length > 0) {
      const matchCount = (cricketData.matches?.length || 0) + (cricketData.currentMatches?.length || 0);
      return `📺 **Live Cricket Update:**\n\nFound ${matchCount} cricket matches. Check the Matches tab for detailed scores and updates!`;
    }
    return "⚠️ **No Live Matches:**\n\nNo live cricket matches found at the moment. Please check back later for live scores and updates.";
  }
  
  if (queryLower.includes("player") || queryLower.includes("stats")) {
    return "👤 **Player Analysis Strategy:**\n\nFor player selection, consider:\n• Recent form and consistency\n• Head-to-head records against opponent\n• Performance in similar conditions\n• Current team role and batting position\n\nFocus on players who have been performing consistently in recent matches!";
  }
  
  return "🤖 **Cricket Fantasy Assistant Ready!**\n\nI'm here to help with:\n• Captain and team suggestions\n• Live cricket scores and updates\n• Player analysis and form guide\n• Fantasy strategy and tips\n\nAsk me specific questions about players, matches, or fantasy strategy!";
}
