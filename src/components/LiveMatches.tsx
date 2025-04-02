
import React, { useEffect, useState } from "react";
import { fetchLiveMatches, fetchLiveScores, getCountryFlagUrl, type CricketMatch } from "../utils/cricket-api";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Flag, MapPin, Filter, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MatchWithCategory extends CricketMatch {
  category: 'Live' | 'Upcoming' | 'Completed';
}

const MatchCard: React.FC<{ match: MatchWithCategory }> = ({ match }) => {
  const team1 = match.teamInfo?.find(t => t.name === match.teams[0]) || { name: match.teams[0], img: "" };
  const team2 = match.teamInfo?.find(t => t.name === match.teams[1]) || { name: match.teams[1], img: "" };
  
  const team1Score = match.score?.find(s => s.inning?.includes(team1.name));
  const team2Score = match.score?.find(s => s.inning?.includes(team2.name));
  
  const getBadgeColor = () => {
    switch (match.category) {
      case 'Live': return "bg-red-500 hover:bg-red-600";
      case 'Upcoming': return "bg-green-500 hover:bg-green-600";
      case 'Completed': return "bg-gray-500 hover:bg-gray-600";
      default: return "bg-blue-500 hover:bg-blue-600";
    }
  };

  const formatMatchTime = (dateTimeString?: string) => {
    if (!dateTimeString) return "Time not available";
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-2"
    >
      <Card className="h-full overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 bg-white rounded-xl">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center text-sm text-gray-500">
              <CalendarDays size={16} className="mr-1" />
              <span>{formatMatchTime(match.dateTimeGMT)}</span>
            </div>
            <Badge className={`${getBadgeColor()} text-white`}>
              {match.category}
            </Badge>
          </div>
          
          <div className="space-y-4">
            {/* Team 1 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <img 
                  src={team1.img || getCountryFlagUrl(team1.name)} 
                  alt={team1.name} 
                  className="w-8 h-6 object-cover rounded shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getCountryFlagUrl(team1.name);
                  }}
                />
                <span className="font-medium">{team1.name}</span>
              </div>
              {team1Score && (
                <span className="font-bold">
                  {team1Score.r}/{team1Score.w || 0} ({team1Score.o || 0})
                </span>
              )}
            </div>
            
            {/* Team 2 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <img 
                  src={team2.img || getCountryFlagUrl(team2.name)} 
                  alt={team2.name} 
                  className="w-8 h-6 object-cover rounded shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getCountryFlagUrl(team2.name);
                  }}
                />
                <span className="font-medium">{team2.name}</span>
              </div>
              {team2Score && (
                <span className="font-bold">
                  {team2Score.r}/{team2Score.w || 0} ({team2Score.o || 0})
                </span>
              )}
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <MapPin size={14} className="mr-1" />
              <span className="truncate max-w-[150px]">{match.venue}</span>
            </div>
            <div className="flex items-center">
              <Flag size={14} className="mr-1" />
              <span>{match.matchType}</span>
            </div>
          </div>
          
          {match.status && match.status !== match.category && (
            <div className="mt-3 text-sm text-center px-2 py-1 bg-gray-100 rounded-md">
              {match.status}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

const LiveMatches: React.FC = () => {
  const [matches, setMatches] = useState<MatchWithCategory[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<MatchWithCategory[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const liveMatches = await fetchLiveMatches();
      const liveScores = await fetchLiveScores();

      const updatedMatches = liveMatches.map((match) => {
        const scoreData = liveScores.find((s) => s.id === match.id);
        return { ...match, score: scoreData?.score || [] };
      });
      
      const categorizedMatches = categorizeMatches(updatedMatches);
      setMatches(categorizedMatches);
      setFilteredMatches(categorizedMatches);
    } catch (error) {
      console.error("Fetch Matches Error:", error);
      setError("Failed to load matches. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const categorizeMatches = (matches: CricketMatch[]): MatchWithCategory[] => {
    return matches.map((match) => {
      const currentTime = new Date();
      const matchTime = match.dateTimeGMT ? new Date(match.dateTimeGMT) : new Date();

      if (match.status === "Match started" || match.status === "Live") {
        return { ...match, category: "Live" };
      } else if (matchTime > currentTime || match.status === "Match not started") {
        return { ...match, category: "Upcoming" };
      } else {
        return { ...match, category: "Completed" };
      }
    });
  };

  const filterMatches = (category: string) => {
    setActiveFilter(category);
    if (category === "All") {
      setFilteredMatches(matches);
    } else {
      const filtered = matches.filter((match) => match.category === category);
      setFilteredMatches(filtered);
    }
  };

  const filterCategories = ["All", "Live", "Upcoming", "Completed"];

  return (
    <section className="py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold mb-2 text-gray-800">Cricket Matches</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay updated with live scores, upcoming fixtures, and match results from around the world.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
          <div className="flex items-center mr-2 text-gray-700">
            <Filter size={18} className="mr-1" />
            <span>Filter:</span>
          </div>
          
          {filterCategories.map((category) => (
            <button
              key={category}
              onClick={() => filterMatches(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === category
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Loading matches...</span>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">
            <p>{error}</p>
            <button 
              onClick={fetchMatches}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap -mx-2">
            <AnimatePresence>
              {filteredMatches.length > 0 ? (
                filteredMatches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full text-center py-10"
                >
                  <p className="text-gray-500">No {activeFilter.toLowerCase()} matches found.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
};

export default LiveMatches;
