import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Trophy, 
  Calendar, 
  Coins, 
  Crown, 
  Target,
  TrendingUp,
  User,
  Award,
  Clock
} from "lucide-react";
import { toast } from "sonner";

interface League {
  id: string;
  name: string;
  entry_fee: number;
  total_spots: number;
  match_id: string;
  team_id: string;
  is_public: boolean;
  creator_id: string;
  invite_code: string;
  created_at: string;
  start_at: string;
}

interface Participant {
  id: string;
  name: string;
  team_name: string;
  points: number;
  rank: number;
  joined_at: string;
}

interface LeagueDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  league: League | null;
}

const LeagueDetailsModal: React.FC<LeagueDetailsModalProps> = ({
  isOpen,
  onClose,
  league
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [leagueStats, setLeagueStats] = useState({
    totalParticipants: 0,
    avgPoints: 0,
    topScore: 0,
    prizePool: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (league && isOpen) {
      loadLeagueDetails();
    }
  }, [league, isOpen]);

  const loadLeagueDetails = async () => {
    if (!league) return;
    
    setIsLoading(true);
    try {
      // Load participants from localStorage (mock data for now)
      const storedParticipants = localStorage.getItem(`participants_${league.id}`);
      let mockParticipants: Participant[] = [];
      
      if (storedParticipants) {
        mockParticipants = JSON.parse(storedParticipants);
      } else {
        // Generate mock participants for demonstration
        mockParticipants = generateMockParticipants(league);
        localStorage.setItem(`participants_${league.id}`, JSON.stringify(mockParticipants));
      }
      
      setParticipants(mockParticipants);
      
      // Calculate league stats
      const totalParticipants = mockParticipants.length;
      const avgPoints = totalParticipants > 0 ? 
        Math.round(mockParticipants.reduce((sum, p) => sum + p.points, 0) / totalParticipants) : 0;
      const topScore = totalParticipants > 0 ? 
        Math.max(...mockParticipants.map(p => p.points)) : 0;
      const prizePool = league.entry_fee * totalParticipants;
      
      setLeagueStats({
        totalParticipants,
        avgPoints,
        topScore,
        prizePool
      });
      
    } catch (error) {
      console.error("Error loading league details:", error);
      toast.error("Failed to load league details");
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockParticipants = (league: League): Participant[] => {
    const mockNames = [
      "Rahul Kumar", "Priya Sharma", "Amit Patel", "Sneha Gupta", "Rohit Singh",
      "Kavya Reddy", "Arjun Mehta", "Pooja Jain", "Vikram Rao", "Neha Verma"
    ];
    
    const teamNames = [
      "Thunder Strikers", "Lightning Bolts", "Fire Phoenixes", "Storm Chasers",
      "Royal Eagles", "Mighty Warriors", "Speed Demons", "Victory Vipers",
      "Champion Chiefs", "Power Players"
    ];
    
    const numParticipants = Math.min(Math.floor(Math.random() * 8) + 3, league.total_spots);
    const participants: Participant[] = [];
    
    for (let i = 0; i < numParticipants; i++) {
      participants.push({
        id: `p${i + 1}`,
        name: mockNames[i % mockNames.length],
        team_name: teamNames[i % teamNames.length],
        points: Math.floor(Math.random() * 500) + 100, // Random points between 100-600
        rank: i + 1,
        joined_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() // Random date within last week
      });
    }
    
    // Sort by points (descending) and assign ranks
    participants.sort((a, b) => b.points - a.points);
    participants.forEach((p, index) => {
      p.rank = index + 1;
    });
    
    return participants;
  };

  const copyInviteCode = () => {
    if (league) {
      navigator.clipboard.writeText(league.invite_code);
      toast.success("Invite code copied to clipboard!");
    }
  };

  if (!league) return null;

  const spotsUsed = participants.length;
  const spotsLeft = league.total_spots - spotsUsed;
  const fillPercentage = (spotsUsed / league.total_spots) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            {league.name}
          </DialogTitle>
          <DialogDescription className="text-base">
            League Details and Leaderboard
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="details">Match Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{leagueStats.totalParticipants}</div>
                  <div className="text-sm text-gray-500">Participants</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Coins className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">₹{leagueStats.prizePool}</div>
                  <div className="text-sm text-gray-500">Prize Pool</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{leagueStats.avgPoints}</div>
                  <div className="text-sm text-gray-500">Avg Points</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{leagueStats.topScore}</div>
                  <div className="text-sm text-gray-500">Top Score</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  League Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Spots Filled</span>
                      <span className="text-sm text-gray-600">
                        {spotsUsed}/{league.total_spots} ({spotsLeft} left)
                      </span>
                    </div>
                    <Progress value={fillPercentage} className="h-3" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Entry Fee:</span> ₹{league.entry_fee}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {league.is_public ? "Public" : "Private"}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Invite Code:</span> 
                      <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                        {league.invite_code}
                      </code>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="ml-2 text-xs"
                        onClick={copyInviteCode}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Current Standings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading leaderboard...</p>
                  </div>
                ) : participants.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No participants yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {participants.map((participant, index) => (
                      <div
                        key={participant.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          index === 0 ? 'bg-yellow-50 border-yellow-200' :
                          index === 1 ? 'bg-gray-50 border-gray-200' :
                          index === 2 ? 'bg-orange-50 border-orange-200' :
                          'bg-white border-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-500 text-white' :
                            index === 2 ? 'bg-orange-500 text-white' :
                            'bg-blue-500 text-white'
                          }`}>
                            {participant.rank}
                          </div>
                          <div>
                            <div className="font-semibold">{participant.name}</div>
                            <div className="text-sm text-gray-600">{participant.team_name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{participant.points}</div>
                          <div className="text-xs text-gray-500">points</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Match Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Match ID:</span>
                    <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-sm">
                      {league.match_id}
                    </code>
                  </div>
                  <div>
                    <span className="font-medium">Start Time:</span>
                    <span className="ml-2">{new Date(league.start_at).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>
                    <span className="ml-2">{new Date(league.created_at).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="font-medium">League Type:</span>
                    <Badge className="ml-2" variant={league.is_public ? "default" : "secondary"}>
                      {league.is_public ? "Public" : "Private"}
                    </Badge>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    League Timeline
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>League Created</span>
                      <span className="text-gray-600">{new Date(league.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Match Starts</span>
                      <span className="text-gray-600">{new Date(league.start_at).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Results Expected</span>
                      <span className="text-gray-600">
                        {new Date(new Date(league.start_at).getTime() + 4 * 60 * 60 * 1000).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeagueDetailsModal;