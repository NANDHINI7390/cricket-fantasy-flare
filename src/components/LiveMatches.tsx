
import React, { useEffect, useState } from "react";
import { fetchLiveMatches, fetchLiveScores, getTeamLogoUrl, formatMatchStatus, categorizeMatches, formatTossInfo, CricketMatch } from "../utils/cricket-api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Award } from "lucide-react";
import MatchCard from "./MatchCard";
import MatchDetailsModal from "./MatchDetailsModal";
import { toast } from "sonner";

const LiveMatches = () => {
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<CricketMatch[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<CricketMatch | null>(null);

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

      // Combine data from both API calls
      const updatedMatches = liveMatches.map((match) => {
        const scoreData = liveScores.find((s) => s.id === match.id);
        return { 
          ...match, 
          score: scoreData?.score || match.score || [],
          teams: match.teams || scoreData?.teams || [],
          teamInfo: match.teamInfo || scoreData?.teamInfo || []
        };
      });

      const categorizedMatches = categorizeMatches(updatedMatches);
      setMatches(categorizedMatches);
      setFilteredMatches(categorizedMatches);
      
      if (categorizedMatches.length === 0) {
        toast.info("No matches are currently available. Check back later!");
      }
    } catch (error) {
      console.error("Fetch Matches Error:", error);
      setMatches([]);
      setFilteredMatches([]);
      toast.error("Failed to fetch match data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filterMatches = (category: string) => {
    setActiveFilter(category);
    setFilteredMatches(
      category === "All" 
        ? matches 
        : matches.filter((match) => match.category === category)
    );
  };

  const handleViewDetails = (match: CricketMatch) => {
    setSelectedMatch(match);
  };

  const closeModal = () => {
    setSelectedMatch(null);
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

      <div className="flex gap-2 mb-6 flex-wrap">
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
            <MatchCard 
              key={match.id} 
              match={match} 
              onViewDetails={handleViewDetails} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No matches found</h3>
          <p className="text-gray-500 mb-6">There are no matches available for the selected category.</p>
          <Button onClick={fetchMatches} variant="outline">
            <RefreshCw size={16} className="mr-2" />
            Refresh Data
          </Button>
        </div>
      )}

      {selectedMatch && (
        <MatchDetailsModal match={selectedMatch} onClose={closeModal} />
      )}
    </div>
  );
};

export default LiveMatches;
