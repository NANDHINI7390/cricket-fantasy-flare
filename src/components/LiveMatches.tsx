
import React, { useEffect, useState } from "react";
import { fetchLiveMatches, fetchLiveScores, getTeamLogoUrl, formatMatchStatus, categorizeMatches, formatTossInfo, CricketMatch } from "../utils/cricket-api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Award, BarChart, ChevronLeft, ChevronRight } from "lucide-react";
import MatchCard from "./MatchCard";
import MatchDetailsModal from "./MatchDetailsModal";
import { toast } from "sonner";

const LiveMatches = () => {
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<CricketMatch[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<CricketMatch | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const matchesPerPage = 3;

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

      console.log("Fetched matches:", liveMatches.length);
      console.log("Fetched scores:", liveScores.length);

      // Combine data from both API calls
      const updatedMatches = liveMatches.map((match) => {
        const scoreData = liveScores.find((s) => s.id === match.id);
        return { 
          ...match, 
          score: scoreData?.score || match.score || [],
          teams: match.teams || scoreData?.teams || [],
          teamInfo: match.teamInfo || scoreData?.teamInfo || [],
          localDateTime: match.localDateTime || scoreData?.localDateTime
        };
      });

      // Apply improved categorization
      const categorizedMatches = categorizeMatches(updatedMatches);
      
      // Sort matches - first Live, then Upcoming by time, then Completed
      const sortedMatches = categorizedMatches.sort((a, b) => {
        // Priority order: Live > Upcoming > Completed
        const categoryOrder = { 'Live': 0, 'Upcoming': 1, 'Completed': 2 };
        const categoryDiff = 
          categoryOrder[a.category as keyof typeof categoryOrder] - 
          categoryOrder[b.category as keyof typeof categoryOrder];
        
        if (categoryDiff !== 0) return categoryDiff;
        
        // For matches with same category:
        if (a.category === 'Upcoming' && b.category === 'Upcoming') {
          // Sort upcoming matches by start time (closer first)
          const timeA = a.dateTimeGMT ? new Date(a.dateTimeGMT).getTime() : 0;
          const timeB = b.dateTimeGMT ? new Date(b.dateTimeGMT).getTime() : 0;
          return timeA - timeB;
        }
        
        if (a.category === 'Live' && b.category === 'Live') {
          // For live matches, prioritize by match type (T20 > ODI > Test)
          const typeOrder = { 't20': 0, 'odi': 1, 'test': 2, 'other': 3 };
          const typeA = a.matchType?.toLowerCase() || 'other';
          const typeB = b.matchType?.toLowerCase() || 'other';
          return (typeOrder[typeA as keyof typeof typeOrder] || 3) - 
                 (typeOrder[typeB as keyof typeof typeOrder] || 3);
        }
        
        return 0;
      });
      
      setMatches(sortedMatches);
      setFilteredMatches(sortedMatches);
      setLastUpdated(new Date().toLocaleTimeString());
      setCurrentPage(1); // Reset to first page when new data loads
      
      if (sortedMatches.length === 0) {
        toast.info("No matches are currently available. Check back later!");
      } else {
        toast.success(`Found ${sortedMatches.length} cricket matches`);
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
    setCurrentPage(1); // Reset to first page when filter changes
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

  // Calculate pagination values
  const indexOfLastMatch = currentPage * matchesPerPage;
  const indexOfFirstMatch = indexOfLastMatch - matchesPerPage;
  const currentMatches = filteredMatches.slice(indexOfFirstMatch, indexOfLastMatch);
  const totalPages = Math.ceil(filteredMatches.length / matchesPerPage);

  // Pagination controls
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderPagination = () => {
    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className="flex items-center gap-1"
        >
          <ChevronLeft size={16} />
          Prev
        </Button>
        
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 p-0 ${
                currentPage === page 
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white' 
                  : 'text-gray-700'
              }`}
            >
              {page}
            </Button>
          ))}
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight size={16} />
        </Button>
      </div>
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
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
          Live & Upcoming Matches
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            Last updated: {lastUpdated}
          </span>
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
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {["All", "Live", "Upcoming", "Completed"].map((category) => (
          <Button
            key={category}
            variant={activeFilter === category ? "default" : "outline"}
            onClick={() => filterMatches(category)}
            size="sm"
            className={activeFilter === category ? 
              `bg-gradient-to-r ${
                category === "Live" ? "from-red-600 to-pink-600" : 
                category === "Upcoming" ? "from-indigo-600 to-blue-600" : 
                category === "Completed" ? "from-green-600 to-teal-600" :
                "from-purple-600 to-violet-600"
              } text-white border-none` : 
              "text-gray-700 hover:bg-gradient-to-r hover:from-purple-600/10 hover:to-blue-500/10"
            }
          >
            {category}
            {category !== "All" && (
              <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
                {matches.filter(m => m.category === category).length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {filteredMatches.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentMatches.map((match) => (
              <MatchCard 
                key={match.id} 
                match={match} 
                onViewDetails={handleViewDetails} 
              />
            ))}
          </div>
          
          {totalPages > 1 && renderPagination()}
          
          <div className="text-center mt-6 text-sm text-gray-500">
            Showing {indexOfFirstMatch + 1}-{Math.min(indexOfLastMatch, filteredMatches.length)} of {filteredMatches.length} matches
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No matches found</h3>
          <p className="text-gray-500 mb-6">There are no matches available for the selected category.</p>
          <Button 
            onClick={fetchMatches} 
            variant="outline"
            className="bg-gradient-to-r from-purple-600/20 to-blue-500/20 hover:from-purple-600/30 hover:to-blue-600/30"
          >
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
