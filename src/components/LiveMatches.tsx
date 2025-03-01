
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import MatchCard from "@/components/MatchCard";
import MatchDetailsModal from "@/components/MatchDetailsModal";
import { fetchMatches, fetchLiveScores, convertToLocalTime, teamsMatch } from "@/utils/cricket-api";

const LiveMatches = () => {
  const [showAll, setShowAll] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const { data: matches, isLoading: isMatchesLoading } = useQuery({
    queryKey: ["matches"],
    queryFn: fetchMatches,
    refetchInterval: 300000, // 5 minutes
  });

  const { data: liveScores, isLoading: isScoresLoading } = useQuery({
    queryKey: ["liveScores"],
    queryFn: fetchLiveScores,
    refetchInterval: 30000, // 30 seconds
    retry: 2,
  });

  // The matchData is already processed in the fetchMatches function
  const visibleMatches = showAll ? matches : matches?.slice(0, 5);

  return (
    <section className="min-h-screen py-8 px-4 bg-gradient-to-r from-purple-100 to-pink-100">
      <div className="container mx-auto max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-gray-900">Cricket</span>{" "}
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Matches
            </span>
          </h1>
        </motion.div>

        {isMatchesLoading || isScoresLoading ? (
          <div className="flex justify-center">
            <Loader2 className="animate-spin text-purple-600" size={28} />
          </div>
        ) : visibleMatches?.length === 0 ? (
          <div className="text-center text-gray-600">
            No upcoming or live ICC Champions Trophy matches found
          </div>
        ) : (
          <div className="space-y-4">
            {visibleMatches?.map((match) => (
              <MatchCard 
                key={match.idEvent} 
                match={match} 
                onViewDetails={setSelectedMatch} 
              />
            ))}
          </div>
        )}

        {matches?.length > 5 && !showAll && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAll(true)}
              className="text-purple-600 hover:text-purple-700 font-semibold"
            >
              Show More Matches
            </button>
          </div>
        )}
      </div>

      {selectedMatch && (
        <MatchDetailsModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </section>
  );
};

export default LiveMatches;
