
// Cricket data fetching utilities
import { toast } from "sonner";

export const SPORTS_DB_API_URL =
  "https://www.thesportsdb.com/api/v1/json/3/eventsseason.php?id=5587&s=2025";
export const CRICK_API_URL = "https://api.cricapi.com/v1/currentMatches?apikey=a52ea237-09e7-4d69-b7cc-e4f0e79fb8ae";

export const TEAM_FLAGS = {
  India: "https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg",
  Australia: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Flag_of_Australia.svg",
  England: "https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg",
  Pakistan: "https://upload.wikimedia.org/wikipedia/commons/3/32/Flag_of_Pakistan.svg",
  "South Africa": "https://upload.wikimedia.org/wikipedia/commons/a/af/Flag_of_South_Africa.svg",
  "New Zealand": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Flag_of_New_Zealand.svg",
  "Sri Lanka": "https://upload.wikimedia.org/wikipedia/commons/1/11/Flag_of_Sri_Lanka.svg",
  Bangladesh: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Flag_of_Bangladesh.svg",
  Afghanistan: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Afghanistan.svg",
};

export const getCountryFlagUrl = (country: string): string => {
  const cleanedCountry = country.replace(/ Cricket| National Team/gi, "").trim();
  return TEAM_FLAGS[cleanedCountry] || "/placeholder.svg";
};

export const isMatchLiveOrUpcoming = (matchDate: string, matchTime: string): boolean => {
  if (!matchDate || !matchTime) return false;
  const matchDateTime = new Date(`${matchDate}T${matchTime}Z`);
  const now = new Date();
  return matchDateTime >= now;
};

export const convertToLocalTime = (date: string, time: string): string => {
  if (!date || !time) return "TBA";
  const utcDateTime = new Date(`${date}T${time}Z`);
  return utcDateTime.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

// Helper function to check if team names match
export const teamsMatch = (team1: string, team2: string): boolean => {
  // Clean both team names by removing common suffixes and converting to lowercase
  const cleanName1 = team1 ? team1.replace(/ Cricket| National Team| Masters| Women/gi, "").toLowerCase().trim() : "";
  const cleanName2 = team2 ? team2.replace(/ Cricket| National Team| Masters| Women/gi, "").toLowerCase().trim() : "";
  
  // Return true if cleaned names match or one is a substring of the other
  return cleanName1 === cleanName2 || cleanName1.includes(cleanName2) || cleanName2.includes(cleanName1);
};

export const fetchMatches = async () => {
  try {
    // Fetch upcoming matches from SPORTS_DB_API_URL
    const upcomingResponse = await fetch(SPORTS_DB_API_URL);
    const upcomingData = await upcomingResponse.json();
    
    if (!upcomingData?.events) throw new Error("No upcoming matches data received");

    // Fetch live & completed match scores from QuickAPI
    const liveResponse = await fetch(CRICK_API_URL);
    const liveData = await liveResponse.json();
    
    if (liveData.status === "failure") throw new Error(liveData.reason || "Failed to fetch live scores");

    const liveMatches = liveData?.data || [];

    // Get current time and time 24 hours ago
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Process matches
    const processedMatches = upcomingData.events.map((match) => {
      const matchDateTime = new Date(`${match.dateEvent}T${match.strTime}Z`);

      // Find if match is live
      const liveMatch = liveMatches.find((live) =>
        teamsMatch(live.team1, match.strHomeTeam) &&
        teamsMatch(live.team2, match.strAwayTeam)
      );

      return {
        ...match,
        isLive: !!liveMatch, // Mark as live if found in QuickAPI
        liveScore: liveMatch?.score || null,
        isFinished: matchDateTime < now && matchDateTime > last24Hours, // Mark finished matches (within 24 hours)
        finalScore: liveMatch && !liveMatch.status.includes("Live") ? liveMatch?.score : null,
      };
    });

    return processedMatches;
  } catch (error) {
    console.error("Error fetching matches:", error);
    toast.error("Failed to fetch matches");
    return [];
  }
};

export const fetchLiveScores = async () => {
  try {
    const response = await fetch(CRICK_API_URL);
    const data = await response.json();
    console.log("Fetched live scores:", data);
    
    if (data.status === "failure") {
      throw new Error(data.reason || "Failed to fetch live scores");
    }
    
    return data?.data || [];
  } catch (error) {
    console.error("Error fetching live scores:", error);
    toast.error("Failed to fetch live scores");
    return [];
  }
};
