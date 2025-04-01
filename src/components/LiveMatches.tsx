import React, { useEffect, useState } from "react";
import { fetchLiveMatches } from "../utils/cricket-api"; // Import the function from the correct path

const LiveMatches = () => {
  const [matches, setMatches] = useState<CricketMatch[]>([]);

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchMatches = async () => {
    try {
      const data = await fetchLiveMatches(); // Call the imported function
      setMatches(data);
    } catch (error) {
      console.error("Error fetching matches:", error);
    }
  };

  return (
    <div>
      <h2>Live Matches</h2>
      {matches.length > 0 ? (
        matches.map((match) => (
          <div key={match.id} className="match-card">
            <h3>{match.name}</h3>
            <p>Type: {match.matchType}</p>
            <p>Status: {match.status}</p>
            <p>Venue: {match.venue}</p>
            <p>Teams: {match.teams.join(" vs ")}</p>
          </div>
        ))
      ) : (
        <p>No matches found.</p>
      )}
    </div>
  );
};

export default LiveMatches;
