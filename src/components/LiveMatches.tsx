import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

// API URLs and team flags setup
const SPORTS_DB_API_URL =
  "https://www.thesportsdb.com/api/v1/json/3/eventsseason.php?id=5587&s=2025";
const CRICK_API_URL = "https://api.cricapi.com/v1/currentMatches?apikey=YOUR_API_KEY";

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

// Fetch upcoming and live matches from TheSportsDB
const fetchMatches = async () => {
  try {
    const response = await fetch(SPORTS_DB_API_URL);
    const data = await response.json();
    return data?.events || [];
  } catch (error) {
    console.error("Error fetching matches:", error);
    return [];
  }
};

// Fetch live scores from CrickAPI
const fetchLiveScores = async () => {
  try {
    const response = await fetch(CRICK_API_URL);
    const data = await response.json();
    return data?.data || [];
  } catch (error) {
    console.error("Error fetching live scores:", error);
    return [];
  }
};

const LiveMatches = () => {
  const [showAll, setShowAll] = useState(false);

  // Fetch matches from TheSportsDB
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
  });

  // Filter live matches from TheSportsDB
  const liveMatches = matches?.filter((match) => match.strStatus === "Live") || [];

  // Merge live scores with live matches
  const mergedLiveMatches = liveMatches?.map((match) => {
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
  }) || [];

  // Combine upcoming and merged live matches
  const allMatches = [...mergedLiveMatches, ...(matches?.filter((match) => match.strStatus !== "Live") || [])];

  const visibleMatches = showAll ? allMatches : allMatches.slice(0, 5);

  return (
    <section 
      className="min-h-screen py-8 px-4"
      style={{
        background: "linear-gradient(135deg, #f3e7ff 0%, #e9d5ff 100%)",
      }}
    >
      <div className="container mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
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
                <Card className="overflow-hidden bg-white rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    <div className="space-y-4">
                      {/* Teams */}
                      <div className="space-y-3">
                        {/* Home Team */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <img
                              src={getCountryFlagUrl(match.strHomeTeam)}
                              alt={match.strHomeTeam}
                              className="w-8 h-8 rounded-full object-cover border-2 border-gray-100"
                            />
                            <span className="text-lg font-semibold text-gray-800">
                              {match.strHomeTeam.replace(" Cricket", "")}
                            </span>
                          </div>
                          {match.liveScore?.status === "Live" && (
                            <span className="text-lg font-bold text-gray-800">
                              {match.liveScore.homeScore}/{match.liveScore.homeWickets}
                            </span>
                          )}
                        </div>

                        {/* Away Team */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <img
                              src={getCountryFlagUrl(match.strAwayTeam)}
                              alt={match.strAwayTeam}
                              className="w-8 h-8 rounded-full object-cover border-2 border-gray-100"
                            />
                            <span className="text-lg font-semibold text-gray-800">
                              {match.strAwayTeam.replace(" Cricket", "")}
                            </span>
                          </div>
                          {match.liveScore?.status === "Live" && (
                            <span className="text-lg font-bold text-gray-800">
                              {match.liveScore.awayScore}/{match.liveScore.awayWickets}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Match Info */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>
                          {match.liveScore?.status === "Live" 
                            ? `${match.strVenue}`
                            : new Date(match.dateEvent).toLocaleDateString(undefined, {
                                weekday: 'long',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                          }
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          match.liveScore?.status === "Live"
                            ? "bg-red-500 text-white"
                            : "bg-gray-600 text-white"
                        }`}>
                          {match.liveScore?.status === "Live" ? "LIVE" : "UPCOMING"}
                        </span>
                      </div>

                      {/* View Details Button */}
                      <button className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity">
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
    </section>
  );
};

export default LiveMatches;
