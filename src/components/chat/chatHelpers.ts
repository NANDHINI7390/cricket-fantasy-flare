import { CricketMatch, fetchLiveMatches, fetchFantasySquad, fetchFantasyPoints, fetchMatchScorecard, fetchAllPlayers } from "@/utils/cricket-api";
import { mockPlayers } from "./mockData";
import { Message, MatchDetails } from "./types";
import { Player } from "@/types/player";
import { supabase } from "@/integrations/supabase/client";

// Enhanced workflow: Use CrickAPI + OpenAI for intelligent responses
export const generateIntelligentResponse = async (
  query: string, 
  matches: CricketMatch[]
): Promise<{ message: string; analysisData?: any }> => {
  try {
    console.log("Starting intelligent response generation...");
    
    // Fetch enhanced cricket data for the query
    const cricketData = await getEnhancedCricketData(query, matches);
    console.log("Enhanced cricket data fetched:", !!cricketData);
    
    // Call the enhanced cricket-assistant edge function with smart prompting
    console.log("Calling cricket-assistant edge function...");
    
    const { data, error } = await supabase.functions.invoke('cricket-assistant', {
      body: {
        query,
        cricketData,
        requestType: determineRequestType(query),
        useSmartPrompting: true
      }
    });

    if (error) {
      console.error("Error calling cricket-assistant:", error);
      return { message: generateFallbackResponse(query, matches) };
    }

    console.log("Cricket assistant response received:", !!data.message);

    return {
      message: data.message || generateFallbackResponse(query, matches),
      analysisData: data.playerStats
    };
  } catch (error) {
    console.error("Error in intelligent response generation:", error);
    return { message: generateFallbackResponse(query, matches) };
  }
};

// Get enhanced cricket data based on user query
const getEnhancedCricketData = async (query: string, matches: CricketMatch[]) => {
  const queryLower = query.toLowerCase();
  let cricketData: any = { matches: matches.slice(0, 5) };

  console.log("Getting enhanced cricket data for query type:", queryLower);

  try {
    // Always include current matches data
    cricketData.currentMatches = matches.slice(0, 3);

    // Determine what specific data to fetch based on query
    if (queryLower.includes("captain") || queryLower.includes("fantasy") || queryLower.includes("pick")) {
      console.log("Fetching fantasy data for captain/team suggestions...");
      
      // Fetch fantasy data for captain/team suggestions
      const fantasyPromises = matches.slice(0, 2).map(async (match) => {
        try {
          const [squad, points] = await Promise.allSettled([
            fetchFantasySquad(match.id),
            fetchFantasyPoints(match.id)
          ]);
          
          return {
            matchId: match.id,
            squad: squad.status === 'fulfilled' ? squad.value : null,
            points: points.status === 'fulfilled' ? points.value : null
          };
        } catch (error) {
          console.error(`Error fetching fantasy data for match ${match.id}:`, error);
          return { matchId: match.id, squad: null, points: null };
        }
      });
      
      const fantasyResults = await Promise.allSettled(fantasyPromises);
      cricketData.fantasyData = fantasyResults
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);
    }

    if (queryLower.includes("player") || queryLower.includes("stats")) {
      console.log("Fetching player information...");
      try {
        cricketData.players = await fetchAllPlayers();
      } catch (error) {
        console.error("Error fetching players:", error);
        cricketData.players = [];
      }
    }

  } catch (error) {
    console.error("Error fetching enhanced cricket data:", error);
  }

  console.log("Enhanced cricket data prepared with matches:", cricketData.matches?.length || 0);
  return cricketData;
};

// Determine request type for smart processing
const determineRequestType = (query: string): string => {
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes("captain") || queryLower.includes("vc")) {
    return "captain_suggestion";
  } else if (queryLower.includes("team") || queryLower.includes("suggest") || queryLower.includes("pick")) {
    return "fantasy_analysis";
  } else if (queryLower.includes("score") || queryLower.includes("live") || queryLower.includes("match")) {
    return "live_analysis";
  } else if (queryLower.includes("player") && (queryLower.includes("form") || queryLower.includes("stats"))) {
    return "player_analysis";
  } else if (queryLower.includes("points") || queryLower.includes("fantasy")) {
    return "fantasy_points";
  } else if (queryLower.includes("squad") || queryLower.includes("playing11")) {
    return "squad_analysis";
  }
  
  return "general";
};

// Enhanced match data formatting
export const formatMatchData = (match: CricketMatch): string | MatchDetails => {
  if (!match) return "Match details unavailable";
  
  const team1 = match.teamInfo?.[0]?.name || match.teams?.[0] || "Team 1";
  const team2 = match.teamInfo?.[1]?.name || match.teams?.[1] || "Team 2";
  
  const team1Score = match.score?.find(s => s.inning.includes(team1));
  const team2Score = match.score?.find(s => s.inning.includes(team2));
  
  const team1ScoreText = team1Score ? `${team1Score.r || 0}/${team1Score.w || 0} (${team1Score.o || 0} overs)` : "No score";
  const team2ScoreText = team2Score ? `${team2Score.r || 0}/${team2Score.w || 0} (${team2Score.o || 0} overs)` : "No score";
  
  return {
    team1,
    team2,
    team1Score: team1ScoreText,
    team2Score: team2ScoreText,
    status: match.status,
    team1Logo: match.teamInfo?.[0]?.img || "",
    team2Logo: match.teamInfo?.[1]?.img || "",
  };
};

