const API_KEY = "a52ea237-09e7-4d69-b7cc-e4f0e79fb8ae";

// Endpoints
const MATCHES_URL = `https://api.cricapi.com/v1/currentMatches?apikey=${API_KEY}`;
const LIVE_SCORES_URL = `https://api.cricapi.com/v1/cricScore?apikey=${API_KEY}`;
const SCORECARD_URL = `https://api.cricapi.com/v1/match_scorecard?apikey=${API_KEY}`;

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

// New interface for player batting stats
export interface BattingStats {
  batsman: string;
  dismissal: string;
  r: number;
  b: number;
  fours: number;
  sixes: number;
  sr: number;
}

// New interface for player bowling stats
export interface BowlingStats {
  bowler: string;
  o: number;
  m: number;
  r: number;
  w: number;
  eco: number;
  wd: number;
  nb: number;
}

// New interface for scorecard data
export interface ScorecardData {
  id: string;
  name: string;
  matchType: string;
  status: string;
  venue: string;
  date: string;
  dateTimeGMT: string;
  teams: string[];
  teamInfo: {
    name: string;
    img: string;
    shortname?: string;
  }[];
  score: ScoreInfo[];
  tossWinner: string;
  tossChoice: string;
  matchWinner?: string;
  scorecard: {
    batting: BattingStats[];
    bowling: BowlingStats[];
    inning: string;
  }[];
  players?: {
    name: string;
    role?: string;
    team?: string;
  }[];
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
      // Format local date time properly
      localDateTime: match.dateTimeGMT ? formatDateTimeForDisplay(match.dateTimeGMT) : ""
    })) || [];
  } catch (error) {
    console.error("Error fetching live matches:", error);
    return [];
  }
};

