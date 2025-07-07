import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Users, 
  TrendingUp, 
  Calendar,
  Award
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { Link } from "react-router-dom";

interface ActivityItem {
  id: string;
  type: 'team_created' | 'contest_joined' | 'contest_won' | 'deposit' | 'withdrawal';
  title: string;
  description: string;
  timestamp: string;
  amount?: number;
  metadata?: any;
}

export const ActivityFeed = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  const fetchActivities = async () => {
    if (!user) return;

    try {
      // Fetch various activities
      const [teamsResult, contestsResult, transactionsResult] = await Promise.all([
        supabase
          .from('teams')
          .select('id, name, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('contest_entries')
          .select('id, created_at, winning_amount, contests(name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      const combinedActivities: ActivityItem[] = [];

      // Add team creation activities
      teamsResult.data?.forEach(team => {
        combinedActivities.push({
          id: `team-${team.id}`,
          type: 'team_created',
          title: 'Team Created',
          description: `Created team "${team.name}"`,
          timestamp: team.created_at
        });
      });

      // Add contest activities
      contestsResult.data?.forEach(entry => {
        if (entry.winning_amount && entry.winning_amount > 0) {
          combinedActivities.push({
            id: `contest-win-${entry.id}`,
            type: 'contest_won',
            title: 'Contest Won!',
            description: `Won ₹${entry.winning_amount} in ${entry.contests?.name || 'a contest'}`,
            timestamp: entry.created_at,
            amount: entry.winning_amount
          });
        } else {
          combinedActivities.push({
            id: `contest-join-${entry.id}`,
            type: 'contest_joined',
            title: 'Contest Joined',
            description: `Joined ${entry.contests?.name || 'a contest'}`,
            timestamp: entry.created_at
          });
        }
      });

      // Add transaction activities
      transactionsResult.data?.forEach(transaction => {
        combinedActivities.push({
          id: `transaction-${transaction.id}`,
          type: transaction.type as any,
          title: transaction.type === 'deposit' ? 'Money Added' : 
                 transaction.type === 'withdrawal' ? 'Money Withdrawn' : 'Transaction',
          description: transaction.description,
          timestamp: transaction.created_at,
          amount: transaction.amount
        });
      });

      // Sort by timestamp and take latest 10
      combinedActivities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(combinedActivities.slice(0, 10));
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'team_created':
        return <Users className="h-4 w-4" />;
      case 'contest_joined':
        return <Trophy className="h-4 w-4" />;
      case 'contest_won':
        return <Award className="h-4 w-4" />;
      case 'deposit':
        return <TrendingUp className="h-4 w-4" />;
      case 'withdrawal':
        return <TrendingUp className="h-4 w-4 rotate-180" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'team_created':
        return 'bg-blue-100 text-blue-600';
      case 'contest_joined':
        return 'bg-purple-100 text-purple-600';
      case 'contest_won':
        return 'bg-green-100 text-green-600';
      case 'deposit':
        return 'bg-green-100 text-green-600';
      case 'withdrawal':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
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
    <Card>
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
        <CardDescription>
          Your recent fantasy cricket activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No activities yet</p>
            <Button asChild>
              <Link to="/contests">Join your first contest</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className={`rounded-full p-2 ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{activity.title}</h4>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(activity.timestamp), 'MMM dd, HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  {activity.amount && (
                    <Badge variant="outline" className="mt-1">
                      {activity.amount > 0 ? '+' : ''}₹{Math.abs(activity.amount).toFixed(2)}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};