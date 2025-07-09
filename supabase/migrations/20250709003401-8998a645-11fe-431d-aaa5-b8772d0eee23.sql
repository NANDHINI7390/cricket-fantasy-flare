-- Enhance notifications system with database storage
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('match_update', 'contest_result', 'player_performance', 'league_update', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add user roles for admin access
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'));

-- Create admin statistics view
CREATE OR REPLACE VIEW public.admin_stats AS
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM public.contests) as total_contests,
  (SELECT COUNT(*) FROM public.contests WHERE filled_spots < total_spots) as active_contests,
  (SELECT COALESCE(SUM(entry_fee * filled_spots), 0) FROM public.contests) as total_revenue,
  (SELECT COUNT(*) FROM public.contest_entries) as total_entries,
  (SELECT COUNT(*) FROM public.teams) as total_teams;

-- Create leaderboard view with real data
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  p.id,
  p.username,
  p.avatar_url,
  u.email,
  COUNT(DISTINCT ce.id) as contests_joined,
  COALESCE(SUM(ce.points), 0) as total_points,
  COALESCE(SUM(ce.winning_amount), 0) as total_winnings,
  COUNT(DISTINCT t.id) as teams_created,
  ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(ce.points), 0) DESC) as rank
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.contest_entries ce ON u.id = ce.user_id
LEFT JOIN public.teams t ON u.id = t.user_id
GROUP BY p.id, p.username, p.avatar_url, u.email
ORDER BY total_points DESC;