import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, ChevronDown, Share2, RefreshCw, AlertTriangle, Brain, Zap } from "lucide-react";
import { fetchLiveMatches, fetchLiveScores, CricketMatch } from "@/utils/cricket-api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "./types";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import LiveMatches from "./LiveMatches";
import { formatMatchData, mergeMatchData, processUserQuery, generateIntelligentResponse } from "./chatHelpers";
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
  const [isAIThinking, setIsAIThinking] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Enhanced welcome message with AI capabilities
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        type: "bot",
        content: "🏏 **Welcome to Cricket Fantasy AI Elite!** 🤖\n\nI'm your advanced AI assistant powered by real-time cricket data. Here's what I can do:\n\n**🎯 Smart Recommendations**\n• AI-powered captain & vice-captain picks\n• Team composition with reasoning\n• Risk vs safe player analysis\n\n**📊 Live Intelligence**\n• Real-time match analysis\n• Player form & performance insights\n• Pitch conditions & weather impact\n\n**🔮 Predictive Analysis**\n• Fantasy point predictions\n• Match outcome probabilities\n• Strategic team building\n\n**Try asking:**\n• \"Suggest best captain for today\"\n• \"Build me a winning team\"\n• \"Analyze current live matches\"\n• \"Best differential picks\"\n\nReady to dominate fantasy cricket? 🚀",
        timestamp: new Date(),
      },
    ]);
  }, []);

  useEffect(() => {
    if (isOpen && matches.length === 0) {
      fetchCricketData();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

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
        // Get AI insights for the fetched matches
        try {
          const aiInsights = await generateIntelligentResponse(
            "Analyze these live cricket matches and provide key fantasy insights",
            combinedMatches
          );
          
          setMessages(prev => [
            ...prev,
            {
              id: `ai-insights-${Date.now()}`,
              type: "bot",
              content: `🎯 **Live Cricket Intelligence Update**\n\n${aiInsights.message}\n\n📊 Found ${combinedMatches.length} matches with live data. Ask me for specific recommendations!`,
              timestamp: new Date(),
            }
          ]);
        } catch (error) {
          console.error("Error getting AI insights:", error);
          setMessages(prev => [
            ...prev,
            {
              id: `match-update-${Date.now()}`,
              type: "bot",
              content: `📊 I found ${combinedMatches.length} cricket matches with live data. Ask me for fantasy suggestions or player analysis!`,
              timestamp: new Date(),
            }
          ]);
        }
        
        toast.success(`Found ${combinedMatches.length} cricket matches`);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: `no-matches-${Date.now()}`,
            type: "bot",
            content: "⚠️ No live matches found right now. I can still help with general fantasy cricket strategies and tips!",
            timestamp: new Date(),
          }
        ]);
        toast.info("No matches are currently available. Check back later!");
      }
    } catch (error) {
      console.error("Error fetching cricket data:", error);
      setDataLoadingStatus("error");
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          type: "bot",
          content: "❌ Couldn't fetch live cricket data. But I'm still here to help with fantasy strategies! Try refreshing later.",
          timestamp: new Date(),
        }
      ]);
      toast.error("Failed to fetch match data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced message handling with AI processing
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
    setIsAIThinking(true);
    
    try {
      if (userQuery.includes("refresh") || userQuery.includes("update")) {
        await fetchCricketData();
      } else {
        // Use enhanced AI processing
        await processUserQuery(userQuery, matches, setMessages);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        type: "bot",
        content: "❌ I encountered an error while processing your request. Please try rephrasing your question or refresh the data.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
      setIsAIThinking(false);
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
        statusMessage = "Loading cricket intelligence...";
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
      {/* Enhanced chat toggle button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`rounded-full p-3 shadow-lg focus:outline-none ${
          isOpen ? "bg-red-500 text-white" : "bg-gradient-to-r from-purple-600 via-blue-500 to-green-500 text-white"
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle AI cricket assistant"
      >
        {isOpen ? <X size={24} /> : (
          <div className="relative">
            <MessageSquare size={24} />
            <div className="absolute -top-1 -right-1 flex items-center">
              <Brain className="w-3 h-3 text-yellow-300" />
              <Zap className="w-2 h-2 text-green-300 animate-pulse" />
            </div>
          </div>
        )}
      </motion.button>
      
      {/* Enhanced chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg shadow-xl w-80 sm:w-96 h-[500px] mb-2 flex flex-col overflow-hidden border border-purple-200"
          >
            {/* Enhanced chat header */}
            <div className="bg-gradient-to-r from-purple-600 via-blue-500 to-green-500 text-white px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Cricket AI Elite</h3>
                <span className="bg-green-500 text-xs px-1.5 py-0.5 rounded-full text-white font-semibold flex items-center gap-1">
                  <Brain size={10} />
                  AI Live
                </span>
                {isAIThinking && (
                  <span className="bg-yellow-500 text-xs px-1.5 py-0.5 rounded-full text-white font-semibold flex items-center gap-1">
                    <div className="animate-spin h-2 w-2 border border-white rounded-full border-t-transparent"></div>
                    Thinking
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
            
            <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="chat">AI Chat</TabsTrigger>
                <TabsTrigger value="matches">Live Matches</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat" className="flex-grow flex flex-col overflow-hidden m-0 p-0">
                <div className="px-4 pt-1">
                  {renderDataStatus()}
                </div>
                
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
                    {(isLoading || isAIThinking) && (
                      <div className="flex justify-center py-2">
                        <div className="animate-pulse flex space-x-1">
                          <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce"></div>
                          <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="h-2 w-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                <div className="border-t border-gray-200 mt-auto">
                  <div className="p-2 flex justify-between items-center">
                    <button 
                      onClick={fetchCricketData}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded"
                      title="Refresh cricket intelligence"
                      disabled={isLoading}
                    >
                      <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <div className="text-xs text-gray-500">
                      AI-powered insights
                    </div>
                  </div>
                  <ChatInput 
                    onSendMessage={handleSendMessage} 
                    isLoading={isLoading || isAIThinking} 
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
