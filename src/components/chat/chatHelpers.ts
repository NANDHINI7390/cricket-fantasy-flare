import { CricketMatch, FantasySquad, FantasyPoints, PlayerInfo } from "@/utils/cricket-api";
import { fetchFantasySquad, fetchFantasyPoints, fetchMatchScorecard, fetchAllPlayers } from "@/utils/cricket-api";
import { mockPlayers } from "./mockData";
import { Message, MatchDetails } from "./types";
import { Player } from "@/types/player";
import { supabase } from "@/integrations/supabase/client";

// Enhanced AI-powered response generation with real fantasy data
export const generateIntelligentResponse = async (
  query: string, 
  matches: CricketMatch[]
): Promise<{ message: string; analysisData?: any }> => {
  try {
    // Get additional fantasy data for live matches
    const enhancedMatchData = await getEnhancedMatchData(matches.slice(0, 3));
    
    // Call the enhanced cricket-assistant edge function
    const { data, error } = await supabase.functions.invoke('cricket-assistant', {
      body: {
        query,
        matchData: enhancedMatchData,
        requestType: determineRequestType(query)
      }
    });

    if (error) {
      console.error("Error calling cricket-assistant:", error);
      return { message: generateBasicResponse(query, matches) };
    }

    return {
      message: data.message || generateBasicResponse(query, matches),
      analysisData: data.playerStats
    };
  } catch (error) {
    console.error("Error in intelligent response:", error);
    return { message: generateBasicResponse(query, matches) };
  }
};

// Get enhanced match data with fantasy squad and points
const getEnhancedMatchData = async (matches: CricketMatch[]) => {
  const enhancedMatches = await Promise.all(
    matches.map(async (match) => {
      try {
        const [fantasySquad, fantasyPoints, scorecard] = await Promise.all([
          fetchFantasySquad(match.id),
          fetchFantasyPoints(match.id),
          fetchMatchScorecard(match.id)
        ]);

        return {
          ...match,
          fantasySquad,
          fantasyPoints,
          scorecard
        };
      } catch (error) {
        console.error(`Error enhancing match ${match.id}:`, error);
        return match;
      }
    })
  );

  return enhancedMatches;
};

// Determine the type of request for better AI processing
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
  } else if (queryLower.includes("weather") || queryLower.includes("pitch") || queryLower.includes("condition")) {
    return "pitch_analysis";
  } else if (queryLower.includes("points") || queryLower.includes("fantasy")) {
    return "fantasy_points";
  } else if (queryLower.includes("squad") || queryLower.includes("playing11")) {
    return "squad_analysis";
  }
  
  return "general";
};

// Enhanced smart fantasy recommendations using real data
export const getSmartFantasyRecommendations = async (matches: CricketMatch[]): Promise<{
  captainPicks: Array<{
    name: string;
    team: string;
    credits: number;
    recentPoints: number;
    reason: string;
  }>;
  valuePicks: Array<{
    name: string;
    team: string;
    credits: number;
    reason: string;
  }>;
  differentialPicks: Array<{
    name: string;
    team: string;
    credits: number;
    reason: string;
  }>;
}> => {
  const recommendations = {
    captainPicks: [],
    valuePicks: [],
    differentialPicks: []
  };

  try {
    for (const match of matches.slice(0, 2)) {
      const [fantasySquad, fantasyPoints] = await Promise.all([
        fetchFantasySquad(match.id),
        fetchFantasyPoints(match.id)
      ]);

      if (fantasySquad && fantasyPoints) {
        // Analyze captain picks based on recent points
        const topPerformers = fantasyPoints.points
          .sort((a, b) => b.points - a.points)
          .slice(0, 3);

        topPerformers.forEach(player => {
          const squadPlayer = findPlayerInSquad(fantasySquad, player.player_id);
          if (squadPlayer) {
            recommendations.captainPicks.push({
              name: player.name,
              team: squadPlayer.team,
              credits: squadPlayer.credits,
              recentPoints: player.points,
              reason: `Scored ${player.points} points recently with ${player.breakdown.runs || 0} runs and ${player.breakdown.wickets || 0} wickets`
            });
          }
        });

        // Find value picks (good points per credit ratio)
        const valuePlayers = fantasyPoints.points
          .map(player => {
            const squadPlayer = findPlayerInSquad(fantasySquad, player.player_id);
            return squadPlayer ? {
              ...player,
              ...squadPlayer,
              pointsPerCredit: player.points / squadPlayer.credits
            } : null;
          })
          .filter(p => p && p.credits <= 8.5 && p.pointsPerCredit > 1)
          .sort((a, b) => b.pointsPerCredit - a.pointsPerCredit)
          .slice(0, 3);

        valuePlayers.forEach(player => {
          recommendations.valuePicks.push({
            name: player.name,
            team: player.team,
            credits: player.credits,
            reason: `Great value at ${player.credits} credits with ${player.pointsPerCredit.toFixed(1)} points per credit`
          });
        });
      }
    }
  } catch (error) {
    console.error("Error getting smart recommendations:", error);
  }

  return recommendations;
};

