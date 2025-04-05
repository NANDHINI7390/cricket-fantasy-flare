
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, ChevronDown, Share2, RefreshCw, AlertTriangle } from "lucide-react";
import { fetchLiveMatches, fetchLiveScores, CricketMatch } from "@/utils/cricket-api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "./types";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import LiveMatches from "./LiveMatches";
import { formatMatchData, mergeMatchData, processUserQuery } from "./chatHelpers";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("chat");
  const [aiPowered, setAiPowered] = useState<boolean>(true);
  const [aiError, setAiError] = useState<string | null>(null);
  const [dataLoadingStatus, setDataLoadingStatus] = useState<string>("idle");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        type: "bot",
        content: "👋 Welcome to Cricket Fantasy Assistant! I can help you with live scores, player stats, team suggestions, and AI-powered recommendations. Try asking:",
        timestamp: new Date(),
      },
      {
        id: "suggestions",
        type: "bot",
        content: "• Show live scores\n• Best captain picks for today\n• Suggest players for my fantasy team\n• Match predictions based on stats",
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
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Fetch cricket match data
  const fetchCricketData = async () => {
    setIsLoading(true);
    setDataLoadingStatus("loading");
    try {
      const [liveMatches, liveScores] = await Promise.all([
        fetchLiveMatches(),
        fetchLiveScores()
      ]);
      
      console.log("Fetched matches data:", liveMatches.length);
      console.log("Fetched scores data:", liveScores.length);
      
      // Combine data from both APIs to get the most complete information
      const combinedMatches = mergeMatchData(liveMatches, liveScores);
      setMatches(combinedMatches);
      setDataLoadingStatus(combinedMatches.length > 0 ? "success" : "empty");
      
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
      setDataLoadingStatus("error");
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
  const handleSendMessage = async (inputValue: string) => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    const userQuery = inputValue.toLowerCase();
    
    // Start loading state
    setIsLoading(true);
    setAiError(null);
    
    try {
      if (userQuery.includes("refresh") || userQuery.includes("update")) {
        // Refresh data
        await fetchCricketData();
        setMessages(prev => [...prev, {
          id: `bot-${Date.now()}`,
          type: "bot",
          content: "Refreshing cricket data...",
          timestamp: new Date(),
        }]);
      } else if (aiPowered) {
        // Use AI-powered response via edge function
        await fetchAIResponse(inputValue);
      } else {
        // Fallback to basic response processing
        processUserQuery(userQuery, matches, setMessages);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        type: "bot",
        content: "Sorry, I encountered an error processing your request. Please try again later.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
      // Ensure we scroll to bottom after new messages
      setTimeout(scrollToBottom, 100);
    }
  };

  // Fetch AI-powered response from edge function
  const fetchAIResponse = async (query: string) => {
    try {
      // Show thinking message
      setMessages(prev => [...prev, {
        id: `thinking-${Date.now()}`,
        type: "bot",
        content: "Thinking...",
        timestamp: new Date(),
        isTemporary: true // Mark as temporary so we can replace it
      }]);

      const response = await fetch(
        "https://yefrdovbporfjdhfojyx.supabase.co/functions/v1/cricket-assistant",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
        }
      );

      // Remove thinking message
      setMessages(prev => prev.filter(m => !m.isTemporary));

      const data = await response.json();
      console.log("AI response:", data);
      
      // Check if there's an error message in the response
      if (!response.ok || data.error) {
        const errorMessage = data.error || `Edge function returned ${response.status}`;
        console.error("Edge function error:", errorMessage);
        
        setAiError(errorMessage);
        
        // Add an error message to the chat
        setMessages(prev => [...prev, {
          id: `ai-error-${Date.now()}`,
          type: "bot",
          content: `AI-powered analysis encountered an issue: ${data.message || errorMessage}. Switching to basic mode.`,
          timestamp: new Date(),
        }]);
        
        // Fall back to basic processing
        processUserQuery(query.toLowerCase(), matches, setMessages);
        return;
      }
      
      // Add the AI response to messages
      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        type: "bot",
        content: data.message || "I'm sorry, I couldn't process that request at the moment.",
        timestamp: new Date(),
      }]);
      
      // If the response includes match data, update our matches
      if (data.cricketData && data.cricketData.length > 0) {
        console.log("Updating matches with data from AI response");
        setMatches(data.cricketData);
      }
      
      // If query was about scores, show match cards
      if (query.toLowerCase().includes("score") || query.toLowerCase().includes("match")) {
        const matchesToShow = data.cricketData?.length > 0 
          ? data.cricketData.slice(0, 3) 
          : matches.slice(0, 3);
        
        if (matchesToShow.length > 0) {
          matchesToShow.forEach(match => {
            setMessages(prev => [...prev, {
              id: `match-${match.id}-${Date.now()}`,
              type: "match-update",
              content: match.name,
              timestamp: new Date(),
              matchData: match,
            }]);
          });
        } else if (data.hasData === false) {
          // If AI knows there's no data
          setMessages(prev => [...prev, {
            id: `no-matches-${Date.now()}`,
            type: "bot",
            content: "I don't have any current match data available. Check back later or try refreshing.",
            timestamp: new Date(),
          }]);
        }
      }
      
      // If query was about players, show player suggestions
      if (query.toLowerCase().includes("captain") || 
          query.toLowerCase().includes("player") || 
          query.toLowerCase().includes("team")) {
        // Handle player suggestions if included in the response
        if (data.playerStats && data.playerStats.length > 0) {
          const captain = data.playerStats[0];
          const viceCaptain = data.playerStats[1];
          const allrounders = data.playerStats.filter(p => p.typeofplayer?.toLowerCase().includes("all"));
          
          setMessages(prev => [...prev, {
            id: `player-suggestion-${Date.now()}`,
            type: "player-suggestion",
            content: "Based on current form and matchups, here are my recommendations:",
            timestamp: new Date(),
            playerSuggestions: {
              captain,
              viceCaptain,
              allrounders
            }
          }]);
        }
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setAiError(error.message);
      
      // Remove thinking message
      setMessages(prev => prev.filter(m => !m.isTemporary));
      
      // Fallback to basic processing
      processUserQuery(query.toLowerCase(), matches, setMessages);
      
      // Notify user of AI issue
      setMessages(prev => [...prev, {
        id: `ai-error-${Date.now()}`,
        type: "bot",
        content: `AI-powered analysis is currently unavailable (${error.message}). I've provided basic information instead.`,
        timestamp: new Date(),
      }]);
    }
  };

  // Share link to invite friends
  const handleShareInvite = () => {
    const shareUrl = window.location.origin;
    
    if (navigator.share) {
      navigator.share({
        title: 'Fantasy Cricket Elite',
        text: 'Join me on Fantasy Cricket Elite for the ultimate cricket fantasy experience!',
        url: shareUrl,
      }).then(() => {
        toast.success("Share successful!");
      }).catch((error) => {
        console.error('Error sharing:', error);
        copyToClipboard(shareUrl);
      });
    } else {
      copyToClipboard(shareUrl);
    }
  };
  
  // Copy to clipboard helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Invite link copied to clipboard!");
    }).catch(err => {
      toast.error("Failed to copy invite link");
      console.error('Could not copy text: ', err);
    });
  };

  // Render error notice
  const renderErrorNotice = () => {
    if (!aiError) return null;
    
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 mb-2">
        <div className="flex items-start">
          <AlertTriangle className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
          <div className="text-xs text-yellow-800">
            <p className="font-medium">AI Service Issue</p>
            <p>Limited functionality available. Using basic mode.</p>
          </div>
        </div>
      </div>
    );
  };

  // Render data status
  const renderDataStatus = () => {
    if (dataLoadingStatus === "idle" || dataLoadingStatus === "success") return null;
    
    let statusMessage = "";
    let statusColor = "";
    
    switch (dataLoadingStatus) {
      case "loading":
        statusMessage = "Loading cricket data...";
        statusColor = "text-blue-600";
        break;
      case "empty":
        statusMessage = "No cricket matches found";
        statusColor = "text-orange-600";
        break;
      case "error":
        statusMessage = "Failed to load cricket data";
        statusColor = "text-red-600";
        break;
    }
    
    return (
      <div className={`text-xs ${statusColor} mb-1 flex items-center`}>
        {dataLoadingStatus === "loading" ? (
          <div className="animate-spin h-3 w-3 mr-1 border border-current rounded-full border-t-transparent"></div>
        ) : null}
        {statusMessage}
      </div>
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Chat toggle button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`rounded-full p-3 shadow-lg focus:outline-none ${
          isOpen ? "bg-red-500 text-white" : "bg-gradient-to-r from-purple-600 to-blue-500 text-white"
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle chat assistant"
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
            <div className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Cricket Fantasy AI</h3>
                {aiPowered && !aiError && (
                  <span className="bg-green-500 text-xs px-1.5 py-0.5 rounded-full text-white font-semibold">
                    AI
                  </span>
                )}
                {aiPowered && aiError && (
                  <span className="bg-yellow-500 text-xs px-1.5 py-0.5 rounded-full text-white font-semibold" title={aiError}>
                    AI Issue
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <button className="text-white hover:text-gray-200">
                      <Share2 size={18} />
                    </button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Invite Friends</SheetTitle>
                      <SheetDescription>
                        Share Fantasy Cricket Elite with your friends and compete together!
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-6">
                      <Button 
                        onClick={handleShareInvite}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
                      >
                        <Share2 size={16} />
                        Share Invite Link
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="text-white hover:text-gray-200"
                  aria-label="Minimize chat"
                >
                  <ChevronDown size={20} />
                </button>
              </div>
            </div>
            
            {/* Tabs */}
            <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="matches">Live Matches</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat" className="flex-grow flex flex-col overflow-hidden m-0 p-0">
                {/* Error notice */}
                {renderErrorNotice()}
                
                {/* Data status */}
                <div className="px-4 pt-1">
                  {renderDataStatus()}
                </div>
                
                {/* Chat messages */}
                <ScrollArea className="flex-grow px-4 py-2" ref={chatContainerRef}>
                  <div className="space-y-2 pb-4">
                    {messages.map(message => (
                      <div key={message.id}>
                        <ChatMessage 
                          message={message} 
                          formatMatchData={formatMatchData} 
                        />
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
                </ScrollArea>
                
                {/* Chat input */}
                <div className="border-t border-gray-200 mt-auto">
                  <div className="p-2 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={fetchCricketData}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded"
                        title="Refresh cricket data"
                      >
                        <RefreshCw size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setAiPowered(!aiPowered);
                          setAiError(null);
                          toast.success(aiPowered ? "Switched to basic mode" : "Switched to AI mode");
                        }}
                        className={`text-xs px-2 py-1 rounded-full ${
                          aiPowered 
                            ? "bg-green-100 text-green-800 hover:bg-green-200" 
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                      >
                        {aiPowered ? "AI: On" : "AI: Off"}
                      </button>
                    </div>
                    {aiError && (
                      <button 
                        className="text-xs text-orange-500 hover:text-orange-700" 
                        title={aiError}
                        onClick={() => toast.error(`AI Error: ${aiError}`)}
                      >
                        AI issues detected
                      </button>
                    )}
                  </div>
                  <ChatInput 
                    onSendMessage={handleSendMessage} 
                    isLoading={isLoading} 
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="matches" className="flex-grow overflow-hidden m-0 p-0">
                <ScrollArea className="h-[370px]">
                  <LiveMatches 
                    matches={matches} 
                    formatMatchData={formatMatchData}
                    onRefresh={fetchCricketData}
                  />
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
