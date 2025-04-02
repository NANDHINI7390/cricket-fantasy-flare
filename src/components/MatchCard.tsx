
import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, Calendar, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCountryFlagUrl, getTeamLogoUrl, formatMatchStatus } from "@/utils/cricket-api";

interface MatchCardProps {
  match: any;
  onViewDetails: (match: any) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onViewDetails }) => {
  const isLive = match.status === "Live" || 
    (match.matchStarted && !match.matchEnded);
  
  const isFinished = match.status.includes("won") || 
    match.matchEnded;

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

  // Format date and time
  const formatMatchDate = () => {
    if (!match.dateTimeGMT) return "Date not available";
    
    const matchDate = new Date(match.dateTimeGMT);
    return matchDate.toLocaleString('en-US', { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ type: "spring", stiffness: 80, damping: 12 }}
      className="h-full"
    >
      <Card className="overflow-hidden bg-white rounded-3xl shadow-lg hover:shadow-xl transition-shadow h-full">
        <div className="p-6 flex flex-col h-full relative">
          <div className="absolute top-3 right-3">
            <Badge variant={getBadgeVariant()}>
              {getDisplayStatus()}
            </Badge>
          </div>

          <div className="mt-6 space-y-6 flex-grow">
            <div className="space-y-4">
              {/* Team 1 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img 
                    src={team1 ? getTeamLogoUrl(team1) : getCountryFlagUrl(match.teams?.[0] || "")} 
                    alt={team1?.name || match.teams?.[0] || "Team 1"} 
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-100" 
                  />
                  <span className="text-lg font-semibold text-gray-800 truncate max-w-[180px]">
                    {team1?.name?.replace(/\s*\[.*\]\s*$/, "") || match.teams?.[0]?.replace(/\s*\[.*\]\s*$/, "") || "Team 1"}
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
                <div className="flex items-center space-x-3">
                  <img 
                    src={team2 ? getTeamLogoUrl(team2) : getCountryFlagUrl(match.teams?.[1] || "")} 
                    alt={team2?.name || match.teams?.[1] || "Team 2"} 
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-100" 
                  />
                  <span className="text-lg font-semibold text-gray-800 truncate max-w-[180px]">
                    {team2?.name?.replace(/\s*\[.*\]\s*$/, "") || match.teams?.[1]?.replace(/\s*\[.*\]\s*$/, "") || "Team 2"}
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

            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex items-center">
                <Calendar size={16} className="mr-2 text-gray-500" />
                <span>{formatMatchDate()}</span>
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
