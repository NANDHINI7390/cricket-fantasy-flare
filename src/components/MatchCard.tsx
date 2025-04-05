
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTeamLogoUrl, formatTossInfo, formatMatchDateTime, CricketMatch } from "@/utils/cricket-api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCountdown } from "@/hooks/useCountdown";

interface MatchCardProps {
  match: CricketMatch;
  onViewDetails: (match: CricketMatch) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onViewDetails }) => {
  const navigate = useNavigate();
  const { formattedTime, days, hours, minutes, seconds, isExpired } = useCountdown(match.dateTimeGMT || "");
  
  const handleTeamClick = (teamName: string) => {
    // Log the navigation for debugging
    console.log(`Navigate to team profile: ${teamName}`);
    // Navigate to the team profile page
    navigate(`/team/${encodeURIComponent(teamName)}`);
    toast.info(`Viewing ${teamName} profile`);
  };

  // Format match status and styles
  const isLive = match.status === "Live" || 
                 match.status.toLowerCase().includes("live") || 
                 (match.matchStarted && !match.matchEnded) ||
                 match.category === "Live";
  
  const isCompleted = match.status.toLowerCase().includes("won") || 
                      match.matchEnded || 
                      match.category === "Completed";
  
  // Add more visually exciting styling based on match status
  const statusClasses = isLive 
    ? "bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium animate-pulse-border border-2 border-red-500" 
    : isCompleted
      ? "bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium"
      : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium";
      
  const team1 = match.teamInfo?.find(t => t.name === match.teams?.[0]);
  const team2 = match.teamInfo?.find(t => t.name === match.teams?.[1]);
  
  const team1Score = match.score?.find(s => s.inning?.includes(team1?.name || ""));
  const team2Score = match.score?.find(s => s.inning?.includes(team2?.name || ""));

  // Format countdown display
  const renderCountdown = () => {
    if (!match.dateTimeGMT || isExpired || isLive) return null;
    
    return (
      <div className="text-xs text-center mt-2">
        <p className="text-gray-500">Starts in: {days > 0 ? `${days}d ` : ''}{hours}h {minutes}m {seconds}s</p>
        <p className="font-medium text-blue-600">{formattedTime}</p>
      </div>
    );
  };

  return (
    <Card className={`overflow-hidden hover:shadow-md transition-all ${isLive ? 'border-2 border-red-500 animate-pulse-border' : ''}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <Badge className={statusClasses}>
            {isLive ? "LIVE" : isCompleted ? "COMPLETED" : "UPCOMING"}
          </Badge>
          <span className="text-xs text-gray-500">{match.matchType || "T20"}</span>
        </div>
        
        <h3 className="font-bold text-lg mb-4 bg-gradient-to-r from-indigo-800 to-purple-800 bg-clip-text text-transparent">
          {match.name}
        </h3>
        
        <div className="mb-3">
          <div 
            className="flex justify-between items-center py-2 px-1 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
            onClick={() => handleTeamClick(team1?.name || "")}
          >
            <div className="flex items-center">
              <img 
                src={getTeamLogoUrl(team1)} 
                alt={team1?.name || "Team 1"} 
                className="w-8 h-8 mr-2 rounded-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://placehold.co/32x32?text=Team";
                }}
              />
              <span className="font-medium text-blue-600 hover:underline">{team1?.name}</span>
            </div>
            <span className="text-sm font-mono font-bold">
              {team1Score ? `${team1Score.r || 0}/${team1Score.w || 0} (${team1Score.o || 0})` : ""}
            </span>
          </div>
          
          <div 
            className="flex justify-between items-center py-2 px-1 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
            onClick={() => handleTeamClick(team2?.name || "")}
          >
            <div className="flex items-center">
              <img 
                src={getTeamLogoUrl(team2)} 
                alt={team2?.name || "Team 2"} 
                className="w-8 h-8 mr-2 rounded-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://placehold.co/32x32?text=Team";
                }}
              />
              <span className="font-medium text-blue-600 hover:underline">{team2?.name}</span>
            </div>
            <span className="text-sm font-mono font-bold">
              {team2Score ? `${team2Score.r || 0}/${team2Score.w || 0} (${team2Score.o || 0})` : ""}
            </span>
          </div>
        </div>
        
        {match.tossWinner && (
          <div className="text-xs text-gray-600 mb-2 italic">
            {formatTossInfo(match)}
          </div>
        )}
        
        {renderCountdown()}
        
        <div className="mt-3 text-center">
          <button 
            onClick={() => onViewDetails(match)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-1 rounded-md text-sm font-medium transition-colors"
          >
            View Details
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchCard;
