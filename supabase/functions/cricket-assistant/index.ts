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
        cricketData: cricketData.slice(0, 10),
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
  
  // Enhanced squad detection with better player name matching
  if (queryLower.includes('rohit') || queryLower.includes('kohli') || 
      queryLower.includes('in the squad') || queryLower.includes('in squad') || 
      queryLower.includes('player') || queryLower.includes('is ') && 
      (queryLower.includes('playing') || queryLower.includes('selected'))) {
    return {
      endpoints: ['players'],
      queryType: 'squad_search',
      intent: 'Search for specific player in squad database',
      requiresChaining: false
    };
  }
  
  // Current matches with better detection
  if (queryLower.includes('today') || queryLower.includes('now') || 
      queryLower.includes('live') || queryLower.includes('current') ||
      queryLower.includes('happening') || queryLower.includes('match')) {
    return {
      endpoints: ['currentMatches'],
      queryType: 'current_matches',
      intent: 'Get current/live matches with team details',
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

// Enhanced fetch function with better error handling
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
      
      console.log(`Fetching from: ${endpoint} - ${url}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`HTTP error ${response.status} for ${endpoint}`);
        continue;
      }
      
      const data = await response.json();
      console.log(`API response for ${endpoint}:`, data.status, data.data?.length || 0);
      
      if (data.status === 'success' && Array.isArray(data.data)) {
        console.log(`Successfully fetched ${data.data.length} items from ${endpoint}`);
        
        // Special handling for different endpoints
        if (endpoint === 'players') {
          // Enhanced player search with better matching
          const searchTerms = query.toLowerCase();
          const players = data.data.filter((player: any) => {
            if (!player.name) return false;
            const playerName = player.name.toLowerCase();
            
            // Check for specific player names in query
            if (searchTerms.includes('rohit') && playerName.includes('rohit')) return true;
            if (searchTerms.includes('kohli') && playerName.includes('kohli')) return true;
            if (searchTerms.includes('pandya') && playerName.includes('pandya')) return true;
            if (searchTerms.includes('sharma') && playerName.includes('sharma')) return true;
            
            return false;
          });
          console.log(`Found ${players.length} players matching search terms`);
          allData.push(...players);
        } else if (endpoint === 'currentMatches') {
          // Enhanced match processing with team extraction
          const processedMatches = data.data.map((match: any) => {
            // Extract team names from match name if teams array is missing
            if ((!match.teams || match.teams.length === 0) && match.name) {
              const vsMatch = match.name.match(/^(.+?)\s+vs\s+(.+?),/);
              if (vsMatch) {
                match.teams = [vsMatch[1].trim(), vsMatch[2].trim()];
              }
            }
            
            // Ensure teamInfo is created
            if (match.teams && (!match.teamInfo || match.teamInfo.length === 0)) {
              match.teamInfo = match.teams.map((teamName: string) => ({
                name: teamName,
                shortname: teamName.substring(0, 3).toUpperCase(),
                img: getTeamFlag(teamName)
              }));
            }
            
            return match;
          });
          allData.push(...processedMatches);
        } else {
          allData.push(...data.data);
        }
      } else {
        console.log(`No valid data from ${endpoint}:`, data.status, data.info?.message || '');
      }
      
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error.message);
    }
  }
  
  console.log(`Total data items collected: ${allData.length}`);
  return allData;
}

// Helper function to get team flags
function getTeamFlag(teamName: string): string {
  const flags = {
    "India": "https://flagcdn.com/w320/in.png",
    "Australia": "https://flagcdn.com/w320/au.png",
    "England": "https://flagcdn.com/w320/gb-eng.png",
    "New Zealand": "https://flagcdn.com/w320/nz.png",
    "Pakistan": "https://flagcdn.com/w320/pk.png",
    "South Africa": "https://flagcdn.com/w320/za.png",
    "Sri Lanka": "https://flagcdn.com/w320/lk.png",
    "Bangladesh": "https://flagcdn.com/w320/bd.png",
    "Afghanistan": "https://flagcdn.com/w320/af.png",
    "West Indies": "https://upload.wikimedia.org/wikipedia/en/thumb/d/d5/Cricket_West_Indies_flag.svg/320px-Cricket_West_Indies_flag.svg.png",
    "Bastar Bisons": "https://h.cricapi.com/img/icon512.png",
    "Surguja Tigers": "https://h.cricapi.com/img/icon512.png",
    "Rajnandgaon Panthers": "https://h.cricapi.com/img/icon512.png",
    "Raigarh Lions": "https://h.cricapi.com/img/icon512.png"
  };
  
  return flags[teamName as keyof typeof flags] || 'https://h.cricapi.com/img/icon512.png';
}

// Generate AI response
async function generateEnhancedAIResponse(query: string, cricketData: any[], apiPlan: any) {
  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      return generateFallbackResponse(query, cricketData, apiPlan);
    }

    // Create enhanced context based on cricket data
    let context = '';
    
    if (apiPlan.queryType === 'squad_search') {
      if (cricketData.length > 0) {
        const playerNames = cricketData.map(p => p.name).join(', ');
        context = `Found ${cricketData.length} players matching your search: ${playerNames}`;
        
        // Enhanced player search response
        const searchQuery = query.toLowerCase();
        const matchingPlayers = cricketData.filter(p => {
          const name = p.name.toLowerCase();
          return searchQuery.includes('rohit') && name.includes('rohit') ||
                 searchQuery.includes('kohli') && name.includes('kohli') ||
                 searchQuery.includes('pandya') && name.includes('pandya');
        });
        
        if (matchingPlayers.length > 0) {
          context = `✅ Yes! Found ${matchingPlayers.length} player(s) matching your search: ${matchingPlayers.map(p => p.name).join(', ')}. These players are available in the current database.`;
        } else {
          context = '❌ No players matching your specific search found in the current database.';
        }
      } else {
        context = 'No players found matching your search criteria in the current database.';
      }
    } else if (apiPlan.queryType === 'current_matches') {
      if (cricketData.length > 0) {
        const matchSummaries = cricketData.slice(0, 5).map(match => {
          const teams = match.teams ? match.teams.join(' vs ') : 'Teams TBD';
          return `🏏 ${match.name}: ${teams} - ${match.status}`;
        }).join('\n');
        context = `📊 Current cricket matches available:\n${matchSummaries}`;
      } else {
        context = 'No current cricket matches available at the moment.';
      }
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a helpful cricket fantasy assistant with access to live cricket data. Use the provided cricket data to answer questions accurately. Be informative and helpful.`
          },
          {
            role: 'user',
            content: `Query: "${query}"\n\nCricket Data Context:\n${context}\n\nPlease respond naturally and helpfully based on this information.`
          }
        ],
        max_tokens: 400,
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

// Enhanced fallback response
function generateFallbackResponse(query: string, cricketData: any[], apiPlan: any) {
  if (apiPlan.queryType === 'squad_search') {
    if (cricketData.length > 0) {
      const searchQuery = query.toLowerCase();
      const matchingPlayers = cricketData.filter(p => {
        const name = p.name.toLowerCase();
        return searchQuery.includes('rohit') && name.includes('rohit') ||
               searchQuery.includes('kohli') && name.includes('kohli') ||
               searchQuery.includes('pandya') && name.includes('pandya');
      });
      
      if (matchingPlayers.length > 0) {
        return `✅ Yes! Found ${matchingPlayers.length} player(s) named matching your search: ${matchingPlayers.map(p => p.name).join(', ')}`;
      } else {
        return `❌ No players matching your specific search found in the current database.`;
      }
    } else {
      return "I couldn't fetch the player database at the moment. Please try again later.";
    }
  }
  
  if (apiPlan.queryType === 'current_matches') {
    if (cricketData.length > 0) {
      const matchList = cricketData.slice(0, 5).map(match => {
        const teams = match.teams ? match.teams.join(' vs ') : 'Teams TBD';
        return `🏏 ${match.name}: ${teams} - ${match.status}`;
      }).join('\n\n');
      return `📊 Current cricket matches available:\n\n${matchList}`;
    } else {
      return "No current matches available for fantasy team suggestions. Please check back when matches are live.";
    }
  }
  
  return "I'm here to help with cricket information! Ask me about current matches, player statistics, or fantasy team suggestions.";
}