// Merge data from multiple cricket APIs
export const mergeMatchData = (matches1: CricketMatch[], matches2: CricketMatch[]): CricketMatch[] => {
  const uniqueMatches = new Map<string, CricketMatch>();
  
  matches1.forEach(match => {
    uniqueMatches.set(match.id, match);
  });
  
  matches2.forEach(match => {
    if (uniqueMatches.has(match.id)) {
      const existingMatch = uniqueMatches.get(match.id)!;
      uniqueMatches.set(match.id, {
        ...existingMatch,
        score: match.score || existingMatch.score,
        status: match.status || existingMatch.status,
      });
    } else {
      uniqueMatches.set(match.id, match);
    }
  });
  
  return Array.from(uniqueMatches.values());
};

// Enhanced query processing with smart workflow
export const processUserQuery = async (
  query: string, 
  matches: CricketMatch[], 
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) => {
  const queryLower = query.toLowerCase();
  
  console.log("Processing user query:", query);
  
  try {
    // Use the smart workflow for all queries
    const aiResponse = await generateIntelligentResponse(query, matches);
    console.log("AI response received:", !!aiResponse.message);
    
    // Handle different types of responses with enhanced formatting
    if (queryLower.includes("captain") || queryLower.includes("team") || queryLower.includes("pick")) {
      setMessages(prev => [...prev, {
        id: `ai-fantasy-${Date.now()}`,
        type: "bot",
        content: `🎯 **Fantasy Analysis**\n\n${aiResponse.message}`,
        timestamp: new Date(),
      }]);
    } else if (queryLower.includes("score") || queryLower.includes("live")) {
      setMessages(prev => [...prev, {
        id: `ai-live-${Date.now()}`,
        type: "bot",
        content: `📺 **Live Cricket Update**\n\n${aiResponse.message}`,
        timestamp: new Date(),
      }]);
    } else if (queryLower.includes("player") || queryLower.includes("stats")) {
      setMessages(prev => [...prev, {
        id: `ai-player-${Date.now()}`,
        type: "bot",
        content: `👤 **Player Analysis**\n\n${aiResponse.message}`,
        timestamp: new Date(),
      }]);
    } else {
      setMessages(prev => [...prev, {
        id: `ai-general-${Date.now()}`,
        type: "bot",
        content: aiResponse.message,
        timestamp: new Date(),
      }]);
    }
  } catch (error) {
    console.error("Error processing user query:", error);
    setMessages(prev => [...prev, {
      id: `error-${Date.now()}`,
      type: "bot",
      content: "❌ I'm having trouble processing your request right now. Let me try with my basic knowledge instead!\n\n" + generateFallbackResponse(query, matches),
      timestamp: new Date(),
    }]);
  }
};

// Fallback response when OpenAI/APIs fail
const generateFallbackResponse = (query: string, matches: CricketMatch[]): string => {
  const queryLower = query.toLowerCase();
  
  console.log("Generating fallback response for:", queryLower);
  
  if (queryLower.includes("captain") || queryLower.includes("team")) {
    return "🏏 **Captain Strategy (Offline Mode):**\n\nFor captain picks, focus on:\n• Top-order batsmen with consistent form\n• All-rounders who contribute with both bat and ball\n• Key bowlers on favorable pitches\n• Players with good recent performances\n\nConsider the pitch conditions and recent team performances when making your choice!";
  }
  
  if (queryLower.includes("score") || queryLower.includes("live")) {
    if (matches.length > 0) {
      return `📺 **Match Update:**\n\nI found ${matches.length} cricket matches in our database. The most recent match is "${matches[0].name}" with status: ${matches[0].status}.\n\nCheck the Matches tab for more detailed information!`;
    }
    return "⚠️ **No Live Data:**\n\nNo live matches found at the moment. This could be due to:\n• No matches currently scheduled\n• API connectivity issues\n• Maintenance period\n\nPlease check back later for live updates!";
  }
  
  if (queryLower.includes("player") || queryLower.includes("stats")) {
    return "👤 **Player Analysis (Offline Mode):**\n\nFor player selection, consider:\n• Recent batting/bowling averages\n• Performance against specific teams\n• Home vs away record\n• Current form in the tournament\n• Pitch and weather conditions\n\nFocus on players who have been consistently performing in similar match situations!";
  }
  
  return "🤖 **Cricket Assistant (Basic Mode):**\n\nI'm currently running in offline mode but can still help with:\n• General cricket strategy and tips\n• Fantasy team building advice\n• Player role explanations\n• Match format strategies\n\nAsk me specific questions about cricket strategy, and I'll do my best to help with my cricket knowledge!";
};

// Suggest players for fantasy team
export const suggestPlayers = (query: string): { content: string; playerSuggestions: { captain?: Player; viceCaptain?: Player; allrounders?: Player[] } } => {
  const captain = mockPlayers.find(p => p.id === "p1");
  const viceCaptain = mockPlayers.find(p => p.id === "p4");
  const allrounders = mockPlayers.filter(p => p.role === "allrounder");
  
  return {
    content: "Here are my enhanced fantasy team recommendations based on analysis:",
    playerSuggestions: {
      captain,
      viceCaptain,
      allrounders
    }
  };
};
