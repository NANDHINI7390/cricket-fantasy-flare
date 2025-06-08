
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query, requestType = 'general' } = await req.json();
    console.log(`Processing ${requestType} query: ${query}`);

    // Determine API execution plan
    const apiPlan = processApiQuery(query);
    console.log('API execution plan:', apiPlan);

    // Fetch relevant cricket data
    const cricketData = await fetchRelevantData(apiPlan.endpoints, query);
    console.log(`Fetched data from ${cricketData.length} API endpoints`);

    // Generate AI response
    const aiResponse = await generateEnhancedAIResponse(query, cricketData, apiPlan);

    return new Response(
      JSON.stringify({
        message: aiResponse,
        cricketData: cricketData.slice(0, 10), // Limit data for response size
        apiPlan,
        hasData: cricketData.length > 0,
        requestType
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in cricket assistant:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: 'I encountered an issue processing your request. Please try again.',
        cricketData: [],
        hasData: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Process user query to determine API strategy
function processApiQuery(query: string) {
  const queryLower = query.toLowerCase();
  
  // Enhanced squad detection
  if (queryLower.includes('rohit') || queryLower.includes('in the squad') || 
      queryLower.includes('in squad') || queryLower.includes('player')) {
    return {
      endpoints: ['players'],
      queryType: 'squad_search',
      intent: 'Search for specific player in squad database',
      requiresChaining: false
    };
  }
  
  // Current matches
  if (queryLower.includes('today') || queryLower.includes('now') || 
      queryLower.includes('live') || queryLower.includes('current') ||
      queryLower.includes('happening')) {
    return {
      endpoints: ['currentMatches'],
      queryType: 'current_matches',
      intent: 'Get current/live matches',
      requiresChaining: false
    };
  }
  
  // Fantasy suggestions
  if (queryLower.includes('suggest') || queryLower.includes('fantasy') || 
      queryLower.includes('captain') || queryLower.includes('team')) {
    return {
      endpoints: ['currentMatches', 'match_squad', 'match_scorecard'],
      queryType: 'fantasy_team',
      intent: 'Suggest fantasy team with detailed analysis',
      requiresChaining: true
    };
  }
  
  // Player stats
  if (queryLower.includes('perform') || queryLower.includes('stats') || 
      queryLower.includes('points')) {
    return {
      endpoints: ['match_scorecard', 'players_info'],
      queryType: 'player_stats',
      intent: 'Get player performance statistics',
      requiresChaining: false
    };
  }
  
  // Default to current matches
  return {
    endpoints: ['currentMatches'],
    queryType: 'general',
    intent: 'General cricket information',
    requiresChaining: false
  };
}

// Fetch data from cricket APIs
async function fetchRelevantData(endpoints: string[], query: string) {
  const API_KEY = Deno.env.get('CRICAPI_KEY') || 'a52ea237-09e7-4d69-b7cc-e4f0e79fb8ae';
  const BASE_URL = 'https://api.cricapi.com/v1';
  
  const allData: any[] = [];
  
  for (const endpoint of endpoints) {
    try {
      let url = '';
      let params = new URLSearchParams({
        apikey: API_KEY,
        offset: '0'
      });
      
      switch (endpoint) {
        case 'currentMatches':
          url = `${BASE_URL}/currentMatches?${params}`;
          break;
        case 'players':
          url = `${BASE_URL}/players?${params}`;
          break;
        case 'match_scorecard':
          // Skip if no match ID available
          continue;
        case 'match_squad':
          // Skip if no match ID available
          continue;
        default:
          continue;
      }
      
      console.log(`Fetching from: ${endpoint}`);
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'success' && Array.isArray(data.data)) {
        console.log(`Successfully fetched ${data.data.length} items from ${endpoint}`);
        
        // Special handling for player search
        if (endpoint === 'players' && query.toLowerCase().includes('rohit')) {
          const players = data.data.filter((player: any) => 
            player.name && player.name.toLowerCase().includes('rohit')
          );
          console.log(`Found ${players.length} players matching "rohit"`);
          allData.push(...players);
        } else if (endpoint === 'currentMatches') {
          // Ensure team info is properly structured
          const processedMatches = data.data.map((match: any) => {
            // Create teamInfo if missing
            if (!match.teamInfo && match.teams && Array.isArray(match.teams)) {
              match.teamInfo = match.teams.map((teamName: string) => ({
                name: teamName,
                shortname: teamName.substring(0, 3).toUpperCase(),
                img: `https://h.cricapi.com/img/icon512.png`
              }));
            }
            return match;
          });
          allData.push(...processedMatches);
        } else {
          allData.push(...data.data);
        }
      } else {
        console.log(`No valid data from ${endpoint}:`, data.status);
      }
      
    } catch (error) {
      if (endpoint === 'players') {
        console.error(`Could not fetch players data: ${error}`);
      } else {
        console.error(`Error fetching cricket data: ${error}`);
      }
    }
  }
  
  return allData;
}

// Generate AI response
async function generateEnhancedAIResponse(query: string, cricketData: any[], apiPlan: any) {
  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      return generateFallbackResponse(query, cricketData, apiPlan);
    }

    // Create context based on cricket data
    let context = '';
    
    if (apiPlan.queryType === 'squad_search') {
      if (cricketData.length > 0) {
        const playerNames = cricketData.map(p => p.name).join(', ');
        context = `Found ${cricketData.length} players matching your search: ${playerNames}`;
        
        if (query.toLowerCase().includes('rohit')) {
          const rohitPlayers = cricketData.filter(p => 
            p.name.toLowerCase().includes('rohit')
          );
          if (rohitPlayers.length > 0) {
            context = `Yes, found ${rohitPlayers.length} player(s) named Rohit in the database: ${rohitPlayers.map(p => p.name).join(', ')}`;
          } else {
            context = 'No players named Rohit found in the current database.';
          }
        }
      } else {
        context = 'No players found matching your search criteria.';
      }
    } else if (apiPlan.queryType === 'current_matches') {
      if (cricketData.length > 0) {
        const matchSummaries = cricketData.slice(0, 3).map(match => {
          const teams = match.teams ? match.teams.join(' vs ') : 'Teams TBD';
          return `${match.name}: ${teams} - ${match.status}`;
        }).join('\n');
        context = `Current matches available:\n${matchSummaries}`;
      } else {
        context = 'No current matches available at the moment.';
      }
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a helpful cricket fantasy assistant. Use the provided cricket data to answer questions accurately. Be concise and helpful.`
          },
          {
            role: 'user',
            content: `Query: "${query}"\n\nCricket Data Context:\n${context}\n\nPlease respond naturally and helpfully based on this information.`
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiData = await response.json();
    return aiData.choices[0]?.message?.content || generateFallbackResponse(query, cricketData, apiPlan);
    
  } catch (error) {
    console.error('Error generating AI response:', error);
    return generateFallbackResponse(query, cricketData, apiPlan);
  }
}

// Fallback response when AI is unavailable
function generateFallbackResponse(query: string, cricketData: any[], apiPlan: any) {
  if (apiPlan.queryType === 'squad_search') {
    if (cricketData.length > 0) {
      if (query.toLowerCase().includes('rohit')) {
        const rohitPlayers = cricketData.filter(p => 
          p.name && p.name.toLowerCase().includes('rohit')
        );
        if (rohitPlayers.length > 0) {
          return `✅ Yes! Found ${rohitPlayers.length} player(s) named Rohit: ${rohitPlayers.map(p => p.name).join(', ')}`;
        } else {
          return `❌ No players named Rohit found in the current database.`;
        }
      }
      return `Found ${cricketData.length} players in the database.`;
    } else {
      return "I couldn't fetch the player database at the moment. Please try again later.";
    }
  }
  
  if (apiPlan.queryType === 'current_matches') {
    if (cricketData.length > 0) {
      const matchList = cricketData.slice(0, 3).map(match => {
        const teams = match.teams ? match.teams.join(' vs ') : 'Teams TBD';
        return `🏏 ${match.name}: ${teams} - ${match.status}`;
      }).join('\n\n');
      return `📊 Current matches available:\n\n${matchList}`;
    } else {
      return "No current matches available for fantasy team suggestions. Please check back when matches are live.";
    }
  }
  
  return "I'm here to help with cricket information! Ask me about current matches, player statistics, or fantasy team suggestions.";
}
