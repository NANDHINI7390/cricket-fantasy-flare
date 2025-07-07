import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, subDays, startOfDay } from "date-fns";

interface PerformanceData {
  date: string;
  earnings: number;
  contests: number;
  winRate: number;
}

export const PerformanceChart = () => {
  const { user } = useAuth();
  const [data, setData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [winRate, setWinRate] = useState(0);

  useEffect(() => {
    if (user) {
      fetchPerformanceData();
    }
  }, [user]);

  const fetchPerformanceData = async () => {
    if (!user) return;

    try {
      // Get last 30 days data
      const thirtyDaysAgo = subDays(new Date(), 30);
      
      const { data: contestEntries, error } = await supabase
        .from('contest_entries')
        .select('created_at, winning_amount, points')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (error) throw error;

      // Group data by date
      const performanceMap = new Map<string, PerformanceData>();
      
      // Initialize all dates with 0 values
      for (let i = 0; i < 30; i++) {
        const date = format(subDays(new Date(), i), 'MMM dd');
        performanceMap.set(date, {
          date,
          earnings: 0,
          contests: 0,
          winRate: 0
        });
      }

      let totalEarn = 0;
      let totalContests = 0;
      let wonContests = 0;

      contestEntries?.forEach(entry => {
        const date = format(new Date(entry.created_at), 'MMM dd');
        const existingData = performanceMap.get(date) || {
          date,
          earnings: 0,
          contests: 0,
          winRate: 0
        };

        existingData.contests += 1;
        existingData.earnings += entry.winning_amount || 0;
        
        totalContests += 1;
        totalEarn += entry.winning_amount || 0;
        
        if ((entry.winning_amount || 0) > 0) {
          wonContests += 1;
        }

        performanceMap.set(date, existingData);
      });

      // Calculate win rates
      performanceMap.forEach((data, date) => {
        if (data.contests > 0) {
          // This is simplified - you might want to track wins separately
          data.winRate = data.earnings > 0 ? (data.earnings / data.contests) * 10 : 0; // Normalized for display
        }
      });

      const chartData = Array.from(performanceMap.values()).reverse();
      
      setData(chartData);
      setTotalEarnings(totalEarn);
      setWinRate(totalContests > 0 ? (wonContests / totalContests) * 100 : 0);
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">30-Day Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Contest success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. per Contest</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{data.reduce((sum, d) => sum + d.contests, 0) > 0 
                ? (totalEarnings / data.reduce((sum, d) => sum + d.contests, 0)).toFixed(2) 
                : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Average earnings per contest
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings Trend</CardTitle>
          <CardDescription>
            Your daily earnings over the past 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip 
                formatter={(value, name) => [`₹${value}`, 'Earnings']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="earnings" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Contest Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Contest Activity</CardTitle>
          <CardDescription>
            Number of contests joined daily
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                formatter={(value, name) => [value, 'Contests']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar 
                dataKey="contests" 
                fill="hsl(var(--primary))"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};