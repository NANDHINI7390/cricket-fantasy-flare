import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { 
  Trophy, 
  Users, 
  Clock, 
  MapPin, 
  Star, 
  Crown,
  Shield,
  CheckCircle,
  AlertCircle,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { fetchMatches } from '@/utils/cricket-api';

interface Player {
  id: string;
  name: string;
  team: string;
  role: 'batsman' | 'bowler' | 'allrounder' | 'wicketkeeper';
  credits: number;
  image_url?: string;
  stats?: any;
}

interface SelectedPlayer extends Player {
  isCaptain?: boolean;
  isViceCaptain?: boolean;
}

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
  deadline: string;
}

const CreateContest = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[]>([]);
  const [captain, setCaptain] = useState<string | null>(null);
  const [viceCaptain, setViceCaptain] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<'match' | 'team' | 'contest'>('match');
  
  const totalCredits = selectedPlayers.reduce((sum, player) => sum + player.credits, 0);
  const team1Count = selectedPlayers.filter(p => p.team === match?.team1_name).length;
  const team2Count = selectedPlayers.filter(p => p.team === match?.team2_name).length;

  useEffect(() => {
    if (matchId) {
      fetchMatchData();
    }
  }, [matchId]);

  const fetchMatchData = async () => {
    try {
      setLoading(true);
      
      // Fetch match details
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('match_id', matchId)
        .single();

      if (matchError) throw matchError;
      setMatch(matchData);

      // Fetch players for this match
      const { data: playersData, error: playersError } = await supabase
        .from('match_players')
        .select(`
          player_id,
          team,
          players (
            id,
            name,
            role,
            credits,
            image_url,
            stats
          )
        `)
        .eq('match_id', matchId);

      if (playersError) throw playersError;

      const formattedPlayers = playersData.map(mp => ({
        id: mp.players.id,
        name: mp.players.name,
        team: mp.team,
        role: mp.players.role as Player['role'],
        credits: mp.players.credits,
        image_url: mp.players.image_url,
        stats: mp.players.stats
      }));

      setPlayers(formattedPlayers);

      // Fetch contests for this match
      const { data: contestsData, error: contestsError } = await supabase
        .from('fantasy_contests')
        .select('*')
        .eq('match_id', matchId)
        .eq('is_active', true);

      if (contestsError) throw contestsError;
      setContests(contestsData || []);

    } catch (error) {
      console.error('Error fetching match data:', error);
      toast.error('Failed to load match data');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerSelect = (player: Player) => {
    if (selectedPlayers.length >= 11 && !selectedPlayers.find(p => p.id === player.id)) {
      toast.error('Maximum 11 players allowed');
      return;
    }

    if (selectedPlayers.find(p => p.id === player.id)) {
      // Remove player
      const updatedPlayers = selectedPlayers.filter(p => p.id !== player.id);
      setSelectedPlayers(updatedPlayers);
      
      if (captain === player.id) setCaptain(null);
      if (viceCaptain === player.id) setViceCaptain(null);
    } else {
      // Add player - check team balance rule
      const newTeam1Count = player.team === match?.team1_name ? team1Count + 1 : team1Count;
      const newTeam2Count = player.team === match?.team2_name ? team2Count + 1 : team2Count;
      
      if (newTeam1Count > 7 || newTeam2Count > 7) {
        toast.error('Maximum 7 players allowed from one team');
        return;
      }

      if (totalCredits + player.credits > 100) {
        toast.error('Total credits cannot exceed 100');
        return;
      }

      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  const handleCaptainSelect = (playerId: string) => {
    if (captain === playerId) {
      setCaptain(null);
    } else {
      setCaptain(playerId);
      if (viceCaptain === playerId) {
        setViceCaptain(null);
      }
    }
  };

  const handleViceCaptainSelect = (playerId: string) => {
    if (viceCaptain === playerId) {
      setViceCaptain(null);
    } else {
      setViceCaptain(playerId);
      if (captain === playerId) {
        setCaptain(null);
      }
    }
  };

  const canProceedToContests = () => {
    return selectedPlayers.length === 11 && 
           captain && 
           viceCaptain && 
           totalCredits <= 100 &&
           team1Count <= 7 &&
           team2Count <= 7;
  };

  const saveTeamAndJoinContest = async (contestId: string) => {
    if (!user || !match) {
      toast.error('Please login to continue');
      return;
    }

    try {
      // Save team first
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert({
          user_id: user.id,
          name: `Team for ${match.name}`,
          match_id: match.match_id,
          captain_id: captain,
          vice_captain_id: viceCaptain,
          total_points: 0,
          is_locked: true
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Save team players
      const teamPlayersData = selectedPlayers.map(player => ({
        team_id: teamData.id,
        player_id: player.id
      }));

      const { error: playersError } = await supabase
        .from('team_players')
        .insert(teamPlayersData);

      if (playersError) throw playersError;

      // Join contest using the database function
      const { data: entryData, error: entryError } = await supabase
        .rpc('join_contest', {
          contest_id: contestId,
          team_id: teamData.id
        });

      if (entryError) throw entryError;

      toast.success('Successfully joined contest!');
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error('Error joining contest:', error);
      toast.error(error.message || 'Failed to join contest');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Match not found</h2>
        <p className="text-gray-600 mb-4">The requested match could not be found.</p>
        <Button onClick={() => navigate('/contests')}>Browse Contests</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Match Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{match.name}</CardTitle>
              <div className="flex items-center gap-4 text-gray-600 mt-2">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {match.venue}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(match.date_time).toLocaleString()}
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              {match.status}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Steps */}
      <div className="mb-6">
        <div className="flex items-center justify-center space-x-8">
          {[
            { key: 'match', label: 'Match Info', icon: Trophy },
            { key: 'team', label: 'Create Team', icon: Users },
            { key: 'contest', label: 'Join Contest', icon: Crown }
          ].map(({ key, label, icon: Icon }, index) => (
            <div key={key} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep === key ? 'bg-primary border-primary text-white' : 
                index < ['match', 'team', 'contest'].indexOf(currentStep) ? 'bg-green-500 border-green-500 text-white' :
                'border-gray-300 text-gray-400'
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={`ml-2 ${currentStep === key ? 'text-primary font-medium' : 'text-gray-500'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Tabs value={currentStep} onValueChange={(value) => setCurrentStep(value as any)}>
        {/* Match Info Tab */}
        <TabsContent value="match">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Teams */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Teams
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {match.team1_logo && (
                        <img src={match.team1_logo} alt={match.team1_name} className="w-8 h-8" />
                      )}
                      <span className="font-medium">{match.team1_name}</span>
                    </div>
                    <Badge variant="outline">{players.filter(p => p.team === match.team1_name).length} players</Badge>
                  </div>
                  
                  <div className="text-center text-gray-500 font-medium">VS</div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {match.team2_logo && (
                        <img src={match.team2_logo} alt={match.team2_name} className="w-8 h-8" />
                      )}
                      <span className="font-medium">{match.team2_name}</span>
                    </div>
                    <Badge variant="outline">{players.filter(p => p.team === match.team2_name).length} players</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Match Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Contest Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Contests</span>
                    <span className="font-medium">{contests.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Prize Pool</span>
                    <span className="font-medium">₹{contests.reduce((sum, c) => sum + c.prize_pool, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available Players</span>
                    <span className="font-medium">{players.length}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-6" 
                  onClick={() => setCurrentStep('team')}
                >
                  Start Creating Team
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Team Creation Tab */}
        <TabsContent value="team">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Team Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Players Selected</span>
                    <span>{selectedPlayers.length}/11</span>
                  </div>
                  <Progress value={(selectedPlayers.length / 11) * 100} />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Credits Used</span>
                    <span>{totalCredits}/100</span>
                  </div>
                  <Progress value={(totalCredits / 100) * 100} />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">{match.team1_name}</span>
                    <div className="font-medium">{team1Count}/7</div>
                  </div>
                  <div>
                    <span className="text-gray-600">{match.team2_name}</span>
                    <div className="font-medium">{team2Count}/7</div>
                  </div>
                </div>

                {selectedPlayers.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Selected Players</h4>
                    {selectedPlayers.map(player => (
                      <div key={player.id} className="flex items-center justify-between text-sm">
                        <span className="truncate">{player.name}</span>
                        <div className="flex items-center gap-1">
                          {captain === player.id && <Crown className="h-3 w-3 text-yellow-500" />}
                          {viceCaptain === player.id && <Shield className="h-3 w-3 text-blue-500" />}
                          <span>{player.credits}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {canProceedToContests() && (
                  <Button 
                    className="w-full" 
                    onClick={() => setCurrentStep('contest')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Join Contest
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Player Selection */}
            <div className="lg:col-span-2">
              <Tabs defaultValue={match.team1_name}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value={match.team1_name}>{match.team1_name}</TabsTrigger>
                  <TabsTrigger value={match.team2_name}>{match.team2_name}</TabsTrigger>
                </TabsList>
                
                {[match.team1_name, match.team2_name].map(teamName => (
                  <TabsContent key={teamName} value={teamName} className="space-y-4">
                    {['wicketkeeper', 'batsman', 'allrounder', 'bowler'].map(role => {
                      const teamPlayers = players.filter(p => p.team === teamName && p.role === role);
                      if (teamPlayers.length === 0) return null;
                      
                      return (
                        <Card key={role}>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium capitalize">{role}s</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-3">
                              {teamPlayers.map(player => {
                                const isSelected = selectedPlayers.find(p => p.id === player.id);
                                const isCaptain = captain === player.id;
                                const isViceCaptain = viceCaptain === player.id;
                                
                                return (
                                  <div key={player.id} className={`border rounded-lg p-3 transition-all ${
                                    isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                                  }`}>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                          <AvatarImage src={player.image_url} alt={player.name} />
                                          <AvatarFallback>{player.name.slice(0, 2)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <div className="font-medium">{player.name}</div>
                                          <div className="text-sm text-gray-600">{player.team}</div>
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">{player.credits}</span>
                                        
                                        {isSelected && (
                                          <div className="flex gap-1">
                                            <Button
                                              size="sm"
                                              variant={isCaptain ? "default" : "outline"}
                                              onClick={() => handleCaptainSelect(player.id)}
                                              className="h-6 px-2 text-xs"
                                            >
                                              <Crown className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant={isViceCaptain ? "default" : "outline"}
                                              onClick={() => handleViceCaptainSelect(player.id)}
                                              className="h-6 px-2 text-xs"
                                            >
                                              <Shield className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        )}
                                        
                                        <Button
                                          size="sm"
                                          variant={isSelected ? "destructive" : "default"}
                                          onClick={() => handlePlayerSelect(player)}
                                        >
                                          {isSelected ? 'Remove' : 'Add'}
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </TabsContent>

        {/* Contest Selection Tab */}
        <TabsContent value="contest">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Contest</CardTitle>
              </CardHeader>
              <CardContent>
                {contests.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No contests available</h3>
                    <p className="text-gray-600">No contests are currently available for this match.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {contests.map(contest => (
                      <Card key={contest.id} className="border-2 hover:border-primary transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{contest.name}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <span>Entry: ₹{contest.entry_fee}</span>
                                <span>Prize: ₹{contest.prize_pool.toLocaleString()}</span>
                                <span>Spots: {contest.filled_spots}/{contest.total_spots}</span>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600">₹{contest.first_prize.toLocaleString()}</div>
                              <div className="text-sm text-gray-600">First Prize</div>
                              <Button 
                                className="mt-2"
                                onClick={() => saveTeamAndJoinContest(contest.id)}
                                disabled={!canProceedToContests()}
                              >
                                Join ₹{contest.entry_fee}
                              </Button>
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <Progress value={(contest.filled_spots / contest.total_spots) * 100} />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreateContest;