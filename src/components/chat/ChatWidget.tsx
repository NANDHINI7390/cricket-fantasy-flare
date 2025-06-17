import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, ChevronDown, Share2, RefreshCw, AlertTriangle, Brain } from "lucide-react";
import { fetchLiveMatches, fetchLiveScores, CricketMatch } from "@/utils/cricket-api";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "./types";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import LiveMatches from "./LiveMatches";
import { formatMatchData, mergeMatchData, parseAIResponse } from "./chatHelpers";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("chat");
  const [dataLoadingStatus, setDataLoadingStatus] = useState<string>("idle");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        type: "bot",
        content: "🏏 Welcome to Cricket Fantasy Assistant! I'm powered by AI and have access to live cricket data. I can help you with:\n\n• Live match analysis and scores\n• AI-powered fantasy team suggestions\n• Detailed player performance insights\n• Captain/vice-captain recommendations with reasoning\n• Match predictions and strategies\n\nTry asking: 'Suggest a fantasy team for today's matches' or 'Who should I pick as captain?'",
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
            content: `🤖 AI Assistant loaded with ${combinedMatches.length} live cricket matches! I'm ready to provide intelligent fantasy insights and analysis.`,
            timestamp: new Date(),
          }
        ]);
        toast.success(`AI Assistant ready with ${combinedMatches.length} matches`);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: `no-matches-${Date.now()}`,
            type: "bot",
            content: "⚠️ No live matches found right now, but I can still provide expert fantasy cricket advice and strategies!",
            timestamp: new Date(),
          }
        ]);
        toast.info("No matches available. AI assistant ready for general advice!");
      }
    } catch (error) {
      console.error("Error fetching cricket data:", error);
      setDataLoadingStatus("error");
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          type: "bot",
          content: "❌ Couldn't fetch live cricket data. I'm still here to help with general fantasy cricket strategies!",
          timestamp: new Date(),
        }
      ]);
      toast.error("Failed to fetch match data. AI assistant still available!");
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced AI-powered message handling
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
    
    try {
      if (userQuery.includes("refresh") || userQuery.includes("update")) {
        // Refresh data
        await fetchCricketData();
      } else {
        // Use AI assistant for intelligent responses
        console.log("Calling cricket assistant with query:", inputValue);
        
        // Determine request type for better AI responses
        let requestType = 'general';
        if (userQuery.includes('fantasy') || userQuery.includes('team') || 
            userQuery.includes('captain') || userQuery.includes('pick') || 
            userQuery.includes('suggest')) {
          requestType = 'fantasy_analysis';
        }
        
        const { data, error } = await supabase.functions.invoke('cricket-assistant', {
          body: {
            query: inputValue,
            matchData: matches.slice(0, 5), // Send current match data
            requestType: requestType
          }
        });

        if (error) {
          console.error("Cricket assistant error:", error);
          // Fallback to basic response
          setMessages(prev => [...prev, {
            id: `fallback-${Date.now()}`,
            type: "bot",
            content: "🤖 I'm having trouble accessing my AI brain right now. Let me give you a quick response based on available data...\n\nFor fantasy teams, focus on in-form players, check recent performances, and balance your team with reliable batsmen, wicket-takers, and all-rounders. Would you like me to refresh the data and try again?",
            timestamp: new Date(),
          }]);
        } else {
          console.log("AI Response received:", data);
          
          // Parse AI response for structured display
          const parsedResponse = parseAIResponse(data.message || data.response || "I'm here to help with cricket insights!");
          
          // Add AI response message
          const aiMessage: Message = {
            id: `ai-${Date.now()}`,
            type: data.playerStats ? "ai-analysis" : "bot",
            content: parsedResponse.content,
            timestamp: new Date(),
            liveAnalysis: parsedResponse.liveAnalysis,
            playerStats: data.playerStats
          };
          
          setMessages(prev => [...prev, aiMessage]);
          
          // Show success toast for fantasy analysis
          if (requestType === 'fantasy_analysis' && data.playerStats) {
            toast.success("AI Fantasy Analysis Complete!");
          }
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        type: "bot",
        content: "🤖 Oops! My AI circuits got a bit tangled. Let me try a simpler approach...\n\nI can help you with fantasy cricket strategies, player analysis, and match insights. Try asking something like 'Who should I pick as captain today?' or refresh the data to try again.",
        timestamp: new Date(),
      }]);
      toast.error("AI assistant temporarily unavailable");
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  const handleShareInvite = () => {
    const shareUrl = window.location.origin;
    
    if (navigator.share) {
      navigator.share({
        title: 'Fantasy Cricket Elite',
        text: 'Join me on Fantasy Cricket Elite for cricket fantasy experience!',
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
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Invite link copied to clipboard!");
    }).catch(err => {
      toast.error("Failed to copy invite link");
      console.error('Could not copy text: ', err);
    });
  };

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
        aria-label="Toggle AI cricket assistant"
      >
        {isOpen ? <X size={24} /> : (
          <div className="relative">
            <MessageSquare size={24} />
            <Brain className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300" />
          </div>
        )}
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
                <h3 className="font-medium">AI Cricket Assistant</h3>
                <span className="bg-green-500 text-xs px-1.5 py-0.5 rounded-full text-white font-semibold flex items-center gap-1">
                  <Brain size={10} />
                  AI Powered
                </span>
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
                        Share Fantasy Cricket Elite with friends!
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
                <TabsTrigger value="chat">AI Chat</TabsTrigger>
                <TabsTrigger value="matches">Live Matches</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat" className="flex-grow flex flex-col overflow-hidden m-0 p-0">
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
                          <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce"></div>
                          <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                {/* Chat input */}
                <div className="border-t border-gray-200 mt-auto">
                  <div className="p-2 flex justify-between items-center">
                    <button 
                      onClick={fetchCricketData}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded"
                      title="Refresh cricket data"
                      disabled={isLoading}
                    >
                      <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Brain size={12} />
                      AI Powered
                    </span>
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
