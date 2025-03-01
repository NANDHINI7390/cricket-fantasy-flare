
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

  // Fetch upcoming matches from SportsDB
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

    // **Filter only ICC Champions Trophy matches**
    if (!match.strEvent.includes("ICC Champions Trophy")) return null;

    // **Filter past matches older than 24 hours**
    const isFinishedWithin24Hours = match.strStatus === "Match Finished" && hoursSinceMatch <= 24;
    if (!isFinishedWithin24Hours && matchDateTime < now) return null;

    // Find corresponding live score data
    const liveMatchData = liveScores?.find((score) => 
      teamsMatch(match.strHomeTeam, score?.teams?.[0]) &&
      teamsMatch(match.strAwayTeam, score?.teams?.[1])
    );

    // Determine if the match is live
    const isLive = liveMatchData && match.strStatus !== "Match Finished";

    // Extract match scores
    let homeScore = "0", homeWickets = "0";
    let awayScore = "0", awayWickets = "0";
    let matchStatus = isLive ? "Live" : match.strStatus;

    if (liveMatchData) {
      const homeScoreEntry = liveMatchData.score?.find((s) =>
        teamsMatch(s.inning, match.strHomeTeam)
      );
      const awayScoreEntry = liveMatchData.score?.find((s) =>
        teamsMatch(s.inning, match.strAwayTeam)
      );

      homeScore = homeScoreEntry?.r?.toString() || "0";
      homeWickets = homeScoreEntry?.w?.toString() || "0";
      awayScore = awayScoreEntry?.r?.toString() || "0";
      awayWickets = awayScoreEntry?.w?.toString() || "0";

      matchStatus = liveMatchData.status || "Live";
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
        matchDetails: liveMatchData 
      },
    };
  };

  // Process and filter matches
  const filteredMatches = matches?.map(processMatchData).filter(Boolean);
  const visibleMatches = showAll ? filteredMatches : filteredMatches?.slice(0, 5);

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
              <MatchCard key={match.idEvent} match={match} onViewDetails={setSelectedMatch} />
            ))}
          </div>
        )}

        {filteredMatches?.length > 5 && !showAll && (
          <div className="mt-4 text-center">
            <button onClick={() => setShowAll(true)} className="text-purple-600 hover:text-purple-700 font-semibold">
              Show More Matches
            </button>
          </div>
        )}
      </div>

      {selectedMatch && <MatchDetailsModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />}
    </section>
  );
};

export default LiveMatches;
