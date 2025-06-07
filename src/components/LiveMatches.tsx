
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
  const matchesPerPage = 6; // Show more matches per page

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      console.log("Starting to fetch cricket data...");
      
      const [liveMatches, liveScores] = await Promise.all([
        fetchLiveMatches(),
        fetchLiveScores()
      ]);

      console.log("Raw API data - Live matches:", liveMatches?.length || 0);
      console.log("Raw API data - Live scores:", liveScores?.length || 0);

      if (!Array.isArray(liveMatches) && !Array.isArray(liveScores)) {
        throw new Error("No valid data from cricket APIs");
      }

      // Combine data from both APIs, prioritizing live matches
      const allMatches = [...(liveMatches || [])];
      
      // Add additional matches from scores if not already present
      if (Array.isArray(liveScores)) {
        liveScores.forEach(scoreMatch => {
          const existingMatch = allMatches.find(m => m.id === scoreMatch.id);
          if (!existingMatch) {
            allMatches.push(scoreMatch);
          } else {
            // Merge score data with existing match
            Object.assign(existingMatch, {
              score: scoreMatch.score || existingMatch.score,
              teams: scoreMatch.teams || existingMatch.teams,
              teamInfo: scoreMatch.teamInfo || existingMatch.teamInfo
            });
          }
        });
      }

      console.log("Combined matches count:", allMatches.length);

      // Enhanced team info extraction for upcoming matches
      const enhancedMatches = allMatches.map(match => {
        // If teamInfo is missing but teams array exists, create basic team info
        if (!match.teamInfo && match.teams && match.teams.length >= 2) {
          match.teamInfo = match.teams.map(teamName => ({
            name: teamName,
            shortname: teamName.substring(0, 3).toUpperCase(),
            img: `/placeholder.svg` // Default placeholder
          }));
        }
        
        // Ensure we have team names even if teamInfo is partial
        if (match.teamInfo && match.teamInfo.length < 2 && match.teams) {
          match.teams.forEach((teamName, index) => {
            if (!match.teamInfo![index]) {
              match.teamInfo!.push({
                name: teamName,
                shortname: teamName.substring(0, 3).toUpperCase(),
                img: `/placeholder.svg`
              });
            }
          });
        }
        
        return match;
      });

      // Apply categorization with better logging
      const categorizedMatches = categorizeMatches(enhancedMatches);
      
      console.log("Categorized matches:", {
        total: categorizedMatches.length,
        live: categorizedMatches.filter(m => m.category === 'Live').length,
        upcoming: categorizedMatches.filter(m => m.category === 'Upcoming').length,
        completed: categorizedMatches.filter(m => m.category === 'Completed').length
      });

      // Sort matches - Live first, then Upcoming, then Recent Completed
      const sortedMatches = categorizedMatches.sort((a, b) => {
        const categoryOrder = { 'Live': 0, 'Upcoming': 1, 'Completed': 2 };
        const categoryDiff = 
          categoryOrder[a.category as keyof typeof categoryOrder] - 
          categoryOrder[b.category as keyof typeof categoryOrder];
        
        if (categoryDiff !== 0) return categoryDiff;
        
        // Within same category, sort by time
        if (a.dateTimeGMT && b.dateTimeGMT) {
          const timeA = new Date(a.dateTimeGMT).getTime();
          const timeB = new Date(b.dateTimeGMT).getTime();
          
          if (a.category === 'Upcoming') {
            return timeA - timeB; // Upcoming: soonest first
          } else {
            return timeB - timeA; // Others: most recent first
          }
        }
        
        return 0;
      });
      
      console.log("Final sorted matches:", sortedMatches.length);
      
      setMatches(sortedMatches);
      setFilteredMatches(sortedMatches);
      setLastUpdated(new Date().toLocaleTimeString());
      setCurrentPage(1);
      
      if (sortedMatches.length === 0) {
        toast.info("No cricket matches found. The API might be experiencing issues.");
      } else {
        toast.success(`Loaded ${sortedMatches.length} cricket matches successfully!`);
      }
    } catch (error) {
      console.error("Comprehensive fetch error:", error);
      setMatches([]);
      setFilteredMatches([]);
      toast.error(`Failed to load cricket data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filterMatches = (category: string) => {
    console.log(`Filtering matches by category: ${category}`);
    setActiveFilter(category);
    setCurrentPage(1);
    
    const filtered = category === "All" 
      ? matches 
      : matches.filter((match) => match.category === category);
    
    console.log(`Filtered results: ${filtered.length} matches`);
    setFilteredMatches(filtered);
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
    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
      const pages = [];
      const showEllipsis = totalPages > 7;
      
      if (!showEllipsis) {
        // Show all pages if 7 or fewer
        for (let i = 1; i <= totalPages; i++) {
          pages.push(
            <Button
              key={i}
              variant={currentPage === i ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(i)}
              className={`min-w-[32px] h-8 p-0 ${
                currentPage === i 
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-0' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {i}
            </Button>
          );
        }
      } else {
        // Smart pagination with ellipsis
        pages.push(
          <Button
            key={1}
            variant={currentPage === 1 ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentPage(1)}
            className={`min-w-[32px] h-8 p-0 ${
              currentPage === 1 
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-0' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            1
          </Button>
        );

        if (currentPage > 3) {
          pages.push(
            <span key="ellipsis1" className="text-gray-400 px-2">...</span>
          );
        }

        const startPage = Math.max(2, currentPage - 1);
        const endPage = Math.min(totalPages - 1, currentPage + 1);

        for (let i = startPage; i <= endPage; i++) {
          pages.push(
            <Button
              key={i}
              variant={currentPage === i ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(i)}
              className={`min-w-[32px] h-8 p-0 ${
                currentPage === i 
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-0' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {i}
            </Button>
          );
        }

        if (currentPage < totalPages - 2) {
          pages.push(
            <span key="ellipsis2" className="text-gray-400 px-2">...</span>
          );
        }

        pages.push(
          <Button
            key={totalPages}
            variant={currentPage === totalPages ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            className={`min-w-[32px] h-8 p-0 ${
              currentPage === totalPages 
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-0' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            {totalPages}
          </Button>
        );
      }
      
      return pages;
    };

    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="flex items-center gap-1 h-8 px-3"
          >
            <ChevronLeft size={14} />
            <span className="hidden sm:inline">Prev</span>
          </Button>
          
          <div className="flex items-center gap-1">
            {renderPageNumbers()}
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 h-8 px-3"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={14} />
          </Button>
        </div>
        
        <div className="text-xs text-gray-500 text-center sm:text-left">
          Showing {indexOfFirstMatch + 1}-{Math.min(indexOfLastMatch, filteredMatches.length)} of {filteredMatches.length} matches
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
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
            <span className="hidden sm:inline">Refresh</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {currentMatches.map((match) => (
              <MatchCard 
                key={match.id} 
                match={match} 
                onViewDetails={handleViewDetails} 
              />
            ))}
          </div>
          
          {renderPagination()}
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
