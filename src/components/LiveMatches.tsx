
import React, { useEffect, useState } from "react";
import { fetchLiveMatches, fetchLiveScores, getTeamLogoUrl, formatMatchStatus } from "../utils/cricket-api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";

const LiveMatches = () => {
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const liveMatches = await fetchLiveMatches();
      const liveScores = await fetchLiveScores();

      if (!Array.isArray(liveMatches) || !Array.isArray(liveScores)) {
        throw new Error("Invalid response format from API");
      }

      const updatedMatches = liveMatches.map((match) => {
        const scoreData = liveScores.find((s) => s.id === match.id);
        return { ...match, score: scoreData?.score || [] };
      });

      const categorizedMatches = categorizeMatches(updatedMatches);
      setMatches(categorizedMatches);
      setFilteredMatches(categorizedMatches);
    } catch (error) {
      console.error("Fetch Matches Error:", error);
      setMatches([]);
      setFilteredMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const categorizeMatches = (matches) => {
    const now = new Date();
    return matches
      .map((match) => {
        if (!match?.dateTimeGMT) return null;
        
        const matchTime = new Date(match.dateTimeGMT);
        const hoursDiff = (matchTime - now) / (1000 * 60 * 60);
        
        // Live matches
        if (match.status === "Live" || 
            (match.matchStarted && !match.matchEnded)) {
          return { ...match, category: "Live" };
        }
        
        // Upcoming matches (within next 48 hours)
        if (hoursDiff > 0 && hoursDiff <= 48) {
          return { ...match, category: "Upcoming" };
        }
        
        // Recently completed matches (within last 24 hours)
        if (hoursDiff < 0 && hoursDiff >= -24 && match.matchEnded) {
          return { ...match, category: "Completed" };
        }
        
        return null;
      })
      .filter(Boolean);
  };

  const filterMatches = (category) => {
    setActiveFilter(category);
    setFilteredMatches(
      category === "All" 
        ? matches 
        : matches.filter((match) => match.category === category)
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Live & Upcoming Matches</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchMatches}
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </Button>
      </div>

      <div className="flex gap-2 mb-6">
        {["All", "Live", "Upcoming", "Completed"].map((category) => (
          <Button
            key={category}
            variant={activeFilter === category ? "default" : "outline"}
            onClick={() => filterMatches(category)}
            size="sm"
          >
            {category}
          </Button>
        ))}
      </div>

      {filteredMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match) => (
            <Card key={match.id} className="overflow-hidden">
              <div className="p-4 space-y-4">
                <Badge variant={match.category === "Live" ? "destructive" : "secondary"}>
                  {match.category}
                </Badge>
                
                <div className="space-y-4">
                  {[0, 1].map((index) => {
                    const team = match.teamInfo?.[index];
                    const teamScore = match.score?.find(
                      (s) => s.inning?.includes(team?.name || match.teams?.[index])
                    );

                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {team && (
                            <img
                              src={getTeamLogoUrl(team)}
                              alt={team.name}
                              className="w-8 h-8 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "https://placehold.co/32x32?text=Team";
                              }}
                            />
                          )}
                          <span className="font-medium">
                            {team?.name || match.teams?.[index]}
                          </span>
                        </div>
                        {teamScore && (
                          <span className="text-sm font-mono">
                            {teamScore.r}/{teamScore.w} ({teamScore.o})
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="text-sm text-gray-600">
                  <div className="mb-1">
                    {new Date(match.dateTimeGMT).toLocaleString()}
                  </div>
                  {match.venue && (
                    <div className="text-xs truncate">
                      {match.venue}
                    </div>
                  )}
                </div>

                <div className="text-sm font-medium text-gray-900">
                  {formatMatchStatus(match.status, match.matchStarted, match.matchEnded)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No matches found for the selected category.
        </div>
      )}
    </div>
  );
};

export default LiveMatches;