// Helper function to find player in squad
const findPlayerInSquad = (fantasySquad: FantasySquad, playerId: string) => {
  for (const squad of fantasySquad.squads) {
    const player = squad.players.find(p => p.id === playerId);
    if (player) {
      return { ...player, team: squad.team };
    }
  }
  return null;
};

// Enhanced match data formatting with fantasy insights
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

// Enhanced player suggestions with AI reasoning
export const suggestPlayersWithAI = async (query: string, matches: CricketMatch[]): Promise<{
  content: string;
  playerSuggestions: {
    captain?: Player;
    viceCaptain?: Player;
    allrounders?: Player[];
  };
  reasoning?: string;
}> => {
  try {
    const response = await generateIntelligentResponse(query, matches);
    
    // Parse AI response for structured player data
    const playerSuggestions = extractPlayerSuggestions(response.message);
    
    return {
      content: response.message,
      playerSuggestions,
      reasoning: extractReasoning(response.message)
    };
  } catch (error) {
    console.error("Error in AI player suggestions:", error);
    return suggestPlayers(query);
  }
};

// Extract player suggestions from AI response
const extractPlayerSuggestions = (aiResponse: string): {
  captain?: Player;
  viceCaptain?: Player;
  allrounders?: Player[];
} => {
  // Look for captain mentions
  const captainMatch = aiResponse.match(/(?:captain|cap)[:\s]+([a-zA-Z\s]+?)(?:\n|\.|\s-)/i);
  const vcMatch = aiResponse.match(/(?:vice.captain|vc)[:\s]+([a-zA-Z\s]+?)(?:\n|\.|\s-)/i);
  
  let captain, viceCaptain;
  
  if (captainMatch) {
    const captainName = captainMatch[1].trim();
    captain = mockPlayers.find(p => p.name.toLowerCase().includes(captainName.toLowerCase())) 
      || mockPlayers.find(p => p.role === "batsman");
  }
  
  if (vcMatch) {
    const vcName = vcMatch[1].trim();
    viceCaptain = mockPlayers.find(p => p.name.toLowerCase().includes(vcName.toLowerCase())) 
      || mockPlayers.find(p => p.role === "allrounder");
  }
  
  const allrounders = mockPlayers.filter(p => p.role === "allrounder").slice(0, 3);
  
  return { captain, viceCaptain, allrounders };
};

// Extract reasoning from AI response
const extractReasoning = (aiResponse: string): string => {
  const reasoningMatch = aiResponse.match(/(?:because|reason|due to|considering)[:\s](.+?)(?:\n\n|$)/i);
  return reasoningMatch ? reasoningMatch[1].trim() : "Based on current form and match conditions";
};

