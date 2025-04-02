
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, ChevronDown } from "lucide-react";
import { fetchLiveMatches, CricketMatch } from "@/utils/cricket-api";

type Message = {
  id: string;
  type: "user" | "bot" | "match-update";
  content: string;
  timestamp: Date;
  matchData?: CricketMatch;
};

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        type: "bot",
        content: "👋 Welcome! Ask me about cricket matches or type 'scores' to see live matches.",
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
      const liveMatches = await fetchLiveMatches();
      setMatches(liveMatches);
      
      // Add a match update message if there are matches
      if (liveMatches.length > 0) {
        setMessages(prev => [
          ...prev,
          {
            id: `match-update-${Date.now()}`,
            type: "bot",
            content: `I found ${liveMatches.length} cricket matches. Type 'scores' to see them.`,
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
    if (query.includes("score") || query.includes("match")) {
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
    } else if (query.includes("help")) {
      // Show help
      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        type: "bot",
        content: `You can ask me things like:
- "Show live scores"
- "Refresh cricket data"
- "Match updates"`,
        timestamp: new Date(),
      }]);
    } else {
      // Generic response
      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        type: "bot",
        content: "You can type 'scores' to see live matches, 'refresh' to update data, or 'help' for more options.",
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
        content: `Showing 3 of ${matches.length} matches. Type 'more' to see others.`,
        timestamp: new Date(),
      }]);
    }
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
    
    return `${team1}: ${team1ScoreText}\n${team2}: ${team2ScoreText}\nStatus: ${match.status}`;
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
        return (
          <div className="flex justify-start mb-3">
            <div className="bg-purple-100 border border-purple-200 rounded-2xl px-4 py-3 max-w-[90%] w-full">
              <h4 className="font-semibold text-purple-800 mb-1">{message.content}</h4>
              <pre className="whitespace-pre-wrap text-sm font-mono bg-white p-2 rounded">
                {message.matchData ? formatMatchData(message.matchData) : "Match data unavailable"}
              </pre>
            </div>
          </div>
        );
      default:
        return null;
    }
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
            className="bg-white rounded-lg shadow-xl w-80 sm:w-96 h-[450px] mb-2 flex flex-col overflow-hidden"
          >
            {/* Chat header */}
            <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
              <h3 className="font-medium">Cricket Assistant</h3>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-white hover:text-gray-200"
              >
                <ChevronDown size={20} />
              </button>
            </div>
            
            {/* Chat messages */}
            <div className="flex-grow p-4 overflow-y-auto">
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
            </div>
            
            {/* Chat input */}
            <div className="border-t p-3">
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about cricket matches..."
                  className="bg-transparent flex-grow focus:outline-none"
                />
                <button 
                  onClick={handleSendMessage}
                  className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatWidget;
