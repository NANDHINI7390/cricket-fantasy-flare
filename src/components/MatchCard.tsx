import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getCountryFlagUrl } from "@/utils/cricket-api";

interface MatchCardProps {
  match: any;
  onViewDetails: (match: any) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onViewDetails }) => {
  const isLive = match.liveScore?.status === "Live" || 
    (match.liveScore?.matchDetails?.matchStarted && !match.liveScore?.matchDetails?.matchEnded);
  
  const isFinished = match.liveScore?.status.includes("won") || 
    match.liveScore?.matchDetails?.matchEnded;

  const getBadgeColor = () => {
    if (isLive) return "bg-red-500 text-white";
    if (isFinished) return "bg-gray-600 text-white";
    return "bg-green-500 text-white";
  };

  const getDisplayStatus = () => {
    if (match.liveScore?.matchDetails?.status) {
      const status = match.liveScore.matchDetails.status;
      return status.length > 20 ? status.substring(0, 20) + "..." : status;
    }
    
    if (isLive) return "Live";
    if (isFinished) return "Finished";
    return "Upcoming";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ type: "spring", stiffness: 80, damping: 12 }}
    >
      <Card className="overflow-hidden bg-white rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
        <div className="p-6 relative">
          <div className="absolute top-2 right-2">
            <span className={`px-3 py-1 rounded-full text-sm ${getBadgeColor()}`}>
              {getDisplayStatus()}
            </span>
          </div>

          <div className="space-y-4 mt-4">
            <div className="space-y-3">
              {[match.strHomeTeam, match.strAwayTeam].map((team, index) => (
                <div className="flex items-center justify-between" key={index}>
                  <div className="flex items-center space-x-3">
                    <img 
                      src={getCountryFlagUrl(team)} 
                      alt={team} 
                      className="w-8 h-8 rounded-full object-cover border-2 border-gray-100" 
                    />
                    <span className="text-lg font-semibold text-gray-800">
                      {team.replace(" Cricket", "")}
                    </span>
                  </div>
                  {(isLive || isFinished) && (
                    <span className="text-lg font-bold text-gray-800">
                      {index === 0
                        ? `${match.liveScore.homeScore}/${match.liveScore.homeWickets}`
                        : `${match.liveScore.awayScore}/${match.liveScore.awayWickets}`}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{match.strVenue}</span>
              <span className="text-sm text-gray-600">{match.matchTime}</span>
            </div>

            <button 
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity" 
              onClick={() => onViewDetails(match)}
            >
              <span>View Details</span>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default MatchCard;
