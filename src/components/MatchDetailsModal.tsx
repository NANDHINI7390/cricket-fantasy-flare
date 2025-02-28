
import React from "react";
import { motion } from "framer-motion";
import { X, Clock, MapPin, Trophy, Calendar } from "lucide-react";
import { getCountryFlagUrl } from "@/utils/cricket-api";

interface MatchDetailsModalProps {
  match: any;
  onClose: () => void;
}

const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({ match, onClose }) => {
  const liveMatch = match.liveScore?.matchDetails;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full m-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Match Details</h2>
          <button 
            onClick={onClose}
            className="hover:bg-gray-100 p-1 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Teams Section with Flags */}
        <div className="flex justify-between items-center mb-6 px-4 py-3 bg-gray-50 rounded-lg">
          <div className="flex flex-col items-center space-y-1">
            <img 
              src={getCountryFlagUrl(match.strHomeTeam)} 
              alt={match.strHomeTeam} 
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200" 
            />
            <span className="text-sm font-medium">{match.strHomeTeam.replace(" Cricket", "")}</span>
          </div>
          
          <div className="text-center">
            <div className="font-bold text-gray-800 mb-1">VS</div>
            <div className="text-xs text-gray-500">
              {match.liveScore?.status === "Live" && "LIVE"}
            </div>
          </div>
          
          <div className="flex flex-col items-center space-y-1">
            <img 
              src={getCountryFlagUrl(match.strAwayTeam)} 
              alt={match.strAwayTeam} 
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200" 
            />
            <span className="text-sm font-medium">{match.strAwayTeam.replace(" Cricket", "")}</span>
          </div>
        </div>
        
        {/* Match Information */}
        <div className="space-y-3">
          <div className="flex items-start space-x-2">
            <MapPin size={16} className="text-gray-500 mt-0.5" />
            <div>
              <p className="text-gray-800">{match.strVenue}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <Trophy size={16} className="text-gray-500 mt-0.5" />
            <div>
              <p className="text-gray-800">{match.strLeague}</p>
              <p className="text-sm text-gray-500">{match.strSeason}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <Clock size={16} className="text-gray-500 mt-0.5" />
            <div>
              <p className="text-gray-800">{match.matchTime}</p>
              {liveMatch?.dateTimeGMT && (
                <p className="text-sm text-gray-500">GMT: {new Date(liveMatch.dateTimeGMT).toLocaleString()}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <Calendar size={16} className="text-gray-500 mt-0.5" />
            <div>
              <p className="text-gray-800">{match.strStatus}</p>
              {liveMatch?.status && match.strStatus !== liveMatch.status && (
                <p className="text-sm text-gray-600">{liveMatch.status}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Live Score Section */}
        {(match.liveScore?.status === "Live" || liveMatch?.score) && (
          <div className="mt-5 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold mb-3 text-center">Live Score</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">{match.strHomeTeam.replace(" Cricket", "")}</span>
                <span className="font-bold">
                  {match.liveScore.homeScore}/{match.liveScore.homeWickets}
                  {liveMatch?.score?.[0]?.o && ` (${liveMatch?.score[0].o} overs)`}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">{match.strAwayTeam.replace(" Cricket", "")}</span>
                <span className="font-bold">
                  {match.liveScore.awayScore}/{match.liveScore.awayWickets}
                  {liveMatch?.score?.[1]?.o && ` (${liveMatch?.score[1].o} overs)`}
                </span>
              </div>
            </div>
            
            {liveMatch?.status && (
              <div className="mt-3 text-center text-sm text-gray-600">
                {liveMatch.status}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MatchDetailsModal;
