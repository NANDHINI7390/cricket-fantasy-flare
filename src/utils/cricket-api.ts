
import { toast } from "sonner";

export const SPORTS_DB_API_URL =
  "https://www.thesportsdb.com/api/v1/json/3/eventsseason.php?id=5587&s=2025";
export const CRICK_API_URL =
  "https://api.cricapi.com/v1/currentMatches?apikey=a52ea237-09e7-4d69-b7cc-e4f0e79fb8ae";

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

// Fetch match data from SportsDB (upcoming matches)
export const fetchMatches = async () => {
  try {
    const response = await fetch(SPORTS_DB_API_URL);
    const data = await response.json();

    if (!data?.events) throw new Error("No upcoming matches found");

    return data.events.filter((match) =>
      match.strEvent.includes("ICC Champions Trophy")
    );
  } catch (error) {
    console.error("Error fetching matches:", error);
    toast.error("Failed to fetch matches");
    return [];
  }
};

// Fetch live and completed match scores from CrickAPI
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

// Convert UTC match time to local time
export const convertToLocalTime = (date: string, time: string): string => {
  if (!date || !time) return "TBA";
  const utcDateTime = new Date(`${date}T${time}Z`);
  return utcDateTime.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

// Check if two team names match
export const teamsMatch = (team1: string, team2: string): boolean => {
  const cleanName1 = team1?.replace(/ Cricket| National Team| Masters| Women/gi, "").toLowerCase().trim();
  const cleanName2 = team2?.replace(/ Cricket| National Team| Masters| Women/gi, "").toLowerCase().trim();
  return cleanName1 === cleanName2 || cleanName1.includes(cleanName2) || cleanName2.includes(cleanName1);
};

export const isMatchLiveOrUpcoming = (matchDate: string, matchTime: string): boolean => {
  if (!matchDate || !matchTime) return false;
  const matchDateTime = new Date(`${matchDate}T${matchTime}Z`);
  const now = new Date();
  return matchDateTime >= now;
};
