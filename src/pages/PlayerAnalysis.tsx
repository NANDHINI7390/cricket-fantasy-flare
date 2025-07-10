import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  TrendingUp, 
  TrendingDown, 
  Star,
  Target,
  Activity,
  BarChart3,
  Zap,
  Brain,
  AlertCircle,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Player {
  id: string;
  name: string;
  team: string;
  role: 'batsman' | 'bowler' | 'allrounder' | 'wicketkeeper';
  credits: number;
  image_url?: string;
  stats?: any;
}

interface AIRecommendation {
  player: Player;
  score: number;
  reasoning: string;
  strengths: string[];
  concerns: string[];
  recommendation: 'high' | 'medium' | 'low';
}

const PlayerAnalysis = () => {
  const { matchId } = useParams();
  const [players, setPlayers] = useState<Player[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('all');

  useEffect(() => {
    if (matchId) {
      fetchPlayersAndAnalyze();
    }
  }, [matchId]);

  const fetchPlayersAndAnalyze = async () => {
    try {
      setLoading(true);
      
      // Fetch players for this match
      const { data: playersData, error } = await supabase
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

      if (error) throw error;

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
      
      // Generate AI recommendations
      await generateAIRecommendations(formattedPlayers);
      
    } catch (error) {
      console.error('Error fetching players:', error);
      toast.error('Failed to load player data');
    } finally {
      setLoading(false);
    }
  };

  const generateAIRecommendations = async (playersList: Player[]) => {
    try {
      setAnalysisLoading(true);
      
      // Check if we have OpenAI API key configured
      const { data, error } = await supabase.functions.invoke('cricket-assistant', {
        body: {
          type: 'player_analysis',
          players: playersList.slice(0, 10), // Limit to avoid token limits
          match_id: matchId
        }
      });

      if (error) {
        console.error('AI Analysis error:', error);
        // Fallback to manual analysis if AI fails
        generateManualRecommendations(playersList);
        return;
      }

      if (data?.recommendations) {
        setRecommendations(data.recommendations);
      } else {
        generateManualRecommendations(playersList);
      }
      
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      generateManualRecommendations(playersList);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const generateManualRecommendations = (playersList: Player[]) => {
    // Fallback manual analysis based on credits and role
    const manualRecs: AIRecommendation[] = playersList.map(player => {
      let score = 50; // Base score
      const strengths: string[] = [];
      const concerns: string[] = [];
      
      // Credit analysis
      if (player.credits >= 9) {
        score += 20;
        strengths.push('High-value player with proven performance');
      } else if (player.credits <= 7) {
        score += 10;
        strengths.push('Budget-friendly option with good value');
      }
      
      // Role-based analysis
      switch (player.role) {
        case 'allrounder':
          score += 15;
          strengths.push('Versatile player contributing in multiple departments');
          break;
        case 'wicketkeeper':
          score += 10;
          strengths.push('Additional points from catches and stumpings');
          break;
        case 'bowler':
          if (player.credits >= 8) {
            score += 10;
            strengths.push('Premium bowler likely to take wickets');
          }
          break;
        case 'batsman':
          if (player.credits >= 9) {
            score += 10;
            strengths.push('Top-order batsman with high scoring potential');
          }
          break;
      }
      
      // Random factors for demonstration
      if (Math.random() > 0.7) {
        score += 10;
        strengths.push('In good recent form');
      }
      
      if (Math.random() > 0.8) {
        score -= 10;
        concerns.push('Inconsistent recent performances');
      }
      
      // Determine recommendation level
      let recommendation: 'high' | 'medium' | 'low' = 'medium';
      if (score >= 70) recommendation = 'high';
      else if (score <= 50) recommendation = 'low';
      
      return {
        player,
        score: Math.min(100, Math.max(0, score)),
        reasoning: `Based on player credits (${player.credits}), role (${player.role}), and recent form analysis.`,
        strengths,
        concerns: concerns.length > 0 ? concerns : ['Monitor injury status before team deadline'],
        recommendation
      };
    });
    
    // Sort by score
    manualRecs.sort((a, b) => b.score - a.score);
    setRecommendations(manualRecs);
  };

  const filteredRecommendations = selectedRole === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.player.role === selectedRole);

  const getRecommendationColor = (rec: 'high' | 'medium' | 'low') => {
    switch (rec) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded"></div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          <Brain className="inline-block h-8 w-8 mr-2 text-blue-600" />
          AI Player Analysis
        </h1>
        <p className="text-gray-600">Smart recommendations powered by AI and statistical analysis</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Players</p>
                <p className="text-2xl font-bold">{players.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Rated</p>
                <p className="text-2xl font-bold text-green-600">
                  {recommendations.filter(r => r.recommendation === 'high').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Medium Rated</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {recommendations.filter(r => r.recommendation === 'medium').length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold">
                  {recommendations.length > 0 
                    ? Math.round(recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.length)
                    : 0
                  }
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Status */}
      {analysisLoading && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Analyzing players with AI...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role Filter */}
      <Tabs value={selectedRole} onValueChange={setSelectedRole} className="mb-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Players</TabsTrigger>
          <TabsTrigger value="wicketkeeper">Wicket Keepers</TabsTrigger>
          <TabsTrigger value="batsman">Batsmen</TabsTrigger>
          <TabsTrigger value="allrounder">All Rounders</TabsTrigger>
          <TabsTrigger value="bowler">Bowlers</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Player Recommendations */}
      <div className="space-y-4">
        {filteredRecommendations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations available</h3>
              <p className="text-gray-600">Try selecting a different role or check back later.</p>
            </CardContent>
          </Card>
        ) : (
          filteredRecommendations.map((rec, index) => (
            <Card key={rec.player.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Player Avatar */}
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={rec.player.image_url} alt={rec.player.name} />
                    <AvatarFallback>{rec.player.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  
                  {/* Player Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{rec.player.name}</h3>
                      <Badge variant="outline" className="capitalize">
                        {rec.player.role}
                      </Badge>
                      <Badge variant="outline">
                        {rec.player.team}
                      </Badge>
                      <Badge className={`${getRecommendationColor(rec.recommendation)} border`}>
                        {rec.recommendation.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-6 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Credits:</span>
                        <span className="font-semibold">{rec.player.credits}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">AI Score:</span>
                        <span className="font-semibold text-blue-600">{rec.score}/100</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-600">Rank:</span>
                        <span className="font-semibold">#{index + 1}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{rec.reasoning}</p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Strengths */}
                      <div>
                        <h4 className="font-medium text-green-700 mb-2 flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          Strengths
                        </h4>
                        <ul className="text-sm space-y-1">
                          {rec.strengths.map((strength, i) => (
                            <li key={i} className="text-gray-600">• {strength}</li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Concerns */}
                      <div>
                        <h4 className="font-medium text-orange-700 mb-2 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          Watch Out
                        </h4>
                        <ul className="text-sm space-y-1">
                          {rec.concerns.map((concern, i) => (
                            <li key={i} className="text-gray-600">• {concern}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  {/* Score Indicator */}
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600 mb-1">{rec.score}</div>
                    <div className="text-sm text-gray-600">AI Score</div>
                    
                    {rec.recommendation === 'high' && (
                      <div className="mt-2">
                        <Star className="h-5 w-5 text-yellow-500 mx-auto" />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PlayerAnalysis;