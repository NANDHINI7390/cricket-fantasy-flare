
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTeamLogoUrl, formatTossInfo, formatMatchDateTime, CricketMatch } from "@/utils/cricket-api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCountdown } from "@/hooks/useCountdown";
import { Clock, Calendar, Award } from "lucide-react";

interface MatchCardProps {
  match: CricketMatch;
  onViewDetails: (match: CricketMatch) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onViewDetails }) => {
  const navigate = useNavigate();
  const { formattedTime, days, hours, minutes, seconds, isExpired } = useCountdown(match.dateTimeGMT || "");
  
  const handleTeamClick = (teamName: string) => {
    console.log(`Navigate to team profile: ${teamName}`);
    navigate(`/team/${encodeURIComponent(teamName)}`);
    toast.info(`Viewing ${teamName} profile`);
  };

  const handleActionButtonClick = () => {
    if (isLive) {
      onViewDetails(match);
    } else if (isUpcoming) {
      navigate(`/create-team?match=${match.id}`);
    } else {
      onViewDetails(match);
    }
  };

  // Format match status and styles
  const isLive = match.status === "Live" || 
                 match.status.toLowerCase().includes('live') || 
                 (match.matchStarted && !match.matchEnded) ||
                 match.category === "Live";
  
  const isCompleted = match.status.toLowerCase().includes("won") || 
                      match.matchEnded || 
                      match.category === "Completed";
  
  const isUpcoming = !isLive && !isCompleted;
  
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

  // Format time display similar to Dream11
  const formatTimeDisplay = () => {
    if (isLive) return "LIVE NOW";
    if (isCompleted) return "COMPLETED";
    
    const matchDate = match.dateTimeGMT ? new Date(match.dateTimeGMT) : null;
    if (!matchDate) return "Upcoming";
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const isToday = matchDate.getDate() === today.getDate() && 
                    matchDate.getMonth() === today.getMonth() && 
                    matchDate.getFullYear() === today.getFullYear();
                    
    const isTomorrow = matchDate.getDate() === tomorrow.getDate() && 
                      matchDate.getMonth() === tomorrow.getMonth() && 
                      matchDate.getFullYear() === tomorrow.getFullYear();
    
    // Format the time (HH:MM AM/PM)
    const timeStr = matchDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
    
    if (isToday) return `Today, ${timeStr}`;
    if (isTomorrow) return `Tomorrow, ${timeStr}`;
    
    // For other dates, show date and time
    const dateStr = matchDate.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short'
    });
    
    return `${dateStr}, ${timeStr}`;
  };

  // Render countdown or time
  const renderTimeInfo = () => {
    if (isLive) {
      return (
        <div className="flex items-center text-red-600 text-sm font-medium animate-pulse-slow">
          <div className="h-2 w-2 bg-red-600 rounded-full mr-2"></div>
          LIVE NOW
        </div>
      );
    }
    
    if (isCompleted) {
      const matchDate = match.dateTimeGMT ? new Date(match.dateTimeGMT) : null;
      const now = new Date();
      const diffDays = matchDate ? Math.floor((now.getTime() - matchDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      let timeAgoText = "Completed";
      if (diffDays === 0) {
        timeAgoText = "Today";
      } else if (diffDays === 1) {
        timeAgoText = "Yesterday";
      } else if (diffDays < 7) {
        timeAgoText = `${diffDays} days ago`;
      }
      
      return (
        <div className="flex items-center text-green-600 text-sm font-medium">
          <Award className="h-3.5 w-3.5 mr-1" />
          {timeAgoText}
        </div>
      );
    }
    
    if (days > 0) {
      return (
        <div className="flex items-center text-blue-600 text-sm">
          <Calendar className="h-3.5 w-3.5 mr-1" />
          {formatTimeDisplay()}
        </div>
      );
    }
    
    return (
      <div className="flex items-center text-blue-600 text-sm">
        <Clock className="h-3.5 w-3.5 mr-1" />
        {formatTimeDisplay()}
        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
          {`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
        </span>
      </div>
    );
  };

  const getActionButtonText = () => {
    if (isLive) return "View Live Match";
    if (isUpcoming) return "Create Team";
    return "View Scorecard";
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
        
        <div className="mt-3 flex flex-col space-y-3">
          <div className="text-center">
            {renderTimeInfo()}
          </div>
          
          <button 
            onClick={handleActionButtonClick}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors w-full"
          >
            {getActionButtonText()}
          </button>
          
          {isUpcoming && (
            <button 
              onClick={() => navigate("/contests")}
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors w-full"
            >
              Join Contests
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchCard;
