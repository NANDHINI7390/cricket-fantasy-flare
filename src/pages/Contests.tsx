
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Trophy, Users, ChevronRight, ArrowUp, Filter, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface Contest {
  id: string;
  name: string;
  entryFee: number;
  prizePool: number;
  totalSpots: number;
  filledSpots: number;
  maxEntriesPerUser: number;
  matchId: string;
  matchName: string;
  matchTime: string;
  firstPrize: number;
  guaranteedPrize: boolean;
  winningPercentage: number;
}

// Sample contests data
const sampleContests: Contest[] = [
  {
    id: "1",
    name: "Winner Takes All",
    entryFee: 49,
    prizePool: 10000,
    totalSpots: 100,
    filledSpots: 65,
    maxEntriesPerUser: 1,
    matchId: "m1",
    matchName: "IND vs AUS",
    matchTime: "Today, 7:30 PM",
    firstPrize: 10000,
    guaranteedPrize: true,
    winningPercentage: 1
  },
  {
    id: "2",
    name: "Mega Contest",
    entryFee: 99,
    prizePool: 100000,
    totalSpots: 1000,
    filledSpots: 750,
    maxEntriesPerUser: 5,
    matchId: "m1",
    matchName: "IND vs AUS",
    matchTime: "Today, 7:30 PM",
    firstPrize: 20000,
    guaranteedPrize: true,
    winningPercentage: 50
  },
  {
    id: "3",
    name: "Practice Contest",
    entryFee: 0,
    prizePool: 1000,
    totalSpots: 500,
    filledSpots: 320,
    maxEntriesPerUser: 1,
    matchId: "m1",
    matchName: "IND vs AUS",
    matchTime: "Today, 7:30 PM",
    firstPrize: 500,
    guaranteedPrize: false,
    winningPercentage: 30
  },
  {
    id: "4",
    name: "Head to Head",
    entryFee: 499,
    prizePool: 900,
    totalSpots: 2,
    filledSpots: 1,
    maxEntriesPerUser: 1,
    matchId: "m2",
    matchName: "ENG vs NZ",
    matchTime: "Tomorrow, 3:30 PM",
    firstPrize: 900,
    guaranteedPrize: true,
    winningPercentage: 50
  },
  {
    id: "5",
    name: "Small Prize Pool",
    entryFee: 19,
    prizePool: 5000,
    totalSpots: 500,
    filledSpots: 200,
    maxEntriesPerUser: 10,
    matchId: "m2",
    matchName: "ENG vs NZ",
    matchTime: "Tomorrow, 3:30 PM",
    firstPrize: 1000,
    guaranteedPrize: false,
    winningPercentage: 40
  },
  {
    id: "6",
    name: "Beginners Only",
    entryFee: 9,
    prizePool: 2000,
    totalSpots: 200,
    filledSpots: 50,
    maxEntriesPerUser: 1,
    matchId: "m3",
    matchName: "SA vs PAK",
    matchTime: "Tomorrow, 7:00 PM",
    firstPrize: 500,
    guaranteedPrize: true,
    winningPercentage: 60
  },
];

