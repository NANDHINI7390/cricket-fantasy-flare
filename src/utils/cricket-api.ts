const API_KEY = "a52ea237-09e7-4d69-b7cc-e4f0e79fb8ae";

// Endpoints
const MATCHES_URL = `https://api.cricapi.com/v1/currentMatches?apikey=${API_KEY}`;
const LIVE_SCORES_URL = `https://api.cricapi.com/v1/cricScore?apikey=${API_KEY}`;

export interface ScoreInfo {
  r?: number;
  w?: number;
  o?: number;
  team?: string;
  inning: string;
}

export interface CricketMatch {
  id: string;
  name: string;
  matchType: string;
  status: string;
  venue: string;
  teams: string[];
  teamInfo: {
    name: string;
    img: string;
  }[];
  score?: ScoreInfo[];
  dateTimeGMT?: string;
  matchStarted?: boolean;
  matchEnded?: boolean;
  category?: string;
  tossWinner?: string;
  tossChoice?: string;
  localDateTime?: string; // Added for local time display
}

// Fetches live matches (without ball-by-ball updates)
export const fetchLiveMatches = async (): Promise<CricketMatch[]> => {
  try {
    const response = await fetch(MATCHES_URL);
    const data = await response.json();

    if (data.status === "failure") {
      throw new Error(data.reason || "Failed to fetch live matches");
    }

    // Add local date/time to each match
    return data.data?.map((match: any) => ({
      ...match,
      tossWinner: match.tossWinner || "",
      tossChoice: match.tossChoice || "",
      localDateTime: match.dateTimeGMT ? new Date(match.dateTimeGMT).toLocaleString() : ""
    })) || [];
  } catch (error) {
    console.error("Error fetching live matches:", error);
    return [];
  }
};

// Fetches real-time scores (for ongoing matches)
export const fetchLiveScores = async (): Promise<CricketMatch[]> => {
  try {
    const response = await fetch(LIVE_SCORES_URL);
    const data = await response.json();

    if (data.status === "failure") {
      throw new Error(data.reason || "Failed to fetch live scores");
    }

    // Process t1s and t2s values when present
    const processedData = data.data.map((match: any) => {
      // Extract team names from match data
      const team1Name = match.t1?.replace(/\s*\[.*\]\s*$/, "").trim();
      const team2Name = match.t2?.replace(/\s*\[.*\]\s*$/, "").trim();
      
      // Format scores to include in the match object
      const team1Score = match.t1s || "";
      const team2Score = match.t2s || "";
      
      // Create formatted score objects
      const scoreObjects = [];
      
      if (team1Score) {
        const [runs, wickets, overs] = parseScore(team1Score);
        scoreObjects.push({
          r: runs,
          w: wickets,
          o: overs,
          inning: `${team1Name} Inning`
        });
      }
      
      if (team2Score) {
        const [runs, wickets, overs] = parseScore(team2Score);
        scoreObjects.push({
          r: runs,
          w: wickets,
          o: overs,
          inning: `${team2Name} Inning`
        });
      }
      
      const startTimeGMT = match.dateTimeGMT || new Date().toISOString();
      
      return {
        ...match,
        teams: [team1Name, team2Name],
        teamInfo: [
          { name: team1Name, img: match.t1img || "" },
          { name: team2Name, img: match.t2img || "" }
        ],
        score: scoreObjects.length > 0 ? scoreObjects : undefined,
        matchStarted: match.ms === "live" || match.ms === "result",
        matchEnded: match.ms === "result",
        dateTimeGMT: startTimeGMT,
        localDateTime: new Date(startTimeGMT).toLocaleString()
      };
    });
    
    return processedData || [];
  } catch (error) {
    console.error("Error fetching live scores:", error);
    return [];
  }
};

// Helper function to parse score strings like "292/8 (50)"
const parseScore = (scoreString: string): [number, number, number] =>
{
  if (!scoreString) return [0, 0, 0];
  
  // Extract runs/wickets part
  const runWicketMatch = scoreString.match(/(\d+)\/(\d+)/);
  const runs = runWicketMatch ? parseInt(runWicketMatch[1], 10) : 0;
  const wickets = runWicketMatch ? parseInt(runWicketMatch[2], 10) : 0;
  
  // Extract overs part
  const oversMatch = scoreString.match(/\(([^)]+)\)/);
  const overs = oversMatch ? parseFloat(oversMatch[1]) : 0;
  
  return [runs, wickets, overs];
};

// Enhanced country flag URL helper with better fallback
export const getCountryFlagUrl = (teamName: string): string => {
  if (!teamName) return "https://placehold.co/32x32?text=Team";
  
  // Extract country name from team name
  const countryName = teamName
    .replace(/ Cricket$/, "")
    .replace(/\s*\[.*\]\s*$/, "")
    .trim();
  
  // Map of country names to their flag codes
  const countryCodeMap: Record<string, string> = {
    "India": "in",
    "Australia": "au",
    "England": "gb-eng",
    "Pakistan": "pk",
    "New Zealand": "nz",
    "South Africa": "za", 
    "West Indies": "wi", // Custom code for West Indies
    "Sri Lanka": "lk",
    "Bangladesh": "bd",
    "Afghanistan": "af",
    "Zimbabwe": "zw",
    "Ireland": "ie",
    "Scotland": "gb-sct",
    "Netherlands": "nl",
    "United Arab Emirates": "ae",
    "Papua New Guinea": "pg",
    "Nepal": "np",
    "Namibia": "na",
    "Oman": "om",
    "USA": "us",
    "Canada": "ca",
    // IPL Teams
    "Chennai Super Kings": "in",
    "Mumbai Indians": "in",
    "Royal Challengers Bengaluru": "in",
    "Royal Challengers Bangalore": "in",
    "Kolkata Knight Riders": "in",
    "Delhi Capitals": "in",
    "Punjab Kings": "in",
    "Rajasthan Royals": "in",
    "Sunrisers Hyderabad": "in",
    "Gujarat Titans": "in",
    "Lucknow Super Giants": "in",
  };
  
  const countryCode = countryCodeMap[countryName] || "xx";
  
  // For West Indies, use a custom flag URL
  if (countryCode === "wi") {
    return "https://upload.wikimedia.org/wikipedia/commons/1/18/WestIndiesCricketFlagPre1999.svg";
  }
  
  try {
    return `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`;
  } catch {
    return "https://placehold.co/32x32?text=Team";
  }
};

