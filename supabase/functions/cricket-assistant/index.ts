
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

    console.log(`🏏 Processing ${requestType} query:`, query);
    console.log(`🤖 Smart prompting enabled:`, useSmartPrompting);
    console.log(`🔑 OpenAI API Key available:`, !!OPENAI_API_KEY);
    console.log(`🏏 CrickAPI Key:`, CRICAPI_KEY);
    console.log(`📊 Cricket data received:`, !!cricketData, cricketData?.matches?.length || 0, "matches");

    let message: string;
    let playerStats: any;

    // Test CrickAPI connection first
    let cricketApiWorking = false;
    if (cricketData?.matches?.length > 0 || cricketData?.currentMatches?.length > 0) {
      cricketApiWorking = true;
      console.log("✅ CrickAPI is working - found live data");
    } else {
      console.log("❌ CrickAPI not working - no live data found");
      // Try to fetch live data directly to test
      try {
        const testResponse = await fetch(`https://api.cricapi.com/v1/currentMatches?apikey=${CRICAPI_KEY}&offset=0`);
        const testData = await testResponse.json();
        console.log("🧪 Direct CrickAPI test:", testData?.status, testData?.data?.length || 0, "matches");
        if (testData?.data?.length > 0) {
          cricketApiWorking = true;
          console.log("✅ CrickAPI is actually working - using direct data");
        }
      } catch (error) {
        console.error("❌ CrickAPI direct test failed:", error);
      }
    }

    // Use OpenAI if API key is available
    if (OPENAI_API_KEY && useSmartPrompting) {
      try {
        console.log("🤖 Calling OpenAI with cricket data...");
        const aiResponse = await generateOpenAIResponse(query, cricketData, requestType, cricketApiWorking);
        message = aiResponse.message;
        playerStats = aiResponse.playerStats;
        console.log("✅ OpenAI response generated successfully");
      } catch (error) {
        console.error("❌ OpenAI API error:", error);
        // Fallback to basic response
        message = generateBasicResponse(query, cricketData, cricketApiWorking);
        console.log("⚠️ Using basic fallback response");
      }
    } else {
      console.log("⚠️ Using basic response (no OpenAI key or smart prompting disabled)");
      message = generateBasicResponse(query, cricketData, cricketApiWorking);
    }
    
    return new Response(
      JSON.stringify({
        message,
        playerStats,
        hasData: cricketApiWorking,
        requestType,
        aiEnhanced: !!OPENAI_API_KEY && useSmartPrompting,
        cricketApiStatus: cricketApiWorking ? "working" : "not working",
        openAiStatus: !!OPENAI_API_KEY ? "available" : "not available"
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error(`❌ Edge function error:`, error);
    return new Response(
      JSON.stringify({ 
        error: "Server error", 
        message: "Sorry, I encountered an error processing your request. Please try again.",
        details: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

// OpenAI response generation
async function generateOpenAIResponse(query: string, cricketData: any, requestType: string, cricketApiWorking: boolean): Promise<{ message: string; playerStats?: any[] }> {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  console.log("🤖 Preparing OpenAI request...");

  const messages = [
    {
      role: "system",
      content: `You are an expert cricket fantasy assistant powered by real-time data and extensive cricket knowledge.

CURRENT STATUS:
- CrickAPI Status: ${cricketApiWorking ? "✅ Working with live data" : "❌ Not available"}
- Your Role: Provide specific, actionable fantasy cricket advice

GUIDELINES:
- Give clear captain/vice-captain recommendations with reasoning
- Consider recent form, pitch conditions, and match context
- Provide value picks and strategy tips
- Be confident but explain your logic
- Focus on fantasy points optimization
- If live data is unavailable, use your extensive cricket knowledge

${cricketApiWorking ? "Use the live cricket data provided to give accurate, data-driven advice." : "Live data is unavailable, so use your comprehensive cricket knowledge to provide the best possible fantasy advice based on recent cricket trends, player forms, and match situations."}`
    },
    {
      role: "user",
      content: `User question: "${query}"`
    }
  ];

  // Add cricket data context if available
  if (cricketApiWorking && cricketData && Object.keys(cricketData).length > 0) {
    let dataContext = "🏏 **LIVE CRICKET DATA:**\n\n";
    
    if (cricketData.matches?.length > 0) {
      dataContext += "**Current Matches:**\n";
      cricketData.matches.slice(0, 3).forEach((match: any) => {
        dataContext += `• ${match.name || 'Match'}: ${match.status || 'Status unknown'}\n`;
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
      dataContext += "\n**Upcoming Matches:**\n";
      cricketData.currentMatches.slice(0, 3).forEach((match: any) => {
        dataContext += `• ${match.name || 'Match'}: ${match.status || 'Status unknown'}\n`;
      });
    }

    messages.push({
      role: "user",
      content: dataContext
    });
  } else {
    messages.push({
      role: "user",
      content: "🚨 **IMPORTANT:** Live cricket data is currently unavailable from CrickAPI. Please use your extensive cricket knowledge to provide the best possible fantasy advice based on:\n- Recent player performances\n- Current cricket season trends\n- Known player forms\n- Match situation analysis\n- Fantasy strategy best practices"
    });
  }

  try {
    console.log("🤖 Making OpenAI API call...");
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 800
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ OpenAI API error response:", errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log("✅ OpenAI response received successfully");
    
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
    console.error("❌ Error in OpenAI API call:", error);
    throw error;
  }
}

// Basic response fallback
function generateBasicResponse(query: string, cricketData: any, cricketApiWorking: boolean): string {
  const queryLower = query.toLowerCase();
  
  console.log("⚠️ Generating basic response for query:", queryLower);
  console.log("🏏 CrickAPI status in basic response:", cricketApiWorking);
  
  const statusPrefix = cricketApiWorking ? 
    "🟢 **Live Data Available** - " : 
    "🔴 **Offline Mode** - ";
  
  if (queryLower.includes("captain") || queryLower.includes("team")) {
    return `${statusPrefix}🏏 **Captain Recommendation Strategy:**\n\nFor fantasy captain picks, consider:\n• Top-order batsmen in good form\n• All-rounders who contribute with bat and ball\n• Bowlers on bowling-friendly pitches\n• Players with consistent recent performances\n\nLook for players who are likely to get more overs/chances to perform!\n\n${cricketApiWorking ? "Check the live matches for current form!" : "Based on general cricket strategy since live data is unavailable."}`;
  }
  
  if (queryLower.includes("score") || queryLower.includes("live")) {
    if (cricketApiWorking && (cricketData?.matches?.length > 0 || cricketData?.currentMatches?.length > 0)) {
      const matchCount = (cricketData.matches?.length || 0) + (cricketData.currentMatches?.length || 0);
      return `${statusPrefix}📺 **Live Cricket Update:**\n\nFound ${matchCount} cricket matches with live data! Check the Matches tab for detailed scores and updates!`;
    }
    return `${statusPrefix}⚠️ **No Live Matches:**\n\nNo live cricket matches found at the moment. This could be due to:\n• No matches currently scheduled\n• CrickAPI connectivity issues\n• Maintenance period\n\nPlease check back later for live updates!`;
  }
  
  if (queryLower.includes("player") || queryLower.includes("stats")) {
    return `${statusPrefix}👤 **Player Analysis Strategy:**\n\nFor player selection, consider:\n• Recent batting/bowling averages\n• Performance against specific teams\n• Home vs away record\n• Current form in the tournament\n• Pitch and weather conditions\n\nFocus on players who have been performing consistently in recent matches!\n\n${cricketApiWorking ? "Live player data should be available in match details!" : "Using general player analysis since live stats aren't available."}`;
  }
  
  return `${statusPrefix}🤖 **Cricket Fantasy Assistant Ready!**\n\nI'm here to help with:\n• Captain and team suggestions\n• Live cricket scores and updates\n• Player analysis and form guide\n• Fantasy strategy and tips\n\n${cricketApiWorking ? "✅ Live cricket data is available!" : "⚠️ Currently running in offline mode due to API issues."}\n\nAsk me specific questions about players, matches, or fantasy strategy!`;
}
