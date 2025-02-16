import React, { useEffect, useState } from "react";

const LiveMatch = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch("https://yefrdovbporfjdhfojyx.supabase.co/functions/v1/cricket-matches");
        if (!response.ok) {
          throw new Error("Failed to fetch matches");
        }
        const data = await response.json();
        setMatches(data);
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
    <div className="live-matches-container">
      <h2>Live & Upcoming Matches</h2>

      {loading ? (
        <p>Loading matches...</p>
      ) : matches.length === 0 ? (
        <p>No live matches available.</p>
      ) : (
        <div className="matches-list">
          {matches.map((match) => (
            <div key={match.match_id} className="match-card">
              <div className="team-info">
                <img src={match.team1_logo} alt={match.team1_name} />
                <h3>{match.team1_name}</h3>
                <p>{match.score1 || "Yet to bat"}</p>
              </div>
              <div className="vs">VS</div>
              <div className="team-info">
                <img src={match.team2_logo} alt={match.team2_name} />
                <h3>{match.team2_name}</h3>
                <p>{match.score2 || "Yet to bat"}</p>
              </div>
              <p className="match-status">{match.status}</p>
              {match.time && <p className="match-time">Starts at: {match.time}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveMatch;
