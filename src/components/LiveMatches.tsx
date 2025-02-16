
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const LiveMatch = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        console.log("Fetching matches...");
        const { data, error } = await supabase.functions.invoke('fetch-cricket-matches', {
          method: 'POST'
        });

        if (error) {
          console.error("Supabase function error:", error);
          toast.error("Failed to fetch matches");
          throw error;
        }

        console.log("Received matches:", data);
        setMatches(data || []);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();

    // Refresh every 60 seconds
    const interval = setInterval(fetchMatches, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Live & Upcoming Matches</h2>

      {loading ? (
        <div className="text-center">Loading matches...</div>
      ) : matches.length === 0 ? (
        <div className="text-center">No live matches available.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <div key={match.match_id} className="bg-white rounded-lg shadow-md p-6">
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="text-center">
                  <img 
                    src={match.team1_logo || '/placeholder.svg'} 
                    alt={match.team1_name} 
                    className="w-16 h-16 mx-auto mb-2 object-contain"
                  />
                  <h3 className="font-semibold text-sm">{match.team1_name}</h3>
                  <p className="text-sm text-gray-600">{match.score1 || "Yet to bat"}</p>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold">VS</div>
                  <div className="mt-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      match.status === 'LIVE' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {match.status}
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <img 
                    src={match.team2_logo || '/placeholder.svg'} 
                    alt={match.team2_name} 
                    className="w-16 h-16 mx-auto mb-2 object-contain"
                  />
                  <h3 className="font-semibold text-sm">{match.team2_name}</h3>
                  <p className="text-sm text-gray-600">{match.score2 || "Yet to bat"}</p>
                </div>
              </div>
              
              {match.time && (
                <div className="mt-4 text-center text-sm text-gray-600">
                  Starts at: {match.time}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveMatch;
