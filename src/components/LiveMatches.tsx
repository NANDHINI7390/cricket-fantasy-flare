
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const LiveMatch = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        console.log("Fetching matches...");
    
        const response = await fetch("https://api.cricapi.com/v1/matches?apikey=a52ea237-09e7-4d69-b7cc-e4f0e79fb8ae&offset=0&per_page=5", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response:", data);

        const matchesList = data.data || [];
        
        if (matchesList.length === 0) {
          toast.error("No matches found");
        } else {
          setMatches(matchesList);
        }
      } catch (error) {
        console.error("Error fetching matches:", error);
        toast.error("Failed to fetch matches");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatches();

    const interval = setInterval(fetchMatches, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">Live & Upcoming Matches</h2>

      {loading ? (
        <div className="text-center dark:text-gray-300">Loading matches...</div>
      ) : matches.length === 0 ? (
        <div className="text-center dark:text-gray-300">No live matches available.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <div key={match.id || match.match_id || Math.random()} className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 p-6 transition-colors duration-300">
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="text-center">
                  <img 
                    src={match.teamInfo?.[0]?.img || '/placeholder.svg'} 
                    alt={match.teamInfo?.[0]?.name || "Team 1"} 
                    className="w-16 h-16 mx-auto mb-2 object-contain"
                  />
                  <h3 className="font-semibold text-sm dark:text-white">{match.teamInfo?.[0]?.name || "Team 1"}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{match.score?.[0]?.r || "Yet to bat"}</p>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold dark:text-white">VS</div>
                  <div className="mt-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      match.status === 'live' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {match.status || "Upcoming"}
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <img 
                    src={match.teamInfo?.[1]?.img || '/placeholder.svg'} 
                    alt={match.teamInfo?.[1]?.name || "Team 2"} 
                    className="w-16 h-16 mx-auto mb-2 object-contain"
                  />
                  <h3 className="font-semibold text-sm dark:text-white">{match.teamInfo?.[1]?.name || "Team 2"}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{match.score?.[1]?.r || "Yet to bat"}</p>
                </div>
              </div>
              
              {match.dateTimeGMT && (
                <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                  Starts at: {new Date(match.dateTimeGMT).toLocaleString()}
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
