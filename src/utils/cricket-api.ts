const API_KEY = "a52ea237-09e7-4d69-b7cc-e4f0e79fb8ae";
const BASE_URL = "https://api.cricapi.com/v1";

export const fetchMatches = async () => {
  try {
    const response = await fetch(`${BASE_URL}/currentMatches?apikey=${API_KEY}`);
    const data = await response.json();
    
    if (data && data.data) {
      const now = new Date();
      return data.data.filter((match) => {
        const matchDate = new Date(match.date);
        const isLive = match.matchStarted && !match.matchEnded;
        const isRecent = match.matchEnded && (now - matchDate) / (1000 * 60 * 60) <= 24;
        return isLive || isRecent;
      });
    }
    return [];
  } catch (error) {
    console.error("Error fetching matches:", error);
    return [];
  }
};

export const fetchLiveScores = async () => {
  try {
    const response = await fetch(`${BASE_URL}/currentMatches?apikey=${API_KEY}`);
    const data = await response.json();
    
    if (data && data.data) {
      const now = new Date();
      return data.data
        .filter((match) => {
          const matchDate = new Date(match.date);
          const isLive = match.matchStarted && !match.matchEnded;
          const isRecent = match.matchEnded && (now - matchDate) / (1000 * 60 * 60) <= 24;
          return isLive || isRecent;
        })
        .map((match) => ({
          id: match.id,
          teams: match.teams,
          teamInfo: match.teamInfo,
          score: match.score,
          matchType: match.matchType,
          matchStarted: match.matchStarted,
          matchEnded: match.matchEnded,
          status: match.status,
          date: match.date,
        }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching live scores:", error);
    return [];
  }
};

export const formatMatchDate = (date, time) => {
  return new Date(`${date}T${time}`).toLocaleString();
};

export const teamsMatch = (team1, team2) => {
  return team1.toLowerCase().includes(team2.toLowerCase()) || 
         team2.toLowerCase().includes(team1.toLowerCase());
};

export const getCountryFlagUrl = (countryCode) => {
  return `https://flagcdn.com/w320/${countryCode.toLowerCase()}.png`;
};