const Contests = () => {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("entryFee");
  const [matches, setMatches] = useState<{ id: string, name: string, time: string }[]>([
    { id: "m1", name: "IND vs AUS", time: "Today, 7:30 PM" },
    { id: "m2", name: "ENG vs NZ", time: "Tomorrow, 3:30 PM" },
    { id: "m3", name: "SA vs PAK", time: "Tomorrow, 7:00 PM" },
  ]);
  const [selectedMatch, setSelectedMatch] = useState<string>("m1");
  const navigate = useNavigate();

  const handleJoinContest = (contest: Contest) => {
    // Check if user is authenticated
    const isAuthenticated = true; // Replace with actual auth check

    if (!isAuthenticated) {
      toast.error("Please log in to join contests");
      // navigate to login page
      return;
    }

    // Check if user has created a team for this match
    const hasTeam = true; // Replace with actual team check

    if (!hasTeam) {
      toast.info("Create a team first to join this contest");
      navigate("/create-team");
      return;
    }

    // In a real app, you would call an API to join the contest
    toast.success(`Successfully joined ${contest.name}`);
    
    // Navigate to team selection if user has multiple teams
    navigate(`/team-preview/${contest.id}`);
  };

  const filteredContests = sampleContests
    .filter(contest => {
      if (selectedMatch !== "all" && contest.matchId !== selectedMatch) {
        return false;
      }
      
      if (activeFilter === "all") return true;
      if (activeFilter === "free" && contest.entryFee === 0) return true;
      if (activeFilter === "paid" && contest.entryFee > 0) return true;
      if (activeFilter === "guaranteed" && contest.guaranteedPrize) return true;
      
      return false;
    })
    .sort((a, b) => {
      if (sortBy === "entryFee") return a.entryFee - b.entryFee;
      if (sortBy === "prizePool") return b.prizePool - a.prizePool;
      if (sortBy === "filledSpots") return (b.filledSpots / b.totalSpots) - (a.filledSpots / a.totalSpots);
      return 0;
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Contests</h1>
          <p className="text-gray-600">Choose a contest and compete with others</p>
        </div>
        
        <div className="mb-6">
          <Tabs defaultValue={selectedMatch} onValueChange={setSelectedMatch}>
            <TabsList className="grid grid-cols-3 mb-2">
              {matches.map(match => (
                <TabsTrigger key={match.id} value={match.id}>
                  {match.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {matches.map(match => (
              <TabsContent key={match.id} value={match.id} className="space-y-2">
                <div className="text-sm text-gray-500 text-center">{match.time}</div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <Card className="p-4 mb-6 bg-white shadow-md">
          <div className="flex flex-wrap gap-2 mb-4">
            <Button 
              variant={activeFilter === 'all' ? 'default' : 'outline'} 
              onClick={() => setActiveFilter('all')}
              size="sm"
            >
              All Contests
            </Button>
            <Button 
              variant={activeFilter === 'free' ? 'default' : 'outline'} 
              onClick={() => setActiveFilter('free')}
              size="sm"
            >
              Free
            </Button>
            <Button 
              variant={activeFilter === 'paid' ? 'default' : 'outline'} 
              onClick={() => setActiveFilter('paid')}
              size="sm"
            >
              Paid
            </Button>
            <Button 
              variant={activeFilter === 'guaranteed' ? 'default' : 'outline'} 
              onClick={() => setActiveFilter('guaranteed')}
              size="sm"
            >
              Guaranteed
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">{filteredContests.length} contests available</div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">Sort by:</span>
              <select 
                className="text-sm border rounded-md px-2 py-1"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="entryFee">Entry Fee</option>
                <option value="prizePool">Prize Pool</option>
                <option value="filledSpots">Filling Fast</option>
              </select>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {filteredContests.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-gray-500">No contests available for the selected filters</p>
            </div>
          ) : (
            filteredContests.map(contest => (
              <ContestCard 
                key={contest.id} 
                contest={contest} 
                onJoin={() => handleJoinContest(contest)}
              />
            ))
          )}
        </div>
        
        <div className="mt-8 flex justify-center">
          <Button onClick={() => navigate("/create-team")} className="bg-purple-600 hover:bg-purple-700">
            Create Your Team
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

interface ContestCardProps {
  contest: Contest;
  onJoin: () => void;
}

const ContestCard: React.FC<ContestCardProps> = ({ contest, onJoin }) => {
  const [showDetails, setShowDetails] = useState(false);
  const spotsLeft = contest.totalSpots - contest.filledSpots;
  const fillPercentage = (contest.filledSpots / contest.totalSpots) * 100;
  
  return (
    <Card className="overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg">{contest.name}</h3>
          {contest.guaranteedPrize && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              Guaranteed
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <Trophy size={16} className="text-purple-600 mr-1" />
            <span className="font-semibold">₹{contest.prizePool.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-sm text-gray-500">Entry: </span>
            <span className="font-semibold">{contest.entryFee === 0 ? 'FREE' : `₹${contest.entryFee}`}</span>
          </div>
        </div>
        
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{contest.filledSpots} teams</span>
            <span>{spotsLeft} spots left</span>
          </div>
          <Progress value={fillPercentage} className="h-2" />
        </div>
        
        {showDetails && (
          <div className="mt-4 mb-4 space-y-3 bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">First Prize</span>
              <span className="font-semibold">₹{contest.firstPrize.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Winners %</span>
              <span className="font-semibold">{contest.winningPercentage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Max entries per user</span>
              <span className="font-semibold">{contest.maxEntriesPerUser}</span>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-2">
          <button 
            className="text-purple-600 text-sm flex items-center"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide Details' : 'View Details'}
            <ChevronRight size={16} className={`transform transition-transform ${showDetails ? 'rotate-90' : ''}`} />
          </button>
          
          <Button onClick={onJoin} className="bg-purple-600 hover:bg-purple-700">
            {contest.entryFee === 0 ? 'Join FREE' : `Join ₹${contest.entryFee}`}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default Contests;
