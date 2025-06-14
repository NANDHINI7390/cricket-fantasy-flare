
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  Brain, 
  Zap, 
  Target, 
  TrendingUp, 
  Shield, 
  Star,
  Users,
  Crown,
  Timer,
  BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Player {
  id: string;
  name: string;
  role: string;
  points: number;
  price: number;
  form: number;
  aiScore: number;
  riskLevel: "Low" | "Medium" | "High";
}

const AITeamOptimizerAdvanced: React.FC = () => {
  const [optimizationSettings, setOptimizationSettings] = useState({
    strategy: "balanced",
    riskTolerance: [50],
    budget: [1000],
    captainWeight: [30],
    formWeight: [25],
    enableMLPredictions: true,
    autoSubstitution: true,
    weatherOptimization: true
  });

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedTeam, setOptimizedTeam] = useState<Player[] | null>(null);

  const strategies = [
    {
      id: "aggressive",
      name: "Aggressive",
      description: "High-risk, high-reward selections",
      icon: Zap,
      color: "from-red-500 to-orange-500"
    },
    {
      id: "balanced",
      name: "Balanced",
      description: "Optimal risk-reward balance",
      icon: Shield,
      color: "from-blue-500 to-purple-500"
    },
    {
      id: "conservative",
      name: "Conservative",
      description: "Low-risk, consistent returns",
      icon: Target,
      color: "from-green-500 to-teal-500"
    }
  ];

  const mockOptimizedTeam: Player[] = [
    { id: "1", name: "Virat Kohli", role: "Batsman", points: 145, price: 105, form: 95, aiScore: 92, riskLevel: "Low" },
    { id: "2", name: "Rohit Sharma", role: "Batsman", points: 138, price: 110, form: 88, aiScore: 89, riskLevel: "Low" },
    { id: "3", name: "KL Rahul", role: "WK-Batsman", points: 125, price: 95, form: 82, aiScore: 85, riskLevel: "Medium" },
    { id: "4", name: "Hardik Pandya", role: "All-rounder", points: 142, price: 100, form: 91, aiScore: 94, riskLevel: "Medium" },
    { id: "5", name: "Ravindra Jadeja", role: "All-rounder", points: 135, price: 85, form: 87, aiScore: 88, riskLevel: "Low" },
    { id: "6", name: "Jasprit Bumrah", role: "Bowler", points: 128, price: 90, form: 94, aiScore: 91, riskLevel: "Low" },
    { id: "7", name: "Yuzvendra Chahal", role: "Bowler", points: 115, price: 75, form: 79, aiScore: 82, riskLevel: "Medium" }
  ];

  const handleOptimize = async () => {
    setIsOptimizing(true);
    // Simulate AI optimization
    setTimeout(() => {
      setOptimizedTeam(mockOptimizedTeam);
      setIsOptimizing(false);
    }, 3000);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "text-green-600 bg-green-100";
      case "Medium": return "text-yellow-600 bg-yellow-100";
      case "High": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Brain className="h-10 w-10 text-purple-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Team Optimizer Pro
          </h1>
        </div>
        <p className="text-gray-600 text-lg">Advanced machine learning powered team optimization</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Optimization Settings */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                Optimization Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Strategy Selection */}
              <div>
                <label className="text-sm font-medium mb-3 block">Strategy</label>
                <div className="space-y-2">
                  {strategies.map((strategy) => (
                    <motion.div
                      key={strategy.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-3 rounded-lg cursor-pointer border-2 transition-all ${
                        optimizationSettings.strategy === strategy.id
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setOptimizationSettings({
                        ...optimizationSettings,
                        strategy: strategy.id
                      })}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full bg-gradient-to-r ${strategy.color}`}>
                          <strategy.icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{strategy.name}</p>
                          <p className="text-xs text-gray-600">{strategy.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Risk Tolerance */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Risk Tolerance: {optimizationSettings.riskTolerance[0]}%
                </label>
                <Slider
                  value={optimizationSettings.riskTolerance}
                  onValueChange={(value) => setOptimizationSettings({
                    ...optimizationSettings,
                    riskTolerance: value
                  })}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Budget */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Budget: ₹{optimizationSettings.budget[0]}
                </label>
                <Slider
                  value={optimizationSettings.budget}
                  onValueChange={(value) => setOptimizationSettings({
                    ...optimizationSettings,
                    budget: value
                  })}
                  min={800}
                  max={1000}
                  step={10}
                  className="w-full"
                />
              </div>

              {/* Captain Weight */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Captain Priority: {optimizationSettings.captainWeight[0]}%
                </label>
                <Slider
                  value={optimizationSettings.captainWeight}
                  onValueChange={(value) => setOptimizationSettings({
                    ...optimizationSettings,
                    captainWeight: value
                  })}
                  max={50}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Advanced Options */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">ML Predictions</label>
                  <Switch
                    checked={optimizationSettings.enableMLPredictions}
                    onCheckedChange={(checked) => setOptimizationSettings({
                      ...optimizationSettings,
                      enableMLPredictions: checked
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Auto Substitution</label>
                  <Switch
                    checked={optimizationSettings.autoSubstitution}
                    onCheckedChange={(checked) => setOptimizationSettings({
                      ...optimizationSettings,
                      autoSubstitution: checked
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Weather Analysis</label>
                  <Switch
                    checked={optimizationSettings.weatherOptimization}
                    onCheckedChange={(checked) => setOptimizationSettings({
                      ...optimizationSettings,
                      weatherOptimization: checked
                    })}
                  />
                </div>
              </div>

              <Button 
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                size="lg"
              >
                {isOptimizing ? (
                  <>
                    <div className="animate-spin h-5 w-5 mr-2 border-2 border-white rounded-full border-t-transparent"></div>
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    Optimize Team
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          <AnimatePresence>
            {isOptimizing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center p-12"
              >
                <div className="relative">
                  <div className="animate-spin h-16 w-16 mx-auto border-4 border-purple-200 rounded-full border-t-purple-600 mb-6"></div>
                  <Brain className="absolute inset-0 h-8 w-8 m-auto text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">AI Processing</h3>
                <p className="text-gray-600">Analyzing 10,000+ data points...</p>
                <div className="mt-4 space-y-2">
                  <div className="text-sm text-gray-500">• Player form analysis</div>
                  <div className="text-sm text-gray-500">• Match conditions optimization</div>
                  <div className="text-sm text-gray-500">• Risk-reward calculation</div>
                </div>
              </motion.div>
            )}

            {optimizedTeam && !isOptimizing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-yellow-500" />
                      Optimized Team
                      <Badge className="bg-green-100 text-green-800 ml-auto">
                        AI Score: 94.2
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {optimizedTeam.map((player, index) => (
                        <motion.div
                          key={player.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-gray-50 to-white border"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold">{player.name}</h4>
                              <p className="text-sm text-gray-600">{player.role}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-semibold">₹{player.price}</p>
                              <p className="text-sm text-gray-600">{player.points} pts</p>
                            </div>
                            <Badge className={getRiskColor(player.riskLevel)}>
                              {player.riskLevel}
                            </Badge>
                            <div className="text-right">
                              <p className="font-bold text-purple-600">{player.aiScore}</p>
                              <p className="text-xs text-gray-500">AI Score</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-green-600">₹{optimizedTeam.reduce((sum, p) => sum + p.price, 0)}</p>
                          <p className="text-sm text-gray-600">Total Cost</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-blue-600">{(optimizedTeam.reduce((sum, p) => sum + p.aiScore, 0) / optimizedTeam.length).toFixed(1)}</p>
                          <p className="text-sm text-gray-600">Avg AI Score</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-purple-600">127%</p>
                          <p className="text-sm text-gray-600">Win Probability</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AITeamOptimizerAdvanced;
