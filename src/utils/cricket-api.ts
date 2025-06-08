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

// Enhanced Team flags mapping based on the API response structure
export const TEAM_FLAGS = {
  "India": "https://flagcdn.com/w320/in.png",
  "Australia": "https://flagcdn.com/w320/au.png", 
  "England": "https://flagcdn.com/w320/gb-eng.png",
  "New Zealand": "https://flagcdn.com/w320/nz.png",
  "Pakistan": "https://flagcdn.com/w320/pk.png",
  "South Africa": "https://flagcdn.com/w320/za.png",
  "Sri Lanka": "https://flagcdn.com/w320/lk.png",
  "Bangladesh": "https://flagcdn.com/w320/bd.png",
  "Afghanistan": "https://flagcdn.com/w320/af.png",
  "West Indies": "https://upload.wikimedia.org/wikipedia/en/thumb/d/d5/Cricket_West_Indies_flag.svg/320px-Cricket_West_Indies_flag.svg.png",
  "Ireland": "https://flagcdn.com/w320/ie.png",
  "Netherlands": "https://flagcdn.com/w320/nl.png",
  "Nepal": "https://flagcdn.com/w320/np.png",
  "Scotland": "https://flagcdn.com/w320/gb-sct.png",
  "Namibia": "https://flagcdn.com/w320/na.png",
  "Oman": "https://flagcdn.com/w320/om.png",
  "United Arab Emirates": "https://flagcdn.com/w320/ae.png",
  "UAE": "https://flagcdn.com/w320/ae.png",
  "USA": "https://flagcdn.com/w320/us.png",
  "Canada": "https://flagcdn.com/w320/ca.png",
  // Adding team mappings from API response
  "Bastar Bisons": "https://h.cricapi.com/img/icon512.png",
  "Surguja Tigers": "https://h.cricapi.com/img/icon512.png",
  "Rajnandgaon Panthers": "https://h.cricapi.com/img/icon512.png",
  "Raigarh Lions": "https://h.cricapi.com/img/icon512.png"
};

export const fetchMatches = async (): Promise<Match[]> => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/matches`, {
      params: {
        apikey: API_KEY,
        offset: 0
      }
    });
    console.log("fetchMatches response:", response.data);
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
    console.log("fetchLiveMatches response:", response.data);
    
    if (response.data && response.data.status === "success" && Array.isArray(response.data.data)) {
      // Process each match to extract team names from the API structure
      const processedMatches = response.data.data.map((match: any) => {
        console.log("Processing match:", match.name, "Teams:", match.teams, "TeamInfo:", match.teamInfo);
        
        // Extract team names from teams array or teamInfo
        let teams = [];
        let teamInfo = [];
        
        if (match.teams && Array.isArray(match.teams)) {
          teams = match.teams;
        } else if (match.teamInfo && Array.isArray(match.teamInfo)) {
          teams = match.teamInfo.map((team: any) => team.name);
        }
        
        // Create teamInfo from teams array if not available
        if (teams.length > 0) {
          teamInfo = teams.map((teamName: string) => ({
            name: teamName,
            shortname: getTeamShortName(teamName),
            img: match.teamInfo?.find((t: any) => t.name === teamName)?.img || 
                 TEAM_FLAGS[teamName as keyof typeof TEAM_FLAGS] || 
                 'https://h.cricapi.com/img/icon512.png'
          }));
        }
        
        return {
          ...match,
          teams,
          teamInfo
        };
      });
      
      console.log("Processed matches with team info:", processedMatches.length);
      return processedMatches;
    }
    
    return [];
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
    console.log("fetchLiveScores response:", response.data);
    
    if (response.data && response.data.status === "success" && Array.isArray(response.data.data)) {
      return response.data.data.map((match: any) => ({
        ...match,
        teamInfo: match.teamInfo || (match.teams ? match.teams.map((teamName: string) => ({
          name: teamName,
          shortname: getTeamShortName(teamName),
          img: TEAM_FLAGS[teamName as keyof typeof TEAM_FLAGS] || 'https://h.cricapi.com/img/icon512.png'
        })) : [])
      }));
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching live scores:", error);
    return [];
  }
};

// Enhanced API functions for all endpoints
export const fetchCurrentMatches = async (): Promise<CricketMatch[]> => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/currentMatches`, {
      params: {
        apikey: API_KEY,
        offset: 0
      }
    });
    console.log("fetchCurrentMatches detailed response:", JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.status === "success" && Array.isArray(response.data.data)) {
      const processedMatches = response.data.data.map((match: any) => {
        console.log(`Processing match: ${match.name}`);
        console.log(`Teams array:`, match.teams);
        console.log(`TeamInfo:`, match.teamInfo);
        
        // Ensure teamInfo is properly structured
        let teamInfo = [];
        if (match.teamInfo && Array.isArray(match.teamInfo)) {
          teamInfo = match.teamInfo.map((team: any) => ({
            name: team.name,
            shortname: team.shortname || getTeamShortName(team.name),
            img: team.img || TEAM_FLAGS[team.name as keyof typeof TEAM_FLAGS] || 'https://h.cricapi.com/img/icon512.png'
          }));
        } else if (match.teams && Array.isArray(match.teams)) {
          teamInfo = match.teams.map((teamName: string) => ({
            name: teamName,
            shortname: getTeamShortName(teamName),
            img: TEAM_FLAGS[teamName as keyof typeof TEAM_FLAGS] || 'https://h.cricapi.com/img/icon512.png'
          }));
        }
        
        console.log(`Final teamInfo for ${match.name}:`, teamInfo);
        
        return {
          ...match,
          teamInfo,
          teams: match.teams || teamInfo.map((t: any) => t.name)
        };
      });
      
      console.log("Total processed matches:", processedMatches.length);
      return processedMatches;
    }
    
    console.log("No valid data in API response");
    return [];
  } catch (error) {
    console.error("Error fetching current matches:", error);
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
    console.log("fetchMatchScorecard response:", response.data);
    return response.data.data as ScorecardData;
  } catch (error) {
    console.error("Error fetching match scorecard:", error);
    return null;
  }
};

