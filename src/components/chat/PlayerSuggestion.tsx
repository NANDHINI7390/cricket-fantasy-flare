
import React from "react";
import { Trophy, Star, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PlayerSuggestionProps } from "./types";

const PlayerSuggestion: React.FC<PlayerSuggestionProps> = ({ playerSuggestions, content }) => {
  const { captain, viceCaptain, allrounders } = playerSuggestions;

  return (
    <Card className="w-full max-w-[90%] border-l-4 border-l-purple-500 shadow-md">
      <CardContent className="p-4">
        <h4 className="font-semibold text-purple-800 mb-2 text-sm">
          {content}
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
  );
};

export default PlayerSuggestion;
