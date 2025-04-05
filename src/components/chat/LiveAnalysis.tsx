import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Sword, Star } from "lucide-react";
import { LiveAnalysisProps } from "./types";

const LiveAnalysis: React.FC<LiveAnalysisProps> = ({ analysis, content }) => {
  const { matchName, teamScores, captainPick, bowlingPick, otherRecommendations } = analysis;

  return (
    <Card className="w-full max-w-[95%] border-l-4 border-l-indigo-500 shadow-md">
      <CardContent className="p-4">
        <h4 className="font-semibold text-indigo-800 mb-2">
          {content}
        </h4>
        
        {/* Match Information */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mb-3">
          <h5 className="font-bold text-indigo-700">{matchName}</h5>
          {teamScores.map((score, index) => (
            <div key={index} className="text-sm text-gray-800 font-medium">
              {score}
            </div>
          ))}
        </div>
        
        {/* Captain Pick */}
        {captainPick && (
          <div className="bg-amber-50 rounded-lg p-3 mb-2">
            <div className="flex items-start">
              <div className="bg-amber-500 text-white p-2 rounded-full mr-3 mt-1">
                <Trophy size={16} />
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <h5 className="font-bold text-amber-800">{captainPick.name}</h5>
                  <span className="ml-2 text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                    Captain Pick
                  </span>
                </div>
                <div className="text-sm font-mono font-medium text-amber-700">
                  {captainPick.stats}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {captainPick.reason}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Bowling Pick */}
        {bowlingPick && (
          <div className="bg-emerald-50 rounded-lg p-3 mb-2">
            <div className="flex items-start">
              <div className="bg-emerald-500 text-white p-2 rounded-full mr-3 mt-1">
                <Sword size={16} />
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <h5 className="font-bold text-emerald-800">{bowlingPick.name}</h5>
                  <span className="ml-2 text-xs bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">
                    Bowling Pick
                  </span>
                </div>
                <div className="text-sm font-mono font-medium text-emerald-700">
                  {bowlingPick.stats}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {bowlingPick.reason}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Other Recommendations */}
        {otherRecommendations && otherRecommendations.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <div className="bg-blue-500 text-white p-2 rounded-full mr-3">
                <Star size={16} />
              </div>
              <div className="font-medium text-blue-800">Other Recommendations</div>
            </div>
            
            <div className="space-y-2">
              {otherRecommendations.map((player, index) => (
                <div key={index} className="flex items-start pl-2 border-l-2 border-blue-200">
                  <div className="flex-1">
                    <div className="font-medium text-blue-700">{player.name}</div>
                    <div className="text-xs text-gray-700">
                      {player.role}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      {player.reason}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveAnalysis;
