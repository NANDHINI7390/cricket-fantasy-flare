
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import MatchCard from "@/components/MatchCard";
import MatchDetailsModal from "@/components/MatchDetailsModal";
import { fetchMatches, fetchLiveScores, formatMatchDate, teamsMatch } from "@/utils/cricket-api";

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

  const processMatchData = (match) => {
    // Find corresponding live score data with improved team name matching
    const liveMatchData = liveScores?.find(
      (score) => {
        // First try to match using teamInfo if available
        if (score.teamInfo && score.teamInfo.length >= 2) {
          return (
            teamsMatch(match.strHomeTeam, score.teamInfo[0].name) && 
            teamsMatch(match.strAwayTeam, score.teamInfo[1].name)
          ) || (
            teamsMatch(match.strHomeTeam, score.teamInfo[1].name) && 
            teamsMatch(match.strAwayTeam, score.teamInfo[0].name)
          );
        }

        // Fall back to matching with teams array
        if (score.teams && score.teams.length >= 2) {
          return (
            teamsMatch(match.strHomeTeam, score.teams[0]) && 
            teamsMatch(match.strAwayTeam, score.teams[1])
          ) || (
            teamsMatch(match.strHomeTeam, score.teams[1]) && 
            teamsMatch(match.strAwayTeam, score.teams[0])
          );
        }

        return false;
      }
    );

    const isLive = match.matchStatus === "Live" || 
      (liveMatchData?.matchStarted && !liveMatchData?.matchEnded);

    // Find the correct score entries for home and away teams
    let homeScore = "0";
    let homeWickets = "0";
    let awayScore = "0";
    let awayWickets = "0";
    let matchStatus = match.matchStatus || "Upcoming";

    if (liveMatchData) {
      if (liveMatchData.score && liveMatchData.score.length > 0) {
        // Try to match home team with the inning string
        const homeScoreEntry = liveMatchData.score.find(s => 
          s.inning && (
            s.inning.includes(match.strHomeTeam.replace(" Cricket", "")) ||
            teamsMatch(s.inning, match.strHomeTeam)
          )
        );
        
        if (homeScoreEntry) {
          homeScore = homeScoreEntry.r?.toString() || "0";
          homeWickets = homeScoreEntry.w?.toString() || "0";
        } else if (liveMatchData.score[0]) {
          // If no direct match, use the first score entry for home team
          homeScore = liveMatchData.score[0].r?.toString() || "0";
          homeWickets = liveMatchData.score[0].w?.toString() || "0";
        }

        // Try to match away team with the inning string
        const awayScoreEntry = liveMatchData.score.find(s => 
          s.inning && (
            s.inning.includes(match.strAwayTeam.replace(" Cricket", "")) ||
            teamsMatch(s.inning, match.strAwayTeam)
          )
        );
        
        if (awayScoreEntry) {
          awayScore = awayScoreEntry.r?.toString() || "0";
          awayWickets = awayScoreEntry.w?.toString() || "0";
        } else if (liveMatchData.score[1]) {
          // If no direct match, use the second score entry for away team
          awayScore = liveMatchData.score[1].r?.toString() || "0";
          awayWickets = liveMatchData.score[1].w?.toString() || "0";
        }
      }
      
      // Use the status from cricAPI if available
      if (liveMatchData.status) {
        matchStatus = liveMatchData.status;
      }
    }

    return {
      ...match,
      matchTime: formatMatchDate(match.dateEvent, match.strTime),
      liveScore: {
        homeScore,
        homeWickets,
        awayScore,
        awayWickets,
        status: matchStatus,
        matchDetails: liveMatchData // Pass the full match data for detail view
      }
    };
  };

  const allMatches = matches?.map(processMatchData);
  const visibleMatches = showAll ? allMatches : allMatches?.slice(0, 5);

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
            No upcoming or live matches found
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

        {allMatches?.length > 5 && !showAll && (
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