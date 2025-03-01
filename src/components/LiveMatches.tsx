
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

  // Fetch upcoming and live matches from SportsDB
  const { data: matches, isLoading: isMatchesLoading } = useQuery({
    queryKey: ["matches"],
    queryFn: fetchMatches,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Fetch live scores from CrickAPI
  const { data: liveScores, isLoading: isScoresLoading } = useQuery({
    queryKey: ["liveScores"],
    queryFn: fetchLiveScores,
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 2,
  });

  const processMatchData = (match) => {
    if (!match || !match.strEvent) return null;

    const now = new Date();
    const matchDateTime = new Date(`${match.dateEvent}T${match.strTime}Z`);
    const hoursSinceMatch = (now - matchDateTime) / (1000 * 60 * 60);

    // Check if match is within the relevant timeframe
    const isUpcoming = matchDateTime > now;
    const isFinishedWithin24Hours = match.strStatus === "Match Finished" && hoursSinceMatch <= 24;
    
    // Skip matches that are finished more than 24 hours ago
    if (!isUpcoming && !isFinishedWithin24Hours && matchDateTime < now) return null;

    // Find corresponding live score data with improved matching
    const liveMatchData = liveScores?.find((score) => {
      // Try matching with teamInfo first
      if (score.teamInfo && score.teamInfo.length >= 2) {
        return (
          (teamsMatch(match.strHomeTeam, score.teamInfo[0].name) && 
           teamsMatch(match.strAwayTeam, score.teamInfo[1].name)) ||
          (teamsMatch(match.strHomeTeam, score.teamInfo[1].name) && 
           teamsMatch(match.strAwayTeam, score.teamInfo[0].name))
        );
      }
      
      // Fall back to matching with teams array
      if (score.teams && score.teams.length >= 2) {
        return (
          (teamsMatch(match.strHomeTeam, score.teams[0]) && 
           teamsMatch(match.strAwayTeam, score.teams[1])) ||
          (teamsMatch(match.strHomeTeam, score.teams[1]) && 
           teamsMatch(match.strAwayTeam, score.teams[0]))
        );
      }
      
      return false;
    });

    // Determine match status
    let matchStatus;
    if (liveMatchData && liveMatchData.matchStarted && !liveMatchData.matchEnded) {
      matchStatus = "Live";
    } else if (isFinishedWithin24Hours || (liveMatchData && liveMatchData.matchEnded)) {
      matchStatus = "Finished";
    } else {
      matchStatus = "Upcoming";
    }

    // Extract and process scores
    let homeScore = "0", homeWickets = "0";
    let awayScore = "0", awayWickets = "0";

    if (liveMatchData && liveMatchData.score && liveMatchData.score.length > 0) {
      // Try to find home team score
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

      // Try to find away team score
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
      
      // Use the detailed status from cricAPI if available
      if (liveMatchData.status) {
        matchStatus = liveMatchData.matchStarted && !liveMatchData.matchEnded ? "Live" : matchStatus;
      }
    }

    return {
      ...match,
      matchTime: convertToLocalTime(match.dateEvent, match.strTime),
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

  // Process matches and sort them (Live first, then Upcoming, then Finished)
  const processedMatches = matches?.map(processMatchData).filter(Boolean) || [];
  
  const sortedMatches = [...processedMatches].sort((a, b) => {
    const statusOrder = { Live: 0, Upcoming: 1, Finished: 2 };
    const statusA = statusOrder[a.liveScore.status] || 1;
    const statusB = statusOrder[b.liveScore.status] || 1;
    
    // First sort by status priority
    if (statusA !== statusB) return statusA - statusB;
    
    // For matches with the same status, sort by date/time
    return new Date(a.dateEvent + 'T' + a.strTime).getTime() - 
           new Date(b.dateEvent + 'T' + b.strTime).getTime();
  });

  const visibleMatches = showAll ? sortedMatches : sortedMatches.slice(0, 5);

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
            No upcoming or live matches found for ICC Champions Trophy
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

        {sortedMatches?.length > 5 && !showAll && (
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
