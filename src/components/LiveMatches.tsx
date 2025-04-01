import React, { useEffect, useState } from "react";
import { fetchLiveMatches } from "../utils/cricket-api"; // Update this path as needed

const LiveMatches = () => {
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const data = await fetchLiveMatches();
      setMatches(data);
      setFilteredMatches(data);
    } catch (error) {
      console.error("Fetch Matches Error:", error);
    }
  };

  const filterMatches = (category) => {
    setActiveFilter(category);
    if (category === "All") {
      setFilteredMatches(matches);
    } else {
      const filtered = matches.filter((match) =>
        match.matchType.includes(category)
      );
      setFilteredMatches(filtered);
    }
  };

  return (
    <div className="live-matches-container">
      <h2 className="title">Live Matches</h2>
      <div className="filter-buttons">
        {["All", "Live", "International", "ICC", "IPL"].map((category) => (
          <button
            key={category}
            className={`filter-btn ${activeFilter === category ? "active" : ""}`}
            onClick={() => filterMatches(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="matches-list">
        {filteredMatches.length > 0 ? (
          filteredMatches.map((match) => (
            <div key={match.id} className="match-card">
              <h3 className="match-title">{match.name}</h3>
              <p className="match-info">Type: {match.matchType}</p>
              <p className="match-info status">Status: {match.status}</p>
              <p className="match-info venue">Venue: {match.venue}</p>
              <p className="teams">
                Teams: {match.teams.map((team, index) => (
                  <span key={index} className="team-info">
                    <img
                      src={`https://flagsapi.com/${team.slice(0, 2).toUpperCase()}/flat/64.png`}
                      alt={team}
                      className="team-flag"
                    />
                    {team}
                  </span>
                ))}
              </p>
            </div>
          ))
        ) : (
          <p className="no-matches">No matches found.</p>
        )}
      </div>

      <style jsx>{`
        .live-matches-container {
          max-width: 900px;
          margin: auto;
          padding: 20px;
          text-align: center;
          font-family: Arial, sans-serif;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .filter-buttons {
          margin-bottom: 20px;
        }
        .filter-btn {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 10px 15px;
          margin: 5px;
          cursor: pointer;
          border-radius: 5px;
          transition: 0.3s;
        }
        .filter-btn.active,
        .filter-btn:hover {
          background-color: #0056b3;
        }
        .matches-list {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          justify-content: center;
        }
        .match-card {
          background: white;
          border-radius: 8px;
          padding: 15px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          width: 250px;
          text-align: left;
        }
        .match-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .match-info {
          font-size: 14px;
          margin: 5px 0;
        }
        .status {
          font-weight: bold;
          color: red;
        }
        .venue {
          font-style: italic;
        }
        .teams {
          margin-top: 10px;
          font-size: 14px;
        }
        .team-info {
          display: flex;
          align-items: center;
          gap: 5px;
          margin: 5px 0;
        }
        .team-flag {
          width: 24px;
          height: 24px;
          border-radius: 50%;
        }
        .no-matches {
          color: red;
          font-size: 18px;
        }
      `}</style>
    </div>
  );
};

export default LiveMatches;
