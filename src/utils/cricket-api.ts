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

export interface FantasySquad {
  match_id: string;
  squads: Array<{
    team: string;
    players: Array<{
      id: string;
      name: string;
      role: string;
      credits: number;
    }>;
  }>;
}

export interface FantasyPoints {
  match_id: string;
  points: Array<{
    player_id: string;
    name: string;
    points: number;
    breakdown: {
      runs?: number;
      wickets?: number;
      catches?: number;
      stumping?: number;
      runout?: number;
    };
  }>;
}

export interface PlayerInfo {
  id: string;
  name: string;
  country: string;
  role: string;
  battingStyle?: string;
  bowlingStyle?: string;
  recentForm?: string;
}

export const fetchMatches = async (): Promise<Match[]> => {
  try {
    console.log("🏏 Fetching matches with API key:", API_KEY.substring(0, 8) + "...");
    const response = await axios.get(`${API_ENDPOINT}/currentMatches`, {
      params: {
        apikey: API_KEY,
        offset: 0
      },
      timeout: 10000 // 10 second timeout
    });
    
    console.log("🏏 CrickAPI Response Status:", response.status);
    console.log("🏏 CrickAPI Response Data:", response.data);
    
    if (response.data && response.data.status === "success") {
      console.log("✅ CrickAPI Success - Found", response.data.data?.length || 0, "matches");
      return response.data.data || [];
    } else {
      console.error("❌ CrickAPI Error Response:", response.data);
      return [];
    }
  } catch (error) {
    console.error("❌ Error fetching matches:", error);
    if (error.response) {
      console.error("❌ Response error:", error.response.status, error.response.data);
    }
    return [];
  }
};

export const fetchLiveMatches = async (): Promise<CricketMatch[]> => {
  const { cacheService, CacheKeys } = await import('./cache-service');
  const cacheKey = CacheKeys.liveMatches();
  
  // Check cache first
  const cachedData = cacheService.get<CricketMatch[]>(cacheKey);
  if (cachedData) {
    console.log("🏏 Using cached live matches data");
    cacheService.recordHit();
    return cachedData;
  }
  
  cacheService.recordMiss();
  
  try {
    console.log("🏏 Fetching live matches with API key:", API_KEY.substring(0, 8) + "...");
    const response = await axios.get(`${API_ENDPOINT}/currentMatches`, {
      params: {
        apikey: API_KEY,
        offset: 0
      },
      timeout: 15000, // Increased timeout
      headers: {
        'User-Agent': 'CricketFantasyApp/1.0'
      }
    });
    
    console.log("🏏 Live Matches Response Status:", response.status);
    
    if (response.data && response.data.status === "success") {
      const matches = response.data.data || [];
      console.log("✅ Live Matches Success - Found", matches.length, "matches");
      
      // Cache successful response
      cacheService.set(cacheKey, matches);
      return matches;
    } else {
      console.error("❌ Live Matches Error:", response.data);
      throw new Error(`API Error: ${response.data?.status || 'Unknown error'}`);
    }
  } catch (error) {
    console.error("❌ Error fetching live matches:", error);
    if (error.response) {
      console.error("❌ API Response Error:", error.response.status, error.response.data);
      
      // Handle rate limiting
      if (error.response.status === 429) {
        throw new Error("API rate limit exceeded. Please upgrade your CricAPI subscription.");
      }
      
      // Handle API key issues
      if (error.response.status === 401) {
        throw new Error("Invalid API key. Please check your CricAPI credentials.");
      }
    }
    
    // Return empty array instead of throwing for network errors
    return [];
  }
};

export const fetchLiveScores = async (): Promise<CricketMatch[]> => {
  const { cacheService, CacheKeys } = await import('./cache-service');
  const cacheKey = CacheKeys.liveScores();
  
  // Check cache first
  const cachedData = cacheService.get<CricketMatch[]>(cacheKey);
  if (cachedData) {
    console.log("🏏 Using cached live scores data");
    cacheService.recordHit();
    return cachedData;
  }
  
  cacheService.recordMiss();
  
  try {
    console.log("🏏 Fetching live scores with API key:", API_KEY.substring(0, 8) + "...");
    const response = await axios.get(`${API_ENDPOINT}/cricScore`, {
      params: {
        apikey: API_KEY
      },
      timeout: 15000,
      headers: {
        'User-Agent': 'CricketFantasyApp/1.0'
      }
    });
    
    console.log("🏏 Live Scores Response Status:", response.status);
    
    if (response.data && response.data.status === "success") {
      const scores = response.data.data || [];
      console.log("✅ Live Scores Success - Found", scores.length, "scores");
      
      // Cache successful response
      cacheService.set(cacheKey, scores);
      return scores;
    } else {
      console.error("❌ Live Scores Error:", response.data);
      throw new Error(`API Error: ${response.data?.status || 'Unknown error'}`);
    }
  } catch (error) {
    console.error("❌ Error fetching live scores:", error);
    if (error.response) {
      console.error("❌ API Response Error:", error.response.status, error.response.data);
      
      if (error.response.status === 429) {
        throw new Error("API rate limit exceeded. Please upgrade your CricAPI subscription.");
      }
      
      if (error.response.status === 401) {
        throw new Error("Invalid API key. Please check your CricAPI credentials.");
      }
    }
    
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

export const fetchFantasySquad = async (matchId: string): Promise<FantasySquad | null> => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/match_squad`, {
      params: {
        apikey: API_KEY,
        id: matchId,
        offset: 0
      }
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching fantasy squad:", error);
    return null;
  }
};

export const fetchFantasyPoints = async (matchId: string, ruleset: string = "0"): Promise<FantasyPoints | null> => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/match_points`, {
      params: {
        apikey: API_KEY,
        id: matchId,
        ruleset,
        offset: 0
      }
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching fantasy points:", error);
    return null;
  }
};

export const fetchAllPlayers = async (): Promise<PlayerInfo[]> => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/players`, {
      params: {
        apikey: API_KEY,
        offset: 0
      }
    });
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching players:", error);
    return [];
  }
};
