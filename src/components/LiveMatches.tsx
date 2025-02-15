
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";
import { ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

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

const RETRY_DELAY = 5000; // 5 seconds
const MAX_RETRIES = 3;

const LiveMatches = () => {
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Reset retry count after successful fetch
  const resetRetryCount = useCallback(() => {
    setRetryCount(0);
  }, []);

  // Fetch matches with proper error handling
  const { data: matches, error, isLoading, refetch } = useQuery({
    queryKey: ['cricket-matches'],
    queryFn: async () => {
      try {
        const { data: matches, error } = await supabase.functions.invoke<Match[]>('fetch-cricket-matches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (error) {
          // Handle rate limiting
          if (error.message?.includes('429')) {
            toast.error('Rate limit exceeded. Please try again later.');
            throw new Error('RATE_LIMIT');
          }
          
          // Handle server errors
          if (error.message?.includes('500')) {
            throw new Error('SERVER_ERROR');
          }

          console.error('Error from edge function:', error);
          throw error;
        }

        resetRetryCount();
        return matches || [];
      } catch (err) {
        console.error('Error fetching matches:', err);
        
        // Handle retry logic for specific errors
        if (err.message === 'SERVER_ERROR' && retryCount < MAX_RETRIES) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            refetch();
          }, RETRY_DELAY);
        }
        
        throw err;
      }
    },
    refetchInterval: (query) => {
      // Adjust refetch interval based on errors
      if (query.state.error?.message === 'RATE_LIMIT') {
        return 60000; // 1 minute if rate limited
      }
      return 30000; // 30 seconds normally
    },
    retry: (failureCount, error: any) => {
      // Don't retry on rate limit errors
      if (error?.message === 'RATE_LIMIT') {
        return false;
      }
      // Retry other errors up to MAX_RETRIES times
      return failureCount < MAX_RETRIES;
    },
    staleTime: 15000, // Data considered fresh for 15 seconds
    gcTime: 5 * 60 * 1000, // Keep cached data for 5 minutes
  });

  const handleViewDetails = useCallback((matchId: string) => {
    setSelectedMatch(matchId);
    toast.info("Detailed match insights coming soon!");
    console.log("Viewing match details for match:", matchId);
  }, []);

  // Show error state
  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load matches';
    
    return (
      <div className="py-16 px-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Unable to Load Matches</h2>
        <p className="text-gray-600 mb-4">{errorMessage}</p>
        <button 
          onClick={() => refetch()}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
        >
          Try Again
        </button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-8 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {matches?.map((match, index) => (
                <motion.div
                  key={match.match_id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ delay: index * 0.15 }}
                  whileHover={{ scale: 1.03 }}
                  className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500 relative"
                >
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

                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={match.team1_logo || "/placeholder.svg"} 
                          alt={match.team1_name} 
                          className="w-8 h-8 rounded-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
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
                          src={match.team2_logo || "/placeholder.svg"} 
                          alt={match.team2_name} 
                          className="w-8 h-8 rounded-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
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

                  <p className="text-gray-600 mt-4 text-sm">
                    {match.status === "LIVE" ? `${match.overs} overs` : match.time}
                  </p>

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
          </AnimatePresence>
        )}

        {selectedMatch && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
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