export const fetchPlayers = async (offset: number = 0): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/players`, {
      params: {
        apikey: API_KEY,
        offset
      }
    });
    console.log("fetchPlayers response:", response.data);
    
    if (response.data && response.data.status === "success" && Array.isArray(response.data.data)) {
      console.log(`Found ${response.data.data.length} players in database`);
      return response.data.data;
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching players:", error);
    return [];
  }
};

export const fetchMatchSquad = async (matchId: string): Promise<any> => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/match_squad`, {
      params: {
        apikey: API_KEY,
        id: matchId
      }
    });
    console.log("fetchMatchSquad response:", response.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching match squad:", error);
    return null;
  }
};

export const fetchPlayerInfo = async (playerId: string): Promise<any> => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/players_info`, {
      params: {
        apikey: API_KEY,
        id: playerId
      }
    });
    console.log("fetchPlayerInfo response:", response.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching player info:", error);
    return null;
  }
};

export const fetchSeriesInfo = async (seriesId: string): Promise<any> => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/series_info`, {
      params: {
        apikey: API_KEY,
        id: seriesId
      }
    });
    console.log("fetchSeriesInfo response:", response.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching series info:", error);
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
  console.log("Categorizing matches:", matches.length);
  const now = new Date();
  
  return matches.map(match => {
    let category = 'Upcoming';
    
    console.log(`Processing match: ${match.name}, status: ${match.status}, matchStarted: ${match.matchStarted}, matchEnded: ${match.matchEnded}`);
    
    // More flexible status checking based on actual API response
    const statusLower = (match.status || "").toLowerCase();
    
    if (statusLower.includes("live") || 
        statusLower.includes("innings break") ||
        statusLower.includes("rain delay") ||
        (match.matchStarted && !match.matchEnded)) {
      category = 'Live';
    } else if (statusLower.includes("won by") ||
               statusLower.includes("draw") ||
               statusLower.includes("tied") ||
               statusLower.includes("no result") ||
               match.matchEnded) {
      category = 'Completed';
    } else if (match.dateTimeGMT) {
      const startDate = new Date(match.dateTimeGMT);
      const timeDiff = startDate.getTime() - now.getTime();
      
      if (timeDiff > 0) {
        category = 'Upcoming';
      } else if (timeDiff > -6 * 60 * 60 * 1000) {
        category = 'Live';
      } else {
        category = 'Completed';
      }
    }
    
    console.log(`Match ${match.name} categorized as: ${category}`);
    
    // Ensure team info is properly set with extracted team names
    const enhancedMatch = {
      ...match,
      category
    };

    // Extract teams from the match name if teams array is empty
    if ((!enhancedMatch.teams || enhancedMatch.teams.length === 0) && enhancedMatch.name) {
      // Try to extract team names from match name (e.g., "Team A vs Team B, Match")
      const vsMatch = enhancedMatch.name.match(/^(.+?)\s+vs\s+(.+?),/);
      if (vsMatch) {
        enhancedMatch.teams = [vsMatch[1].trim(), vsMatch[2].trim()];
        enhancedMatch.teamInfo = enhancedMatch.teams.map((teamName: string) => ({
          name: teamName,
          shortname: getTeamShortName(teamName),
          img: TEAM_FLAGS[teamName as keyof typeof TEAM_FLAGS] || 'https://h.cricapi.com/img/icon512.png'
        }));
      }
    }
    
    return enhancedMatch;
  });
};

