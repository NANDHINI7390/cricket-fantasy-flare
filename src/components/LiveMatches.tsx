import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, ChevronRight, X } from "lucide-react";
import { Card } from "@/components/ui/card";

const SPORTS_DB_API_URL =
  "https://www.thesportsdb.com/api/v1/json/3/eventsseason.php?id=5587&s=2025";
const CRICK_API_URL = "https://api.cricapi.com/v1/currentMatches?apikey=YOUR_API_KEY";

const TEAM_FLAGS = {
  India: "https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg",
  Australia: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Flag_of_Australia.svg",
  England: "https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg",
  Pakistan: "https://upload.wikimedia.org/wikipedia/commons/3/32/Flag_of_Pakistan.svg",
  "South Africa": "https://upload.wikimedia.org/wikipedia/commons/a/af/Flag_of_South_Africa.svg",
  "New Zealand": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Flag_of_New_Zealand.svg",
  "Sri Lanka": "https://upload.wikimedia.org/wikipedia/commons/1/11/Flag_of_Sri_Lanka.svg",
  Bangladesh: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Flag_of_Bangladesh.svg",
  Afghanistan: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Afghanistan.svg",
};

const getCountryFlagUrl = (country) => {
  const cleanedCountry = country.replace(/ Cricket| National Team/gi, "").trim();
  return TEAM_FLAGS[cleanedCountry] || "/placeholder.svg";
};

const fetchMatches = async () => {
  try {
    const response = await fetch(SPORTS_DB_API_URL);
    const data = await response.json();
    console.log("Fetched matches:", data); // Debug log
    return data?.events || [];
  } catch (error) {
    console.error("Error fetching matches:", error);
    return [];
  }
};

const fetchLiveScores = async () => {
  try {
    const response = await fetch(CRICK_API_URL);
    const data = await response.json();
    console.log("Fetched live scores:", data); // Debug log
    
    if (data.status === "failure") {
      console.error("CricAPI Error:", data.reason);
      return [];
    }
    
    return data?.data || [];
  } catch (error) {
    console.error("Error fetching live scores:", error);
    return [];
  }
};

const convertToLocalTime = (date, time) => {
  if (!date || !time) return "TBA";

  const utcDateTime = new Date(`${date}T${time}Z`);
  return utcDateTime.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

const LiveMatches = () => {
  const [showAll, setShowAll] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const { data: matches, isLoading: isMatchesLoading } = useQuery({
    queryKey: ["matches"],
    queryFn: fetchMatches,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const { data: liveScores, isLoading: isScoresLoading } = useQuery({
    queryKey: ["liveScores"],
    queryFn: fetchLiveScores,
    refetchInterval: 30000, // More frequent updates for live scores (30 seconds)
    retry: 2, // Retry failed requests twice
  });

  const allMatches = matches?.map((match) => {
    const liveMatchData = liveScores?.find(
      (score) =>
        score.teamInfo?.some((team) => match.strHomeTeam.includes(team.name)) &&
        score.teamInfo?.some((team) => match.strAwayTeam.includes(team.name))
    );

    const isLive = match.strStatus === "Live" || liveMatchData;

    return {
      ...match,
      matchTime: convertToLocalTime(match.dateEvent, match.strTime),
      liveScore: liveMatchData
        ? {
            homeScore: liveMatchData.score[0]?.r || "0",
            homeWickets: liveMatchData.score[0]?.w || "0",
            awayScore: liveMatchData.score[1]?.r || "0",
            awayWickets: liveMatchData.score[1]?.w || "0",
            status: "Live",
          }
        : { 
            status: isLive ? "Live" : "Upcoming"
          },
    };
  });

  const visibleMatches = showAll ? allMatches : allMatches?.slice(0, 5);

  return (
    <section className="min-h-screen py-8 px-4 bg-gradient-to-r from-purple-100 to-pink-100">
      <div className="container mx-auto max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-8">
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
            {visibleMatches?.map((match) => (
              <motion.div key={match.idEvent} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 80, damping: 12 }}>
                <Card className="overflow-hidden bg-white rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="p-6 relative">
                    <div className="absolute top-2 right-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        match.liveScore?.status === "Live" ? "bg-red-500 text-white" : "bg-gray-600 text-white"
                      }`}>
                        {match.liveScore?.status}
                      </span>
                    </div>

                    <div className="space-y-4 mt-4">
                      <div className="space-y-3">
                        {[match.strHomeTeam, match.strAwayTeam].map((team, index) => (
                          <div className="flex items-center justify-between" key={index}>
                            <div className="flex items-center space-x-3">
                              <img src={getCountryFlagUrl(team)} alt={team} className="w-8 h-8 rounded-full object-cover border-2 border-gray-100" />
                              <span className="text-lg font-semibold text-gray-800">{team.replace(" Cricket", "")}</span>
                            </div>
                            {match.liveScore?.status === "Live" && (
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

                      <button className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity" onClick={() => setSelectedMatch(match)}>
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
              <p><strong>Time:</strong> {selectedMatch.matchTime}</p>
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
