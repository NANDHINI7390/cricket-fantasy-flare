
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, ChevronRight, X } from "lucide-react";
import { Card } from "@/components/ui/card";

// API URLs and team flags setup
const SPORTS_DB_API_URL =
  "https://www.thesportsdb.com/api/v1/json/3/eventsseason.php?id=5587&s=2025";
const CRICK_API_URL = "https://api.cricapi.com/v1/currentMatches?apikey=a52ea237-09e7-4d69-b7cc-e4f0e79fb8ae ";

// Static flag URLs for cricket teams
const TEAM_FLAGS = {
  "India": "https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg",
  "Australia": "https://upload.wikimedia.org/wikipedia/commons/b/b9/Flag_of_Australia.svg",
  "England": "https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg",
  "Pakistan": "https://upload.wikimedia.org/wikipedia/commons/3/32/Flag_of_Pakistan.svg",
  "South Africa": "https://upload.wikimedia.org/wikipedia/commons/a/af/Flag_of_South_Africa.svg",
  "New Zealand": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Flag_of_New_Zealand.svg",
  "Sri Lanka": "https://upload.wikimedia.org/wikipedia/commons/1/11/Flag_of_Sri_Lanka.svg",
  "Bangladesh": "https://upload.wikimedia.org/wikipedia/commons/f/f9/Flag_of_Bangladesh.svg"
};

// Function to get country flag URL
const getCountryFlagUrl = (country) => {
  const cleanCountry = country.replace(" Cricket", "");
  return TEAM_FLAGS[cleanCountry] || "/placeholder.svg";
};

// Fetch matches from TheSportsDB
const fetchMatches = async () => {
  const response = await fetch(SPORTS_DB_API_URL);
  const data = await response.json();
  return data?.events || [];
};

// Fetch live scores from CrickAPI
const fetchLiveScores = async () => {
  const response = await fetch(CRICK_API_URL);
  const data = await response.json();
  return data?.data || [];
};

const LiveMatches = () => {
  const [showAll, setShowAll] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Fetch matches
  const { data: matches, isLoading: isMatchesLoading } = useQuery({
    queryKey: ["matches"],
    queryFn: fetchMatches,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Fetch live scores
  const { data: liveScores, isLoading: isScoresLoading } = useQuery({
    queryKey: ["liveScores"],
    queryFn: fetchLiveScores,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Filter live matches
  const liveMatches = matches?.filter((match) => match.strStatus === "Live") || [];

  // Merge live scores with live matches
  const mergedLiveMatches = liveMatches.map((match) => {
    const liveMatchData = liveScores?.find(
      (score) =>
        score.teamInfo.some((team) => team.name.includes(match.strHomeTeam)) &&
        score.teamInfo.some((team) => team.name.includes(match.strAwayTeam))
    );

    return {
      ...match,
      liveScore: liveMatchData
        ? {
            homeScore: liveMatchData.score[0]?.r || "N/A",
            homeWickets: liveMatchData.score[0]?.w || "N/A",
            awayScore: liveMatchData.score[1]?.r || "N/A",
            awayWickets: liveMatchData.score[1]?.w || "N/A",
            status: "Live",
          }
        : { status: "Live" },
    };
  });

  // Combine live and upcoming matches
  const allMatches = [...mergedLiveMatches, ...(matches?.filter((match) => match.strStatus !== "Live") || [])];

  const visibleMatches = showAll ? allMatches : allMatches.slice(0, 5);

  return (
    <section className="min-h-screen py-8 px-4 bg-gradient-to-r from-purple-200 to-pink-100">
      <div className="container mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold">
            <span className="text-gray-900">Live</span>{" "}
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Cricket Matches
            </span>
          </h1>
        </motion.div>

        {isMatchesLoading || isScoresLoading ? (
          <div className="flex justify-center">
            <Loader2 className="animate-spin text-purple-600" size={28} />
          </div>
        ) : (
          <div className="space-y-4">
            {visibleMatches.map((match) => (
              <motion.div
                key={match.idEvent}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 80, damping: 12 }}
              >
                <Card className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="relative">
                    {/* Status Label - Now at the top */}
                    <div className="absolute -top-3 right-6">
                      <span className="px-4 py-1 rounded-full text-white text-sm bg-red-500 shadow-md">
                        {match.liveScore?.status === "Live" ? "LIVE" : "UPCOMING"}
                      </span>
                    </div>

                    <div className="p-6 space-y-4">
                      {/* Teams */}
                      <div className="space-y-3 mt-2">
                        <div className="flex justify-between">
                          <span className="font-semibold text-lg">{match.strHomeTeam}</span>
                          <span className="font-semibold text-lg">{match.strAwayTeam}</span>
                        </div>
                      </div>

                      {/* Match Info */}
                      <div className="text-sm text-gray-600">
                        <span>{match.strVenue}</span>
                      </div>

                      {/* View Details Button */}
                      <button
                        className="w-full py-3 px-4 bg-purple-600 text-white rounded-xl font-semibold flex justify-center items-center space-x-2 hover:opacity-90 transition-opacity"
                        onClick={() => setSelectedMatch(match)}
                      >
                        <span>View Details</span>
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Match Details Modal */}
      {selectedMatch && (
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
                onClick={() => setSelectedMatch(null)}
                className="hover:bg-gray-100 p-1 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2">
              <p><strong>Venue:</strong> {selectedMatch.strVenue}</p>
              <p><strong>League:</strong> {selectedMatch.strLeague}</p>
              <p><strong>Season:</strong> {selectedMatch.strSeason}</p>
              {selectedMatch.liveScore?.status === "Live" && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Live Score</h3>
                  <p>{selectedMatch.strHomeTeam}: {selectedMatch.liveScore.homeScore}/{selectedMatch.liveScore.homeWickets}</p>
                  <p>{selectedMatch.strAwayTeam}: {selectedMatch.liveScore.awayScore}/{selectedMatch.liveScore.awayWickets}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
};

export default LiveMatches;
