import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Users, 
  Trophy, 
  DollarSign, 
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface AdminStats {
  totalUsers: number;
  totalContests: number;
  totalRevenue: number;
  activeContests: number;
}

const AdminPanel = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalUsers: 0,
    totalContests: 0,
    totalRevenue: 0,
    activeContests: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newContest, setNewContest] = useState({
    name: "",
    entry_fee: 0,
    prize_pool: 0,
    total_spots: 100,
    max_entries_per_user: 1,
    match_id: "",
    first_prize: 0,
    guaranteed_prize: false,
    winning_percentage: 50
  });

  useEffect(() => {
    checkAdminAccess();
    fetchContests();
    fetchAdminStats();
  }, []);

  const checkAdminAccess = async () => {
    // For demo purposes, we'll allow access
    // In production, you'd check user roles here
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      toast.error("Admin access required");
      window.location.href = "/auth";
      return;
    }
  };

  const fetchContests = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContests(data || []);
    } catch (error) {
      console.error("Error fetching contests:", error);
      toast.error("Failed to load contests");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminStats = async () => {
    try {
      // Mock admin stats for now
      setAdminStats({
        totalUsers: 1247,
        totalContests: contests.length,
        totalRevenue: 125000,
        activeContests: contests.filter(c => c.filled_spots < c.total_spots).length
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    }
  };

  const createContest = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('contests')
        .insert([{
          name: newContest.name,
          entry_fee: newContest.entry_fee,
          prize_pool: newContest.prize_pool,
          total_spots: newContest.total_spots,
          filled_spots: 0,
          max_entries_per_user: newContest.max_entries_per_user,
          match_id: newContest.match_id,
          first_prize: newContest.first_prize,
          guaranteed_prize: newContest.guaranteed_prize,
          winning_percentage: newContest.winning_percentage
        }])
        .select();

      if (error) throw error;

      toast.success("Contest created successfully!");
      setShowCreateModal(false);
      setNewContest({
        name: "",
        entry_fee: 0,
        prize_pool: 0,
        total_spots: 100,
        max_entries_per_user: 1,
        match_id: "",
        first_prize: 0,
        guaranteed_prize: false,
        winning_percentage: 50
      });
      fetchContests();
    } catch (error) {
      console.error("Error creating contest:", error);
      toast.error("Failed to create contest");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteContest = async (contestId: string) => {
    try {
      const { error } = await supabase
        .from('contests')
        .delete()
        .eq('id', contestId);

      if (error) throw error;

      toast.success("Contest deleted successfully!");
      fetchContests();
    } catch (error) {
      console.error("Error deleting contest:", error);
      toast.error("Failed to delete contest");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-8 px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Admin Panel
          </h1>
          <p className="text-gray-600 text-lg">Manage contests, users, and platform operations</p>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900">{adminStats.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Trophy className="h-8 w-8 text-purple-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900">{adminStats.totalContests}</div>
              <div className="text-sm text-gray-600">Total Contests</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900">₹{adminStats.totalRevenue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Settings className="h-8 w-8 text-orange-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900">{adminStats.activeContests}</div>
              <div className="text-sm text-gray-600">Active Contests</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="contests" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="contests">Contest Management</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="contests" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Contest Management</CardTitle>
                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Create Contest
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Contest</DialogTitle>
                      <DialogDescription>
                        Set up a new fantasy cricket contest for users to participate in.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Contest Name</Label>
                        <Input
                          id="name"
                          value={newContest.name}
                          onChange={(e) => setNewContest({...newContest, name: e.target.value})}
                          placeholder="Enter contest name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="matchId">Match ID</Label>
                        <Input
                          id="matchId"
                          value={newContest.match_id}
                          onChange={(e) => setNewContest({...newContest, match_id: e.target.value})}
                          placeholder="Enter match ID"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="entryFee">Entry Fee (₹)</Label>
                        <Input
                          id="entryFee"
                          type="number"
                          value={newContest.entry_fee}
                          onChange={(e) => setNewContest({...newContest, entry_fee: Number(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="prizePool">Prize Pool (₹)</Label>
                        <Input
                          id="prizePool"
                          type="number"
                          value={newContest.prize_pool}
                          onChange={(e) => setNewContest({...newContest, prize_pool: Number(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="totalSpots">Total Spots</Label>
                        <Input
                          id="totalSpots"
                          type="number"
                          value={newContest.total_spots}
                          onChange={(e) => setNewContest({...newContest, total_spots: Number(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="firstPrize">First Prize (₹)</Label>
                        <Input
                          id="firstPrize"
                          type="number"
                          value={newContest.first_prize}
                          onChange={(e) => setNewContest({...newContest, first_prize: Number(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxEntries">Max Entries Per User</Label>
                        <Input
                          id="maxEntries"
                          type="number"
                          value={newContest.max_entries_per_user}
                          onChange={(e) => setNewContest({...newContest, max_entries_per_user: Number(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="winningPercentage">Winning Percentage (%)</Label>
                        <Input
                          id="winningPercentage"
                          type="number"
                          value={newContest.winning_percentage}
                          onChange={(e) => setNewContest({...newContest, winning_percentage: Number(e.target.value)})}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createContest} disabled={isLoading}>
                        {isLoading ? "Creating..." : "Create Contest"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Loading contests...</p>
                    </div>
                  ) : contests.length === 0 ? (
                    <div className="text-center py-8">
                      <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No contests created yet</p>
                    </div>
                  ) : (
                    contests.map((contest) => (
                      <div key={contest.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold">{contest.name}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant={contest.guaranteed_prize ? "default" : "secondary"}>
                              {contest.guaranteed_prize ? "Guaranteed" : "Regular"}
                            </Badge>
                            <Badge variant={contest.filled_spots >= contest.total_spots ? "destructive" : "outline"}>
                              {contest.filled_spots >= contest.total_spots ? "Full" : "Open"}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <span className="text-sm text-gray-500">Entry Fee</span>
                            <p className="font-semibold">₹{contest.entry_fee}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Prize Pool</span>
                            <p className="font-semibold">₹{contest.prize_pool.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Filled Spots</span>
                            <p className="font-semibold">{contest.filled_spots}/{contest.total_spots}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Match ID</span>
                            <p className="font-semibold text-xs">{contest.match_id}</p>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Fill Rate</span>
                            <span>{Math.round((contest.filled_spots / contest.total_spots) * 100)}%</span>
                          </div>
                          <Progress value={(contest.filled_spots / contest.total_spots) * 100} className="h-2" />
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => deleteContest(contest.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">User Management</h3>
                  <p className="text-gray-600">
                    User management features will be available here including user profiles, activity logs, and moderation tools.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
                  <p className="text-gray-600">
                    Detailed analytics including user engagement, revenue metrics, and contest performance will be displayed here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">System Settings</h3>
                  <p className="text-gray-600">
                    Platform configuration, payment settings, and system preferences will be managed here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default AdminPanel;