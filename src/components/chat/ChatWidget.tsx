
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, ChevronDown, Trophy, Star, TrendingUp, CricketBall } from "lucide-react";
import { fetchLiveMatches, fetchLiveScores, CricketMatch, getTeamLogoUrl, formatMatchStatus } from "@/utils/cricket-api";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Player } from "@/types/player";

type Message = {
  id: string;
  type: "user" | "bot" | "match-update" | "player-suggestion";
  content: string;
  timestamp: Date;
  matchData?: CricketMatch;
  playerSuggestions?: {
    captain?: Player;
    viceCaptain?: Player;
    allrounders?: Player[];
  };
};

// Mock data for player suggestions - in a real app, this would come from your API
const mockPlayers: Player[] = [
  {
    id: "p1",
    name: "Virat Kohli",
    team: "Royal Challengers Bengaluru",
    role: "batsman",
    credits: 10.5,
    image_url: "https://resources.pulse.icc-cricket.com/players/284/164.png",
    stats: { avg: 48.9, sr: 138.2, recent_form: [75, 82, 43, 61, 23] },
    created_at: "2023-01-01",
    updated_at: "2023-01-01"
  },
  {
    id: "p2",
    name: "Jasprit Bumrah",
    team: "Mumbai Indians",
    role: "bowler",
    credits: 9.5,
    image_url: "https://resources.pulse.icc-cricket.com/players/284/1124.png",
    stats: { wickets: 145, economy: 7.4, recent_form: [3, 2, 4, 1, 3] },
    created_at: "2023-01-01",
    updated_at: "2023-01-01"
  },
  {
    id: "p3",
    name: "Ravindra Jadeja",
    team: "Chennai Super Kings",
    role: "allrounder",
    credits: 9.0,
    image_url: "https://resources.pulse.icc-cricket.com/players/284/9.png",
    stats: { bat_avg: 32.6, bowl_avg: 24.8, recent_form: [45, 2, 38, 3, 29] },
    created_at: "2023-01-01",
    updated_at: "2023-01-01"
  },
  {
    id: "p4",
    name: "KL Rahul",
    team: "Lucknow Super Giants",
    role: "batsman",
    credits: 9.5,
    image_url: "https://resources.pulse.icc-cricket.com/players/284/1125.png",
    stats: { avg: 47.2, sr: 134.5, recent_form: [68, 43, 91, 12, 55] },
    created_at: "2023-01-01",
    updated_at: "2023-01-01"
  },
  {
    id: "p5",
    name: "Rashid Khan",
    team: "Gujarat Titans",
    role: "bowler",
    credits: 9.0,
    image_url: "https://resources.pulse.icc-cricket.com/players/284/2778.png",
    stats: { wickets: 138, economy: 6.8, recent_form: [3, 2, 1, 4, 2] },
    created_at: "2023-01-01",
    updated_at: "2023-01-01"
  }
];

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        type: "bot",
        content: "👋 Welcome to Cricket Fantasy Assistant! I can help you with live scores, player stats, and team suggestions. Try asking:",
        timestamp: new Date(),
      },
      {
        id: "suggestions",
        type: "bot",
        content: "• Show live scores\n• Who should I pick as captain?\n• Best fantasy players today",
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Fetch matches when first opened
  useEffect(() => {
    if (isOpen && matches.length === 0) {
      fetchCricketData();
    }
  }, [isOpen]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Fetch cricket match data
  const fetchCricketData = async () => {
    setIsLoading(true);
    try {
      const [liveMatches, liveScores] = await Promise.all([
        fetchLiveMatches(),
        fetchLiveScores()
      ]);
      
      // Combine data from both APIs to get the most complete information
      const combinedMatches = mergeMatchData(liveMatches, liveScores);
      setMatches(combinedMatches);
      
      // Add a match update message if there are matches
      if (combinedMatches.length > 0) {
        setMessages(prev => [
          ...prev,
          {
            id: `match-update-${Date.now()}`,
            type: "bot",
            content: `I found ${combinedMatches.length} cricket matches. Type 'scores' to see them or tap the Matches tab.`,
            timestamp: new Date(),
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: `no-matches-${Date.now()}`,
            type: "bot",
            content: "There are no live matches right now. Check back later or ask about player suggestions!",
            timestamp: new Date(),
          }
        ]);
      }
    } catch (error) {
      console.error("Error fetching cricket data:", error);
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          type: "bot",
          content: "Sorry, I couldn't fetch the latest cricket data. Please try again later.",
          timestamp: new Date(),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Merge data from multiple cricket APIs
  const mergeMatchData = (matches1: CricketMatch[], matches2: CricketMatch[]): CricketMatch[] => {
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

  // Handle user message submission
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    const userQuery = inputValue.toLowerCase();
    setInputValue("");
    
    // Process the query
    setTimeout(() => {
      processUserQuery(userQuery);
    }, 500);
  };

  // Process user query and generate response
  const processUserQuery = (query: string) => {
    setIsLoading(true);
    
    // Handle different query types
    if (query.includes("score") || query.includes("match") || query.includes("live")) {
      // Show all matches
      showMatchUpdates();
    } else if (query.includes("refresh") || query.includes("update")) {
      // Refresh data
      fetchCricketData();
      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        type: "bot",
        content: "Refreshing cricket data...",
        timestamp: new Date(),
      }]);
    } else if (query.includes("captain") || query.includes("team") || query.includes("pick") || query.includes("suggest")) {
      // Suggest players for fantasy team
      suggestPlayers(query);
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
    
    setIsLoading(false);
  };

  // Show match updates in chat
  const showMatchUpdates = () => {
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
  };

  // Suggest players for fantasy team
  const suggestPlayers = (query: string) => {
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
    
    setMessages(prev => [...prev, {
      id: `player-suggestion-${Date.now()}`,
      type: "player-suggestion",
      content,
      timestamp: new Date(),
      playerSuggestions: {
        captain,
        viceCaptain,
        allrounders
      }
    }]);
  };

  // Format match data for display
  const formatMatchData = (match: CricketMatch) => {
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

  // Render a message bubble
  const renderMessage = (message: Message) => {
    switch (message.type) {
      case "user":
        return (
          <div className="flex justify-end mb-3">
            <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-2 max-w-[80%]">
              {message.content}
            </div>
          </div>
        );
      case "bot":
        return (
          <div className="flex justify-start mb-3">
            <div className="bg-gray-200 rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
              {message.content}
            </div>
          </div>
        );
      case "match-update":
        if (!message.matchData) return null;
        
        const matchDetails = formatMatchData(message.matchData);
        
        return (
          <div className="flex justify-start mb-3">
            <Card className="w-full max-w-[90%] border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <h4 className="font-semibold text-blue-800 mb-2 text-sm">
                  {message.content}
                </h4>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <img 
                        src={matchDetails.team1Logo || "https://via.placeholder.com/32"} 
                        alt={matchDetails.team1}
                        className="w-8 h-8 mr-2 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/32";
                        }}
                      />
                      <span className="font-medium">{matchDetails.team1}</span>
                    </div>
                    <span className="text-sm font-mono">{matchDetails.team1Score}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img 
                        src={matchDetails.team2Logo || "https://via.placeholder.com/32"} 
                        alt={matchDetails.team2}
                        className="w-8 h-8 mr-2 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/32";
                        }}
                      />
                      <span className="font-medium">{matchDetails.team2}</span>
                    </div>
                    <span className="text-sm font-mono">{matchDetails.team2Score}</span>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-center py-1 px-2 bg-blue-100 text-blue-800 rounded-full">
                  {matchDetails.status}
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      case "player-suggestion":
        if (!message.playerSuggestions) return null;
        
        const { captain, viceCaptain, allrounders } = message.playerSuggestions;
        
        return (
          <div className="flex justify-start mb-3">
            <Card className="w-full max-w-[90%] border-l-4 border-l-purple-500 shadow-md">
              <CardContent className="p-4">
                <h4 className="font-semibold text-purple-800 mb-2 text-sm">
                  {message.content}
                </h4>
                
                {captain && (
                  <div className="bg-amber-50 rounded-lg p-3 mb-2">
                    <div className="flex items-center">
                      <div className="bg-amber-500 text-white p-2 rounded-full mr-3">
                        <Trophy size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h5 className="font-bold">{captain.name}</h5>
                          <span className="ml-2 text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                            Captain
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {captain.team} • {captain.role} • {captain.credits} credits
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {viceCaptain && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-2">
                    <div className="flex items-center">
                      <div className="bg-blue-500 text-white p-2 rounded-full mr-3">
                        <Star size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h5 className="font-bold">{viceCaptain.name}</h5>
                          <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                            Vice Captain
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {viceCaptain.team} • {viceCaptain.role} • {viceCaptain.credits} credits
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {allrounders && allrounders.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <div className="bg-green-500 text-white p-2 rounded-full mr-3">
                        <TrendingUp size={16} />
                      </div>
                      <div className="font-medium text-green-800">All-Rounders</div>
                    </div>
                    
                    {allrounders.map(player => (
                      <div key={player.id} className="flex items-center mb-2 last:mb-0 pl-2 border-l-2 border-green-200">
                        <div className="flex-1">
                          <div className="font-medium">{player.name}</div>
                          <div className="text-xs text-gray-600">
                            {player.team} • {player.credits} credits
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Render matches tab
  const renderMatchesTab = () => {
    if (matches.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <CricketBall size={48} className="mb-4 opacity-30" />
          <p>No matches currently available</p>
          <Button 
            variant="outline" 
            size="sm"
            className="mt-4"
            onClick={fetchCricketData}
          >
            Refresh
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4 p-2">
        {matches.map(match => {
          const matchDetails = formatMatchData(match);
          return (
            <Card key={match.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="text-xs text-gray-500 mb-2">{match.matchType?.toUpperCase() || "T20"}</div>
                
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-sm">{match.name}</h4>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <img 
                      src={matchDetails.team1Logo || "https://via.placeholder.com/32"} 
                      alt={matchDetails.team1}
                      className="w-8 h-8 mr-2 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/32";
                      }}
                    />
                    <span className="font-medium">{matchDetails.team1}</span>
                  </div>
                  <span className="text-sm font-mono">{matchDetails.team1Score}</span>
                </div>
                
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <img 
                      src={matchDetails.team2Logo || "https://via.placeholder.com/32"} 
                      alt={matchDetails.team2}
                      className="w-8 h-8 mr-2 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/32";
                      }}
                    />
                    <span className="font-medium">{matchDetails.team2}</span>
                  </div>
                  <span className="text-sm font-mono">{matchDetails.team2Score}</span>
                </div>
                
                <div className="text-xs text-center py-1 px-2 bg-blue-100 text-blue-800 rounded-full w-fit mx-auto">
                  {matchDetails.status}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Chat toggle button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`rounded-full p-3 shadow-lg focus:outline-none ${
          isOpen ? "bg-red-500 text-white" : "bg-blue-600 text-white"
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>
      
      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg shadow-xl w-80 sm:w-96 h-[500px] mb-2 flex flex-col overflow-hidden"
          >
            {/* Chat header */}
            <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
              <h3 className="font-medium">Cricket Fantasy Assistant</h3>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-white hover:text-gray-200"
              >
                <ChevronDown size={20} />
              </button>
            </div>
            
            {/* Tabs */}
            <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="matches">Live Matches</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat" className="flex-grow flex flex-col">
                {/* Chat messages */}
                <ScrollArea className="flex-grow p-4">
                  {messages.map(message => (
                    <div key={message.id}>
                      {renderMessage(message)}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-center py-2">
                      <div className="animate-pulse flex space-x-1">
                        <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </ScrollArea>
                
                {/* Chat input */}
                <div className="border-t p-3">
                  <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask about matches or players..."
                      className="bg-transparent flex-grow focus:outline-none"
                    />
                    <button 
                      onClick={handleSendMessage}
                      className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                      disabled={isLoading}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="matches" className="flex-grow">
                <ScrollArea className="h-[412px]">
                  {renderMatchesTab()}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatWidget;
