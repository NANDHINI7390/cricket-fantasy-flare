import React, { useEffect, useState } from "react";
import { fetchLiveMatches } from "../utils/cricket-api"; // Ensure the path is correct

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
      console.log("Fetched Matches:", data); // Debugging log
      setMatches(data);
      setFilteredMatches(data);
    } catch (error) {
      console.error("Fetch Matches Error:", error);
    }
  };

  const filterMatches = (category: string) => {
    setActiveFilter(category);
    if (category === "All") {
      setFilteredMatches(matches);
    } else if (category === "Upcoming") {
      setFilteredMatches(matches.filter((match) => match.status === "Upcoming"));
    } else if (category === "Live") {
      setFilteredMatches(matches.filter((match) => match.status === "Live"));
    } else {
      setFilteredMatches(matches.filter((match) => match.matchType.includes(category)));
    }
  };

  const getCountryFlag = (country: string) => {
    return `https://flagsapi.com/${country.slice(0, 2).toUpperCase()}/flat/64.png`;
  };

  return (
    <div className="live-matches-container">
      <h2 className="title">Live & Upcoming Matches</h2>
      <div className="filter-buttons">
        {["All", "Live", "Upcoming", "International", "ICC", "IPL"].map((category) => (
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
              <p className={`match-status ${match.status.toLowerCase()}`}>{match.status}</p>
              <p className="match-info venue">Venue: {match.venue}</p>
              <p className="match-info date-time">
                {match.dateEvent} | {match.strTime}
              </p>
              <div className="teams">
                {match.teams.map((team, index) => (
                  <div key={index} className="team-info">
                    <img src={getCountryFlag(team)} alt={team} className="team-flag" />
                    <span>{team}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="no-matches">No matches found under "{activeFilter}" category.</p>
        )}
      </div>

      <style jsx>{`
        .live-matches-container {
          max-width: 900px;
          margin: auto;
          padding: 20px;
          text-align: center;
          font-family: Arial, sans-serif;
          background: linear-gradient(to bottom right, #f0f4f8, #d1e3ff);
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .title {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #0056b3;
        }
        .filter-buttons {
          margin-bottom: 20px;
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .filter-btn {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 10px 15px;
          cursor: pointer;
          border-radius: 5px;
          transition: background-color 0.3s, transform 0.2s;
          font-size: 16px;
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
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          width: 280px;
          text-align: left;
          transition: transform 0.2s;
          position: relative;
        }
        .match-card:hover {
          transform: translateY(-5px);
        }
        .match-title {
          font-size: 18px;
          font-weight: bold;
          color: #333;
          text-align: center;
        }
        .match-info {
          font-size: 14px;
          margin: 5px 0;
        }
        .match-status {
          font-weight: bold;
          text-align: center;
          padding: 5px;
          border-radius: 5px;
          width: 120px;
          margin: 10px auto;
        }
        .match-status.live {
          background-color: #ff4d4d;
          color: white;
        }
        .match-status.upcoming {
          background-color: #ffa500;
          color: white;
        }
        .venue {
          font-style: italic;
        }
        .date-time {
          font-size: 12px;
          color: #666;
        }
        .teams {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 10px;
          align-items: center;
        }
        .team-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
        }
        .team-flag {
          width: 30px;
          height: 20px;
          border-radius: 3px;
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
