
import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";

// API URL for ICC Champions Trophy 2025
const API_URL = "https://www.thesportsdb.com/api/v1/json/3/eventsseason.php?id=5587&s=2025";

// Predefined team logos (fallback if API doesn't return logos)
const teamLogos = {
  India: "https://upload.wikimedia.org/wikipedia/en/7/77/India_national_cricket_team_logo.svg",
  Australia: "https://upload.wikimedia.org/wikipedia/en/b/b3/Australia_national_cricket_team_logo.svg",
  England: "https://upload.wikimedia.org/wikipedia/en/2/2a/England_cricket_team_logo.svg",
  Pakistan: "https://upload.wikimedia.org/wikipedia/en/c/c4/Pakistan_cricket_team_logo.svg",
  SouthAfrica: "https://upload.wikimedia.org/wikipedia/en/1/19/Cricket_South_Africa_logo.svg",
  NewZealand: "https://upload.wikimedia.org/wikipedia/en/3/3a/New_Zealand_Cricket_logo.svg",
  SriLanka: "https://upload.wikimedia.org/wikipedia/en/a/a3/Sri_Lanka_Cricket_logo.svg",
  Bangladesh: "https://upload.wikimedia.org/wikipedia/en/4/4a/Bangladesh_Cricket_Board_Logo.svg",
};

// Fetch ICC Champions Trophy 2025 Matches
const fetchChampionsTrophyMatches = async () => {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (data && data.events) {
      return data.events;
    }
    console.warn("No ICC Champions Trophy 2025 matches found.");
    return [];
  } catch (error) {
    console.error("Error fetching matches:", error);
    return [];
  }
};

const LiveMatches = () => {
  const [showAll, setShowAll] = useState(false);

  const { data: matches, isLoading } = useQuery({
    queryKey: ["championsTrophyMatches"],
    queryFn: fetchChampionsTrophyMatches,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const visibleMatches = showAll ? matches : matches?.slice(0, 5);

  const renderMatchCard = (match) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 80, damping: 12 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-white/10 backdrop-blur-lg border border-white/20">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-2 items-center">
            {/* Home Team */}
            <div className="text-center">
              <img
                src={match.strHomeTeamBadge || teamLogos[match.strHomeTeam] || "/placeholder.svg"}
                alt={match.strHomeTeam}
                className="w-12 h-12 mx-auto mb-1 object-contain"
              />
              <h3 className="font-semibold text-xs text-white">{match.strHomeTeam}</h3>
            </div>

            {/* VS + Match Status */}
            <div className="text-center">
              <div className="text-lg font-bold text-white">VS</div>
              <motion.span 
                className={`px-2 py-0.5 rounded text-xs ${
                  match.strStatus === "Live" 
                    ? "bg-red-500/20 text-red-200 backdrop-blur-sm" 
                    : "bg-blue-500/20 text-blue-200 backdrop-blur-sm"
                }`}
                animate={{ scale: match.strStatus === "Live" ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 2, repeat: match.strStatus === "Live" ? Infinity : 0 }}
              >
                {match.strStatus === "Live" ? "LIVE" : "Upcoming"}
              </motion.span>
            </div>

            {/* Away Team */}
            <div className="text-center">
              <img
                src={match.strAwayTeamBadge || teamLogos[match.strAwayTeam] || "/placeholder.svg"}
                alt={match.strAwayTeam}
                className="w-12 h-12 mx-auto mb-1 object-contain"
              />
              <h3 className="font-semibold text-xs text-white">{match.strAwayTeam}</h3>
            </div>
          </div>

          {/* Match Date / Stadium */}
          <div className="mt-2 text-center text-xs text-gray-300">
            <p>{match.strStatus === "Live" ? `${match.strVenue}` : `${match.dateEvent}`}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <section
      className="py-8 px-4"
      style={{ background: "linear-gradient(135deg, #8E44AD, #E91E63)" }}
    >
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 10 }}
          className="text-center mb-6"
        >
          <CardHeader className="text-center mb-4">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-white">ICC Champions Trophy 2025</CardTitle>
          </CardHeader>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        ) : matches?.length ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleMatches?.map((match) => renderMatchCard(match))}
            </div>
            {matches.length > 5 && (
              <div className="text-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAll(!showAll)}
                  className="bg-white/10 text-white hover:bg-white/20 border-white/20"
                >
                  {showAll ? (
                    <><ChevronUp className="w-4 h-4 mr-2" /> Show Less</>
                  ) : (
                    <><ChevronDown className="w-4 h-4 mr-2" /> Show More ({matches.length - 5} matches)</>
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-200">No matches available</div>
        )}
      </div>
    </section>
  );
};

export default LiveMatches;
