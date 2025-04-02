
import { CricketMatch } from "@/utils/cricket-api";
import { mockPlayers } from "./mockData";
import { Message, MatchDetails } from "./types";
import { Player } from "@/types/player";

// Format match data for display
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
  // This is a simplified implementation - in a real app, you would need more sophisticated merging logic
  const uniqueMatches = new Map<string, CricketMatch>();
  
  // Add matches from first source
  matches1.forEach(match => {
    uniqueMatches.set(match.id, match);
  });
  
  // Add or update with matches from second source
  matches2.forEach(match => {
    if (uniqueMatches.has(match.id)) {
      // Merge data if this match already exists
      const existingMatch = uniqueMatches.get(match.id)!;
      uniqueMatches.set(match.id, {
        ...existingMatch,
        // Prefer score from the second source as it might be more recent
        score: match.score || existingMatch.score,
        status: match.status || existingMatch.status,
      });
    } else {
      uniqueMatches.set(match.id, match);
    }
  });
  
  return Array.from(uniqueMatches.values());
};

// Suggest players for fantasy team
export const suggestPlayers = (query: string): { content: string; playerSuggestions: { captain?: Player; viceCaptain?: Player; allrounders?: Player[] } } => {
  // In a real implementation, you would analyze the query and fetch relevant player data
  // For this example, we'll use the mock data
  
  // Determine what kind of suggestions to make
  const isCaptainQuery = query.includes("captain");
  const isAllRounderQuery = query.includes("all") && query.includes("round");
  
  // Create player suggestions
  const captain = mockPlayers.find(p => p.id === "p1"); // Virat for captain
  const viceCaptain = mockPlayers.find(p => p.id === "p4"); // KL Rahul for VC
  const allrounders = mockPlayers.filter(p => p.role === "allrounder");
  
  let content = "";
  
  if (isCaptainQuery) {
    content = "Based on recent form and matchup, here are my captain recommendations:";
  } else if (isAllRounderQuery) {
    content = "Here are the top all-rounders for your fantasy team:";
  } else {
    content = "Here are my fantasy team recommendations based on recent form and matchups:";
  }
  
  return {
    content,
    playerSuggestions: {
      captain,
      viceCaptain,
      allrounders
    }
  };
};

// Process user query and prepare response
export const processUserQuery = (
  query: string, 
  matches: CricketMatch[], 
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) => {
  // Handle different query types
  if (query.includes("score") || query.includes("match") || query.includes("live")) {
    // Show all matches
    if (matches.length === 0) {
      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        type: "bot",
        content: "No matches are currently available. Type 'refresh' to check again.",
        timestamp: new Date(),
      }]);
      return;
    }

    // Add a message for each match (limit to 3 for simplicity)
    const matchesToShow = matches.slice(0, 3);
    matchesToShow.forEach(match => {
      setMessages(prev => [...prev, {
        id: `match-${match.id}-${Date.now()}`,
        type: "match-update",
        content: match.name,
        timestamp: new Date(),
        matchData: match,
      }]);
    });

    // Add a summary message if there are more matches
    if (matches.length > 3) {
      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        type: "bot",
        content: `Showing 3 of ${matches.length} matches. Check the Matches tab to see all.`,
        timestamp: new Date(),
      }]);
    }
  } else if (query.includes("captain") || query.includes("team") || query.includes("pick") || query.includes("suggest")) {
    // Suggest players for fantasy team
    const { content, playerSuggestions } = suggestPlayers(query);
    
    setMessages(prev => [...prev, {
      id: `player-suggestion-${Date.now()}`,
      type: "player-suggestion",
      content,
      timestamp: new Date(),
      playerSuggestions
    }]);
  } else if (query.includes("help")) {
    // Show help
    setMessages(prev => [...prev, {
      id: `bot-${Date.now()}`,
      type: "bot",
      content: `You can ask me things like:
• "Show live scores"
• "Who should I pick as captain?"
• "Suggest players for my fantasy team"
• "Refresh cricket data"`,
      timestamp: new Date(),
    }]);
  } else {
    // Generic response
    setMessages(prev => [...prev, {
      id: `bot-${Date.now()}`,
      type: "bot",
      content: "You can type 'scores' to see live matches, 'suggest team' for fantasy recommendations, or 'help' for more options.",
      timestamp: new Date(),
    }]);
  }
};
