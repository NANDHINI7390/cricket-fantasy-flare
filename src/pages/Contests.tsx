
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Trophy, Users, ChevronRight, ArrowUp, Filter, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { joinContest } from "@/utils/wallet-service";

interface Contest {
  id: string;
  name: string;
  entry_fee: number;
  prize_pool: number;
  total_spots: number;
  filled_spots: number;
  max_entries_per_user: number;
  match_id: string;
  first_prize: number;
  guaranteed_prize: boolean;
  winning_percentage: number;
  created_at: string;
}

interface Match {
  id: string;
  name: string;
  time: string;
}

const Contests = () => {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("entry_fee");
  const [matches, setMatches] = useState<Match[]>([
    { id: "m1", name: "IND vs AUS", time: "Today, 7:30 PM" },
    { id: "m2", name: "ENG vs NZ", time: "Tomorrow, 3:30 PM" },
    { id: "m3", name: "SA vs PAK", time: "Tomorrow, 7:00 PM" },
  ]);
  const [selectedMatch, setSelectedMatch] = useState<string>("m1");
  const [contests, setContests] = useState<Contest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .order(sortBy, { ascending: sortBy === 'entry_fee' });

      if (error) {
        throw error;
      }

      setContests(data || []);
    } catch (error) {
      console.error("Error fetching contests:", error);
      toast.error("Failed to load contests");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user teams for the selected match
  const [userTeams, setUserTeams] = useState<{ id: string; name: string }[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  
  const fetchUserTeams = async (matchId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        return;
      }
      
      const { data, error } = await supabase
        .from('teams')
        .select('id, name')
        .eq('user_id', user.user.id)
        .eq('match_id', matchId);
        
      if (error) {
        throw error;
      }
      
      setUserTeams(data || []);
      if (data && data.length > 0) {
        setSelectedTeamId(data[0].id);
      } else {
        setSelectedTeamId(null);
      }
    } catch (error) {
      console.error("Error fetching user teams:", error);
    }
  };

  useEffect(() => {
    fetchUserTeams(selectedMatch);
  }, [selectedMatch]);

  const handleJoinContest = async (contest: Contest) => {
    try {
      // Check if user is authenticated
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        toast.error("Please log in to join contests");
        // navigate to login page
        navigate("/auth");
        return;
      }
      
      // Check if user has created a team for this match
      if (userTeams.length === 0) {
        toast.info("Create a team first to join this contest");
        navigate("/create-team");
        return;
      }

      // If multiple teams, ensure one is selected
      if (!selectedTeamId) {
        toast.error("Please select a team to join this contest");
        return;
      }

      // Call the join contest function
      const success = await joinContest(contest.id, selectedTeamId);
      
      if (success) {
        toast.success(`Successfully joined ${contest.name}`);
        // Refresh contests to update the UI
        fetchContests();
      } else {
        toast.error("Failed to join contest");
      }
    } catch (error) {
      console.error("Error joining contest:", error);
      toast.error("Failed to join contest. Please try again.");
    }
  };

  const filteredContests = contests
    .filter(contest => {
      if (selectedMatch !== "all" && contest.match_id !== selectedMatch) {
        return false;
      }
      
      if (activeFilter === "all") return true;
      if (activeFilter === "free" && contest.entry_fee === 0) return true;
      if (activeFilter === "paid" && contest.entry_fee > 0) return true;
      if (activeFilter === "guaranteed" && contest.guaranteed_prize) return true;
      
      return false;
    })
    .sort((a, b) => {
      if (sortBy === "entry_fee") return a.entry_fee - b.entry_fee;
      if (sortBy === "prize_pool") return b.prize_pool - a.prize_pool;
      if (sortBy === "filled_spots") return (b.filled_spots / b.total_spots) - (a.filled_spots / a.total_spots);
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

        {userTeams.length > 0 && (
          <Card className="p-4 mb-6 bg-white shadow-md">
            <h3 className="font-semibold mb-2">Select Team to Join Contests</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {userTeams.map(team => (
                <Button 
                  key={team.id}
                  variant={selectedTeamId === team.id ? "default" : "outline"}
                  onClick={() => setSelectedTeamId(team.id)}
                  className="text-sm"
                >
                  {team.name}
                </Button>
              ))}
            </div>
          </Card>
        )}

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
                onChange={(e) => {
                  setSortBy(e.target.value);
                  // Re-fetch with new sort order
                  fetchContests();
                }}
              >
                <option value="entry_fee">Entry Fee</option>
                <option value="prize_pool">Prize Pool</option>
                <option value="filled_spots">Filling Fast</option>
              </select>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center p-8">
              <p className="text-gray-500">Loading contests...</p>
            </div>
          ) : filteredContests.length === 0 ? (
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
  const spotsLeft = contest.total_spots - contest.filled_spots;
  const fillPercentage = (contest.filled_spots / contest.total_spots) * 100;
  
  return (
    <Card className="overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg">{contest.name}</h3>
          {contest.guaranteed_prize && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              Guaranteed
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <Trophy size={16} className="text-purple-600 mr-1" />
            <span className="font-semibold">₹{contest.prize_pool.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-sm text-gray-500">Entry: </span>
            <span className="font-semibold">{contest.entry_fee === 0 ? 'FREE' : `₹${contest.entry_fee}`}</span>
          </div>
        </div>
        
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{contest.filled_spots} teams</span>
            <span>{spotsLeft} spots left</span>
          </div>
          <Progress value={fillPercentage} className="h-2" />
        </div>
        
        {showDetails && (
          <div className="mt-4 mb-4 space-y-3 bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">First Prize</span>
              <span className="font-semibold">₹{contest.first_prize.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Winners %</span>
              <span className="font-semibold">{contest.winning_percentage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Max entries per user</span>
              <span className="font-semibold">{contest.max_entries_per_user}</span>
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
            {contest.entry_fee === 0 ? 'Join FREE' : `Join ₹${contest.entry_fee}`}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default Contests;