// Parse AI response for structured display
export const parseAIResponse = (response: string): {
  content: string;
  liveAnalysis?: {
    matchName: string;
    teamScores: string[];
    captainPick?: {
      name: string;
      stats: string;
      reason: string;
    };
    bowlingPick?: {
      name: string;
      stats: string;
      reason: string;
    };
    otherRecommendations?: Array<{
      name: string;
      role: string;
      reason: string;
    }>;
  }
} => {
  // Default content
  let parsedContent = {
    content: response,
  };

  try {
    // Check if the response contains match information
    if (response.includes("**Match:**") && (response.includes("**Score:**") || response.includes("**Captain Pick:**"))) {
      // Extract match name
      const matchNameMatch = response.match(/\*\*Match:\*\*\s*(.*?)(?=\s*\*\*Score|\*\*Captain|\s*$)/i);
      const matchName = matchNameMatch ? matchNameMatch[1].trim() : "Unknown Match";
      
      // Extract scores
      const scoresMatch = response.match(/\*\*Score:\*\*\s*(.*?)(?=\s*\*\*Captain|\*\*Top|\s*$)/i);
      const scoresText = scoresMatch ? scoresMatch[1].trim() : "";
      const teamScores = scoresText.split('**').filter(s => s.trim().length > 0);
      
      // If no explicit scores found, look for team score formats
      const teamScoreMatches = response.match(/([A-Za-z\s]+)\s+(\d+)\/(\d+)\s*\(([^)]+)\)/g);
      const extractedScores = teamScoreMatches || [];
      
      // Extract captain pick
      const captainMatch = response.match(/\*\*Captain Pick:\*\*\s*(.*?)(?=\s*\*\*Top|\*\*Other|\s*$)/i);
      let captainPick;
      
      if (captainMatch) {
        const captainText = captainMatch[1].trim();
        // Parse name and stats
        const captainNameMatch = captainText.match(/(.*?)(?=–|:|$)/);
        const captainStatsMatch = captainText.match(/–\s*(.*?)(?=\(|\)|\s*$)/);
        const captainReasonMatch = response.match(new RegExp(`${captainNameMatch?.[1].trim()}.*?(is|has|shows|provides|offers|brings|because|as|since)([^.]*)`));
        
        captainPick = {
          name: captainNameMatch ? captainNameMatch[1].trim() : "Unknown",
          stats: captainStatsMatch ? captainStatsMatch[1].trim() : "",
          reason: captainReasonMatch ? `${captainReasonMatch[1]}${captainReasonMatch[2]}` : "In good form"
        };
      }
      
      // Extract bowling pick
      const bowlingMatch = response.match(/\*\*Top Bowling Pick:\*\*\s*(.*?)(?=\s*\*\*Other|\s*$)/i);
      let bowlingPick;
      
      if (bowlingMatch) {
        const bowlingText = bowlingMatch[1].trim();
        // Parse name and stats
        const bowlerNameMatch = bowlingText.match(/(.*?)(?=–|:|$)/);
        const bowlerStatsMatch = bowlingText.match(/–\s*(.*?)(?=\(|\)|\s*$)/);
        const bowlerReasonMatch = response.match(new RegExp(`${bowlerNameMatch?.[1].trim()}.*?(is|has|shows|provides|offers|brings|because|as|since)([^.]*)`));
        
        bowlingPick = {
          name: bowlerNameMatch ? bowlerNameMatch[1].trim() : "Unknown",
          stats: bowlerStatsMatch ? bowlerStatsMatch[1].trim() : "",
          reason: bowlerReasonMatch ? `${bowlerReasonMatch[1]}${bowlerReasonMatch[2]}` : "Bowling well"
        };
      }
      
      // Find other player recommendations
      const otherRecs = [];
      const playerRegex = /([A-Za-z\s]+) is a good (pick|choice|option|selection|allrounder|batsman|bowler)/gi;
      let playerMatch;
      
      while ((playerMatch = playerRegex.exec(response)) !== null) {
        const playerName = playerMatch[1].trim();
        // Skip if this is already the captain or bowling pick
        if (captainPick?.name === playerName || bowlingPick?.name === playerName) continue;
        
        // Find role and reason
        const roleMatch = response.match(new RegExp(`${playerName}.*?(batsman|bowler|all-rounder|allrounder|wicket-keeper|keeper)`, 'i'));
        const reasonMatch = response.match(new RegExp(`${playerName}[^.]*`, 'i'));
        
        otherRecs.push({
          name: playerName,
          role: roleMatch ? roleMatch[1] : "Player",
          reason: reasonMatch ? reasonMatch[0].replace(playerName, "").trim() : "Good form"
        });
      }
      
      // Create a summarized content for the message
      let summaryContent = "Based on current match data and player performances, here are my fantasy recommendations:";
      
      // Return structured data for display
      return {
        content: summaryContent,
        liveAnalysis: {
          matchName,
          teamScores: teamScores.length > 0 ? teamScores : extractedScores,
          captainPick,
          bowlingPick,
          otherRecommendations: otherRecs.length > 0 ? otherRecs : undefined
        }
      };
    }
  } catch (error) {
    console.error("Error parsing AI response:", error);
  }
  
  // If we couldn't parse it into a structured format, return the original text
  return parsedContent;
};

