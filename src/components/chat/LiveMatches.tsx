
import React from "react";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { LiveMatchesProps } from "./types";
import MatchCard from "./MatchCard";

const LiveMatches: React.FC<LiveMatchesProps> = ({ matches, formatMatchData, onRefresh }) => {
  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <BarChart3 size={48} className="mb-4 opacity-30" />
        <p>No matches currently available</p>
        <Button 
          variant="outline" 
          size="sm"
          className="mt-4"
          onClick={onRefresh}
        >
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-2">
      {matches.map(match => {
        const matchDetails = formatMatchData(match);
        
        if (typeof matchDetails === "string") {
          return (
            <Card key={match.id} className="hover:shadow-md transition-shadow p-4">
              <div className="text-center text-gray-500">{matchDetails}</div>
            </Card>
          );
        }
        
        return (
          <MatchCard 
            key={match.id} 
            match={match} 
            details={matchDetails} 
          />
        );
      })}
    </div>
  );
};

export default LiveMatches;
