import axios from 'axios';

const API_ENDPOINT = 'https://api.cricapi.com/v1';
const API_KEY = process.env.CRIC_API_KEY;

interface Match {
  id: string;
  name: string;
  status: string;
  date_start: string;
  date_end: string;
  teams: string[];
  score: any[];
}

interface CategorizedMatches {
  upcoming: Match[];
  live: Match[];
  completed: Match[];
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
