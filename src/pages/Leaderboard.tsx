
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, TrendingUp, Search, Filter, ChevronDown, ArrowUp, ArrowDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  rank: number;
  points: number;
  teams: number;
  winnings: number;
  change: 'up' | 'down' | 'same';
}

// Sample leaderboard data
const sampleUsers: User[] = [
  { id: "1", name: "Virat Shah", username: "kingkohli", avatar: "https://randomuser.me/api/portraits/men/32.jpg", rank: 1, points: 1289, teams: 12, winnings: 25000, change: 'same' },
  { id: "2", name: "Rohit Malhotra", username: "hitman45", avatar: "https://randomuser.me/api/portraits/men/44.jpg", rank: 2, points: 1187, teams: 15, winnings: 18000, change: 'up' },
  { id: "3", name: "Mahendra Singh", username: "captaincool07", avatar: "https://randomuser.me/api/portraits/men/67.jpg", rank: 3, points: 1142, teams: 10, winnings: 15000, change: 'down' },
  { id: "4", name: "Ajay Patel", username: "cricket_king", avatar: "https://randomuser.me/api/portraits/men/55.jpg", rank: 4, points: 1098, teams: 14, winnings: 12000, change: 'up' },
  { id: "5", name: "Priya Sharma", username: "fantasy_queen", avatar: "https://randomuser.me/api/portraits/women/22.jpg", rank: 5, points: 1065, teams: 8, winnings: 10000, change: 'up' },
  { id: "6", name: "Rahul Mehta", username: "rahul_fantasy", avatar: "https://randomuser.me/api/portraits/men/11.jpg", rank: 6, points: 1032, teams: 11, winnings: 8000, change: 'down' },
  { id: "7", name: "Anita Gupta", username: "anita_cricket", avatar: "https://randomuser.me/api/portraits/women/45.jpg", rank: 7, points: 987, teams: 9, winnings: 7500, change: 'down' },
  { id: "8", name: "Deepak Verma", username: "deep_cricket", avatar: "https://randomuser.me/api/portraits/men/36.jpg", rank: 8, points: 954, teams: 7, winnings: 6000, change: 'same' },
  { id: "9", name: "Nikhil Kapoor", username: "nikhil007", avatar: "https://randomuser.me/api/portraits/men/82.jpg", rank: 9, points: 923, teams: 12, winnings: 5500, change: 'up' },
  { id: "10", name: "Sneha Joshi", username: "sneha_fantasy", avatar: "https://randomuser.me/api/portraits/women/67.jpg", rank: 10, points: 889, teams: 10, winnings: 5000, change: 'down' },
  // Add more users as needed
];

const timeframes = ["Today", "This Week", "This Month", "All Time"];

const Leaderboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTimeframe, setSelectedTimeframe] = useState("This Week");
  const [sortBy, setSortBy] = useState("points");
  const [contests, setContests] = useState([
    { id: "c1", name: "IND vs AUS Mega Contest", participants: 10000 },
    { id: "c2", name: "World Cup Fantasy League", participants: 25000 },
    { id: "c3", name: "IPL Super League", participants: 50000 },
  ]);
  const [selectedContest, setSelectedContest] = useState("all");

  const filteredUsers = sampleUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === "points") return b.points - a.points;
    if (sortBy === "winnings") return b.winnings - a.winnings;
    if (sortBy === "teams") return b.teams - a.teams;
    return a.rank - b.rank;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-8 px-4 bg-gradient-to-r from-indigo-50 to-purple-50"
    >
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
          <p className="text-gray-600">See how you rank against other players</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <LeaderboardCard 
            icon={<Trophy className="w-6 h-6 text-yellow-500" />}
            title="Top Rank"
            value="#1"
            description="Your highest rank"
            color="from-yellow-500 to-amber-300"
          />
          <LeaderboardCard 
            icon={<TrendingUp className="w-6 h-6 text-green-500" />}
            title="Points"
            value="956"
            description="Your fantasy points"
            color="from-green-500 to-emerald-300"
          />
          <LeaderboardCard 
            icon={<Medal className="w-6 h-6 text-blue-500" />}
            title="Winnings"
            value="₹5,245"
            description="Total prize money"
            color="from-blue-500 to-indigo-300"
          />
        </div>

        <Card className="p-4 mb-6 bg-white shadow-md">
          <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search players..."
                  className="pl-9 pr-4 py-2 border rounded-md w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  {timeframes.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="points">Points</SelectItem>
                  <SelectItem value="winnings">Winnings</SelectItem>
                  <SelectItem value="teams">Teams</SelectItem>
                  <SelectItem value="rank">Rank</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <div className="mb-6">
          <Tabs defaultValue="all" onValueChange={setSelectedContest}>
            <TabsList className="grid grid-cols-4 mb-2">
              <TabsTrigger value="all">All Contests</TabsTrigger>
              {contests.map(contest => (
                <TabsTrigger key={contest.id} value={contest.id}>
                  {contest.name.length > 15 ? contest.name.substring(0, 15) + '...' : contest.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="all" className="text-sm text-gray-500 text-center">
              Showing rankings across all contests
            </TabsContent>
            {contests.map(contest => (
              <TabsContent key={contest.id} value={contest.id} className="text-sm text-gray-500 text-center">
                {contest.participants.toLocaleString()} participants
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <Card className="overflow-hidden bg-white shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Player</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">Points</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">Teams</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">Winnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user, index) => (
                  <tr key={user.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`flex items-center justify-center w-6 h-6 rounded-full mr-2 ${
                          user.rank <= 3 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.rank}
                        </span>
                        {user.change === 'up' && <ArrowUp size={14} className="text-green-500" />}
                        {user.change === 'down' && <ArrowDown size={14} className="text-red-500" />}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img className="h-10 w-10 rounded-full" src={user.avatar} alt="" />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-semibold">
                      {user.points.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user.teams}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-semibold">
                      ₹{user.winnings.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-gray-500">No players found matching your search</p>
            </div>
          )}
        </Card>
      </div>
    </motion.div>
  );
};

interface LeaderboardCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  color: string;
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ icon, title, value, description, color }) => {
  return (
    <Card className="overflow-hidden">
      <div className={`h-2 bg-gradient-to-r ${color}`}></div>
      <div className="p-4">
        <div className="flex items-center">
          <div className="mr-3">
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Leaderboard;
