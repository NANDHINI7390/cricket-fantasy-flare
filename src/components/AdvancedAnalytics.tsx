
import React, { useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { TrendingUp, Trophy, Target, Users, DollarSign, Calendar, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const AdvancedAnalytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  const [selectedMetric, setSelectedMetric] = useState("all");

  // Mock data for analytics
  const performanceData = [
    { name: "Mon", points: 145, winRate: 65, contests: 3 },
    { name: "Tue", points: 178, winRate: 80, contests: 4 },
    { name: "Wed", points: 156, winRate: 45, contests: 2 },
    { name: "Thu", points: 203, winRate: 90, contests: 5 },
    { name: "Fri", points: 167, winRate: 70, contests: 3 },
    { name: "Sat", points: 198, winRate: 85, contests: 6 },
    { name: "Sun", points: 189, winRate: 75, contests: 4 }
  ];

  const contestData = [
    { name: "Won", value: 68, color: "#10b981" },
    { name: "Top 3", value: 15, color: "#f59e0b" },
    { name: "Top 10", value: 12, color: "#3b82f6" },
    { name: "Others", value: 5, color: "#6b7280" }
  ];

  const playerPerformanceData = [
    { player: "Virat Kohli", batting: 92, bowling: 20, fielding: 85, consistency: 88 },
    { player: "Jasprit Bumrah", batting: 15, bowling: 95, fielding: 80, consistency: 90 },
    { player: "KL Rahul", batting: 85, bowling: 10, fielding: 90, consistency: 82 },
    { player: "Hardik Pandya", batting: 78, bowling: 75, fielding: 85, consistency: 80 },
    { player: "Rohit Sharma", batting: 88, bowling: 5, fielding: 75, consistency: 85 }
  ];

  const earningsData = [
    { month: "Jan", earnings: 2500, investment: 1800 },
    { month: "Feb", earnings: 3200, investment: 2100 },
    { month: "Mar", earnings: 4100, investment: 2800 },
    { month: "Apr", earnings: 3800, investment: 2500 },
    { month: "May", earnings: 5200, investment: 3200 },
    { month: "Jun", earnings: 4800, investment: 3000 }
  ];

  const StatCard = ({ title, value, icon: Icon, trend, color = "blue" }: any) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
            {trend && (
              <p className={`text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
                <TrendingUp className="w-3 h-3 mr-1" />
                {trend > 0 ? '+' : ''}{trend}% from last period
              </p>
            )}
          </div>
          <div className={`p-3 bg-${color}-100 rounded-full`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600">Deep insights into your fantasy cricket performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Points"
          value="1,247"
          icon={Target}
          trend={12.5}
          color="blue"
        />
        <StatCard
          title="Contests Won"
          value="68"
          icon={Trophy}
          trend={8.3}
          color="green"
        />
        <StatCard
          title="Win Rate"
          value="74%"
          icon={TrendingUp}
          trend={5.2}
          color="purple"
        />
        <StatCard
          title="Total Earnings"
          value="₹28,500"
          icon={DollarSign}
          trend={15.7}
          color="emerald"
        />
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="contests">Contests</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Performance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="points" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Win Rate Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Win Rate Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="winRate" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contests" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contest Results Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Contest Results Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={contestData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {contestData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {contestData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm text-gray-600">{entry.name}: {entry.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contest Participation */}
            <Card>
              <CardHeader>
                <CardTitle>Contest Participation</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="contests" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="players" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Player Performance Radar</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={playerPerformanceData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="player" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Batting" dataKey="batting" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                  <Radar name="Bowling" dataKey="bowling" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                  <Radar name="Fielding" dataKey="fielding" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                  <Radar name="Consistency" dataKey="consistency" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Earnings vs Investment</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={earningsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="investment" fill="#ef4444" name="Investment" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="earnings" fill="#10b981" name="Earnings" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalytics;
