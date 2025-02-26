
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// API URLs
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
      className="py-8 px-4"
      style={{
        background: "linear-gradient(135deg, #1a1f2e, #2d364d)",
        boxShadow: "inset 0 0 100px rgba(148, 163, 184, 0.05)",
      }}
    >
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 10 }}
          className="text-center mb-6"
        >
          <CardHeader className="text-center mb-4">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-slate-200">
              ICC Champions Trophy 2025
            </CardTitle>
          </CardHeader>
        </motion.div>

        {isMatchesLoading || isScoresLoading ? (
          <div className="flex justify-center">
            <Loader2 className="animate-spin text-slate-400" size={28} />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleMatches.map((match) => (
              <motion.div
                key={match.idEvent}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 80, damping: 12 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-lg border border-slate-700/30">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-3 gap-2 items-center">
                      {/* Home Team */}
                      <div className="text-center">
                        <div className="bg-slate-700/20 rounded-full p-2 mb-1">
                          <img
                            src={getCountryFlagUrl(match.strHomeTeam)}
                            alt={match.strHomeTeam}
                            className="w-12 h-12 mx-auto object-contain"
                          />
                        </div>
                        <h3 className="font-semibold text-xs text-slate-200">{match.strHomeTeam.replace(" Cricket", "")}</h3>
                      </div>

                      {/* VS + Match Status */}
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-200">VS</div>
                        <motion.span
                          className={`px-2 py-0.5 rounded text-xs ${
                            match.liveScore?.status === "Live"
                              ? "bg-emerald-500/20 text-emerald-200 backdrop-blur-sm border border-emerald-400/20"
                              : "bg-amber-500/10 text-amber-200 backdrop-blur-sm border border-amber-400/10"
                          }`}
                          animate={{ scale: match.liveScore?.status === "Live" ? [1, 1.1, 1] : 1 }}
                          transition={{ duration: 2, repeat: match.liveScore?.status === "Live" ? Infinity : 0 }}
                        >
                          {match.liveScore?.status === "Live" ? "LIVE" : "Upcoming"}
                        </motion.span>
                      </div>

                      {/* Away Team */}
                      <div className="text-center">
                        <div className="bg-slate-700/20 rounded-full p-2 mb-1">
                          <img
                            src={getCountryFlagUrl(match.strAwayTeam)}
                            alt={match.strAwayTeam}
                            className="w-12 h-12 mx-auto object-contain"
                          />
                        </div>
                        <h3 className="font-semibold text-xs text-slate-200">{match.strAwayTeam.replace(" Cricket", "")}</h3>
                      </div>
                    </div>

                    {/* Live Score Display */}
                    {match.liveScore?.status === "Live" && (
                      <div className="mt-2 text-center text-xs text-slate-400">
                        <p>{match.strVenue}</p>
                        <p>
                          {match.strHomeTeam.replace(" Cricket", "")}: {match.liveScore.homeScore}/{match.liveScore.homeWickets} vs{" "}
                          {match.strAwayTeam.replace(" Cricket", "")}: {match.liveScore.awayScore}/{match.liveScore.awayWickets}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Show More / Show Less Button */}
        {allMatches.length > 5 && (
          <div className="flex justify-center mt-6">
            <Button
              onClick={() => setShowAll(!showAll)}
              variant="outline"
              className="flex items-center space-x-2 text-slate-300 border-slate-700 hover:bg-slate-800"
            >
              {showAll ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              <span>{showAll ? "Show Less" : "Show More"}</span>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default LiveMatches;
