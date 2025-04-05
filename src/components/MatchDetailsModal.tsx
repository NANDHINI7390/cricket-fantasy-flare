
import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Clock, MapPin, Trophy, Calendar, Flag, Award, BarChart } from "lucide-react";
import { getCountryFlagUrl, getTeamLogoUrl, formatTossInfo, formatMatchDateTime, CricketMatch } from "@/utils/cricket-api";
import { Button } from "@/components/ui/button";
import MatchScorecardAnalysis from "./MatchScorecardAnalysis";

interface MatchDetailsModalProps {
  match: CricketMatch;
  onClose: () => void;
}

const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({ match, onClose }) => {
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);
  
  // Extract team information
  const team1 = match.teamInfo?.[0] || { name: match.teams?.[0] || "Team 1" };
  const team2 = match.teamInfo?.[1] || { name: match.teams?.[1] || "Team 2" };
  
  // Find scores for both teams if available
  const team1Score = match.score?.find((s: any) => s.inning?.includes(team1?.name));
  const team2Score = match.score?.find((s: any) => s.inning?.includes(team2?.name));
  
  // Get toss information
  const tossInfo = formatTossInfo(match);
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-6 rounded-xl shadow-lg max-w-4xl w-full relative overflow-y-auto max-h-[90vh]"
      >
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 hover:bg-gray-100 p-1 rounded-full transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        
        {!showAnalysis ? (
          <>
            <h2 className="text-xl font-bold mb-6 pr-8">Match Details</h2>
            
            {/* Teams Section with Logos/Flags */}
            <div className="flex justify-between items-center mb-6 px-4 py-5 bg-gray-50 rounded-lg">
              <div className="flex flex-col items-center space-y-2">
                <img 
                  src={getTeamLogoUrl(team1)} 
                  alt={team1.name} 
                  className="w-14 h-14 rounded-full object-cover border-2 border-gray-200" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/32x32?text=Team";
                  }}
                />
                <span className="text-sm font-medium text-center">{team1.name.replace(/\s*\[.*\]\s*$/, "")}</span>
              </div>
              
              <div className="text-center">
                <div className="font-bold text-gray-800 mb-1">VS</div>
                <div className="text-xs text-gray-500">
                  {match.matchType?.toUpperCase() || ""}
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-2">
                <img 
                  src={getTeamLogoUrl(team2)} 
                  alt={team2.name} 
                  className="w-14 h-14 rounded-full object-cover border-2 border-gray-200" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/32x32?text=Team";
                  }}
                />
                <span className="text-sm font-medium text-center">{team2.name.replace(/\s*\[.*\]\s*$/, "")}</span>
              </div>
            </div>
            
            {/* Match Status */}
            <div className="bg-gray-100 p-3 rounded-lg text-center mb-6">
              <span className="font-semibold text-gray-800">{match.status}</span>
            </div>

            {/* Toss information */}
            {tossInfo && (
              <div className="bg-blue-50 p-3 rounded-lg text-center mb-6 flex items-center justify-center">
                <Award size={18} className="text-blue-600 mr-2" />
                <span className="font-medium text-blue-800 text-sm">{tossInfo}</span>
              </div>
            )}
            
            {/* Live Score Section */}
            {(match.matchStarted || match.score?.length > 0) && (
              <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h3 className="font-bold mb-3 text-center border-b pb-2">Scoreboard</h3>
                
                <div className="space-y-4">
                  {team1Score && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <img 
                          src={getTeamLogoUrl(team1)} 
                          alt={team1.name} 
                          className="w-6 h-6 rounded-full" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/32x32?text=Team";
                          }}
                        />
                        <span className="font-medium">{team1.name.replace(/\s*\[.*\]\s*$/, "")}</span>
                      </div>
                      <div>
                        <span className="font-bold">{team1Score.r}/{team1Score.w || 0}</span>
                        {team1Score.o ? <span className="text-sm text-gray-600 ml-1">({team1Score.o} overs)</span> : null}
                      </div>
                    </div>
                  )}
                  
                  {team2Score && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <img 
                          src={getTeamLogoUrl(team2)} 
                          alt={team2.name} 
                          className="w-6 h-6 rounded-full" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/32x32?text=Team";
                          }}
                        />
                        <span className="font-medium">{team2.name.replace(/\s*\[.*\]\s*$/, "")}</span>
                      </div>
                      <div>
                        <span className="font-bold">{team2Score.r}/{team2Score.w || 0}</span>
                        {team2Score.o ? <span className="text-sm text-gray-600 ml-1">({team2Score.o} overs)</span> : null}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Match Information */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Calendar size={18} className="text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-800 font-medium">Match Date</p>
                  <p className="text-sm text-gray-600">{formatMatchDateTime(match.dateTimeGMT)}</p>
                </div>
              </div>
              
              {match.venue && (
                <div className="flex items-start space-x-3">
                  <MapPin size={18} className="text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-800 font-medium">Venue</p>
                    <p className="text-sm text-gray-600">{match.venue}</p>
                  </div>
                </div>
              )}
              
              {match.name && (
                <div className="flex items-start space-x-3">
                  <Trophy size={18} className="text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-800 font-medium">Series</p>
                    <p className="text-sm text-gray-600">{match.name.split(',')[0]}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start space-x-3">
                <Flag size={18} className="text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-800 font-medium">Match Type</p>
                  <p className="text-sm text-gray-600 capitalize">{match.matchType || "Not specified"}</p>
                </div>
              </div>
            </div>
            
            {/* View Analysis Button */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-center">
              <Button 
                onClick={() => setShowAnalysis(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex items-center gap-2"
              >
                <BarChart size={16} />
                View Player Analysis & Recommendations
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold pr-8">Match Analysis & Recommendations</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAnalysis(false)}
                className="flex items-center gap-1"
              >
                <X size={16} />
                Back to Details
              </Button>
            </div>
            
            <MatchScorecardAnalysis matchId={match.id} />
          </>
        )}
      </motion.div>
    </div>
  );
};

export default MatchDetailsModal;
