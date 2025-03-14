
import { Player } from './player';

export interface FantasyTeam {
  id: string;
  user_id: string;
  name: string;
  match_id: string;
  captain_id: string | null;
  vice_captain_id: string | null;
  created_at: string;
  updated_at: string;
  players: Player[];
  totalCredits?: number;
  contests?: number;
}
