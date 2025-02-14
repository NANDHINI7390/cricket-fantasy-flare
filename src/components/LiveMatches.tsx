import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Match {
  id: string;
  match_id: string;
  team1_name: string;
  team1_logo: string;
  team2_name: string;
  team2_logo: string;
  score1: string | null;
  score2: string | null;
  overs: string | null;
  status: string;
  time: string | null;
}

const LiveMatches = () => {
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

  const { data: matches, error, isLoading } = useQuery({
    queryKey: ['cricket-matches'],
    queryFn: async () => {
      try {
        const { data: matches, error } = await supabase.functions.invoke<Match[]>('fetch-cricket-matches', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (error) {
          // Handle specific error types
          if (error.message?.includes('429')) {
            throw new Error('Rate limit exceeded. Please try again later.');
          }
          if (error.message?.includes('500')) {
            throw new Error('Server error. Please try again later.');
          }
          console.error('Error from edge function:', error);
          throw error;
        }
        
        return matches || [];
      } catch (err) {
        console.error('Error fetching matches:', err);
        throw err;
      }
    },
    refetchInterval: 60000, // Increased to 1 minute to reduce API calls
    retry: (failureCount, error: any) => {
      // Don't retry on rate limit errors
      if (error?.message?.includes('429')) {
        return false;
      }
      // Retry other errors up to 3 times
      return failureCount < 3;
    },
    // Add stale time to reduce unnecessary refetches
    staleTime: 30000, // Data considered fresh for 30 seconds
    // Add cache time to keep data around
    gcTime: 5 * 60 * 1000, // Keep cached data for 5 minutes
  });

  const handleViewDetails = (matchId: string) => {
    setSelectedMatch(matchId);
    toast.info("Detailed match insights coming soon!");
    console.log("Viewing match details for match:", matchId);
  };

  if (error) {
    // Show user-friendly error message
    const errorMessage = error instanceof Error ? error.message : 'Failed to load matches';
    toast.error(errorMessage);
    
    return (
      <div className="py-16 px-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Unable to Load Matches</h2>
        <p className="text-gray-600">{errorMessage}</p>
      </div>
    );
  }

  return (
    <section className="py-16 px-6 bg-gradient-to-b from-purple-200 to-pink-100">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">
          Live <span className="text-purple-600">Cricket Matches</span>
        </h2>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {matches?.map((match, index) => (
              <motion.div
                key={match.match_id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ scale: 1.03, boxShadow: "0px 10px 20px rgba(0,0,0,0.2)" }}
                className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500 relative"
              >
                {/* Match Status Badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold text-white ${
                      match.status === "LIVE"
                        ? "bg-gradient-to-r from-red-500 to-pink-500"
                        : "bg-gradient-to-r from-gray-500 to-gray-700"
                    }`}
                  >
                    {match.status}
                  </span>
                </div>

                {/* Match Info */}
                <div className="flex flex-col space-y-4">
                  {/* Teams */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={match.team1_logo || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8iD-oFluh_Uzf831rNAMcw1okMOUUJbwYww&s"} 
                        alt={match.team1_name} 
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8iD-oFluh_Uzf831rNAMcw1okMOUUJbwYww&s";
                        }}
                      />
                      <span className="text-lg font-semibold text-gray-800">{match.team1_name}</span>
                    </div>
                    {match.status === "LIVE" && (
                      <span className="text-lg font-medium text-green-600">
                        {match.score1 || ''}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={match.team2_logo || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLVdU8NLPu6IR5ry9JOBz0fHvvuV-Bzd4liA&s"} 
                        alt={match.team2_name} 
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLVdU8NLPu6IR5ry9JOBz0fHvvuV-Bzd4liA&s";
                        }}
                      />
                      <span className="text-lg font-semibold text-gray-800">{match.team2_name}</span>
                    </div>
                    {match.status === "LIVE" && (
                      <span className="text-lg font-medium text-gray-700">
                        {match.score2 || ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Time or Overs */}
                <p className="text-gray-600 mt-4 text-sm">
                  {match.status === "LIVE" ? `${match.overs} overs` : match.time}
                </p>

                {/* View Details Button */}
                <motion.button
                  onClick={() => handleViewDetails(match.match_id)}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center justify-center w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  View Details <ChevronRight className="ml-2 w-5 h-5" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Selected Match Info */}
        {selectedMatch && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 p-6 bg-white rounded-xl shadow-lg text-center"
          >
            <h3 className="text-xl font-semibold text-gray-900">
              Match {selectedMatch} details coming soon!
            </h3>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default LiveMatches;
