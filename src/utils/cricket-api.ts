
import axios from 'axios';

const API_ENDPOINT = 'https://api.cricapi.com/v1';
const API_KEY = import.meta.env.VITE_CRIC_API_KEY || 'a52ea237-09e7-4d69-b7cc-e4f0e79fb8ae';

export interface Match {
  id: string;
  name: string;
  status: string;
  date_start: string;
  date_end: string;
  teams: string[];
  score: any[];
}

export interface CricketMatch {
  id: string;
  name: string;
  status: string;
  venue?: string;
  date?: string;
  dateTimeGMT?: string;
  teams: string[];
  teamInfo?: Array<{
    name: string;
    shortname: string;
    img: string;
  }>;
  score?: Array<{
    r: number;
    w: number;
    o: number;
    inning: string;
  }>;
  matchType?: string;
  series_id?: string;
  fantasyEnabled?: boolean;
  matchStarted?: boolean;
  matchEnded?: boolean;
  category?: string;
  localDateTime?: string;
}

export interface CategorizedMatches {
  upcoming: CricketMatch[];
  live: CricketMatch[];
  completed: CricketMatch[];
}

export interface ScorecardData {
  match_id: string;
  name?: string;
  venue?: string;
  date?: string;
  matchType?: string;
  status?: string;
  batting: BattingStats[];
  bowling: BowlingStats[];
}

export interface BattingStats {
  player_id: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strike_rate: number;
}

export interface BowlingStats {
  player_id: string;
  name: string;
  overs: number;
  wickets: number;
  runs: number;
  economy: number;
}

export const fetchMatches = async (): Promise<Match[]> => {
  try {
    console.log("Calling edge function for cricket data...");
    const response = await fetch(
      "https://yefrdovbporfjdhfojyx.supabase.co/functions/v1/fetch-cricket-data",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    
    if (!response.ok) {
      console.error(`Edge function request failed with status ${response.status}`);
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Edge function response:", data);
    
    if (data.error) {
      console.warn("API returned error:", data.error);
      return [];
    }
    
    const matches = data.currentMatches || [];
    console.log("Processed matches:", matches.length);
    return matches;
  } catch (error) {
    console.error("Error fetching matches via edge function:", error);
    return [];
  }
};

export const fetchLiveMatches = async (): Promise<CricketMatch[]> => {
  try {
    console.log("Fetching live matches via edge function...");
    const response = await fetch(
      "https://yefrdovbporfjdhfojyx.supabase.co/functions/v1/fetch-cricket-data",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    
    if (!response.ok) {
      console.error(`Edge function request failed with status ${response.status}`);
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Live matches data received:", data);
    
    if (data.error) {
      console.warn("API returned error:", data.error);
      return [];
    }
    
    return data.currentMatches || [];
  } catch (error) {
    console.error("Error fetching live matches:", error);
    return [];
  }
};

export const fetchLiveScores = async (): Promise<CricketMatch[]> => {
  try {
    console.log("Fetching live scores via edge function...");
    const response = await fetch(
      "https://yefrdovbporfjdhfojyx.supabase.co/functions/v1/fetch-cricket-data",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    
    if (!response.ok) {
      console.error(`Edge function request failed with status ${response.status}`);
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Live scores data received:", data);
    
    if (data.error) {
      console.warn("API returned error:", data.error);
      return [];
    }
    
    return data.liveScores || [];
  } catch (error) {
    console.error("Error fetching live scores:", error);
    return [];
  }
};

export const fetchMatchScorecard = async (matchId: string): Promise<ScorecardData | null> => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/match_scorecard`, {
      params: {
        apikey: API_KEY,
        id: matchId
      }
    });
    return response.data.data as ScorecardData;
  } catch (error) {
    console.error("Error fetching match scorecard:", error);
    return null;
  }
};

const processMatchData = (match: any) => {
  return {
    id: match.id,
    name: match.name,
    status: match.status,
    date_start: match.date_start,
    date_end: match.date_end,
    teams: match.teams,
    score: match.score,
    category: match.category || 'Upcoming'
  };
};

export const categorizeMatches = (matches: any[]): CricketMatch[] => {
  const now = new Date();
  
  return matches.map(match => {
    let category = 'Upcoming';
    
    if (match.status === "Live" || 
        match.status?.toLowerCase().includes('live') || 
        (match.matchStarted && !match.matchEnded)) {
      category = 'Live';
    } else if (match.status?.toLowerCase().includes("won") || 
               match.matchEnded) {
      category = 'Completed';
    } else if (match.date_start) {
      const startDate = new Date(match.date_start);
      if (startDate <= now) {
        category = 'Live';
      }
    }
    
    return {
      ...match,
      category
    };
  });
};

export const fetchMatchDetails = async (matchId: string) => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/match_info`, {
      params: {
        apikey: API_KEY,
        match_id: matchId
      }
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching match details:", error);
    return null;
  }
};

export const fetchPlayers = async (matchId: string) => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/players`, {
      params: {
        apikey: API_KEY,
        match_id: matchId,
        offset: 0
      }
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching players:", error);
    return null;
  }
};

// Helper functions
export const getTeamLogoUrl = (team?: string | { name: string; shortname?: string; img?: string }): string => {
  if (typeof team === 'object' && team?.img) {
    return team.img;
  }
  return '/placeholder.svg';
};

export const getTeamName = (team?: string | { name: string; shortname?: string; img?: string }): string => {
  if (typeof team === 'object' && team?.name) {
    return team.name;
  }
  if (typeof team === 'string') {
    return team;
  }
  return 'Unknown Team';
};

export const formatTossInfo = (match: CricketMatch): string => {
  return match.status || 'Match information not available';
};

export const formatMatchDateTime = (dateTimeGMT?: string): string => {
  if (!dateTimeGMT) return 'Time TBD';
  
  const matchDate = new Date(dateTimeGMT);
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(matchDate);
};

export const formatMatchStatus = (status: string): string => {
  return status || 'Status unknown';
};

export const getCountryFlagUrl = (teamName: string): string => {
  // Simple mapping for common teams
  const flagMap: Record<string, string> = {
    'India': '🇮🇳',
    'Australia': '🇦🇺',
    'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'Pakistan': '🇵🇰',
    'South Africa': '🇿🇦',
    'New Zealand': '🇳🇿',
    'Sri Lanka': '🇱🇰',
    'Bangladesh': '🇧🇩',
    'West Indies': '🏴‍☠️',
    'Afghanistan': '🇦🇫'
  };
  
  return flagMap[teamName] || '🏏';
};

export const analyzeScorecardData = (scorecard: ScorecardData) => {
  // Basic analysis of scorecard data
  const topBatsmen = scorecard.batting.sort((a, b) => b.runs - a.runs).slice(0, 3);
  const topBowlers = scorecard.bowling.sort((a, b) => b.wickets - a.wickets).slice(0, 3);
  
  return {
    topBatsmen,
    topBowlers,
    totalRuns: scorecard.batting.reduce((sum, player) => sum + player.runs, 0),
    totalWickets: scorecard.bowling.reduce((sum, player) => sum + player.wickets, 0)
  };
};
