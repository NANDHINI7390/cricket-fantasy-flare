
import { Player } from "@/types/player";
import { CricketMatch } from "@/utils/cricket-api";

export interface Message {
  id: string;
  type: "user" | "bot" | "match-update" | "player-suggestion" | "ai-analysis";
  content: string;
  timestamp: Date;
  matchData?: CricketMatch;
  playerSuggestions?: {
    captain?: Player;
    viceCaptain?: Player;
    allrounders?: Player[];
  };
  liveAnalysis?: {
    matchName: string;
    teamScores: string[];
    captainPick?: {
      name: string;
      stats: string;
      reason: string;
    };
    bowlingPick?: {
      name: string;
      stats: string;
      reason: string;
    };
    otherRecommendations?: Array<{
      name: string;
      role: string;
      reason: string;
    }>;
  };
  playerStats?: Array<{
    name: string;
    role: string;
    details: string;
  }>;
}

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export interface ChatMessageProps {
  message: Message;
  formatMatchData: (match: CricketMatch) => any;
}

export interface MatchDetails {
  team1: string;
  team2: string;
  team1Score: string;
  team2Score: string;
  status: string;
  team1Logo?: string;
  team2Logo?: string;
}

export interface LiveAnalysisProps {
  analysis: {
    matchName: string;
    teamScores: string[];
    captainPick?: {
      name: string;
      stats: string;
      reason: string;
    };
    bowlingPick?: {
      name: string;
      stats: string;
      reason: string;
    };
    otherRecommendations?: Array<{
      name: string;
      role: string;
      reason: string;
    }>;
  };
  content: string;
}

export interface LiveMatchesProps {
  matches: CricketMatch[];
  formatMatchData: (match: CricketMatch) => any;
  onRefresh: () => void;
}

export interface MatchCardProps {
  match: CricketMatch;
  details: MatchDetails;
}

export interface PlayerSuggestionProps {
  playerSuggestions: {
    captain?: Player;
    viceCaptain?: Player;
    allrounders?: Player[];
  };
  content: string;
}
