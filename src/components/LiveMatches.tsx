import React, { useEffect, useState } from "react";
import { fetchLiveMatches } from "../utils/cricket-api";

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
      const categorizedMatches = categorizeMatches(data);
      setMatches(categorizedMatches);
      setFilteredMatches(categorizedMatches);
    } catch (error) {
      console.error("Fetch Matches Error:", error);
    }
  };

  const categorizeMatches = (matches) => {
    const now = new Date();
    return matches.map((match) => {
      const matchDateTime = new Date(`${match.dateEvent}T${match.strTime}`);
      let status = "Upcoming";

      if (match.matchEnded) {
        status = "Completed";
      } else if (match.matchStarted) {
        status = "Live";
      } else if (matchDateTime < now) {
        status = "Completed";
      }

      return { ...match, status };
    });
  };

  const filterMatches = (category) => {
    setActiveFilter(category);
    if (category === "All") {
      setFilteredMatches(matches);
    } else {
      setFilteredMatches(matches.filter((match) => match.status === category));
    }
  };

  return (
    <div className="live-matches-container">
      <h2 className="title">Live & Upcoming Matches</h2>
      <div className="filter-buttons">
        {["All", "Live", "Upcoming", "Completed"].map((category) => (
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
              <p className="match-info date-time">
                {match.dateEvent} {match.strTime}
              </p>
            </div>
          ))
        ) : (
          <p className="no-matches">No matches found.</p>
        )}
      </div>
    </div>
  );
};

export default LiveMatches;
