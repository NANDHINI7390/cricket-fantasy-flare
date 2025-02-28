
import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface MatchDetailsModalProps {
  match: any;
  onClose: () => void;
}

const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({ match, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full m-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Match Details</h2>
          <button 
            onClick={onClose}
            className="hover:bg-gray-100 p-1 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-2">
          <p><strong>Venue:</strong> {match.strVenue}</p>
          <p><strong>League:</strong> {match.strLeague}</p>
          <p><strong>Season:</strong> {match.strSeason}</p>
          <p><strong>Time:</strong> {match.matchTime}</p>
          {match.liveScore?.status === "Live" && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Live Score</h3>
              <p>{match.strHomeTeam}: {match.liveScore.homeScore}/{match.liveScore.homeWickets}</p>
              <p>{match.strAwayTeam}: {match.liveScore.awayScore}/{match.liveScore.awayWickets}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MatchDetailsModal;
