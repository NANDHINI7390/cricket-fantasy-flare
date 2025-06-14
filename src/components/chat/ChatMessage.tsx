
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
      
      return (
        <div className="flex justify-start mb-3">
          <PlayerSuggestion 
            playerSuggestions={message.playerSuggestions} 
            content={message.content} 
          />
        </div>
      );
    
    case "live-analysis":
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
