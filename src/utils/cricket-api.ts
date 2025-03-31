const API_KEY = "a52ea237-09e7-4d69-b7cc-e4f0e79fb8ae";
const BASE_URL = "https://api.cricapi.com/v1";

// Function to fetch matches
export const fetchMatches = async () => {
  try {
    const response = await fetch(`${BASE_URL}/currentMatches?apikey=${API_KEY}`);
    const data = await response.json();
    
    if (!data || !data.data) return [];

    const matches = data.data.filter(match => match.matchType === "t20"); // Fetch only cricket matches
    
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours

    return matches.filter(match => {
      const matchDate = new Date(match.date);
      return match.matchStarted || matchDate >= oneDayAgo; // Live or finished in the last 24 hours
    });

  } catch (error) {
    console.error("Error fetching matches:", error);
    return [];
  }
};

// Function to fetch live scores
export const fetchLiveScores = async () => {
  try {
    const response = await fetch(`${BASE_URL}/currentMatches?apikey=${API_KEY}`);
    const data = await response.json();
    
    if (!data || !data.data) return [];

    return data.data
      .filter(match => match.matchType === "t20") // Fetch only cricket matches
      .map(match => ({
        id: match.id,
        teams: match.teams,
        teamInfo: match.teamInfo,
        score: match.score,
        matchStarted: match.matchStarted,
        matchEnded: match.matchEnded,
        status: match.status,
        date: match.date,
      }));

  } catch (error) {
    console.error("Error fetching live scores:", error);
    return [];
  }
};

// Function to format match date
export const formatMatchDate = (date, time) => {
  return new Date(`${date}T${time}`).toLocaleString();
};

// Function to compare teams safely
export const teamsMatch = (team1, team2) => {
  if (!team1 || !team2) return false; // Prevents undefined error
  return team1.toLowerCase().includes(team2.toLowerCase()) || 
         team2.toLowerCase().includes(team1.toLowerCase());
};

// Function to get country flag URL
export const getCountryFlagUrl = (countryCode) => {
  if (!countryCode) return ""; // Prevent undefined values
  return `https://flagcdn.com/w320/${countryCode.toLowerCase()}.png`;
};
