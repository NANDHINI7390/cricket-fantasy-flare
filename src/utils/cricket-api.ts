const API_KEY = "a52ea237-09e7-4d69-b7cc-e4f0e79fb8ae";
const BASE_URL = "https://api.cricapi.com/v1";

// Function to fetch matches with filters
export const fetchMatches = async (filters = {}) => {
  try {
    const response = await fetch(`${BASE_URL}/currentMatches?apikey=${API_KEY}`);
    const data = await response.json();
    
    if (!data || !data.data) return [];

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return data.data
      .filter((match) => {
        const matchDate = new Date(match.date);
        
        // Apply filters
        if (filters.matchType && match.matchType !== filters.matchType) return false;
        if (filters.status && !match.status.includes(filters.status)) return false;
        if (filters.teams && !filters.teams.some(team => match.teams.includes(team))) return false;
        if (filters.date && match.date !== filters.date) return false;
        if (filters.venue && match.venue !== filters.venue) return false;
        if (filters.matchStarted !== undefined && match.matchStarted !== filters.matchStarted) return false;
        if (filters.matchEnded !== undefined && match.matchEnded !== filters.matchEnded) return false;
        
        return (
          (match.matchStarted && !match.matchEnded) ||
          (match.matchEnded && matchDate >= oneDayAgo)
        );
      })
      .map((match) => ({
        id: match.id,
        teams: match.teams || [],
        teamInfo: match.teamInfo || [],
        score: match.score || [],
        matchType: match.matchType,
        matchStarted: match.matchStarted,
        matchEnded: match.matchEnded,
        status: match.status,
        date: match.date,
        venue: match.venue,
      }));
  } catch (error) {
    console.error("Error fetching matches:", error);
    return [];
  }
};

// Fetch live scores with the same filters
export const fetchLiveScores = async (filters = {}) => {
  try {
    const response = await fetch(`${BASE_URL}/currentMatches?apikey=${API_KEY}`);
    const data = await response.json();
    
    if (!data || !data.data) return [];

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return data.data
      .filter((match) => {
        const matchDate = new Date(match.date);
        
        // Apply filters
        if (filters.matchType && match.matchType !== filters.matchType) return false;
        if (filters.status && !match.status.includes(filters.status)) return false;
        if (filters.teams && !filters.teams.some(team => match.teams.includes(team))) return false;
        if (filters.date && match.date !== filters.date) return false;
        if (filters.venue && match.venue !== filters.venue) return false;
        if (filters.matchStarted !== undefined && match.matchStarted !== filters.matchStarted) return false;
        if (filters.matchEnded !== undefined && match.matchEnded !== filters.matchEnded) return false;
        
        return (
          (match.matchStarted && !match.matchEnded) ||
          (match.matchEnded && matchDate >= oneDayAgo)
        );
      })
      .map((match) => ({
        id: match.id,
        teams: match.teams || [],
        teamInfo: match.teamInfo || [],
        score: match.score || [],
        matchType: match.matchType,
        matchStarted: match.matchStarted,
        matchEnded: match.matchEnded,
        status: match.status,
        date: match.date,
        venue: match.venue,
      }));
  } catch (error) {
    console.error("Error fetching live scores:", error);
    return [];
  }
};
