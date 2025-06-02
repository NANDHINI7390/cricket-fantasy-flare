
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Zap, Target, TrendingUp, Users, Star, RefreshCw, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface Player {
  id: string;
  name: string;
  team: string;
  role: "batsman" | "bowler" | "allrounder" | "wicketkeeper";
  credits: number;
  form: number;
  recentPerformance: number[];
  projectedPoints: number;
  selectionPercentage: number;
  matchup: "easy" | "medium" | "hard";
  isPlaying11: boolean;
}

interface OptimizationSettings {
  riskTolerance: number;
  preferCaptaincy: "form" | "matchup" | "ownership";
  includeUnpopularPicks: boolean;
  balanceTeam: boolean;
  maxCreditsPerPlayer: number;
}

const AITeamOptimizer: React.FC = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedTeam, setOptimizedTeam] = useState<Player[]>([]);
  const [settings, setSettings] = useState<OptimizationSettings>({
    riskTolerance: 50,
    preferCaptaincy: "form",
    includeUnpopularPicks: true,
    balanceTeam: true,
    maxCreditsPerPlayer: 12
  });

  // Mock player data
  const availablePlayers: Player[] = [
    {
      id: "1",
      name: "Virat Kohli",
      team: "India",
      role: "batsman",
      credits: 11.5,
      form: 92,
      recentPerformance: [78, 45, 123, 67, 89],
      projectedPoints: 145,
      selectionPercentage: 89,
      matchup: "medium",
      isPlaying11: true
    },
    {
      id: "2",
      name: "Jasprit Bumrah",
      team: "India", 
      role: "bowler",
      credits: 10.5,
      form: 95,
      recentPerformance: [89, 67, 78, 92, 85],
      projectedPoints: 120,
      selectionPercentage: 76,
      matchup: "easy",
      isPlaying11: true
    },
    {
      id: "3",
      name: "Hardik Pandya",
      team: "India",
      role: "allrounder", 
      credits: 10,
      form: 88,
      recentPerformance: [67, 89, 45, 78, 92],
      projectedPoints: 135,
      selectionPercentage: 82,
      matchup: "medium",
      isPlaying11: true
    },
    {
      id: "4",
      name: "KL Rahul",
      team: "India",
      role: "wicketkeeper",
      credits: 9.5,
      form: 85,
      recentPerformance: [78, 92, 67, 85, 74],
      projectedPoints: 125,
      selectionPercentage: 71,
      matchup: "easy",
      isPlaying11: true
    },
    {
      id: "5",
      name: "David Warner",
      team: "Australia",
      role: "batsman",
      credits: 9,
      form: 78,
      recentPerformance: [45, 67, 89, 56, 78],
      projectedPoints: 110,
      selectionPercentage: 45,
      matchup: "hard",
      isPlaying11: true
    }
  ];

  const optimizeTeam = async () => {
    setIsOptimizing(true);
    
    // Simulate AI optimization process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock optimization logic based on settings
    let sortedPlayers = [...availablePlayers];
    
    // Apply risk tolerance
    if (settings.riskTolerance < 30) {
      // Conservative: prefer high ownership, safe picks
      sortedPlayers.sort((a, b) => b.selectionPercentage - a.selectionPercentage);
    } else if (settings.riskTolerance > 70) {
      // Aggressive: prefer low ownership, high upside
      sortedPlayers.sort((a, b) => (b.projectedPoints - a.projectedPoints) - (b.selectionPercentage - a.selectionPercentage));
    } else {
      // Balanced: mix of form and projections
      sortedPlayers.sort((a, b) => (b.form + b.projectedPoints) - (a.form + a.projectedPoints));
    }

    // Select top players respecting team balance
    const optimized = sortedPlayers.slice(0, 11);
    setOptimizedTeam(optimized);
    setIsOptimizing(false);
    
    toast.success("Team optimized successfully! 🚀");
  };

  const getMatchupColor = (matchup: string) => {
    switch (matchup) {
      case "easy": return "text-green-600 bg-green-100";
      case "medium": return "text-yellow-600 bg-yellow-100";
      case "hard": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "batsman": return "🏏";
      case "bowler": return "⚡";
      case "allrounder": return "🎯";
      case "wicketkeeper": return "🧤";
      default: return "👤";
    }
  };

  const teamScore = optimizedTeam.reduce((sum, player) => sum + player.projectedPoints, 0);
  const totalCredits = optimizedTeam.reduce((sum, player) => sum + player.credits, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Team Optimizer
          </h1>
        </div>
        <p className="text-gray-600">Let AI create the perfect fantasy team based on advanced analytics</p>
      </div>

      <Tabs defaultValue="optimizer" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="optimizer">Optimizer</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="optimizer" className="space-y-6">
          {/* Optimization Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Quick Optimize
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">
                    Risk Tolerance: {settings.riskTolerance}%
                  </p>
                  <Slider
                    value={[settings.riskTolerance]}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, riskTolerance: value[0] }))}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Conservative</span>
                    <span>Aggressive</span>
                  </div>
                </div>
                <Button 
                  onClick={optimizeTeam} 
                  disabled={isOptimizing}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isOptimizing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Optimize Team
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Optimization Progress */}
          {isOptimizing && (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Analyzing player data...</span>
                    <span className="text-sm text-gray-500">33%</span>
                  </div>
                  <Progress value={33} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Calculating optimal combinations...</span>
                    <span className="text-sm text-gray-500">66%</span>
                  </div>
                  <Progress value={66} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Finalizing team selection...</span>
                    <span className="text-sm text-gray-500">100%</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Optimized Team */}
          {optimizedTeam.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-500" />
                    Optimized Team
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-600 font-medium">
                      Projected: {teamScore} pts
                    </span>
                    <span className="text-blue-600 font-medium">
                      Credits: {totalCredits.toFixed(1)}/100
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {optimizedTeam.map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getRoleIcon(player.role)}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{player.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {player.team}
                            </Badge>
                            <Badge className={`text-xs ${getMatchupColor(player.matchup)}`}>
                              {player.matchup}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span>Form: {player.form}%</span>
                            <span>Projected: {player.projectedPoints} pts</span>
                            <span>Ownership: {player.selectionPercentage}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-600">{player.credits}</div>
                        <div className="text-xs text-gray-500">credits</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Risk Tolerance</label>
                <Slider
                  value={[settings.riskTolerance]}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, riskTolerance: value[0] }))}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Safe picks (High ownership)</span>
                  <span>Risky picks (Low ownership)</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Captain Selection Strategy</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={settings.preferCaptaincy}
                  onChange={(e) => setSettings(prev => ({ ...prev, preferCaptaincy: e.target.value as any }))}
                >
                  <option value="form">Best Form</option>
                  <option value="matchup">Best Matchup</option>
                  <option value="ownership">Low Ownership</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Include Unpopular Picks</label>
                <Switch
                  checked={settings.includeUnpopularPicks}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, includeUnpopularPicks: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Balance Team Roles</label>
                <Switch
                  checked={settings.balanceTeam}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, balanceTeam: checked }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Max Credits Per Player: {settings.maxCreditsPerPlayer}
                </label>
                <Slider
                  value={[settings.maxCreditsPerPlayer]}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, maxCreditsPerPlayer: value[0] }))}
                  min={8}
                  max={15}
                  step={0.5}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Recent Form</span>
                      <span>35%</span>
                    </div>
                    <Progress value={35} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Matchup Analysis</span>
                      <span>25%</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Ownership Strategy</span>
                      <span>20%</span>
                    </div>
                    <Progress value={20} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Historical Data</span>
                      <span>20%</span>
                    </div>
                    <Progress value={20} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">87%</div>
                  <p className="text-sm text-gray-600 mb-4">
                    High confidence in team selection based on current data
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    Expected to outperform 75% of teams
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AITeamOptimizer;
