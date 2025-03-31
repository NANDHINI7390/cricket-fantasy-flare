const API_KEY = "a52ea237-09e7-4d69-b7cc-e4f0e79fb8ae";
const BASE_URL = "https://api.cricapi.com/v1";

// Function to fetch matches
export const fetchMatches = async () => {
  try {
    const response = await fetch(`${BASE_URL}/currentMatches?apikey=${API_KEY}`);
    const data = await response.json();
    
    if (!data || !data.data) return [];

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Filter only live matches or those finished within the last 24 hours
    return data.data
      .filter((match) => {
        const matchDate = new Date(match.date);
        return (
          // If it's live:
          (match.matchStarted && !match.matchEnded) ||
          // or if it ended within 24 hours:
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
      }));
  } catch (error) {
    console.error("Error fetching matches:", error);
    return [];
  }
};

// Same filtering logic for live scores
export const fetchLiveScores = async () => {
  try {
    const response = await fetch(`${BASE_URL}/currentMatches?apikey=${API_KEY}`);
    const data = await response.json();
    
    if (!data || !data.data) return [];

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return data.data
      .filter((match) => {
        const matchDate = new Date(match.date);
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
      }));
  } catch (error) {
    console.error("Error fetching live scores:", error);
    return [];
  }
};

// Safely format a match date
export const formatMatchDate = (date, time) => {
  return new Date(`${date}T${time}`).toLocaleString();
};

// Safely compare team names (avoids .toLowerCase on undefined)
export const teamsMatch = (team1, team2) => {
  if (!team1 || !team2) return false;
  return team1.toLowerCase().includes(team2.toLowerCase()) ||
         team2.toLowerCase().includes(team1.toLowerCase());
};

// Safely build a country flag URL (avoids .replace or .toLowerCase on undefined)
export const getCountryFlagUrl = (country) => {
  if (!country) {
    console.warn("No country name provided; returning placeholder.");
    return "/placeholder.svg"; // Or any default fallback image
  }
  
  // Example: remove known suffixes or do any other needed string replacements
  // but check if country is safe first
  const cleanedCountry = country
    .replace(/ Cricket| National Team/gi, "") // Safely remove known suffixes
    .trim();
  
  // Then transform it to a suitable code or slug if needed
  const lowerCase = cleanedCountry.toLowerCase();
  
  // Example: if you have a mapping from 'india' => 'in', do that here.
  // Otherwise, just return an example URL or a known pattern.
  return `https://flagcdn.com/w320/${lowerCase}.png`;
};
