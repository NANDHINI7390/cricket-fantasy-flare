import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Trophy, 
  Users, 
  CreditCard, 
  TrendingUp, 
  Calendar,
  Plus,
  Eye,
  Crown,
  Activity,
  Target,
  Award,
  Clock,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import PageNavigation from "@/components/PageNavigation";

interface DashboardStats {
  totalTeams: number;
  totalContests: number;
  totalWinnings: number;
  currentBalance: number;
  recentActivity: any[];
  upcomingMatches: any[];
  subscriptionStatus: any;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalTeams: 0,
    totalContests: 0,
    totalWinnings: 0,
    currentBalance: 0,
    recentActivity: [],
    upcomingMatches: [],
    subscriptionStatus: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch user stats in parallel
      const [
        teamsResult,
        contestsResult,
        walletResult,
        transactionsResult,
        matchesResult,
        subscriptionResult
      ] = await Promise.all([
        supabase.from('teams').select('*').eq('user_id', user.id),
        supabase.from('contest_entries').select('*, contests(name, entry_fee, first_prize)').eq('user_id', user.id),
        supabase.from('wallets').select('balance').eq('user_id', user.id).single(),
        supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('cricket_matches').select('*').eq('status', 'upcoming').limit(3),
        supabase.functions.invoke('check-subscription')
      ]);

      const totalWinnings = contestsResult.data?.reduce((sum, entry) => 
        sum + (entry.winning_amount || 0), 0) || 0;

      setStats({
        totalTeams: teamsResult.data?.length || 0,
        totalContests: contestsResult.data?.length || 0,
        totalWinnings,
        currentBalance: walletResult.data?.balance || 0,
        recentActivity: transactionsResult.data || [],
        upcomingMatches: matchesResult.data || [],
        subscriptionStatus: subscriptionResult.data
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getUserInitials = () => {
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const quickActions = [
    { label: 'Create Team', icon: Plus, path: '/create-team', color: 'bg-blue-500' },
    { label: 'Join Contest', icon: Trophy, path: '/contests', color: 'bg-green-500' },
    { label: 'Add Money', icon: CreditCard, path: '/wallet', color: 'bg-purple-500' },
    { label: 'Player Analysis', icon: BarChart3, path: '/player-analysis', color: 'bg-orange-500' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-8 px-4 bg-gradient-to-b from-background to-secondary/20"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="mb-6">
          <PageNavigation />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="text-lg font-semibold">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Player'}!
              </h1>
              <p className="text-muted-foreground">
                Ready to dominate fantasy cricket today?
              </p>
            </div>
            {stats.subscriptionStatus?.subscribed && (
              <Badge variant="default" className="ml-auto">
                <Crown className="h-3 w-3 mr-1" />
                {stats.subscriptionStatus.subscription_tier || 'Premium'}
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeams}</div>
              <p className="text-xs text-muted-foreground">
                Teams created
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contests Joined</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalContests}</div>
              <p className="text-xs text-muted-foreground">
                Active participation
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Winnings</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalWinnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Lifetime earnings
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.currentBalance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Available funds
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Jump into your next fantasy cricket adventure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => (
                <Button
                  key={action.label}
                  asChild
                  variant="outline"
                  className="w-full justify-start h-12"
                >
                  <Link to={action.path}>
                    <div className={`rounded-full p-2 mr-3 ${action.color}`}>
                      <action.icon className="h-4 w-4 text-white" />
                    </div>
                    {action.label}
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest transactions and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent activity</p>
                  <Button asChild variant="link" className="mt-2">
                    <Link to="/contests">Join your first contest</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentActivity.map((activity, index) => (
                    <div key={activity.id || index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-full p-2 ${
                          activity.type === 'deposit' ? 'bg-green-100' :
                          activity.type === 'withdrawal' ? 'bg-red-100' :
                          activity.type === 'contest_join' ? 'bg-blue-100' :
                          'bg-yellow-100'
                        }`}>
                          {activity.type === 'deposit' && <TrendingUp className="h-4 w-4 text-green-600" />}
                          {activity.type === 'withdrawal' && <CreditCard className="h-4 w-4 text-red-600" />}
                          {activity.type === 'contest_join' && <Trophy className="h-4 w-4 text-blue-600" />}
                          {activity.type === 'contest_win' && <Award className="h-4 w-4 text-yellow-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(activity.created_at), 'MMM dd, HH:mm')}
                          </p>
                        </div>
                      </div>
                      <div className={`font-semibold ${activity.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {activity.amount > 0 ? '+' : ''}₹{Math.abs(activity.amount).toFixed(2)}
                      </div>
                    </div>
                  ))}
                  <Button asChild variant="link" className="w-full">
                    <Link to="/wallet">View all transactions</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Matches */}
        {stats.upcomingMatches.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Matches
              </CardTitle>
              <CardDescription>
                Create teams for these upcoming cricket matches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.upcomingMatches.map((match, index) => (
                  <div key={match.id || index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                      <Badge variant="outline">{match.status}</Badge>
                      <span className="text-xs text-muted-foreground">{match.time}</span>
                    </div>
                    <h4 className="font-semibold text-sm mb-1">
                      {match.team1_name} vs {match.team2_name}
                    </h4>
                    <div className="flex gap-2 mt-3">
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <Link to={`/create-team?match=${match.match_id}`}>
                          <Plus className="h-3 w-3 mr-1" />
                          Create Team
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="ghost">
                        <Link to="/contests">
                          <Eye className="h-3 w-3 mr-1" />
                          View Contests
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription Status */}
        {!stats.subscriptionStatus?.subscribed && (
          <Card className="mt-6 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Upgrade to Premium
              </CardTitle>
              <CardDescription>
                Unlock advanced features and boost your fantasy cricket performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm mb-2">Get access to:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Advanced AI player recommendations</li>
                    <li>• Unlimited contest entries</li>
                    <li>• Detailed analytics and insights</li>
                    <li>• Priority customer support</li>
                  </ul>
                </div>
                <Button asChild>
                  <Link to="/subscription">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade Now
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;