
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChatMessageProps } from "./types";
import PlayerSuggestion from "./PlayerSuggestion";
import LiveAnalysis from "./LiveAnalysis";

const ChatMessage: React.FC<ChatMessageProps> = ({ message, formatMatchData }) => {
  switch (message.type) {
    case "user":
      return (
        <div className="flex justify-end mb-3">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-tr-none px-4 py-2 max-w-[80%] shadow-md">
            {message.content}
          </div>
        </div>
      );

    case "bot":
      return (
        <div className="flex justify-start mb-3">
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%] shadow-md">
            <div className="whitespace-pre-wrap text-gray-800">{message.content}</div>
          </div>
        </div>
      );

    case "match-update":
      if (!message.matchData) return null;
      
      const matchDetails = formatMatchData(message.matchData);
      
      if (typeof matchDetails === "string") {
        return (
          <div className="flex justify-start mb-3">
            <div className="bg-gray-200 rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
              {matchDetails}
            </div>
          </div>
        );
      }
      
      return (
        <div className="flex justify-start mb-3">
          <Card className="w-full max-w-[90%] border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-4">
              <h4 className="font-semibold text-green-800 mb-2 text-sm flex items-center gap-2">
                🏏 {message.content}
              </h4>
              
              <div className="bg-white rounded-lg p-3 border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <img 
                      src={matchDetails.team1Logo || "https://via.placeholder.com/32"} 
                      alt={matchDetails.team1}
                      className="w-8 h-8 mr-2 rounded-full border-2 border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/32";
                      }}
                    />
                    <span className="font-medium text-gray-800">{matchDetails.team1}</span>
                  </div>
                  <span className="text-sm font-mono bg-blue-100 px-2 py-1 rounded text-blue-800">{matchDetails.team1Score}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img 
                      src={matchDetails.team2Logo || "https://via.placeholder.com/32"} 
                      alt={matchDetails.team2}
                      className="w-8 h-8 mr-2 rounded-full border-2 border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/32";
                      }}
                    />
                    <span className="font-medium text-gray-800">{matchDetails.team2}</span>
                  </div>
                  <span className="text-sm font-mono bg-blue-100 px-2 py-1 rounded text-blue-800">{matchDetails.team2Score}</span>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-center py-2 px-3 bg-gradient-to-r from-green-100 to-blue-100 text-green-800 rounded-full border border-green-200">
                📊 {matchDetails.status}
              </div>
            </CardContent>
          </Card>
        </div>
      );
      
    case "player-suggestion":
      if (!message.playerSuggestions) return null;
      
      return (
        <div className="flex justify-start mb-3">
          <PlayerSuggestion 
            playerSuggestions={message.playerSuggestions} 
            content={message.content} 
          />
        </div>
      );
    
    case "ai-analysis":
      if (!message.liveAnalysis) return null;
      
      return (
        <div className="flex justify-start mb-3">
          <LiveAnalysis 
            analysis={message.liveAnalysis} 
            content={message.content} 
          />
        </div>
      );
      
    default:
      return null;
  }
};

export default ChatMessage;
