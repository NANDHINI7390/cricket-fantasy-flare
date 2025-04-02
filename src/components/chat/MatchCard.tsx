
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MatchCardProps } from "./types";

const MatchCard: React.FC<MatchCardProps> = ({ match, details }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="text-xs text-gray-500 mb-2">{match.matchType?.toUpperCase() || "T20"}</div>
        
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium text-sm">{match.name}</h4>
        </div>
        
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <img 
              src={details.team1Logo || "https://via.placeholder.com/32"} 
              alt={details.team1}
              className="w-8 h-8 mr-2 rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/32";
              }}
            />
            <span className="font-medium">{details.team1}</span>
          </div>
          <span className="text-sm font-mono">{details.team1Score}</span>
        </div>
        
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <img 
              src={details.team2Logo || "https://via.placeholder.com/32"} 
              alt={details.team2}
              className="w-8 h-8 mr-2 rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/32";
              }}
            />
            <span className="font-medium">{details.team2}</span>
          </div>
          <span className="text-sm font-mono">{details.team2Score}</span>
        </div>
        
        <div className="text-xs text-center py-1 px-2 bg-blue-100 text-blue-800 rounded-full w-fit mx-auto">
          {details.status}
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchCard;
