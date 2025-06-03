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
  upcoming: Match[];
  live: Match[];
  completed: Match[];
}

export interface ScorecardData {
  match_id: string;
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
    const response = await axios.get(`${API_ENDPOINT}/matches`, {
      params: {
        apikey: API_KEY,
        offset: 0
      }
    });
    return response.data.data as Match[];
  } catch (error) {
    console.error("Error fetching matches:", error);
    return [];
  }
};

export const fetchLiveMatches = async (): Promise<CricketMatch[]> => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/currentMatches`, {
      params: {
        apikey: API_KEY,
        offset: 0
      }
    });
    return response.data.data as CricketMatch[];
  } catch (error) {
    console.error("Error fetching live matches:", error);
    return [];
  }
};

export const fetchLiveScores = async (): Promise<CricketMatch[]> => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/cricScore`, {
      params: {
        apikey: API_KEY
      }
    });
    return response.data.data as CricketMatch[];
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
    score: match.score
  };
};

export const categorizeMatches = (matches: any[]): CategorizedMatches => {
  const now = new Date();
  
  const upcomingMatches = matches
    .map(match => {
      if (!match?.date_start) return null;
      const matchDate = new Date(match.date_start);
      if (matchDate > now) {
        return processMatchData(match);
      }
      return null;
    })
    .filter((match): match is any => match !== null);

  const liveMatches = matches
    .map(match => {
      if (!match?.date_start || !match?.date_end) return null;
      const startDate = new Date(match.date_start);
      const endDate = new Date(match.date_end);
      if (startDate <= now && now <= endDate) {
        return processMatchData(match);
      }
      return null;
    })
    .filter((match): match is any => match !== null);

  const completedMatches = matches
    .map(match => {
      if (!match?.date_end) return null;
      const endDate = new Date(match.date_end);
      if (endDate < now) {
        return processMatchData(match);
      }
      return null;
    })
    .filter((match): match is any => match !== null);

  return {
    upcoming: upcomingMatches,
    live: liveMatches,
    completed: completedMatches
  };
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
export const getTeamLogoUrl = (teamImg?: string): string => {
  return teamImg || '/placeholder.svg';
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
