
import { toast } from "sonner";

export const SPORTS_DB_API_URL =
  "https://www.thesportsdb.com/api/v1/json/3/eventsseason.php?id=5587&s=2025";
export const CRICK_API_URL =
  "https://api.cricapi.com/v1/currentMatches?apikey=a52ea237-09e7-4d69-b7cc-e4f0e79fb8ae";

export const TEAM_FLAGS: Record<string, string> = {
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

export const teamsMatch = (team1: string, team2: string): boolean => {
  const cleanName1 = team1 ? team1.replace(/ Cricket| National Team| Masters| Women/gi, "").toLowerCase().trim() : "";
  const cleanName2 = team2 ? team2.replace(/ Cricket| National Team| Masters| Women/gi, "").toLowerCase().trim() : "";
  return cleanName1 === cleanName2 || cleanName1.includes(cleanName2) || cleanName2.includes(cleanName1);
};

interface SportsDBMatch {
  idEvent: string;
  strEvent: string;
  dateEvent: string;
  strTime: string;
  strStatus: string;
  strHomeTeam: string;
  strAwayTeam: string;
  strVenue: string;
  strLeague: string;
  strSeason: string;
  [key: string]: any;
}

interface ProcessedMatch extends SportsDBMatch {
  matchStatus: 'Live' | 'Finished' | 'Upcoming';
}

export const fetchMatches = async (): Promise<ProcessedMatch[]> => {
  try {
    const response = await fetch(SPORTS_DB_API_URL);
    const data = await response.json();
    console.log("Fetched matches:", data);

    if (!data?.events) {
      throw new Error("No matches data received");
    }

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const filteredMatches = data.events
      .map((match: SportsDBMatch) => {
        const matchDateTime = new Date(`${match.dateEvent}T${match.strTime}Z`);
        const isFinished = match.strStatus === "Match Finished";
        const isFinishedRecently = isFinished && matchDateTime >= twentyFourHoursAgo;
        const isLive = matchDateTime <= now && !isFinished;
        const isUpcoming = matchDateTime > now;

        if (!isLive && !isUpcoming && !isFinishedRecently) return null;

        return {
          ...match,
          matchStatus: isLive ? "Live" : isFinished ? "Finished" : "Upcoming",
        };
      })
      .filter(Boolean)
      .sort((a: ProcessedMatch, b: ProcessedMatch) => {
        const statusPriority = { Live: 0, Upcoming: 1, Finished: 2 };
        const priorityDiff = statusPriority[a.matchStatus] - statusPriority[b.matchStatus];

        if (priorityDiff !== 0) return priorityDiff;

        return (
          new Date(`${a.dateEvent}T${a.strTime}Z`).getTime() -
          new Date(`${b.dateEvent}T${b.strTime}Z`).getTime()
        );
      });

    return filteredMatches;
  } catch (error) {
    console.error("Error fetching matches:", error);
    toast.error("Failed to fetch matches");
    return [];
  }
};

interface ScoreInfo {
  r?: number;
  w?: number;
  o?: number;
  inning: string;
  update?: boolean;
}

interface TeamInfo {
  name: string;
  shortname?: string;
  img?: string;
}

interface CricketMatch {
  id: string;
  name: string;
  matchType: string;
  status: string;
  venue: string;
  date: string;
  dateTimeGMT: string;
  teams: string[];
  teamInfo?: TeamInfo[];
  teamBatting?: string;
  score?: ScoreInfo[];
  matchStarted?: boolean;
  matchEnded?: boolean;
  [key: string]: any;
}

interface ProcessedCricketMatch extends CricketMatch {
  score: ScoreInfo[];
}

export const fetchLiveScores = async (): Promise<ProcessedCricketMatch[]> => {
  try {
    const response = await fetch(CRICK_API_URL);
    const data = await response.json();
    console.log("Fetched live scores:", data);

    if (data.status === "failure") {
      throw new Error(data.reason || "Failed to fetch live scores");
    }

    const matches: CricketMatch[] = data?.data || [];

    const updatedMatches = matches.map((match) => {
      const { teamInfo, score, status, teamBatting } = match;

      if (!score || score.length === 0) return match;

      // Identify batting team
      const battingTeam = teamBatting || (score[0]?.inning ? score[0].inning.split(" ")[0] : null);

      return {
        ...match,
        score: score.map((inning: ScoreInfo) => {
          return {
            ...inning,
            update: inning.inning.includes(battingTeam), // Update only for batting team
          };
        }),
      };
    });

    return updatedMatches;
  } catch (error) {
    console.error("Error fetching live scores:", error);
    toast.error("Failed to fetch live scores");
    return [];
  }
};

export const formatMatchDate = (matchDate: string, matchTime: string): string => {
  if (!matchDate || !matchTime) return "TBA";

  const matchDateTime = new Date(`${matchDate}T${matchTime}Z`);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  if (matchDateTime.toDateString() === now.toDateString()) {
    return `Today, ${matchDateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  } else if (matchDateTime.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow, ${matchDateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  } else {
    return matchDateTime.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  }
};