// Helper function to get team short names
export const getTeamShortName = (teamName: string): string => {
  const shortNames: Record<string, string> = {
    "India": "IND",
    "Australia": "AUS",
    "England": "ENG", 
    "New Zealand": "NZ",
    "Pakistan": "PAK",
    "South Africa": "SA",
    "Sri Lanka": "SL",
    "Bangladesh": "BAN",
    "Afghanistan": "AFG",
    "West Indies": "WI",
    "Ireland": "IRE",
    "Netherlands": "NED",
    "Nepal": "NEP",
    "Scotland": "SCO",
    "Namibia": "NAM",
    "Oman": "OMA",
    "United Arab Emirates": "UAE",
    "UAE": "UAE",
    "USA": "USA",
    "Canada": "CAN",
    // Adding team mappings from actual API
    "Bastar Bisons": "BB",
    "Surguja Tigers": "ST",
    "Rajnandgaon Panthers": "RP",
    "Raigarh Lions": "RL"
  };
  
  return shortNames[teamName] || teamName.substring(0, 3).toUpperCase();
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

// Enhanced query processing function with better squad detection
export const processApiQuery = (query: string): {
  apiEndpoints: string[];
  queryType: string;
  intent: string;
} => {
  const queryLower = query.toLowerCase();
  
  // Squad/Player in squad queries - this should be prioritized
  if (queryLower.includes('in the squad') || queryLower.includes('in squad') || 
      queryLower.includes('rohit') || queryLower.includes('kohli') ||
      queryLower.includes('is ') && (queryLower.includes('playing') || queryLower.includes('selected'))) {
    return {
      apiEndpoints: ['players'],
      queryType: 'squad_search',
      intent: 'Search for player in squad'
    };
  }
  
  // Current matches queries
  if (queryLower.includes('today') || queryLower.includes('now') || 
      queryLower.includes('live') || queryLower.includes('happening')) {
    return {
      apiEndpoints: ['currentMatches'],
      queryType: 'current_matches',
      intent: 'Get current/live matches'
    };
  }
  
  // Fantasy team suggestions
  if (queryLower.includes('suggest') || queryLower.includes('fantasy team') || 
      queryLower.includes('captain') || queryLower.includes('vice captain')) {
    return {
      apiEndpoints: ['currentMatches', 'match_squad', 'match_scorecard'],
      queryType: 'fantasy_team',
      intent: 'Suggest fantasy team with captain/vice-captain'
    };
  }
  
  // Player performance queries
  if (queryLower.includes('perform') || queryLower.includes('stats') || 
      queryLower.includes('points') || queryLower.includes('last match')) {
    return {
      apiEndpoints: ['match_scorecard', 'players_info'],
      queryType: 'player_stats',
      intent: 'Get player performance and stats'
    };
  }
  
  // Squad queries
  if (queryLower.includes('squad') || queryLower.includes('team') || 
      queryLower.includes('players in')) {
    return {
      apiEndpoints: ['match_squad', 'players'],
      queryType: 'squad_info',
      intent: 'Get squad information'
    };
  }
  
  // Fantasy scores
  if (queryLower.includes('fantasy score') || queryLower.includes('points breakdown') || 
      queryLower.includes('yesterday') || queryLower.includes('last game')) {
    return {
      apiEndpoints: ['match_scorecard'],
      queryType: 'fantasy_scores',
      intent: 'Get fantasy point breakdowns'
    };
  }
  
  // Default general query
  return {
    apiEndpoints: ['currentMatches'],
    queryType: 'general',
    intent: 'General cricket information'
  };
};

// Enhanced squad search function
export const searchPlayerInSquad = (playerName: string, squadData: any[]): any[] => {
  if (!squadData || !Array.isArray(squadData)) return [];
  
  const searchTerm = playerName.toLowerCase();
  const results = squadData.filter(player => 
    player.name && player.name.toLowerCase().includes(searchTerm)
  );
  
  console.log(`Searching for "${playerName}" in ${squadData.length} players, found ${results.length} matches`);
  return results;
};

// Helper functions
export const getTeamLogoUrl = (team?: string | { name: string; shortname?: string; img?: string }): string => {
  if (typeof team === 'object' && team?.img) {
    return team.img;
  }
  if (typeof team === 'string') {
    return TEAM_FLAGS[team as keyof typeof TEAM_FLAGS] || 'https://h.cricapi.com/img/icon512.png';
  }
  return 'https://h.cricapi.com/img/icon512.png';
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
