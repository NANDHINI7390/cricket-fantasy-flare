
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Match {
  id: string;
  team1: string;
  team2: string;
  venue: string;
  time: string;
  status: "upcoming" | "live" | "completed";
  score1?: string;
  score2?: string;
}

const LiveMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real application, you would fetch this data from an API
      // For now, we'll use mock data
      const mockMatches: Match[] = [
        {
          id: "1",
          team1: "Mumbai Indians",
          team2: "Chennai Super Kings",
          venue: "Wankhede Stadium, Mumbai",
          time: "7:30 PM IST",
          status: "live",
          score1: "186/4 (18.2 ov)",
          score2: "165/6 (20 ov)"
        },
        {
          id: "2",
          team1: "Royal Challengers Bangalore",
          team2: "Kolkata Knight Riders",
          venue: "M. Chinnaswamy Stadium, Bangalore",
          time: "3:30 PM IST",
          status: "upcoming"
        },
        {
          id: "3",
          team1: "Delhi Capitals",
          team2: "Rajasthan Royals",
          venue: "Arun Jaitley Stadium, Delhi",
          time: "7:30 PM IST",
          status: "completed",
          score1: "179/3 (20 ov)",
          score2: "182/6 (19.4 ov)"
        }
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setMatches(mockMatches);
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError("Failed to fetch match data. Please try again later.");
      toast.error("Failed to load matches");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleRefresh = () => {
    fetchMatches();
    toast.info("Refreshing match data...");
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-gray-900"
          >
            Live Matches
          </motion.h2>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 text-red-700 rounded-md border border-red-200">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((skeleton) => (
              <div 
                key={`skeleton-${skeleton}`}
                className="bg-white rounded-lg shadow-md p-6 animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-6"></div>
                <div className="flex justify-between items-center">
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-gray-500">{match.venue}</span>
                    <span 
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        match.status === 'live' 
                          ? 'bg-green-100 text-green-800' 
                          : match.status === 'upcoming' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {match.status === 'live' ? 'LIVE' : match.status === 'upcoming' ? 'UPCOMING' : 'COMPLETED'}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {match.team1} vs {match.team2}
                  </h3>
                  
                  <p className="text-gray-600 mb-4">
                    {match.time}
                  </p>
                  
                  {(match.status === 'live' || match.status === 'completed') && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{match.team1}</span>
                        <span className="font-bold">{match.score1}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{match.team2}</span>
                        <span className="font-bold">{match.score2}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <button 
                      className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {!isLoading && matches.length === 0 && !error && (
          <div className="text-center py-8">
            <p className="text-gray-600">No matches available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default LiveMatches;
