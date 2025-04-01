import React, { useEffect, useState } from "react";
import { fetchLiveMatches } from "../utils/cricket-api";
import "./LiveMatches.css"; // Import CSS file for styling

const getFlagUrl = (team) => `https://countryflagsapi.com/png/${team.replace(" ", "-").toLowerCase()}`;

const LiveMatches = () => {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchMatches = async () => {
    try {
      const data = await fetchLiveMatches();
      setMatches(data);
    } catch (error) {
      console.error("Error fetching matches:", error);
    }
  };

  return (
    <div className="live-matches-container">
      <h2 className="title">Live Cricket Matches</h2>
      {matches.length > 0 ? (
        <div className="matches-grid">
          {matches.map((match) => (
            <div key={match.id} className="match-card">
              <h3>{match.name}</h3>
              <p className="match-info">{match.matchType} | {match.venue}</p>
              <p className="match-status">{match.status}</p>
              <div className="teams">
                {match.teams.map((team, index) => (
                  <div key={index} className="team">
                    <img src={getFlagUrl(team)} alt={team} className="team-flag" />
                    <span className="team-name">{team}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-matches">No live matches available.</p>
      )}
    </div>
  );
};

export default LiveMatches;
