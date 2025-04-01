const API_KEY = "a52ea237-09e7-4d69-b7cc-e4f0e79fb8ae";

// Endpoints
const MATCHES_URL = `https://api.cricapi.com/v1/currentMatches?apikey=${API_KEY}`;
const LIVE_SCORES_URL = `https://api.cricapi.com/v1/cricScore?apikey=${API_KEY}`;

export interface ScoreInfo {
  r?: number; // Runs
  w?: number; // Wickets
  o?: number; // Overs
  team?: string;
  inning: string;
}

export interface CricketMatch {
  id: string;
  name: string;
  matchType: string;
  status: string;
  venue: string;
  teams: string[];
  score?: ScoreInfo[];
  matchStarted?: boolean;
  matchEnded?: boolean;
}

// Fetch live matches
export const fetchLiveMatches = async (): Promise<CricketMatch[]> => {
  try {
    const response = await fetch(MATCHES_URL);
    const data = await response.json();
    console.log("Fetched Live Matches Data:", data); // Debugging log

    if (!data || data.status === "failure" || !data.data) {
      throw new Error(data.reason || "Failed to fetch live matches");
    }

    return data.data || [];
  } catch (error) {
    console.error("Error fetching live matches:", error);
    return [];
  }
};

// Fetch live scores
export const fetchLiveScores = async (): Promise<CricketMatch[]> => {
  try {
    const response = await fetch(LIVE_SCORES_URL);
    const data = await response.json();
    console.log("Fetched Live Scores Data:", data); // Debugging log

    if (!data || data.status === "failure" || !data.data) {
      throw new Error(data.reason || "Failed to fetch live scores");
    }

    return data.data || [];
  } catch (error) {
    console.error("Error fetching live scores:", error);
    return [];
  }
};

// UI Component (React)
import React, { useEffect, useState } from "react";
import { fetchLiveMatches } from "./api";

const LiveMatches = () => {
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<CricketMatch[]>([]);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const data = await fetchLiveMatches();
      console.log("Setting Matches State:", data); // Debugging log
      setMatches(data);
      setFilteredMatches(data);
    } catch (error) {
      console.error("Fetch Matches Error:", error);
    }
  };

  return (
    <div>
      <h2>Live Matches</h2>
      {filteredMatches.length > 0 ? (
        filteredMatches.map((match) => (
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
