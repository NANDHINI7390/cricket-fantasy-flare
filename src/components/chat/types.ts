
import { CricketMatch } from "@/utils/cricket-api";
import { Player } from "@/types/player";

export type MessageType = "user" | "bot" | "match-update" | "player-suggestion" | "live-analysis";

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  matchData?: CricketMatch;
  playerSuggestions?: {
    captain?: Player;
    viceCaptain?: Player;
    allrounders?: Player[];
  };
  isTemporary?: boolean;
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
}

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export interface ChatMessageProps {
  message: Message;
  formatMatchData: (match: CricketMatch) => string | MatchDetails;
}

export interface MatchDetails {
  team1: string;
  team2: string;
  team1Score: string;
  team2Score: string;
  status: string;
  team1Logo: string;
  team2Logo: string;
}

export interface LiveMatchesProps {
  matches: CricketMatch[];
  formatMatchData: (match: CricketMatch) => string | MatchDetails;
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
