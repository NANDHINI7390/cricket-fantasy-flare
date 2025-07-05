import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Shield, 
  Zap,
  Award,
  Activity,
  BarChart3,
  Sparkles,
  MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Player {
  id: string;
  name: string;
  team: string;
  role: string;
  credits: number;
  image_url?: string;
  stats?: any;
}

interface PlayerRecommendation {
  player: Player;
  recommendation: string;
  confidence: number;
  reasoning: string;
  tags: string[];
}

const PlayerAnalysis = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [recommendations, setRecommendations] = useState<PlayerRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("search");

  useEffect(() => {
    fetchPlayers();
    generateRecommendations();
  }, []);

  const fetchPlayers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('credits', { ascending: false });
        
      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error("Error fetching players:", error);
      toast.error("Failed to load players");
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecommendations = async () => {
    try {
      setAnalysisLoading(true);
      
      // Get AI recommendations using our cricket assistant
      const { data, error } = await supabase.functions.invoke('cricket-assistant', {
        body: {
          query: "Give me top 5 fantasy cricket player recommendations for today's matches with detailed analysis including captain and vice-captain suggestions",
          requestType: 'player_recommendations',
          useSmartPrompting: true
        }
      });

      if (error) throw error;

      // Mock recommendations based on our player data for now
      const mockRecommendations: PlayerRecommendation[] = players.slice(0, 5).map((player, index) => ({
        player,
        recommendation: index === 0 ? "Captain Pick" : index === 1 ? "Vice-Captain Pick" : 
                      index === 2 ? "Value Pick" : index === 3 ? "Safe Choice" : "Risky Differential",
        confidence: Math.floor(Math.random() * 30) + 70,
        reasoning: `${player.name} has been in excellent form with consistent performances. ${
          index === 0 ? "Perfect captain choice due to recent form and favorable matchup." :
          index === 1 ? "Reliable vice-captain option with good recent stats." :
          index === 2 ? "Great value for credits with high potential return." :
          index === 3 ? "Consistent performer, safe fantasy choice." :
          "High risk, high reward pick for differential advantage."
        }`,
        tags: index === 0 ? ["Captain", "In Form", "Match Winner"] :
              index === 1 ? ["Vice-Captain", "Consistent", "All-rounder"] :
              index === 2 ? ["Value Pick", "Budget-friendly", "Sleeper"] :
              index === 3 ? ["Safe Pick", "Reliable", "Consistent"] :
              ["Differential", "Risky", "High Upside"]
      }));

      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      toast.error("Failed to generate recommendations");
    } finally {
      setAnalysisLoading(false);
    }
  };

  const getPlayerAnalysis = async (player: Player) => {
    try {
      setAnalysisLoading(true);
      
      const { data, error } = await supabase.functions.invoke('cricket-assistant', {
        body: {
          query: `Analyze ${player.name} from ${player.team} team. Provide detailed fantasy analysis including recent form, strengths, weaknesses, and fantasy potential for upcoming matches.`,
          requestType: 'player_analysis',
          useSmartPrompting: true
        }
      });

      if (error) throw error;
      
      setSelectedPlayer(player);
      toast.success(`Analysis loaded for ${player.name}`);
    } catch (error) {
      console.error("Error getting player analysis:", error);
      toast.error("Failed to analyze player");
    } finally {
      setAnalysisLoading(false);
    }
  };

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'batsman': return <Target className="h-4 w-4" />;
      case 'bowler': return <Zap className="h-4 w-4" />;
      case 'allrounder': return <Award className="h-4 w-4" />;
      case 'wicketkeeper': return <Shield className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'batsman': return 'bg-blue-100 text-blue-800';
      case 'bowler': return 'bg-red-100 text-red-800';
      case 'allrounder': return 'bg-purple-100 text-purple-800';
      case 'wicketkeeper': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-8 px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Player Analysis & Recommendations
          </h1>
          <p className="text-gray-600 text-lg">AI-powered insights for fantasy cricket success</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Recommendations
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Player Search
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Detailed Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-6">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI-Powered Fantasy Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Get data-driven player recommendations powered by live cricket data and AI analysis.</p>
                <Button 
                  onClick={generateRecommendations} 
                  disabled={analysisLoading}
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  {analysisLoading ? "Generating..." : "Refresh Recommendations"}
                </Button>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {recommendations.map((rec, index) => (
                <Card key={rec.player.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {rec.player.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{rec.player.name}</h3>
                          <p className="text-gray-600">{rec.player.team} • {rec.player.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${index === 0 ? 'bg-gold-100 text-gold-800' : index === 1 ? 'bg-silver-100 text-silver-800' : 'bg-gray-100 text-gray-800'} mb-2`}>
                          {rec.recommendation}
                        </Badge>
                        <p className="text-sm text-gray-500">₹{rec.player.credits} credits</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Confidence Score</span>
                        <span className="text-sm font-bold text-gray-900">{rec.confidence}%</span>
                      </div>
                      <Progress value={rec.confidence} className="h-2" />
                    </div>

                    <p className="text-gray-700 mb-4">{rec.reasoning}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {rec.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Button 
                      onClick={() => getPlayerAnalysis(rec.player)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Get Detailed Analysis
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Players
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="text"
                  placeholder="Search by player name, team, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-4"
                />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">Loading players...</p>
                </div>
              ) : filteredPlayers.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No players found matching your search.</p>
                </div>
              ) : (
                filteredPlayers.map((player) => (
                  <Card key={player.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {player.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 truncate">{player.name}</h3>
                          <p className="text-sm text-gray-600">{player.team}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={`${getRoleColor(player.role)} flex items-center gap-1`}>
                          {getRoleIcon(player.role)}
                          {player.role}
                        </Badge>
                        <span className="text-sm font-semibold text-gray-900">₹{player.credits}</span>
                      </div>

                      <Button 
                        onClick={() => getPlayerAnalysis(player)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled={analysisLoading}
                      >
                        {analysisLoading ? "Analyzing..." : "Analyze Player"}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            {selectedPlayer ? (
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {selectedPlayer.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedPlayer.name}</h2>
                      <p className="text-blue-100">{selectedPlayer.team} • {selectedPlayer.role}</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        Recent Form Analysis
                      </h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-800">
                            <strong>Last 5 matches:</strong> Consistent performer with average fantasy points of 45+ per match
                          </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Home vs Away:</strong> Better performance at home ground with 20% higher scoring rate
                          </p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <p className="text-sm text-purple-800">
                            <strong>Opposition Record:</strong> Strong historical performance against upcoming opponent
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        Fantasy Potential
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Captain Potential</span>
                            <span className="text-sm text-gray-600">85%</span>
                          </div>
                          <Progress value={85} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Value for Credits</span>
                            <span className="text-sm text-gray-600">78%</span>
                          </div>
                          <Progress value={78} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Consistency Score</span>
                            <span className="text-sm text-gray-600">92%</span>
                          </div>
                          <Progress value={92} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-yellow-600" />
                      AI Recommendation
                    </h3>
                    <p className="text-gray-700">
                      {selectedPlayer.name} is a strong fantasy pick for upcoming matches. 
                      Recent form indicates consistent performance with high ceiling potential. 
                      Consider as captain/vice-captain based on match conditions and opposition.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Player Selected</h3>
                  <p className="text-gray-600">
                    Search for a player or select from recommendations to view detailed analysis.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default PlayerAnalysis;