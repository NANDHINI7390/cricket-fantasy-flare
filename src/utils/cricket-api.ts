
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

    // Filter only ICC Champions Trophy matches
    const championsTrophyMatches = upcomingData.events.filter((match: any) => 
      match.strEvent && match.strEvent.includes("ICC Champions Trophy")
    );

    console.log("Champions Trophy matches:", championsTrophyMatches);
    
    // Get live scores to integrate with match data
    const liveScores = await fetchLiveScores();

    // Get current time and time 24 hours ago
    const now = new Date();
    const last24Hours = new Date(now.getTime() - (24 * 60 * 60 * 1000));

    // Process matches
    const processedMatches = championsTrophyMatches.map((match: any) => {
      const matchDateTime = new Date(`${match.dateEvent}T${match.strTime}Z`);
      const isWithin24Hours = matchDateTime > last24Hours;
      
      // Only include upcoming matches and those from the last 24 hours
      if (matchDateTime > now || isWithin24Hours) {
        // Find if match is live in CrickAPI data
        const liveMatch = liveScores.find((live: any) => 
          (live.teams && live.teams.length >= 2 && 
           teamsMatch(live.teams[0], match.strHomeTeam) && 
           teamsMatch(live.teams[1], match.strAwayTeam)) ||
          (live.teamInfo && live.teamInfo.length >= 2 &&
           teamsMatch(live.teamInfo[0].name, match.strHomeTeam) && 
           teamsMatch(live.teamInfo[1].name, match.strAwayTeam))
        );

        // Extract score information
        let homeScore = "0";
        let homeWickets = "0";
        let awayScore = "0";
        let awayWickets = "0";
        let matchStatus = matchDateTime <= now ? "Live" : "Upcoming";

        if (liveMatch) {
          // Extract scores if available
          if (liveMatch.score && liveMatch.score.length > 0) {
            // Try to match home team with the inning string
            const homeScoreEntry = liveMatch.score.find((s: any) => 
              s.inning && teamsMatch(s.inning, match.strHomeTeam)
            );
            
            if (homeScoreEntry) {
              homeScore = homeScoreEntry.r?.toString() || "0";
              homeWickets = homeScoreEntry.w?.toString() || "0";
            } else if (liveMatch.score[0]) {
              homeScore = liveMatch.score[0].r?.toString() || "0";
              homeWickets = liveMatch.score[0].w?.toString() || "0";
            }

            // Try to match away team with the inning string
            const awayScoreEntry = liveMatch.score.find((s: any) => 
              s.inning && teamsMatch(s.inning, match.strAwayTeam)
            );
            
            if (awayScoreEntry) {
              awayScore = awayScoreEntry.r?.toString() || "0";
              awayWickets = awayScoreEntry.w?.toString() || "0";
            } else if (liveMatch.score[1]) {
              awayScore = liveMatch.score[1].r?.toString() || "0";
              awayWickets = liveMatch.score[1].w?.toString() || "0";
            }
          }
          
          // Use the status from cricAPI if available
          matchStatus = liveMatch.status || matchStatus;
        }

        return {
          ...match,
          matchTime: convertToLocalTime(match.dateEvent, match.strTime),
          liveScore: {
            homeScore,
            homeWickets,
            awayScore,
            awayWickets,
            status: matchStatus,
            matchDetails: liveMatch // Pass the full match data for detail view
          }
        };
      }
      return null;
    }).filter(Boolean); // Remove null entries

    console.log("Processed matches:", processedMatches);
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