// Enhanced query processing with real fantasy data
export const processUserQuery = async (
  query: string, 
  matches: CricketMatch[], 
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) => {
  const queryLower = query.toLowerCase();
  
  // Smart fantasy suggestions with real data
  if (queryLower.includes("captain") || queryLower.includes("team") || queryLower.includes("pick") || queryLower.includes("suggest")) {
    try {
      const smartRecommendations = await getSmartFantasyRecommendations(matches);
      const aiResponse = await generateIntelligentResponse(query, matches);
      
      // Parse the AI response for live analysis format
      const parsedResponse = parseAIResponse(aiResponse.message);
      
      if (parsedResponse.liveAnalysis) {
        setMessages(prev => [...prev, {
          id: `ai-analysis-${Date.now()}`,
          type: "ai-analysis",
          content: parsedResponse.content,
          timestamp: new Date(),
          liveAnalysis: parsedResponse.liveAnalysis,
          smartRecommendations
        }]);
      } else {
        // Show smart recommendations
        let smartContent = aiResponse.message;
        
        if (smartRecommendations.captainPicks.length > 0) {
          smartContent += "\n\n🎯 **Smart Captain Picks:**\n";
          smartRecommendations.captainPicks.forEach(pick => {
            smartContent += `• **${pick.name}** (${pick.team}) - ${pick.credits} credits\n  ${pick.reason}\n`;
          });
        }

        if (smartRecommendations.valuePicks.length > 0) {
          smartContent += "\n💰 **Value Picks:**\n";
          smartRecommendations.valuePicks.forEach(pick => {
            smartContent += `• **${pick.name}** (${pick.team}) - ${pick.credits} credits\n  ${pick.reason}\n`;
          });
        }
        
        setMessages(prev => [...prev, {
          id: `smart-suggestion-${Date.now()}`,
          type: "bot",
          content: smartContent,
          timestamp: new Date(),
        }]);
      }
      
      return;
    } catch (error) {
      console.error("Error in smart processing:", error);
    }
  }
  
  // Fantasy points analysis
  if (queryLower.includes("points") || queryLower.includes("fantasy")) {
    if (matches.length === 0) {
      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        type: "bot",
        content: "No matches available for fantasy points analysis. Please refresh to get latest data.",
        timestamp: new Date(),
      }]);
      return;
    }

    try {
      const match = matches[0];
      const fantasyPoints = await fetchFantasyPoints(match.id);
      
      if (fantasyPoints) {
        const topScorers = fantasyPoints.points
          .sort((a, b) => b.points - a.points)
          .slice(0, 5);
        
        let pointsContent = `📊 **Fantasy Points Analysis for ${match.name}:**\n\n`;
        pointsContent += "🏆 **Top Performers:**\n";
        
        topScorers.forEach((player, index) => {
          pointsContent += `${index + 1}. **${player.name}** - ${player.points} points\n`;
          if (player.breakdown.runs) pointsContent += `   Runs: ${player.breakdown.runs}\n`;
          if (player.breakdown.wickets) pointsContent += `   Wickets: ${player.breakdown.wickets}\n`;
          pointsContent += "\n";
        });
        
        setMessages(prev => [...prev, {
          id: `fantasy-points-${Date.now()}`,
          type: "bot",
          content: pointsContent,
          timestamp: new Date(),
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: `bot-${Date.now()}`,
          type: "bot",
          content: "Fantasy points data not available for this match. Try asking about live scores or player suggestions.",
          timestamp: new Date(),
        }]);
      }
      
      return;
    } catch (error) {
      console.error("Error fetching fantasy points:", error);
    }
  }

  // Squad analysis
  if (queryLower.includes("squad") || queryLower.includes("playing11")) {
    if (matches.length === 0) {
      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        type: "bot",
        content: "No matches available for squad analysis. Please refresh to get latest data.",
        timestamp: new Date(),
      }]);
      return;
    }

    try {
      const match = matches[0];
      const fantasySquad = await fetchFantasySquad(match.id);
      
      if (fantasySquad) {
        let squadContent = `👥 **Fantasy Squad for ${match.name}:**\n\n`;
        
        fantasySquad.squads.forEach(squad => {
          squadContent += `🏏 **${squad.team}:**\n`;
          const batsmen = squad.players.filter(p => p.role.toLowerCase().includes('bat'));
          const bowlers = squad.players.filter(p => p.role.toLowerCase().includes('bowl'));
          const allrounders = squad.players.filter(p => p.role.toLowerCase().includes('all'));
          const keepers = squad.players.filter(p => p.role.toLowerCase().includes('keep'));
          
          if (batsmen.length > 0) {
            squadContent += "**Batsmen:** " + batsmen.map(p => `${p.name} (${p.credits})`).join(", ") + "\n";
          }
          if (bowlers.length > 0) {
            squadContent += "**Bowlers:** " + bowlers.map(p => `${p.name} (${p.credits})`).join(", ") + "\n";
          }
          if (allrounders.length > 0) {
            squadContent += "**All-rounders:** " + allrounders.map(p => `${p.name} (${p.credits})`).join(", ") + "\n";
          }
          if (keepers.length > 0) {
            squadContent += "**Wicket-keepers:** " + keepers.map(p => `${p.name} (${p.credits})`).join(", ") + "\n";
          }
          squadContent += "\n";
        });
        
        setMessages(prev => [...prev, {
          id: `squad-analysis-${Date.now()}`,
          type: "bot",
          content: squadContent,
          timestamp: new Date(),
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: `bot-${Date.now()}`,
          type: "bot",
          content: "Squad data not available for this match. Try asking about live scores or general player suggestions.",
          timestamp: new Date(),
        }]);
      }
      
      return;
    } catch (error) {
      console.error("Error fetching squad data:", error);
    }
  }
  
  // Live scores with AI insights
  if (queryLower.includes("score") || queryLower.includes("match") || queryLower.includes("live")) {
    if (matches.length === 0) {
      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        type: "bot",
        content: "No matches are currently available. Type 'refresh' to check again.",
        timestamp: new Date(),
      }]);
      return;
    }

    // Get AI insights for live matches with enhanced data
    try {
      const enhancedMatches = await getEnhancedMatchData(matches.slice(0, 2));
      const aiResponse = await generateIntelligentResponse(
        `Analyze these live cricket matches for fantasy insights with squad and points data`,
        enhancedMatches
      );
      
      setMessages(prev => [...prev, {
        id: `ai-insight-${Date.now()}`,
        type: "bot",
        content: aiResponse.message,
        timestamp: new Date(),
      }]);
    } catch (error) {
      console.error("Error getting AI insights:", error);
    }
    
    // Show match data
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

    if (matches.length > 3) {
      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        type: "bot",
        content: `Showing 3 of ${matches.length} matches. Check the Matches tab to see all.`,
        timestamp: new Date(),
      }]);
    }
    
    return;
  }
  
  // Player analysis with AI
  if (queryLower.includes("player") || queryLower.includes("form") || queryLower.includes("stats")) {
    try {
      const aiResponse = await generateIntelligentResponse(query, matches);
      setMessages(prev => [...prev, {
        id: `player-analysis-${Date.now()}`,
        type: "bot",
        content: aiResponse.message,
        timestamp: new Date(),
      }]);
      return;
    } catch (error) {
      console.error("Error in player analysis:", error);
    }
  }
  
  // Help command with enhanced features
  if (queryLower.includes("help")) {
    setMessages(prev => [...prev, {
      id: `bot-${Date.now()}`,
      type: "bot",
      content: `🏏 **Cricket Fantasy AI Assistant - Enhanced Edition**

I can help you with:

**📊 Live Match Analysis**
• "Show live scores"
• "What's happening in the match?"
• "Match updates with fantasy impact"

**👑 Smart Captain & Team Suggestions**
• "Who should I pick as captain?" (Uses real points data)
• "Suggest best vice-captain"
• "Build me a winning team"
• "Value picks under 8 credits"

**📈 Real Fantasy Data**
• "Show fantasy points for [match]"
• "Squad analysis for today's match"
• "Top performers this match"
• "Best differential picks"

**🎯 Advanced Strategy**
• "Pitch conditions impact"
• "Weather effect on fantasy"
• "Safe vs risky picks"
• "Points per credit analysis"

**💰 Credit Management**
• "Budget-friendly team"
• "Premium player analysis"
• "Value vs expensive picks"

Just ask naturally - I now use real fantasy squad data, points, and player information! 🤖`,
      timestamp: new Date(),
    }]);
    return;
  }
  
  // General AI response for any other query
  try {
    const aiResponse = await generateIntelligentResponse(query, matches);
    setMessages(prev => [...prev, {
      id: `ai-general-${Date.now()}`,
      type: "bot",
      content: aiResponse.message,
      timestamp: new Date(),
    }]);
  } catch (error) {
    console.error("Error in general AI response:", error);
    setMessages(prev => [...prev, {
      id: `bot-${Date.now()}`,
      type: "bot",
      content: "I'm here to help with cricket fantasy questions! Try asking about live scores, player suggestions, or team building tips.",
      timestamp: new Date(),
    }]);
  }
};

// Fallback basic response function
const generateBasicResponse = (query: string, matches: CricketMatch[]): string => {
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes("captain") || queryLower.includes("team")) {
    return "🏏 For the best captain picks, I recommend looking at top-order batsmen in good form. Consider players who are consistent run-scorers and can provide stability to your fantasy team.";
  }
  
  if (queryLower.includes("score") || queryLower.includes("live")) {
    if (matches.length > 0) {
      return `📺 I found ${matches.length} cricket matches. ${matches[0].name} is ${matches[0].status}. Check the Matches tab for detailed scores.`;
    }
    return "⚠️ No live matches found at the moment. Please check back later.";
  }
  
  return "🤖 I'm your cricket fantasy AI assistant! Ask me about live scores, player suggestions, or team building strategies.";
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
