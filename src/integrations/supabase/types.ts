export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      contest_entries: {
        Row: {
          contest_id: string
          created_at: string
          id: string
          points: number | null
          rank: number | null
          team_id: string
          updated_at: string
          user_id: string
          winning_amount: number | null
        }
        Insert: {
          contest_id: string
          created_at?: string
          id?: string
          points?: number | null
          rank?: number | null
          team_id: string
          updated_at?: string
          user_id: string
          winning_amount?: number | null
        }
        Update: {
          contest_id?: string
          created_at?: string
          id?: string
          points?: number | null
          rank?: number | null
          team_id?: string
          updated_at?: string
          user_id?: string
          winning_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contest_entries_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contest_entries_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      contests: {
        Row: {
          created_at: string
          entry_fee: number
          filled_spots: number
          first_prize: number
          guaranteed_prize: boolean
          id: string
          match_id: string
          max_entries_per_user: number
          name: string
          prize_pool: number
          total_spots: number
          updated_at: string
          winning_percentage: number
        }
        Insert: {
          created_at?: string
          entry_fee?: number
          filled_spots?: number
          first_prize: number
          guaranteed_prize?: boolean
          id?: string
          match_id: string
          max_entries_per_user?: number
          name: string
          prize_pool: number
          total_spots: number
          updated_at?: string
          winning_percentage: number
        }
        Update: {
          created_at?: string
          entry_fee?: number
          filled_spots?: number
          first_prize?: number
          guaranteed_prize?: boolean
          id?: string
          match_id?: string
          max_entries_per_user?: number
          name?: string
          prize_pool?: number
          total_spots?: number
          updated_at?: string
          winning_percentage?: number
        }
        Relationships: []
      }
      cricket_matches: {
        Row: {
          created_at: string | null
          id: string
          match_id: string
          overs: string | null
          score1: string | null
          score2: string | null
          status: string
          team1_logo: string | null
          team1_name: string
          team2_logo: string | null
          team2_name: string
          time: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          match_id: string
          overs?: string | null
          score1?: string | null
          score2?: string | null
          status: string
          team1_logo?: string | null
          team1_name: string
          team2_logo?: string | null
          team2_name: string
          time?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          match_id?: string
          overs?: string | null
          score1?: string | null
          score2?: string | null
          status?: string
          team1_logo?: string | null
          team1_name?: string
          team2_logo?: string | null
          team2_name?: string
          time?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      players: {
        Row: {
          created_at: string
          credits: number
          id: string
          image_url: string | null
          name: string
          role: string
          stats: Json | null
          team: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credits: number
          id?: string
          image_url?: string | null
          name: string
          role: string
          stats?: Json | null
          team: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credits?: number
          id?: string
          image_url?: string | null
          name?: string
          role?: string
          stats?: Json | null
          team?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      team_players: {
        Row: {
          created_at: string
          id: string
          player_id: string
          team_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          player_id: string
          team_id: string
        }
        Update: {
          created_at?: string
          id?: string
          player_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          captain_id: string | null
          created_at: string
          id: string
          match_id: string
          name: string
          updated_at: string
          user_id: string
          vice_captain_id: string | null
        }
        Insert: {
          captain_id?: string | null
          created_at?: string
          id?: string
          match_id: string
          name: string
          updated_at?: string
          user_id: string
          vice_captain_id?: string | null
        }
        Update: {
          captain_id?: string | null
          created_at?: string
          id?: string
          match_id?: string
          name?: string
          updated_at?: string
          user_id?: string
          vice_captain_id?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          status: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      join_contest: {
        Args: {
          contest_id: string
          team_id: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
