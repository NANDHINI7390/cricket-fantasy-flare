import { CricketMatch } from "@/utils/cricket-api";
import { Player } from "@/types/player";

export type MessageType = "user" | "bot" | "match-update" | "player-suggestion";

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
  isTemporary?: boolean; // Added this property to fix the error
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
