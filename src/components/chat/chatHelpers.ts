
import { CricketMatch, fetchLiveMatches, fetchFantasySquad, fetchFantasyPoints, fetchMatchScorecard, fetchAllPlayers } from "@/utils/cricket-api";
import { mockPlayers } from "./mockData";
import { Message, MatchDetails } from "./types";
import { Player } from "@/types/player";
import { supabase } from "@/integrations/supabase/client";

// Smart workflow: Use CrickAPI + OpenAI for intelligent responses
export const generateIntelligentResponse = async (
  query: string, 
  matches: CricketMatch[]
): Promise<{ message: string; analysisData?: any }> => {
  try {
    // Fetch enhanced cricket data for the query
    const cricketData = await getEnhancedCricketData(query, matches);
    
    // Call the enhanced cricket-assistant edge function with smart prompting
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

    return {
      message: data.message || generateFallbackResponse(query, matches),
      analysisData: data.playerStats
    };
  } catch (error) {
    console.error("Error in intelligent response:", error);
    return { message: generateFallbackResponse(query, matches) };
  }
};

// Get enhanced cricket data based on user query
const getEnhancedCricketData = async (query: string, matches: CricketMatch[]) => {
  const queryLower = query.toLowerCase();
  let cricketData: any = { matches: matches.slice(0, 3) };

  try {
    // Determine what specific data to fetch based on query
    if (queryLower.includes("captain") || queryLower.includes("fantasy") || queryLower.includes("pick")) {
      // Fetch fantasy data for captain/team suggestions
      const fantasyData = await Promise.allSettled(
        matches.slice(0, 2).map(async (match) => {
          const [squad, points, scorecard] = await Promise.all([
            fetchFantasySquad(match.id),
            fetchFantasyPoints(match.id),
            fetchMatchScorecard(match.id)
          ]);
          return { matchId: match.id, squad, points, scorecard };
        })
      );
      
      cricketData.fantasyData = fantasyData
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);
    }

    if (queryLower.includes("player") || queryLower.includes("stats")) {
      // Fetch player information
      cricketData.players = await fetchAllPlayers();
    }

    if (queryLower.includes("score") || queryLower.includes("live")) {
      // Fetch latest live scores
      cricketData.liveScores = await fetchLiveMatches();
    }

  } catch (error) {
    console.error("Error fetching enhanced cricket data:", error);
  }

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
  
  try {
    // Use the smart workflow for all queries
    const aiResponse = await generateIntelligentResponse(query, matches);
    
    // Handle different types of responses
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
      content: "I'm having trouble processing your request right now. Please try again or ask something else!",
      timestamp: new Date(),
    }]);
  }
};

// Fallback response when OpenAI/APIs fail
const generateFallbackResponse = (query: string, matches: CricketMatch[]): string => {
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes("captain") || queryLower.includes("team")) {
    return "🏏 For captain picks, I recommend looking at top-order batsmen in good form. Consider players who are consistent run-scorers and can provide stability to your fantasy team. Without live data, focus on recent performances and pitch conditions.";
  }
  
  if (queryLower.includes("score") || queryLower.includes("live")) {
    if (matches.length > 0) {
      return `📺 I found ${matches.length} cricket matches. ${matches[0].name} is ${matches[0].status}. Check the Matches tab for more details.`;
    }
    return "⚠️ No live matches found at the moment. Please check back later for live scores and updates.";
  }
  
  return "🤖 I'm your enhanced cricket fantasy AI assistant! I can help with live scores, player analysis, fantasy team suggestions, and strategic insights. Try asking about specific players or matches!";
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
