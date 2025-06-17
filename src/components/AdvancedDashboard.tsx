
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  TrendingUp, 
  Brain, 
  Crown, 
  Zap,
  Target,
  BarChart3,
  Users,
  Star,
  Award,
  Timer,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";

interface AdvancedDashboardProps {
  userStats?: {
    totalWinnings: number;
    winRate: number;
    rank: number;
    aiScore: number;
  };
}

const AdvancedDashboard: React.FC<AdvancedDashboardProps> = ({ userStats }) => {
  const [activeMetric, setActiveMetric] = useState("performance");
  
  const stats = userStats || {
    totalWinnings: 25847,
    winRate: 73.2,
    rank: 127,
    aiScore: 94.5
  };

  const premiumFeatures = [
    {
      icon: Brain,
      title: "AI Captain Optimizer",
      description: "ML-powered captain selection with 94% accuracy",
      status: "Active",
      color: "from-purple-500 to-blue-500"
    },
    {
      icon: Target,
      title: "Live Match Predictor",
      description: "Real-time match outcome predictions",
      status: "Premium",
      color: "from-green-500 to-teal-500"
    },
    {
      icon: Zap,
      title: "Auto Team Builder",
      description: "Instant optimal team creation",
      status: "Pro",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Globe,
      title: "Global Insights",
      description: "International player analysis",
      status: "Elite",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Premium Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-8 w-8 text-yellow-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Elite Dashboard
            </h1>
            <Crown className="h-8 w-8 text-yellow-500" />
          </div>
          <p className="text-gray-600 text-lg">Advanced Cricket Fantasy Intelligence Platform</p>
        </motion.div>

        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Total Winnings</p>
                    <p className="text-3xl font-bold">₹{stats.totalWinnings.toLocaleString()}</p>
                  </div>
                  <Trophy className="h-8 w-8 text-green-200" />
                </div>
                <div className="mt-4">
                  <Badge variant="secondary" className="bg-green-400 text-green-900">
                    +12% this month
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Win Rate</p>
                    <p className="text-3xl font-bold">{stats.winRate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-200" />
                </div>
                <div className="mt-4">
                  <Badge variant="secondary" className="bg-blue-400 text-blue-900">
                    Elite Tier
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Global Rank</p>
                    <p className="text-3xl font-bold">#{stats.rank}</p>
                  </div>
                  <Award className="h-8 w-8 text-purple-200" />
                </div>
                <div className="mt-4">
                  <Badge variant="secondary" className="bg-purple-400 text-purple-900">
                    Top 1%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">AI Score</p>
                    <p className="text-3xl font-bold">{stats.aiScore}/100</p>
                  </div>
                  <Brain className="h-8 w-8 text-orange-200" />
                </div>
                <div className="mt-4">
                  <Badge variant="secondary" className="bg-orange-400 text-orange-900">
                    Genius Level
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Premium Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="mb-8 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500" />
                Premium Intelligence Suite
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {premiumFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className={`relative p-6 rounded-xl bg-gradient-to-br ${feature.color} text-white hover:scale-105 transition-transform cursor-pointer`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <feature.icon className="h-8 w-8" />
                      <Badge variant="secondary" className="bg-white/20 text-white">
                        {feature.status}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm opacity-90">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Advanced Analytics Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Tabs defaultValue="performance" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white shadow-lg">
              <TabsTrigger value="performance" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                Performance
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                Analytics
              </TabsTrigger>
              <TabsTrigger value="insights" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                AI Insights
              </TabsTrigger>
              <TabsTrigger value="predictions" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                Predictions
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="performance" className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    Performance Analytics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">127</p>
                      <p className="text-gray-600">Contests Won</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">73.2%</p>
                      <p className="text-gray-600">Success Rate</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">4.2x</p>
                      <p className="text-gray-600">ROI Multiplier</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-500" />
                    Deep Analytics
                  </h3>
                  <p className="text-gray-600">Advanced analytics dashboard with detailed performance metrics, trend analysis, and comparative insights.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="insights" className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-green-500" />
                    AI-Powered Insights
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <Zap className="h-5 w-5 text-green-500 mt-1" />
                      <div>
                        <p className="font-semibold text-green-800">Captain Optimization</p>
                        <p className="text-green-600 text-sm">AI suggests Virat Kohli as captain with 87% success probability</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <Timer className="h-5 w-5 text-blue-500 mt-1" />
                      <div>
                        <p className="font-semibold text-blue-800">Match Timing Advantage</p>
                        <p className="text-blue-600 text-sm">Evening matches show 23% higher returns for your playing style</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="predictions" className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-orange-500" />
                    Match Predictions
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold">IND vs AUS</p>
                        <p className="text-sm text-gray-600">T20 • Today 7:30 PM</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">IND 68%</p>
                        <p className="text-sm text-gray-600">Win Probability</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            <Brain className="h-5 w-5 mr-2" />
            AI Team Builder
          </Button>
          <Button size="lg" variant="outline" className="border-2 border-green-500 text-green-600 hover:bg-green-50">
            <Trophy className="h-5 w-5 mr-2" />
            Join Elite Contest
          </Button>
          <Button size="lg" variant="outline" className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50">
            <TrendingUp className="h-5 w-5 mr-2" />
            View Analytics
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default AdvancedDashboard;
