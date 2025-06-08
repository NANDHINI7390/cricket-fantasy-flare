
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, ChevronDown, Share2, RefreshCw, AlertTriangle, Brain } from "lucide-react";
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
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        type: "bot",
        content: "🏏 Welcome to Cricket Fantasy AI Assistant! I can help you with:\n\n• Live match scores and analysis\n• Fantasy team suggestions with AI\n• Player information and statistics\n• Captain/vice-captain recommendations\n\nTry asking: 'Suggest a fantasy team for today's match' or 'Tell me about Rohit Sharma' or 'Show live scores'",
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
      
      const combinedMatches = mergeMatchData(liveMatches, liveScores);
      setMatches(combinedMatches);
      setDataLoadingStatus(combinedMatches.length > 0 ? "success" : "empty");
      
      if (combinedMatches.length > 0) {
        setMessages(prev => [
          ...prev,
          {
            id: `match-update-${Date.now()}`,
            type: "bot",
            content: `📊 Found ${combinedMatches.length} cricket matches! Ask me about players, fantasy suggestions, or live scores.`,
            timestamp: new Date(),
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: `no-matches-${Date.now()}`,
            type: "bot",
            content: "⚠️ No live matches found right now. I can still help with player information and general cricket advice!",
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
          content: "❌ Couldn't fetch live cricket data. I can still answer general cricket questions!",
          timestamp: new Date(),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if query is asking for fantasy suggestions
  const isFantasyQuery = (query: string): boolean => {
    const fantasyKeywords = [
      'suggest', 'team', 'fantasy', 'captain', 'vice captain', 'pick', 'select',
      'recommend', 'best players', 'top players', 'who should', 'perform well',
      'playing 11', 'squad', 'lineup'
    ];
    
    return fantasyKeywords.some(keyword => 
      query.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  // Handle user message submission
  const handleSendMessage = async (inputValue: string) => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    const userQuery = inputValue.toLowerCase();
    
    setIsLoading(true);
    setAiError(null);
    
    try {
      if (userQuery.includes("refresh") || userQuery.includes("update")) {
        await fetchCricketData();
      } else {
        // Use the improved edge function for all queries
        await fetchAIResponse(inputValue);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        type: "bot",
        content: "❌ Sorry, I encountered an error. Please try again or refresh the data.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  // Fetch AI-powered response from edge function
  const fetchAIResponse = async (query: string) => {
    try {
      setIsAiThinking(true);
      
      // Show thinking message
      const thinkingMessageId = `thinking-${Date.now()}`;
      setMessages(prev => [...prev, {
        id: thinkingMessageId,
        type: "bot",
        content: "🧠 Analyzing your query...",
        timestamp: new Date(),
        isTemporary: true
      }]);

      const requestType = isFantasyQuery(query) ? 'fantasy_analysis' : 'general';
      
      const response = await fetch(
        "https://yefrdovbporfjdhfojyx.supabase.co/functions/v1/cricket-assistant",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            query,
            requestType
          }),
        }
      );

      // Remove thinking message
      setMessages(prev => prev.filter(m => m.id !== thinkingMessageId));

      const data = await response.json();
      console.log("AI response:", data);
      
      if (!response.ok || data.error) {
        const errorMessage = data.error || `Edge function returned ${response.status}`;
        console.error("Edge function error:", errorMessage);
        
        setAiError(errorMessage);
        
        setMessages(prev => [...prev, {
          id: `ai-error-${Date.now()}`,
          type: "bot",
          content: `⚠️ Service temporarily unavailable: ${data.message || errorMessage}`,
          timestamp: new Date(),
        }]);
        return;
      }
      
      // Add the AI response to messages
      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        type: "bot",
        content: data.message || "I'm sorry, I couldn't process that request at the moment.",
        timestamp: new Date(),
        isAiGenerated: true
      }]);
      
      // Handle additional data from AI response
      if (data.cricketData && data.cricketData.length > 0) {
        console.log("Updating matches with data from AI response");
        
        // Show relevant match cards for live matches
        const liveMatches = data.cricketData.filter((m: any) => 
          m.status?.toLowerCase().includes('live') || 
          m.status?.toLowerCase().includes('innings')
        ).slice(0, 2);
        
        liveMatches.forEach((match: CricketMatch) => {
          setMessages(prev => [...prev, {
            id: `match-${match.id}-${Date.now()}`,
            type: "match-update",
            content: match.name,
            timestamp: new Date(),
            matchData: match,
          }]);
        });
      }
      
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setAiError(error.message);
      
      setMessages(prev => prev.filter(m => !m.isTemporary));
      
      setMessages(prev => [...prev, {
        id: `ai-error-${Date.now()}`,
        type: "bot",
        content: `⚠️ I'm having trouble connecting to my cricket database. Please try again in a moment.`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  // Share link to invite friends
  const handleShareInvite = () => {
    const shareUrl = window.location.origin;
    
    if (navigator.share) {
      navigator.share({
        title: 'Fantasy Cricket Elite',
        text: 'Join me on Fantasy Cricket Elite for AI-powered cricket fantasy experience!',
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
            <p className="font-medium">Service Issue</p>
            <p>Some features may be limited.</p>
          </div>
        </div>
      </div>
    );
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
        aria-label="Toggle chat assistant"
      >
        {isOpen ? <X size={24} /> : (
          <div className="relative">
            <MessageSquare size={24} />
            {aiPowered && (
              <Brain className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300" />
            )}
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
                <h3 className="font-medium">Cricket Fantasy AI</h3>
                {aiPowered && !aiError && (
                  <span className="bg-green-500 text-xs px-1.5 py-0.5 rounded-full text-white font-semibold flex items-center gap-1">
                    <Brain size={10} />
                    AI
                  </span>
                )}
                {aiPowered && aiError && (
                  <span className="bg-yellow-500 text-xs px-1.5 py-0.5 rounded-full text-white font-semibold" title={aiError}>
                    Limited
                  </span>
                )}
                {isAiThinking && (
                  <div className="flex items-center gap-1">
                    <div className="animate-spin h-3 w-3 border border-white rounded-full border-t-transparent"></div>
                    <span className="text-xs">Thinking...</span>
                  </div>
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
                        Share Fantasy Cricket Elite with AI-powered insights!
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
                    {(isLoading || isAiThinking) && (
                      <div className="flex justify-center py-2">
                        <div className="animate-pulse flex space-x-1">
                          <div className="h-2 w-2 bg-purple-400 rounded-full"></div>
                          <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                          <div className="h-2 w-2 bg-purple-400 rounded-full"></div>
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
                        disabled={isLoading}
                      >
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                      </button>
                      <span className="text-xs text-green-600">🟢 API Connected</span>
                    </div>
                    {aiError && (
                      <button 
                        className="text-xs text-orange-500 hover:text-orange-700" 
                        title={aiError}
                        onClick={() => toast.error(`Service Issue: ${aiError}`)}
                      >
                        Service issues
                      </button>
                    )}
                  </div>
                  <ChatInput 
                    onSendMessage={handleSendMessage} 
                    isLoading={isLoading || isAiThinking} 
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
