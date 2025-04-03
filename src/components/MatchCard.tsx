
import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, Calendar, MapPin, Award, Timer, ChevronRightCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useCountdown } from "@/hooks/useCountdown";
import { 
  getCountryFlagUrl, 
  getTeamLogoUrl, 
  formatMatchStatus, 
  formatTossInfo,
  formatMatchDateTime,
  CricketMatch
} from "@/utils/cricket-api";

interface MatchCardProps {
  match: CricketMatch;
  onViewDetails: (match: CricketMatch) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onViewDetails }) => {
  const isLive = match.status.toLowerCase() === "live" || 
    (match.matchStarted && !match.matchEnded);
  
  const isFinished = match.status.toLowerCase().includes("won") || 
    match.matchEnded;

  const isUpcoming = !isLive && !isFinished;
  
  // Get countdown for upcoming matches
  const { days, hours, minutes, seconds } = useCountdown(
    match.dateTimeGMT || new Date().toISOString()
  );
  
  const getBadgeVariant = () => {
    if (isLive) return "destructive";
    if (isFinished) return "secondary";
    return "default";
  };

  const getDisplayStatus = () => {
    return formatMatchStatus(match.status, match.matchStarted, match.matchEnded);
  };

  // Extract team information
  const team1 = match.teamInfo && match.teamInfo[0];
  const team2 = match.teamInfo && match.teamInfo[1];

  // Find scores for both teams if available
  const team1Score = match.score?.find((s: any) => s.inning?.includes(team1?.name))?.r;
  const team1Wickets = match.score?.find((s: any) => s.inning?.includes(team1?.name))?.w;
  const team1Overs = match.score?.find((s: any) => s.inning?.includes(team1?.name))?.o;
  
  const team2Score = match.score?.find((s: any) => s.inning?.includes(team2?.name))?.r;
  const team2Wickets = match.score?.find((s: any) => s.inning?.includes(team2?.name))?.w;
  const team2Overs = match.score?.find((s: any) => s.inning?.includes(team2?.name))?.o;

  // Get toss information
  const tossInfo = formatTossInfo(match);

  const handleTeamClick = (e: React.MouseEvent, teamName: string) => {
    e.stopPropagation();
    // Navigate to team stats/profile
    console.log(`Navigate to team profile: ${teamName}`);
    // For now, show a toast notification
    // toast.info(`${teamName} profile coming soon!`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ type: "spring", stiffness: 80, damping: 12 }}
      className="h-full"
    >
      <Card 
        className={`overflow-hidden bg-white rounded-3xl shadow-lg hover:shadow-xl transition-shadow h-full 
          ${isLive ? 'border-2 border-red-500 relative animate-pulse-border' : ''}`}
      >
        <div className="p-6 flex flex-col h-full relative">
          <div className="absolute top-3 right-3">
            <Badge variant={getBadgeVariant()} className={isLive ? 'animate-pulse' : ''}>
              {getDisplayStatus()}
            </Badge>
          </div>

          <div className="mt-6 space-y-6 flex-grow">
            {/* Countdown timer for upcoming matches */}
            {isUpcoming && match.dateTimeGMT && (
              <div className="mb-4 flex items-center justify-center space-x-2 text-sm font-medium">
                <Timer size={16} className="text-blue-500" />
                <div className="flex space-x-1">
                  <div className="bg-gray-100 rounded px-2 py-1">{days}d</div>
                  <div className="bg-gray-100 rounded px-2 py-1">{hours}h</div>
                  <div className="bg-gray-100 rounded px-2 py-1">{minutes}m</div>
                  <div className="bg-gray-100 rounded px-2 py-1">{seconds}s</div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Team 1 */}
              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors"
                  onClick={(e) => handleTeamClick(e, team1?.name || match.teams?.[0] || "Team 1")}
                >
                  <img 
                    src={team1 ? getTeamLogoUrl(team1) : getCountryFlagUrl(match.teams?.[0] || "")} 
                    alt={team1?.name || match.teams?.[0] || "Team 1"} 
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-100" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/32x32?text=Team";
                    }}
                  />
                  <span className="text-lg font-semibold text-gray-800 truncate max-w-[180px] flex items-center">
                    {team1?.name?.replace(/\s*\[.*\]\s*$/, "") || match.teams?.[0]?.replace(/\s*\[.*\]\s*$/, "") || "Team 1"}
                    <ChevronRightCircle size={16} className="ml-1 text-blue-500 opacity-70" />
                  </span>
                </div>
                {(isLive || isFinished) && team1Score !== undefined && (
                  <div className="text-lg font-bold text-gray-800">
                    {team1Score}/{team1Wickets || 0}
                    {team1Overs ? <span className="text-sm text-gray-600 ml-1">({team1Overs})</span> : null}
                  </div>
                )}
              </div>

              {/* Versus divider */}
              <div className="flex items-center justify-center">
                <div className="border-t border-gray-200 flex-grow"></div>
                <span className="px-4 text-gray-500 font-semibold">VS</span>
                <div className="border-t border-gray-200 flex-grow"></div>
              </div>

              {/* Team 2 */}
              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors"
                  onClick={(e) => handleTeamClick(e, team2?.name || match.teams?.[1] || "Team 2")}
                >
                  <img 
                    src={team2 ? getTeamLogoUrl(team2) : getCountryFlagUrl(match.teams?.[1] || "")} 
                    alt={team2?.name || match.teams?.[1] || "Team 2"} 
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-100" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/32x32?text=Team";
                    }}
                  />
                  <span className="text-lg font-semibold text-gray-800 truncate max-w-[180px] flex items-center">
                    {team2?.name?.replace(/\s*\[.*\]\s*$/, "") || match.teams?.[1]?.replace(/\s*\[.*\]\s*$/, "") || "Team 2"}
                    <ChevronRightCircle size={16} className="ml-1 text-blue-500 opacity-70" />
                  </span>
                </div>
                {(isLive || isFinished) && team2Score !== undefined && (
                  <div className="text-lg font-bold text-gray-800">
                    {team2Score}/{team2Wickets || 0}
                    {team2Overs ? <span className="text-sm text-gray-600 ml-1">({team2Overs})</span> : null}
                  </div>
                )}
              </div>
            </div>

            {/* Toss Information */}
            {tossInfo && (
              <div className="flex items-center text-sm text-gray-600">
                <Award size={16} className="mr-2 text-gray-500" />
                <span className="text-xs italic">{tossInfo}</span>
              </div>
            )}

            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex items-center">
                <Calendar size={16} className="mr-2 text-gray-500" />
                <span>{formatMatchDateTime(match.dateTimeGMT)}</span>
              </div>
              {match.venue && (
                <div className="flex items-center">
                  <MapPin size={16} className="mr-2 text-gray-500" />
                  <span className="truncate">{match.venue}</span>
                </div>
              )}
            </div>
          </div>

          <button 
            className="w-full py-3 px-4 mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity" 
            onClick={() => onViewDetails(match)}
          >
            <span>View Details</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </Card>
    </motion.div>
  );
};

export default MatchCard;
