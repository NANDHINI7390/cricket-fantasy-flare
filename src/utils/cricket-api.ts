const API_KEY = "a52ea237-09e7-4d69-b7cc-e4f0e79fb8ae";

// Endpoints
const MATCHES_URL = `https://api.cricapi.com/v1/currentMatches?apikey=${API_KEY}`;
const LIVE_SCORES_URL = `https://api.cricapi.com/v1/cricScore?apikey=${API_KEY}`;

export interface ScoreInfo {
  r?: number; // Runs
  w?: number; // Wickets
  o?: number; // Overs
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
}

// Fetches live matches (without ball-by-ball updates)
export const fetchLiveMatches = async (): Promise<CricketMatch[]> => {
  try {
    const response = await fetch(MATCHES_URL);
    const data = await response.json();

    if (data.status === "failure") {
      throw new Error(data.reason || "Failed to fetch live matches");
    }

    return data.data || [];
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
      
      return {
        ...match,
        teams: [team1Name, team2Name],
        teamInfo: [
          { name: team1Name, img: match.t1img || "" },
          { name: team2Name, img: match.t2img || "" }
        ],
        score: scoreObjects.length > 0 ? scoreObjects : undefined,
        matchStarted: match.ms === "live" || match.ms === "result",
        matchEnded: match.ms === "result"
      };
    });
    
    return processedData || [];
  } catch (error) {
    console.error("Error fetching live scores:", error);
    return [];
  }
};

// Helper function to parse score strings like "292/8 (50)"
const parseScore = (scoreString: string): [number, number, number] => {
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

// Helper function to get country flag URL
export const getCountryFlagUrl = (teamName: string): string => {
  // Extract country name from team name, removing "Cricket" suffix if present
  const countryName = teamName.replace(/ Cricket$/, "")
    .replace(/\s*\[.*\]\s*$/, "").trim(); // Remove bracketed parts like [CSK]
  
  // Map of country names to their flag codes (ISO 3166-1 alpha-2)
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
    "Kolkata Knight Riders": "in",
    "Delhi Capitals": "in",
    "Punjab Kings": "in",
    "Rajasthan Royals": "in",
    "Sunrisers Hyderabad": "in",
    "Gujarat Titans": "in",
    "Lucknow Super Giants": "in",
  };
  
  // Get the country code, default to a placeholder if not found
  const countryCode = countryCodeMap[countryName] || "xx";
  
  // For West Indies, use a custom flag URL
  if (countryCode === "wi") {
    return "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/WestIndiesCricketFlagPre1999.svg/320px-WestIndiesCricketFlagPre1999.svg.png";
  }
  
  // Return standard flag URL from flagpedia
  return `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`;
};

// Function to get team logo URL (falls back to country flag if no logo)
export const getTeamLogoUrl = (team: any): string => {
  // If the team has an image URL, use it
  if (team.img && team.img !== "https://h.cricapi.com/img/icon512.png") {
    return team.img;
  }
  
  // Otherwise use the country flag
  return getCountryFlagUrl(team.name);
};

// Format match status to be more user-friendly
export const formatMatchStatus = (status: string, matchStarted?: boolean, matchEnded?: boolean): string => {
  if (status === "Match not started") return "Upcoming";
  if (status.includes("won")) return status;
  if (matchStarted && !matchEnded) return "Live";
  if (matchEnded) return "Completed";
  return status;
};
