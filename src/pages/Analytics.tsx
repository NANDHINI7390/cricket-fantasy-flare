
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Users, 
  Trophy, 
  DollarSign,
  Calendar,
  Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PageNavigation from "@/components/PageNavigation";

interface AnalyticsData {
  totalContests: number;
  totalWinnings: number;
  winRate: number;
  averagePosition: number;
  bestRank: number;
  totalTeams: number;
  monthlyStats: Array<{
    month: string;
    contests: number;
    winnings: number;
    winRate: number;
  }>;
  performanceByMatchType: Array<{
    type: string;
    contests: number;
    winnings: number;
    winRate: number;
  }>;
}

const Analytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalContests: 0,
    totalWinnings: 0,
    winRate: 0,
    averagePosition: 0,
    bestRank: 0,
    totalTeams: 0,
    monthlyStats: [],
    performanceByMatchType: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("all_time");

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        toast.error("Please login to view analytics");
        return;
      }

      // Fetch user's contest entries
      const { data: entries, error: entriesError } = await supabase
        .from('contest_entries')
        .select(`
          *,
          contests!inner(name, match_id, entry_fee)
        `)
        .eq('user_id', user.user.id);

      if (entriesError) throw entriesError;

      // Fetch user's teams
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .eq('user_id', user.user.id);

      if (teamsError) throw teamsError;

      // Calculate analytics
      const totalContests = entries?.length || 0;
      const totalWinnings = entries?.reduce((sum, entry) => sum + (entry.winning_amount || 0), 0) || 0;
      const wins = entries?.filter(entry => (entry.winning_amount || 0) > 0).length || 0;
      const winRate = totalContests > 0 ? (wins / totalContests) * 100 : 0;
      const ranks = entries?.filter(entry => entry.rank).map(entry => entry.rank);
      const averagePosition = ranks && ranks.length > 0 ? ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length : 0;
      const bestRank = ranks && ranks.length > 0 ? Math.min(...ranks) : 0;

      // Mock monthly stats (in a real app, you'd calculate this from actual data)
      const monthlyStats = [
        { month: "Jan", contests: 12, winnings: 2500, winRate: 25 },
        { month: "Feb", contests: 18, winnings: 3200, winRate: 33 },
        { month: "Mar", contests: 25, winnings: 4100, winRate: 28 },
        { month: "Apr", contests: 22, winnings: 3800, winRate: 32 },
        { month: "May", contests: 30, winnings: 5500, winRate: 37 },
        { month: "Jun", contests: 28, winnings: 4900, winRate: 35 }
      ];

      // Mock performance by match type
      const performanceByMatchType = [
        { type: "T20", contests: 45, winnings: 12000, winRate: 33 },
        { type: "ODI", contests: 28, winnings: 8500, winRate: 29 },
        { type: "Test", contests: 15, winnings: 3500, winRate: 27 },
        { type: "IPL", contests: 52, winnings: 15000, winRate: 38 }
      ];

      setAnalytics({
        totalContests,
        totalWinnings,
        winRate,
        averagePosition,
        bestRank,
        totalTeams: teams?.length || 0,
        monthlyStats,
        performanceByMatchType
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, subtitle, trend }: {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    subtitle: string;
    trend?: number;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {icon}
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-gray-500">{subtitle}</p>
            </div>
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp size={16} className={trend < 0 ? 'rotate-180' : ''} />
              <span className="text-sm font-medium">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 px-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center py-12">
            <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-8 px-4 bg-gradient-to-r from-blue-50 to-indigo-50"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Track your fantasy cricket performance and insights</p>
          </div>
          <PageNavigation />
        </div>

        {/* Time filter */}
        <div className="mb-6">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_time">All Time</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
              <SelectItem value="last_6_months">Last 6 Months</SelectItem>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Trophy className="h-6 w-6 text-yellow-500" />}
            title="Total Contests"
            value={analytics.totalContests}
            subtitle="Contests participated"
            trend={12}
          />
          <StatCard
            icon={<DollarSign className="h-6 w-6 text-green-500" />}
            title="Total Winnings"
            value={`₹${analytics.totalWinnings.toLocaleString()}`}
            subtitle="Prize money earned"
            trend={8}
          />
          <StatCard
            icon={<Target className="h-6 w-6 text-blue-500" />}
            title="Win Rate"
            value={`${analytics.winRate.toFixed(1)}%`}
            subtitle="Success percentage"
            trend={5}
          />
          <StatCard
            icon={<BarChart3 className="h-6 w-6 text-purple-500" />}
            title="Best Rank"
            value={analytics.bestRank || 'N/A'}
            subtitle="Highest position achieved"
          />
        </div>

        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance by Match Type */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance by Match Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.performanceByMatchType.map((type, index) => (
                      <div key={type.type} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{type.type}</span>
                          <Badge variant="secondary">{type.contests} contests</Badge>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>₹{type.winnings.toLocaleString()}</span>
                          <span>{type.winRate}% win rate</span>
                        </div>
                        <Progress value={type.winRate} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Average Position</p>
                        <p className="text-2xl font-bold text-blue-600">#{analytics.averagePosition.toFixed(0)}</p>
                      </div>
                      <Target className="h-8 w-8 text-blue-500" />
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Teams Created</p>
                        <p className="text-2xl font-bold text-green-600">{analytics.totalTeams}</p>
                      </div>
                      <Users className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.monthlyStats.map((stat, index) => (
                    <div key={stat.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{stat.month} 2024</p>
                          <p className="text-sm text-gray-600">{stat.contests} contests</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{stat.winnings.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{stat.winRate}% win rate</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <h4 className="font-semibold text-blue-900">Strong IPL Performance</h4>
                      <p className="text-sm text-blue-700">Your 38% win rate in IPL contests is above average</p>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-semibold text-green-900">Consistent Improvement</h4>
                      <p className="text-sm text-green-700">Win rate has improved by 12% over the last 3 months</p>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                      <h4 className="font-semibold text-yellow-900">Opportunity</h4>
                      <p className="text-sm text-yellow-700">Consider more ODI contests - untapped potential</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Focus on T20 Formats</p>
                        <p className="text-sm text-gray-600">Your T20 performance shows the most consistency</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Diversify Contest Types</p>
                        <p className="text-sm text-gray-600">Try more guaranteed prize contests for steady returns</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Captain Selection</p>
                        <p className="text-sm text-gray-600">Analyze your top-performing captains for patterns</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default Analytics;