// Helper function to format date time consistently
const formatDateTimeForDisplay = (dateTimeGMT: string): string => {
  try {
    const date = new Date(dateTimeGMT);
    
    // Format the date for Indian Standard Time (IST)
    // IST is UTC+5:30
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZone: 'Asia/Kolkata' // Use IST timezone
    };
    
    return new Intl.DateTimeFormat('en-IN', options).format(date);
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateTimeGMT;
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
        // Format local date time properly
        localDateTime: formatDateTimeForDisplay(startTimeGMT)
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

// New function to fetch scorecard data
export const fetchMatchScorecard = async (matchId: string): Promise<ScorecardData | null> => {
  try {
    const response = await fetch(`${SCORECARD_URL}&id=${matchId}`);
    const data = await response.json();

    if (data.status !== "success") {
      throw new Error(data.reason || "Failed to fetch scorecard");
    }

    return data.data || null;
  } catch (error) {
    console.error("Error fetching match scorecard:", error);
    return null;
  }
};

// Calculate player rating based on batting performance
export const calculateBattingRating = (batStats: BattingStats): number => {
  if (!batStats) return 0;
  
  // Base score from runs
  let rating = batStats.r * 1;
  
  // Bonus for strike rate
  if (batStats.sr > 150) {
    rating += 20;
  } else if (batStats.sr > 130) {
    rating += 15;
  } else if (batStats.sr > 110) {
    rating += 10;
  } else if (batStats.sr > 90) {
    rating += 5;
  }
  
  // Bonus for boundaries
  rating += (batStats.fours * 2) + (batStats.sixes * 4);
  
  // Bonus for big scores
  if (batStats.r >= 100) {
    rating += 50;
  } else if (batStats.r >= 50) {
    rating += 25;
  } else if (batStats.r >= 30) {
    rating += 10;
  }
  
  return rating;
};

// Calculate player rating based on bowling performance
export const calculateBowlingRating = (bowlStats: BowlingStats): number => {
  if (!bowlStats) return 0;
  
  // Base score from wickets
  let rating = bowlStats.w * 25;
  
  // Bonus for economy
  if (bowlStats.eco < 6) {
    rating += 20;
  } else if (bowlStats.eco < 7) {
    rating += 15;
  } else if (bowlStats.eco < 8) {
    rating += 10;
  } else if (bowlStats.eco < 9) {
    rating += 5;
  }
  
  // Penalty for bad economy
  if (bowlStats.eco > 10) {
    rating -= 10;
  }
  
  // Bonus for maidens
  rating += (bowlStats.m * 5);
  
  // Bonuses for wicket milestones
  if (bowlStats.w >= 5) {
    rating += 50;
  } else if (bowlStats.w >= 3) {
    rating += 25;
  } else if (bowlStats.w >= 2) {
    rating += 10;
  }
  
  return rating;
};

// Analyze scorecard and identify best performers
export const analyzeScorecardData = (scorecard: ScorecardData): {
  bestBatsmen: Array<{name: string, stats: BattingStats, rating: number}>;
  bestBowlers: Array<{name: string, stats: BowlingStats, rating: number}>;
  bestCaptainPick: {name: string, role: string, rating: number};
  recommendedTeam: Array<{name: string, role: string, rating: number}>;
} => {
  if (!scorecard || !scorecard.scorecard) {
    return {
      bestBatsmen: [],
      bestBowlers: [],
      bestCaptainPick: {name: "No data", role: "unknown", rating: 0},
      recommendedTeam: []
    };
  }
  
  // Process batting performances
  const batsmen: Array<{name: string, stats: BattingStats, rating: number}> = [];
  
  // Process bowling performances
  const bowlers: Array<{name: string, stats: BowlingStats, rating: number}> = [];
  
  // Go through each innings
  scorecard.scorecard.forEach(inning => {
    // Process batsmen
    inning.batting.forEach(batsman => {
      // Skip entries with no runs or very low contribution
      if (batsman.r <= 1) return;
      
      const rating = calculateBattingRating(batsman);
      
      batsmen.push({
        name: batsman.batsman,
        stats: batsman,
        rating
      });
    });
    
    // Process bowlers
    inning.bowling.forEach(bowler => {
      // Skip entries with no overs bowled
      if (bowler.o <= 0) return;
      
      const rating = calculateBowlingRating(bowler);
      
      bowlers.push({
        name: bowler.bowler,
        stats: bowler,
        rating
      });
    });
  });
  
  // Sort batsmen and bowlers by rating
  const sortedBatsmen = batsmen.sort((a, b) => b.rating - a.rating);
  const sortedBowlers = bowlers.sort((a, b) => b.rating - a.rating);
  
  // Find the best captain based on highest overall rating
  let bestCaptain = {name: "No data", role: "unknown", rating: 0};
  
  // Consider top batsman
  if (sortedBatsmen.length > 0) {
    bestCaptain = {
      name: sortedBatsmen[0].name,
      role: "batsman",
      rating: sortedBatsmen[0].rating
    };
  }
  
  // Consider top bowler - if better than batsman
  if (sortedBowlers.length > 0 && sortedBowlers[0].rating > bestCaptain.rating) {
    bestCaptain = {
      name: sortedBowlers[0].name,
      role: "bowler",
      rating: sortedBowlers[0].rating
    };
  }
  
  // Build recommended team (max 11 players)
  const recommendedTeam: Array<{name: string, role: string, rating: number}> = [];
  
  // Add top 6 batsmen
  sortedBatsmen.slice(0, 6).forEach(batsman => {
    recommendedTeam.push({
      name: batsman.name,
      role: "batsman",
      rating: batsman.rating
    });
  });
  
  // Add top 5 bowlers 
  sortedBowlers.slice(0, 5).forEach(bowler => {
    // Avoid duplicates (in case player is both batsman and bowler)
    if (!recommendedTeam.some(player => player.name === bowler.name)) {
      recommendedTeam.push({
        name: bowler.name,
        role: "bowler",
        rating: bowler.rating
      });
    }
  });
  
  // If we don't have 11 players, fill with remaining players
  if (recommendedTeam.length < 11) {
    // Add remaining batsmen
    let index = 6;
    while (recommendedTeam.length < 11 && index < sortedBatsmen.length) {
      if (!recommendedTeam.some(player => player.name === sortedBatsmen[index].name)) {
        recommendedTeam.push({
          name: sortedBatsmen[index].name,
          role: "batsman",
          rating: sortedBatsmen[index].rating
        });
      }
      index++;
    }
    
    // Add remaining bowlers
    index = 5;
    while (recommendedTeam.length < 11 && index < sortedBowlers.length) {
      if (!recommendedTeam.some(player => player.name === sortedBowlers[index].name)) {
        recommendedTeam.push({
          name: sortedBowlers[index].name,
          role: "bowler",
          rating: sortedBowlers[index].rating
        });
      }
      index++;
    }
  }
  
  return {
    bestBatsmen: sortedBatsmen.slice(0, 5),
    bestBowlers: sortedBowlers.slice(0, 5),
    bestCaptainPick: bestCaptain,
    recommendedTeam: recommendedTeam.slice(0, 11)
  };
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

// Helper to format date and time in IST timezone with improved precision
export const formatMatchDateTime = (dateTimeGMT?: string): string => {
  if (!dateTimeGMT) return "Date not available";
  
  try {
    // Create a Date object from the GMT string
    const matchDate = new Date(dateTimeGMT);
    
    // Check if date is valid
    if (isNaN(matchDate.getTime())) {
      return "Invalid date";
    }
    
    // Format the date in IST timezone with improved formatting
    return new Intl.DateTimeFormat('en-IN', { 
      dateStyle: 'medium', 
      timeStyle: 'short',
      hour12: true,
      timeZone: 'Asia/Kolkata' // Use IST timezone
    }).format(matchDate);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
}

// Helper to calculate IST time from GMT time
const convertToIST = (dateTimeGMT: string): Date => {
  const utcDate = new Date(dateTimeGMT);
  // No need to manually adjust for IST as we're using the timeZone option in DateTimeFormat
  return utcDate;
};

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
        
        // Add local date time to the match
        const enhancedMatch = {
          ...match,
          localDateTime: formatDateTimeForDisplay(match.dateTimeGMT)
        };
        
        // IMPROVED CATEGORIZATION LOGIC
        
        // If match has definitively ended based on explicit status
        if (match.status.toLowerCase().includes("won") || 
            match.status.toLowerCase().includes("drawn") ||
            match.status.toLowerCase().includes("abandoned") ||
            match.matchEnded === true) {
          return { ...enhancedMatch, category: "Completed" };
        }
        
        // Calculate time difference in milliseconds
        const timeDiff = matchTime.getTime() - now.getTime();
        
        // If match is in the future (positive time difference) - it's Upcoming
        if (timeDiff > 0) {
          return { ...enhancedMatch, category: "Upcoming" };
        }
        
        // If match has explicit "Live" status
        if (match.status.toLowerCase() === "live" || 
            match.status.toLowerCase().includes("live")) {
          return { ...enhancedMatch, category: "Live" };
        }
        
        // Match has started but no explicit completion status and started within last 8 hours
        // Cricket matches typically last 3-8 hours depending on format
        if ((match.matchStarted === true || timeDiff <= 0) && 
            timeDiff > -8 * 60 * 60 * 1000 && 
            match.matchEnded !== true) {
          
          // Check for match type to determine if it might still be live
          if (match.matchType?.toLowerCase() === 't20') {
            // T20 matches last about 3.5-4 hours
            if (timeDiff > -4 * 60 * 60 * 1000) {
              return { ...enhancedMatch, category: "Live" };
            }
          } else if (match.matchType?.toLowerCase() === 'odi') {
            // ODI matches last about 8 hours
            if (timeDiff > -8 * 60 * 60 * 1000) {
              return { ...enhancedMatch, category: "Live" };
            }
          } else if (match.matchType?.toLowerCase() === 'test') {
            // Test matches last multiple days, check if day's play is in progress
            const currentHour = now.getHours();
            // Typical playing hours are between 10:00 and 18:00 local time
            if (currentHour >= 10 && currentHour < 18) {
              return { ...enhancedMatch, category: "Live" };
            }
          } else {
            // For unknown match types, use a 6-hour window
            if (timeDiff > -6 * 60 * 60 * 1000) {
              return { ...enhancedMatch, category: "Live" };
            }
          }
        }
        
        // If match started more than 8 hours ago, it's most likely completed
        return { ...enhancedMatch, category: "Completed" };
        
      } catch (error) {
        console.error(`Error categorizing match: ${match.name}`, error);
        return null;
      }
    })
    .filter((match): match is CricketMatch => match !== null);
};
