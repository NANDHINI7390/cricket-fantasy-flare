import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  Calendar, 
  MapPin, 
  Trophy, 
  Users, 
  Clock,
  Search,
  Filter,
  Star,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { fetchMatches } from '@/utils/cricket-api';

interface Match {
  id: string;
  match_id: string;
  name: string;
  team1_name: string;
  team2_name: string;
  team1_logo?: string;
  team2_logo?: string;
  venue: string;
  date_time: string;
  status: string;
}

interface Contest {
  id: string;
  name: string;
  entry_fee: number;
  prize_pool: number;
  total_spots: number;
  filled_spots: number;
  first_prize: number;
}

const UpcomingMatches = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [contests, setContests] = useState<{ [key: string]: Contest[] }>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'today' | 'tomorrow' | 'week'>('all');

  useEffect(() => {
    fetchUpcomingMatches();
  }, []);

  const fetchUpcomingMatches = async () => {
    try {
      setLoading(true);
      
      // First try to get matches from database
      const { data: dbMatches, error: dbError } = await supabase
        .from('matches')
        .select('*')
        .eq('status', 'upcoming')
        .gte('date_time', new Date().toISOString())
        .order('date_time', { ascending: true });

      if (dbError) throw dbError;

      if (dbMatches && dbMatches.length > 0) {
        setMatches(dbMatches);
        await fetchContestsForMatches(dbMatches.map(m => m.match_id));
      } else {
        // Fallback to API if no matches in database
        const apiMatches = await fetchMatches();
        
        // Filter upcoming matches
        const upcomingMatches = apiMatches.filter((match: any) => {
          const matchDate = new Date(match.dateTimeGMT);
          return matchDate > new Date() && match.status !== 'Match not started';
        });

        // Transform API data to our format
        const transformedMatches: Match[] = upcomingMatches.slice(0, 10).map((match: any) => ({
          id: match.id,
          match_id: match.id,
          name: match.name,
          team1_name: match.teamInfo?.[0]?.name || match.teams?.[0] || 'Team 1',
          team2_name: match.teamInfo?.[1]?.name || match.teams?.[1] || 'Team 2',
          team1_logo: match.teamInfo?.[0]?.img,
          team2_logo: match.teamInfo?.[1]?.img,
          venue: match.venue || 'TBD',
          date_time: match.dateTimeGMT,
          status: 'upcoming'
        }));

        setMatches(transformedMatches);
        
        // Store matches in database for future use
        if (transformedMatches.length > 0) {
          await supabase.from('matches').upsert(
            transformedMatches.map(match => ({
              match_id: match.match_id,
              name: match.name,
              team1_name: match.team1_name,
              team2_name: match.team2_name,
              team1_logo: match.team1_logo,
              team2_logo: match.team2_logo,
              venue: match.venue,
              date_time: match.date_time,
              status: match.status
            })),
            { onConflict: 'match_id' }
          );
        }
        
        await fetchContestsForMatches(transformedMatches.map(m => m.match_id));
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const fetchContestsForMatches = async (matchIds: string[]) => {
    try {
      const { data: contestsData, error } = await supabase
        .from('fantasy_contests')
        .select('*')
        .in('match_id', matchIds)
        .eq('is_active', true);

      if (error) throw error;

      const contestsByMatch: { [key: string]: Contest[] } = {};
      contestsData?.forEach(contest => {
        if (!contestsByMatch[contest.match_id]) {
          contestsByMatch[contest.match_id] = [];
        }
        contestsByMatch[contest.match_id].push(contest);
      });

      setContests(contestsByMatch);
    } catch (error) {
      console.error('Error fetching contests:', error);
    }
  };

  const filterMatches = () => {
    let filtered = matches;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(match => 
        match.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.team1_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.team2_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.venue.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    if (selectedFilter === 'today') {
      filtered = filtered.filter(match => {
        const matchDate = new Date(match.date_time);
        return matchDate >= today && matchDate < tomorrow;
      });
    } else if (selectedFilter === 'tomorrow') {
      filtered = filtered.filter(match => {
        const matchDate = new Date(match.date_time);
        const dayAfterTomorrow = new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
        return matchDate >= tomorrow && matchDate < dayAfterTomorrow;
      });
    } else if (selectedFilter === 'week') {
      filtered = filtered.filter(match => {
        const matchDate = new Date(match.date_time);
        return matchDate >= today && matchDate < nextWeek;
      });
    }

    return filtered;
  };

  const handleCreateTeam = (matchId: string) => {
    navigate(`/create-contest/${matchId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const filteredMatches = filterMatches();

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upcoming Matches</h1>
        <p className="text-gray-600">Create your fantasy team and join contests</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search matches, teams, or venues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Tabs value={selectedFilter} onValueChange={(value) => setSelectedFilter(value as any)}>
          <TabsList className="grid w-full grid-cols-4 md:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Matches List */}
      {filteredMatches.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMatches.map(match => {
            const matchContests = contests[match.match_id] || [];
            const totalPrizePool = matchContests.reduce((sum, c) => sum + c.prize_pool, 0);
            const minEntry = matchContests.length > 0 ? Math.min(...matchContests.map(c => c.entry_fee)) : 0;
            
            return (
              <Card key={match.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Match Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {match.status}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          {new Date(match.date_time).toLocaleString()}
                        </div>
                      </div>

                      {/* Teams */}
                      <div className="flex items-center gap-6 mb-3">
                        <div className="flex items-center gap-3">
                          {match.team1_logo && (
                            <img src={match.team1_logo} alt={match.team1_name} className="w-8 h-8" />
                          )}
                          <span className="font-semibold text-lg">{match.team1_name}</span>
                        </div>
                        
                        <div className="text-gray-500 font-medium">VS</div>
                        
                        <div className="flex items-center gap-3">
                          {match.team2_logo && (
                            <img src={match.team2_logo} alt={match.team2_name} className="w-8 h-8" />
                          )}
                          <span className="font-semibold text-lg">{match.team2_name}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {match.venue}
                      </div>
                    </div>

                    {/* Contest Stats */}
                    <div className="lg:text-right">
                      {matchContests.length > 0 ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600">Contests</div>
                              <div className="font-semibold">{matchContests.length}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Min Entry</div>
                              <div className="font-semibold">₹{minEntry}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Prize Pool</div>
                              <div className="font-semibold text-green-600">₹{totalPrizePool.toLocaleString()}</div>
                            </div>
                          </div>
                          
                          <Button 
                            onClick={() => handleCreateTeam(match.match_id)}
                            className="w-full lg:w-auto"
                          >
                            <Trophy className="h-4 w-4 mr-2" />
                            Create Team
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="text-sm text-gray-600 mb-2">No contests yet</div>
                          <Button 
                            variant="outline"
                            onClick={() => handleCreateTeam(match.match_id)}
                            className="w-full lg:w-auto"
                          >
                            <Star className="h-4 w-4 mr-2" />
                            Be First to Join
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UpcomingMatches;