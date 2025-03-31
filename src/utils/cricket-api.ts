import axios from 'axios';

const API_KEY = 'your_api_key_here'; // Replace with your actual API key
const BASE_URL = 'https://api.example.com/cricket'; // Replace with the actual API URL

// Function to fetch IPL live and upcoming matches
export const fetchIPLMatches = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/matches`, {
      params: {
        apiKey: API_KEY,
        league: 'IPL',
        status: 'live,upcoming',
      },
    });
    return response.data.matches.map(match => ({
      id: match.id,
      teams: `${match.team1} vs ${match.team2}`,
      date: match.date,
      status: match.status,
      venue: match.venue,
      live: match.status === 'live',
    }));
  } catch (error) {
    console.error('Error fetching IPL matches:', error);
    return [];
  }
};

// Function to fetch live IPL scores
export const fetchLiveIPLScores = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/liveScores`, {
      params: {
        apiKey: API_KEY,
        league: 'IPL',
      },
    });
    return response.data.scores.map(score => ({
      matchId: score.matchId,
      team1: {
        name: score.team1.name,
        runs: score.team1.runs,
        wickets: score.team1.wickets,
        overs: score.team1.overs,
      },
      team2: {
        name: score.team2.name,
        runs: score.team2.runs,
        wickets: score.team2.wickets,
        overs: score.team2.overs,
      },
      status: score.status,
    }));
  } catch (error) {
    console.error('Error fetching live IPL scores:', error);
    return [];
  }
};

// Function to fetch past IPL scores within the last 24 hours
export const fetchPastIPLScores = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/scores`, {
      params: {
        apiKey: API_KEY,
        league: 'IPL',
        since: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    });
    return response.data.scores.map(score => ({
      matchId: score.matchId,
      teams: `${score.team1.name} vs ${score.team2.name}`,
      result: score.result,
      date: score.date,
    }));
  } catch (error) {
    console.error('Error fetching past IPL scores:', error);
    return [];
  }
};