// Updated function to get team logo URL with better error handling
export const getTeamLogoUrl = (team: any): string => {
  if (!team) return "https://placehold.co/32x32?text=Team";
  
  // If the team has a valid image URL, use it
  if (team.img && 
      team.img !== "https://h.cricapi.com/img/icon512.png" && 
      team.img.startsWith('http')) {
    return team.img;
  }
  
  // Otherwise use the country flag
  return getCountryFlagUrl(team.name);
};

// Format match status with better handling
export const formatMatchStatus = (status: string, matchStarted?: boolean, matchEnded?: boolean): string => {
  if (!status) return "Unknown";
  
  if (status === "Match not started" || status === "") return "Upcoming";
  if (status.toLowerCase().includes("won")) return status;
  if (matchStarted && !matchEnded) return "Live";
  if (matchEnded) return "Completed";
  return status;
};

// Format toss information
export const formatTossInfo = (match: CricketMatch): string => {
  if (!match.tossWinner) return "";
  
  const winnerTeam = match.teams?.find(team => match.tossWinner?.includes(team)) || match.tossWinner;
  const choice = match.tossChoice?.toLowerCase() || "";
  
  if (choice === "batting" || choice === "bat") {
    return `${winnerTeam} won the toss and chose to bat first`;
  } else if (choice === "bowling" || choice === "bowl" || choice === "field") {
    return `${winnerTeam} won the toss and chose to bowl first`;
  }
  
  return `${winnerTeam} won the toss`;
};

// Helper to format date and time in user's local timezone with improved precision
export const formatMatchDateTime = (dateTimeGMT?: string): string => {
  if (!dateTimeGMT) return "Date not available";
  
  try {
    // Create a Date object from the GMT string
    const matchDate = new Date(dateTimeGMT);
    
    // Check if date is valid
    if (isNaN(matchDate.getTime())) {
      return "Invalid date";
    }
    
    // Format the date in the user's local timezone with improved formatting
    return new Intl.DateTimeFormat('default', { 
      dateStyle: 'medium', 
      timeStyle: 'short',
      hour12: true  // Ensure 12-hour format with AM/PM
    }).format(matchDate);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
}

// Helper to categorize matches by start time and status with improved time logic
export const categorizeMatches = (matches: CricketMatch[]): CricketMatch[] => {
  // Current time in user's local timezone
  const now = new Date();
  
  return matches
    .map((match) => {
      if (!match?.dateTimeGMT) return null;
      
      try {
        // Parse match time from GMT string
        const matchTime = new Date(match.dateTimeGMT);
        
        // Calculate hours difference
        const hoursDiff = (matchTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        console.log(`Match: ${match.name}, Time: ${matchTime.toLocaleString()}, Hours diff: ${hoursDiff}`);
        
        // Add local date time to the match
        const enhancedMatch = {
          ...match,
          localDateTime: matchTime.toLocaleString()
        };
        
        // Live matches - using status or matchStarted/matchEnded properties
        if (match.status.toLowerCase() === "live" || 
            (match.matchStarted && !match.matchEnded)) {
          return { ...enhancedMatch, category: "Live" };
        }
        
        // For matches with matchStarted=true but status doesn't say "Live",
        // check if the match time is within the last 6 hours
        if (match.matchStarted && hoursDiff <= 0 && hoursDiff > -6) {
          return { ...enhancedMatch, category: "Live" };
        }
        
        // Upcoming matches (within next 48 hours)
        if (hoursDiff > 0 && hoursDiff <= 48) {
          return { ...enhancedMatch, category: "Upcoming" };
        }
        
        // Recently completed matches (within last 48 hours)
        if (hoursDiff < 0 && hoursDiff >= -48 && 
            (match.matchEnded || match.status.toLowerCase().includes("won"))) {
          return { ...enhancedMatch, category: "Completed" };
        }
        
        // Matches outside of the 48-hour window (future or past)
        if (hoursDiff > 48) {
          return { ...enhancedMatch, category: "Upcoming" };
        }
        
        if (hoursDiff < -48 && 
            (match.matchEnded || match.status.toLowerCase().includes("won"))) {
          return { ...enhancedMatch, category: "Completed" };
        }
        
        // Default categorization based on match status
        if (match.status.toLowerCase().includes("won") || match.matchEnded) {
          return { ...enhancedMatch, category: "Completed" };
        }
        
        return { ...enhancedMatch, category: "Upcoming" };
      } catch (error) {
        console.error(`Error categorizing match: ${match.name}`, error);
        return null;
      }
    })
    .filter(Boolean) as CricketMatch[];
};
