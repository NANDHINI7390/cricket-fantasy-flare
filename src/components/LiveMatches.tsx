import React, { useEffect, useState } from "react";
import { fetchLiveMatches, fetchLiveScores } from "../utils/cricket-api";

const LiveMatches = () => {
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const liveMatches = await fetchLiveMatches();
      const liveScores = await fetchLiveScores();

      const updatedMatches = liveMatches.map((match) => {
        const scoreData = liveScores.find((s) => s.id === match.id);
        return { ...match, score: scoreData?.score || [] };
      });

      const categorizedMatches = categorizeMatches(updatedMatches);
      setMatches(categorizedMatches);
      setFilteredMatches(categorizedMatches);
    } catch (error) {
      console.error("Fetch Matches Error:", error);
    }
  };

  const categorizeMatches = (matches) => {
    return matches
      .map((match) => {
        const currentTime = new Date();
        const matchTime = new Date(match.dateTimeGMT);
        const daysDiff = (currentTime - matchTime) / (1000 * 60 * 60 * 24);

        if (match.status === "Live") {
          return { ...match, category: "Live" };
        } else if (matchTime > currentTime) {
          return { ...match, category: "Upcoming" };
        } else if (match.matchEnded && daysDiff <= 15) {
          return { ...match, category: "Completed" };
        } else {
          return null; // Exclude old completed matches
        }
      })
      .filter(Boolean);
  };

  const filterMatches = (category) => {
    setActiveFilter(category);
    if (category === "All") {
      setFilteredMatches(matches);
    } else {
      const filtered = matches.filter((match) => match.category === category);
      setFilteredMatches(filtered);
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
              <div className="team-info">
                <div className="team">
                  <img
                    src={match.teamInfo[0]?.img || ""}
                    alt={match.teams[0]}
                    className="team-flag"
                  />
                  <span>{match.teams[0]}</span>
                </div>
                <div className="team">
                  <img
                    src={match.teamInfo[1]?.img || ""}
                    alt={match.teams[1]}
                    className="team-flag"
                  />
                  <span>{match.teams[1]}</span>
                </div>
              </div>
              <p className="match-info">Type: {match.matchType}</p>
              <p className="match-info status">Status: {match.status}</p>
              <p className="match-info venue">Venue: {match.venue}</p>
              <p className="match-info date-time">
                Match Time: {new Date(match.dateTimeGMT).toLocaleString()}
              </p>
              {match.score?.length > 0 && (
                <p className="score">
                  {match.score.map((s) => (
                    <span key={s.inning}>
                      {s.team}: {s.r}/{s.w} ({s.o} ov)
                    </span>
                  ))}
                </p>
              )}
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
