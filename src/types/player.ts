
export type PlayerRole = "batsman" | "bowler" | "allrounder" | "wicketkeeper";

export interface Player {
  id: string;
  name: string;
  team: string;
  role: PlayerRole;
  credits: number;
  image_url: string | null;
  stats: any | null;
  created_at: string;
  updated_at: string;
}

export interface SelectedPlayer extends Player {
  selected: boolean;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
}
