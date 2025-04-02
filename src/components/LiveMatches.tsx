import React, { useEffect, useState } from "react"; import { fetchLiveMatches, fetchLiveScores } from "../utils/cricket-api";

const LiveMatches = () => { const [matches, setMatches] = useState([]); const [filteredMatches, setFilteredMatches] = useState([]); const [activeFilter, setActiveFilter] = useState("All");

useEffect(() => { fetchMatches(); }, []);

const fetchMatches = async () => { try { const liveMatches = await fetchLiveMatches(); const liveScores = await fetchLiveScores();

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

const categorizeMatches = (matches) => { return matches.map((match) => { const currentTime = new Date(); const matchTime = new Date(match.dateEvent);

if (match.status === "Live") {
    return { ...match, category: "Live" };
  } else if (matchTime > currentTime) {
    return { ...match, category: "Upcoming" };
  } else {
    return { ...match, category: "Completed" };
  }
});

};

const filterMatches = (category) => { setActiveFilter(category); if (category === "All") { setFilteredMatches(matches); } else { const filtered = matches.filter((match) => match.category === category); setFilteredMatches(filtered); } };

return ( <div className="live-matches-container"> <h2 className="title">Live & Upcoming Matches</h2> <div className="filter-buttons"> {["All", "Live", "Upcoming", "Completed"].map((category) => ( <button key={category} className={filter-btn ${activeFilter === category ? "active" : ""}} onClick={() => filterMatches(category)} > {category} </button> ))} </div> <div className="matches-list"> {filteredMatches.length > 0 ? ( filteredMatches.map((match) => ( <div key={match.id} className="match-card"> <div className="team-info"> <div className="team"> <img src={match.teamInfo[0]?.img || ""} alt={match.teams[0]} className="team-flag" /> <span>{match.teams[0]}</span> </div> <div className="team"> <img src={match.teamInfo[1]?.img || ""} alt={match.teams[1]} className="team-flag" /> <span>{match.teams[1]}</span> </div> </div> <p className="match-info">Type: {match.matchType}</p> <p className="match-info status">Status: {match.status}</p> <p className="match-info venue">Venue: {match.venue}</p> <p className="match-info date-time"> Match Time: {new Date(match.dateEvent).toLocaleString()} </p> {match.score?.length > 0 && ( <p className="score"> {match.score.map((s) => ( <span key={s.inning}>{s.team}: {s.r}/{s.w} ({s.o} ov)</span> ))} </p> )} </div> )) ) : ( <p className="no-matches">No matches found.</p> )} </div>

<style jsx>{`
    .live-matches-container {
      max-width: 1100px;
      margin: auto;
      padding: 20px;
      text-align: center;
      font-family: Arial, sans-serif;
      background: white;
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
    }
    .filter-btn {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 10px 15px;
      margin: 5px;
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
      background: #f8f9fa;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      width: 300px;
      text-align: center;
      transition: transform 0.2s;
    }
    .match-card:hover {
      transform: translateY(-5px);
    }
    .team-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .team {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .team-flag {
      width: 30px;
      height: 20px;
      border-radius: 4px;
    }
    .match-info {
      font-size: 14px;
      margin: 5px 0;
    }
    .score {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }
    .no-matches {
      color: red;
      font-size: 18px;
    }
  `}</style>
</div>

); };

export default LiveMatches;