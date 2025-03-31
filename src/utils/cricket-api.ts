const API_KEY = "a52ea237-09e7-4d69-b7cc-e4f0e79fb8ae";
const BASE_URL = "https://api.cricapi.com/v1";

// Function to fetch live and recently finished matches
export const fetchMatches = async () => {
  try {
    const response = await fetch(`${BASE_URL}/currentMatches?apikey=${API_KEY}`);
    const data = await response.json();
    
    if (data && data.data) {
      const now = new Date();
      return data.data.filter((match) => {
        // Convert match date to Date object
        const matchDate = new Date(match.date);
        const timeDiff = (now - matchDate) / (1000 * 60 * 60); // Difference in hours

        // Include only live matches or matches finished within 24 hours
        return match.matchStarted || (match.matchEnded && timeDiff <= 24);
      }).map((match) => ({
        id: match.id,
        teams: match.teams || [],
        teamInfo: match.teamInfo || [],
        score: match.score || [],
        matchStarted: match.matchStarted,
        matchEnded: match.matchEnded,
        status: match.status,
        matchType: match.matchType, // To display if it's T20, ODI, Test, etc.
        date: match.date,
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching matches:", error);
    return [];
  }
};

// Function to format match date
export const formatMatchDate = (date) => {
  return new Date(date).toLocaleString();
};

// Function to compare two teams (case insensitive)
export const teamsMatch = (team1, team2) => {
  return team1?.toLowerCase().includes(team2?.toLowerCase()) || 
         team2?.toLowerCase().includes(team1?.toLowerCase());
};

// Function to get country flag URL safely
export const getCountryFlagUrl = (countryCode) => {
  if (!countryCode) {
    console.warn("Country code is undefined");
    return ""; // Return an empty string or a default flag image
  }
  return `https://flagcdn.com/w320/${countryCode.toLowerCase()}.png`;
};
