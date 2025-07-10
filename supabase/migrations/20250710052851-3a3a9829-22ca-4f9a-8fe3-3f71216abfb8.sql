-- Create matches table for upcoming cricket matches
CREATE TABLE public.matches (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    team1_name TEXT NOT NULL,
    team1_logo TEXT,
    team2_name TEXT NOT NULL, 
    team2_logo TEXT,
    venue TEXT,
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'upcoming',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create match_players table for storing players in each match
CREATE TABLE public.match_players (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id TEXT NOT NULL,
    player_id UUID NOT NULL REFERENCES public.players(id),
    team TEXT NOT NULL,
    is_playing_xi BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update teams table to include scoring details
ALTER TABLE public.teams 
ADD COLUMN total_points NUMERIC DEFAULT 0,
ADD COLUMN final_rank INTEGER,
ADD COLUMN is_locked BOOLEAN DEFAULT false;

-- Create fantasy_contests table
CREATE TABLE public.fantasy_contests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id TEXT NOT NULL,
    name TEXT NOT NULL,
    entry_fee NUMERIC NOT NULL DEFAULT 0,
    prize_pool NUMERIC NOT NULL,
    total_spots INTEGER NOT NULL,
    filled_spots INTEGER NOT NULL DEFAULT 0,
    max_entries_per_user INTEGER DEFAULT 1,
    first_prize NUMERIC NOT NULL,
    winning_percentage INTEGER NOT NULL,
    guaranteed_prize BOOLEAN DEFAULT false,
    contest_type TEXT DEFAULT 'public', -- public, private, head-to-head
    min_team_size INTEGER DEFAULT 11,
    max_team_size INTEGER DEFAULT 11,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create player_performances table for live scoring
CREATE TABLE public.player_performances (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id TEXT NOT NULL,
    player_id UUID NOT NULL REFERENCES public.players(id),
    runs_scored INTEGER DEFAULT 0,
    balls_faced INTEGER DEFAULT 0,
    fours INTEGER DEFAULT 0,
    sixes INTEGER DEFAULT 0,
    wickets_taken INTEGER DEFAULT 0,
    runs_conceded INTEGER DEFAULT 0,
    balls_bowled INTEGER DEFAULT 0,
    maidens INTEGER DEFAULT 0,
    catches INTEGER DEFAULT 0,
    stumpings INTEGER DEFAULT 0,
    run_outs INTEGER DEFAULT 0,
    is_duck BOOLEAN DEFAULT false,
    is_opener BOOLEAN DEFAULT false,
    strike_rate NUMERIC,
    economy_rate NUMERIC,
    fantasy_points NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for all new tables
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fantasy_contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_performances ENABLE ROW LEVEL SECURITY;

-- RLS Policies for matches (public read)
CREATE POLICY "Matches are viewable by everyone" 
ON public.matches FOR SELECT 
USING (true);

-- RLS Policies for match_players (public read)
CREATE POLICY "Match players are viewable by everyone" 
ON public.match_players FOR SELECT 
USING (true);

-- RLS Policies for fantasy_contests (public read)
CREATE POLICY "Fantasy contests are viewable by everyone" 
ON public.fantasy_contests FOR SELECT 
USING (true);

-- RLS Policies for player_performances (public read)
CREATE POLICY "Player performances are viewable by everyone" 
ON public.player_performances FOR SELECT 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_matches_date_time ON public.matches(date_time);
CREATE INDEX idx_matches_status ON public.matches(status);
CREATE INDEX idx_match_players_match_id ON public.match_players(match_id);
CREATE INDEX idx_fantasy_contests_match_id ON public.fantasy_contests(match_id);
CREATE INDEX idx_player_performances_match_player ON public.player_performances(match_id, player_id);

-- Update trigger for matches
CREATE TRIGGER update_matches_updated_at
    BEFORE UPDATE ON public.matches
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for fantasy_contests
CREATE TRIGGER update_fantasy_contests_updated_at
    BEFORE UPDATE ON public.fantasy_contests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for player_performances
CREATE TRIGGER update_player_performances_updated_at
    BEFORE UPDATE ON public.player_performances
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();