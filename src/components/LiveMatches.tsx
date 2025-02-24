
import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";

// API Keys & URLs
const API_KEY = "fc3aea268114e8b77bd56fb22bcd5f1709b67913cefa9041f3faf99e4e8c3aca";
const BASE_URL = "https://apiv2.api-cricket.com/cricket/";

const fetchLiveMatches = async () => {
  try {
    const response = await fetch(`${BASE_URL}?method=get_livescore&APIkey=${API_KEY}`);
    const data = await response.json();

    if (data.result && data.result.length > 0) {
      return data.result;
    }
    console.warn("No live matches found.");
    return [];
  } catch (error) {
    console.error("Error fetching live matches:", error);
    return [];
  }
};

const fetchUpcomingMatches = async () => {
  try {
    const response = await fetch(`${BASE_URL}?method=get_events&APIkey=${API_KEY}&date_start=2025-02-24&date_stop=2025-02-26`);
    const data = await response.json();

    if (data.result && data.result.length > 0) {
      return data.result;
    }
    console.warn("No upcoming matches found.");
    return [];
  } catch (error) {
    console.error("Error fetching upcoming matches:", error);
    return [];
  }
};

const LiveMatches = () => {
  const [showAllLive, setShowAllLive] = useState(false);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);

  const { data: liveMatches, isLoading: loadingLive } = useQuery({
    queryKey: ["liveMatches"],
    queryFn: fetchLiveMatches,
    refetchInterval: 60000,
  });

  const { data: upcomingMatches, isLoading: loadingUpcoming } = useQuery({
    queryKey: ["upcomingMatches"],
    queryFn: fetchUpcomingMatches,
    refetchInterval: 300000,
  });

  const visibleLiveMatches = showAllLive ? liveMatches : liveMatches?.slice(0, 3);
  const visibleUpcomingMatches = showAllUpcoming ? upcomingMatches : upcomingMatches?.slice(0, 3);

  // Render match cards
  const renderMatchCard = (match, isLive) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 80, damping: 12 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-white/10 backdrop-blur-lg border border-white/20">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-2 items-center">
            <div className="text-center">
              <img
                src={match.home_team_logo || "/placeholder.svg"}
                alt={match.event_home_team}
                className="w-12 h-12 mx-auto mb-1 object-contain"
              />
              <h3 className="font-semibold text-xs text-white">{match.event_home_team}</h3>
              {isLive && <p className="text-xs text-gray-300">{match.event_home_final_result}</p>}
            </div>

            <div className="text-center">
              <div className="text-lg font-bold text-white">VS</div>
              <motion.span 
                className={`px-2 py-0.5 rounded text-xs ${
                  isLive 
                    ? "bg-red-500/20 text-red-200 backdrop-blur-sm" 
                    : "bg-blue-500/20 text-blue-200 backdrop-blur-sm"
                }`}
                animate={{ scale: isLive ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 2, repeat: isLive ? Infinity : 0 }}
              >
                {isLive ? "LIVE" : "Upcoming"}
              </motion.span>
            </div>

            <div className="text-center">
              <img
                src={match.away_team_logo || "/placeholder.svg"}
                alt={match.event_away_team}
                className="w-12 h-12 mx-auto mb-1 object-contain"
              />
              <h3 className="font-semibold text-xs text-white">{match.event_away_team}</h3>
              {isLive && <p className="text-xs text-gray-300">{match.event_away_final_result}</p>}
            </div>
          </div>

          <div className="mt-2 text-center text-xs text-gray-300">
            <p>{isLive ? `${match.event_stadium}` : `${match.event_date_start}`}</p>
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
            <CardTitle className="text-2xl sm:text-3xl font-bold text-white">Live Matches</CardTitle>
          </CardHeader>
        </motion.div>

        {loadingLive ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        ) : liveMatches?.length ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleLiveMatches?.map((match) => renderMatchCard(match, true))}
            </div>
            {liveMatches.length > 3 && (
              <div className="text-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAllLive(!showAllLive)}
                  className="bg-white/10 text-white hover:bg-white/20 border-white/20"
                >
                  {showAllLive ? (
                    <><ChevronUp className="w-4 h-4 mr-2" /> Show Less</>
                  ) : (
                    <><ChevronDown className="w-4 h-4 mr-2" /> Show More ({liveMatches.length - 3} matches)</>
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-200">No live matches available</div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 10 }}
          className="text-center mt-8 mb-6"
        >
          <CardHeader className="text-center mb-4">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-white">Upcoming Matches</CardTitle>
          </CardHeader>
        </motion.div>

        {loadingUpcoming ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        ) : upcomingMatches?.length ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleUpcomingMatches?.map((match) => renderMatchCard(match, false))}
            </div>
            {upcomingMatches.length > 3 && (
              <div className="text-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAllUpcoming(!showAllUpcoming)}
                  className="bg-white/10 text-white hover:bg-white/20 border-white/20"
                >
                  {showAllUpcoming ? (
                    <><ChevronUp className="w-4 h-4 mr-2" /> Show Less</>
                  ) : (
                    <><ChevronDown className="w-4 h-4 mr-2" /> Show More ({upcomingMatches.length - 3} matches)</>
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-200">No upcoming matches available</div>
        )}
      </div>
    </section>
  );
};

export default LiveMatches;
