
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign, 
  Users, 
  Trophy,
  Brain,
  Star,
  Zap,
  Shield,
  Crown,
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";

const PremiumAnalytics: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");

  // Mock data for charts
  const performanceData = [
    { name: 'Week 1', winnings: 2400, contests: 12, winRate: 75 },
    { name: 'Week 2', winnings: 1398, contests: 8, winRate: 62.5 },
    { name: 'Week 3', winnings: 9800, contests: 15, winRate: 86.7 },
    { name: 'Week 4', winnings: 3908, contests: 11, winRate: 72.7 },
    { name: 'Week 5', winnings: 4800, contests: 14, winRate: 78.6 },
    { name: 'Week 6', winnings: 3800, contests: 9, winRate: 66.7 },
  ];

  const playerTypeData = [
    { name: 'Batsmen', value: 35, color: '#3B82F6' },
    { name: 'Bowlers', value: 30, color: '#10B981' },
    { name: 'All-rounders', value: 25, color: '#F59E0B' },
    { name: 'Wicket-keepers', value: 10, color: '#EF4444' },
  ];

  const aiInsights = [
    {
      type: "Performance Trend",
      icon: TrendingUp,
      title: "Win Rate Improving",
      description: "Your win rate has increased by 12% over the last month",
      change: "+12%",
      positive: true
    },
    {
      type: "Captain Analysis",
      icon: Crown,
      title: "Captain Selection Accuracy",
      description: "AI-recommended captains performing 23% better",
      change: "+23%",
      positive: true
    },
    {
      type: "Risk Assessment",
      icon: Shield,
      title: "Optimal Risk Level",
      description: "Your current risk profile is generating maximum returns",
      change: "Optimal",
      positive: true
    },
    {
      type: "Prediction Accuracy",
      icon: Brain,
      title: "AI Model Performance",
      description: "Match predictions achieving 87% accuracy rate",
      change: "87%",
      positive: true
    }
  ];

  const topPerformingStrategies = [
    { strategy: "Aggressive Batting", roi: 245, contests: 23, success: 78 },
    { strategy: "Balanced Approach", roi: 198, contests: 45, success: 72 },
    { strategy: "Bowling Focus", roi: 167, contests: 18, success: 83 },
    { strategy: "All-rounder Heavy", roi: 134, contests: 31, success: 69 }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <BarChart3 className="h-10 w-10 text-blue-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Premium Analytics
          </h1>
        </div>
        <p className="text-gray-600 text-lg">Advanced performance insights and AI-powered analytics</p>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total ROI</p>
                  <p className="text-3xl font-bold">247%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-200" />
              </div>
              <Badge variant="secondary" className="bg-blue-400 text-blue-900 mt-2">
                +34% vs last month
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">AI Accuracy</p>
                  <p className="text-3xl font-bold">94.2%</p>
                </div>
                <Brain className="h-8 w-8 text-green-200" />
              </div>
              <Badge variant="secondary" className="bg-green-400 text-green-900 mt-2">
                Industry Leading
              </Badge>
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
                  <p className="text-purple-100 text-sm font-medium">Avg Points</p>
                  <p className="text-3xl font-bold">247</p>
                </div>
                <Target className="h-8 w-8 text-purple-200" />
              </div>
              <Badge variant="secondary" className="bg-purple-400 text-purple-900 mt-2">
                Top 5% Player
              </Badge>
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
                  <p className="text-orange-100 text-sm font-medium">Streak</p>
                  <p className="text-3xl font-bold">12</p>
                </div>
                <Zap className="h-8 w-8 text-orange-200" />
              </div>
              <Badge variant="secondary" className="bg-orange-400 text-orange-900 mt-2">
                Personal Best
              </Badge>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="mb-8 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-purple-500" />
              AI-Powered Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {aiInsights.map((insight, index) => (
                <motion.div
                  key={insight.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <insight.icon className={`h-6 w-6 ${insight.positive ? 'text-green-500' : 'text-red-500'}`} />
                    <Badge variant={insight.positive ? "default" : "destructive"}>
                      {insight.change}
                    </Badge>
                  </div>
                  <h4 className="font-semibold mb-1">{insight.title}</h4>
                  <p className="text-sm text-gray-600">{insight.description}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Analytics Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-lg">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="strategies">Strategies</TabsTrigger>
            <TabsTrigger value="players">Player Analysis</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Winnings Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorWinnings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="winnings" stroke="#3B82F6" fillOpacity={1} fill="url(#colorWinnings)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Win Rate Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="winRate" stroke="#10B981" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="strategies" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Top Performing Strategies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformingStrategies.map((strategy, index) => (
                    <div key={strategy.strategy} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold">{strategy.strategy}</h4>
                          <p className="text-sm text-gray-600">{strategy.contests} contests</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{strategy.roi}% ROI</p>
                        <p className="text-sm text-gray-600">{strategy.success}% success</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="players" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Player Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={playerTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {playerTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Captain Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Virat Kohli</span>
                      <Badge className="bg-green-100 text-green-800">92% Success</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">Rohit Sharma</span>
                      <Badge className="bg-blue-100 text-blue-800">87% Success</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium">KL Rahul</span>
                      <Badge className="bg-purple-100 text-purple-800">84% Success</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="predictions" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>AI Match Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">IND vs AUS</h4>
                      <p className="text-sm text-gray-600">T20 • Today 7:30 PM</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">IND 68%</p>
                      <Badge className="bg-blue-100 text-blue-800 mt-1">High Confidence</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">ENG vs SA</h4>
                      <p className="text-sm text-gray-600">ODI • Tomorrow 2:00 PM</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">ENG 72%</p>
                      <Badge className="bg-green-100 text-green-800 mt-1">Very High</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default PremiumAnalytics;
