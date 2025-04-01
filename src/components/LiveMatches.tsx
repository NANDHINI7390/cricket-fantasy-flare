import React, { useEffect, useState } from "react";
import { fetchLiveMatches, fetchLiveScores, CricketMatch } from "@/utils/cricket-api"; // Ensure this path is correct
import { toast } from "sonner";

const CATEGORIES = ["All", "Live", "International", "Leagues", "ICC"];

const LiveMatch = () => {
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<CricketMatch[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const data = await fetchLiveMatches(); // Fetching live matches
      setMatches(data);
      setFilteredMatches(data);
    } catch (error) {
      toast.error("Failed to fetch matches");
      console.error("Fetch Matches Error:", error);
    }
  };

  const fetchScores = async () => {
    try {
      const data = await fetchLiveScores(); // Fetching live scores
      setMatches(data);
      setFilteredMatches(data);
      toast.success("Live scores updated!");
    } catch (error) {
      toast.error("Failed to fetch live scores");
      console.error("Fetch Live Scores Error:", error);
    }
  };

  // Function to filter matches based on category
  const filterMatches = (category: string) => {
    setSelectedCategory(category);

    if (category === "All") {
      setFilteredMatches(matches);
      return;
    }

    let filtered: CricketMatch[];

    switch (category) {
      case "Live":
        filtered = matches.filter((match) => match.status.toLowerCase().includes("live"));
        break;
      case "International":
        filtered = matches.filter((match) => match.matchType.toLowerCase().includes("international"));
        break;
      case "Leagues":
        filtered = matches.filter((match) => match.matchType.toLowerCase().includes("league"));
        break;
      case "ICC":
        filtered = matches.filter((match) => match.name.toLowerCase().includes("icc"));
        break;
      default:
        filtered = matches;
    }

    setFilteredMatches(filtered);
  };

  return (
    <div className="container">
      {/* Category Buttons */}
      <div className="categories">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            className={selectedCategory === category ? "active" : ""}
            onClick={() => filterMatches(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Refresh Button */}
      <button className="refresh-button" onClick={fetchScores}>
        Refresh Live Scores
      </button>

      {/* Matches Display */}
      <div className="matches">
        <h1 className="live-match-title">Live Matches</h1> {/* Title for Live Matches */}
        {filteredMatches.length > 0 ? (
          filteredMatches.map((match) => (
            <div key={match.id} className="match-card">
              <h3>{match.name}</h3>
              <p>Type: {match.matchType}</p>
              <p>Status: {match.status}</p>
              <p>Venue: {match.venue}</p>
              <p>Teams: {match.teams.join(" vs ")}</p>

              {/* Logging the match and score for debugging */}
              {console.log("Match:", match)}
              {console.log("Score:", match.score)}

              {match.score && Array.isArray(match.score) ? (
                match.score.map((s, index) => {
                  // Check if s has the required properties
                  if (s.team !== undefined && s.r !== undefined && s.w !== undefined && s.o !== undefined) {
                    return (
                      <p key={index}>
                        {s.team}: {s.r}/{s.w} ({s.o} overs)
                      </p>
                    );
                  } else {
                    return (
                      <p key={index}>
                        Invalid score data.
                      </p>
                    );
                  }
                })
              ) : (
                <p>No score information available.</p>
              )}
            </div>
          ))
        ) : (
          <p>No matches found.</p>
        )}
      </div>

      {/* Styling */}
      <style jsx>{`
        .container {
          max-width: 800px;
          margin: auto;
          text-align: center;
        }
        .categories {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        button {
          padding: 10px 20px;
          border: none;
          cursor: pointer;
          background: #ddd;
          border-radius: 5px;
          transition: 0.3s;
        }
        .active {
          background: #007bff;
          color: white;
        }
        .refresh-button {
          background: #28a745;
          color: white;
          margin: 20px 0;
        }
        .match-card {
          border: 1px solid #ddd;
          padding: 10px;
          margin: 10px 0;
          border-radius: 5px;
        }
        .live-match-title {
          color: #000; /* Set desired color here */
          font-size: 24px; /* Adjust font size as needed */
          margin-bottom: 20px; /* Add margin for spacing */
        }
      `}</style>
    </div>
  );
};

export default LiveMatch;
