import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, Copy, Users, Star, Trophy, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";

// Player type definition
type Player = {
  id: string;
  name: string;
  team: string;
  role: "batsman" | "bowler" | "allrounder" | "wicketkeeper";
  credits: number;
  image_url?: string;
  isCaptain: boolean;
  isViceCaptain: boolean;
};

// Team type definition
type FantasyTeam = {
  id: string;
  name: string;
  match_id: string;
  captain_id?: string;
  vice_captain_id?: string;
  players: Player[];
  totalPoints?: number;
  totalCredits: number;
  contests: number;
  created_at: string;
};

const MyTeams = () => {
  const [teams, setTeams] = useState<FantasyTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<FantasyTeam | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserTeams();
  }, []);

  const fetchUserTeams = async () => {
    try {
      setIsLoading(true);
      
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        toast.error("Please log in to view your teams");
        navigate("/auth");
        return;
      }
      
      // Fetch user's teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .eq('user_id', user.user.id);
        
      if (teamsError) throw teamsError;
      
      if (!teamsData || teamsData.length === 0) {
        setTeams([]);
        setIsLoading(false);
        return;
      }
      
      // Get team details with players
      const teamPromises = teamsData.map(async (team) => {
        // Get team players
        const { data: teamPlayers, error: teamPlayersError } = await supabase
          .from('team_players')
          .select('player_id')
          .eq('team_id', team.id);
          
        if (teamPlayersError) throw teamPlayersError;
        
        if (!teamPlayers || teamPlayers.length === 0) {
          return {
            ...team,
            players: [],
            totalCredits: 0,
            contests: 0,
          };
        }
        
        const playerIds = teamPlayers.map(tp => tp.player_id);
        
        // Get player details
        const { data: players, error: playersError } = await supabase
          .from('players')
          .select('*')
          .in('id', playerIds);
          
        if (playersError) throw playersError;
        
        // Get contest entries count
        const { count, error: countError } = await supabase
          .from('contest_entries')
          .select('*', { count: 'exact', head: true })
          .eq('team_id', team.id);
          
        if (countError) throw countError;
        
        // Map players with captain/vice-captain status
        const mappedPlayers = players.map(player => ({
          ...player,
          isCaptain: player.id === team.captain_id,
          isViceCaptain: player.id === team.vice_captain_id
        }));
        
        // Calculate total credits
        const totalCredits = mappedPlayers.reduce((sum, player) => sum + Number(player.credits), 0);
        
        return {
          ...team,
          players: mappedPlayers,
          totalCredits,
          contests: count || 0,
          totalPoints: 0, // This would typically come from match results
        };
      });
      
      const fullTeams = await Promise.all(teamPromises);
      setTeams(fullTeams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast.error("Failed to load your teams");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTeam = (team: FantasyTeam) => {
    // In a real app, this would navigate to the team edit page with the team ID
    navigate(`/create-team?edit=${team.id}`);
  };

  const handleCloneTeam = async (team: FantasyTeam) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        toast.error("You must be logged in to clone a team");
        return;
      }
      
      // Create a new team with the same details
      const { data: newTeam, error: teamError } = await supabase
        .from('teams')
        .insert({
          user_id: user.user.id,
          name: `${team.name} (Copy)`,
          match_id: team.match_id,
          captain_id: team.captain_id,
          vice_captain_id: team.vice_captain_id
        })
        .select('id')
        .single();
        
      if (teamError) throw teamError;
      
      // Get the player IDs from the original team
      const { data: teamPlayers, error: playersError } = await supabase
        .from('team_players')
        .select('player_id')
        .eq('team_id', team.id);
        
      if (playersError) throw playersError;
      
      if (teamPlayers && teamPlayers.length > 0) {
        // Clone the team players into the new team
        const newTeamPlayers = teamPlayers.map(tp => ({
          team_id: newTeam.id,
          player_id: tp.player_id
        }));
        
        const { error: insertError } = await supabase
          .from('team_players')
          .insert(newTeamPlayers);
          
        if (insertError) throw insertError;
      }
      
      toast.success(`Team "${team.name}" has been cloned`);
      fetchUserTeams(); // Refresh the teams list
    } catch (error) {
      console.error("Error cloning team:", error);
      toast.error("Failed to clone team");
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      // First delete team players (due to foreign key constraints)
      const { error: playersError } = await supabase
        .from('team_players')
        .delete()
        .eq('team_id', teamId);
        
      if (playersError) throw playersError;
      
      // Then delete the team
      const { error: teamError } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);
        
      if (teamError) throw teamError;
      
      setTeams(teams.filter(team => team.id !== teamId));
      toast.success("Team has been deleted successfully");
    } catch (error) {
      console.error("Error deleting team:", error);
      toast.error("Failed to delete team");
    }
  };

  const getRoleCount = (team: FantasyTeam, role: string) => {
    return team.players.filter(player => player.role === role).length;
  };

  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-8 px-4 bg-gradient-to-r from-indigo-50 to-purple-50"
    >
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Teams</h1>
          <p className="text-gray-600">Manage your fantasy cricket teams</p>
        </div>

        {isLoading ? (
          <div className="text-center p-8">
            <p className="text-gray-500">Loading your teams...</p>
          </div>
        ) : teams.length === 0 ? (
          <Card className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Teams Created Yet</h3>
            <p className="text-gray-500 mb-6">Create your first fantasy cricket team to join contests</p>
            <Button onClick={() => navigate("/create-team")} className="bg-purple-600 hover:bg-purple-700">
              Create Team
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {teams.map(team => (
              <Card key={team.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="border-b">
                  <div className="p-4 md:flex md:justify-between md:items-center">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{team.name}</h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Trophy size={14} className="mr-1" />
                          <span>{team.totalPoints || 0} pts</span>
                        </div>
                        <div className="flex items-center">
                          <Users size={14} className="mr-1" />
                          <span>{team.contests} contests</span>
                        </div>
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          <span>{new Date(team.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEditTeam(team)}
                        className="flex items-center"
                      >
                        <Pencil size={14} className="mr-1" />
                        Edit
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleCloneTeam(team)}
                        className="flex items-center"
                      >
                        <Copy size={14} className="mr-1" />
                        Clone
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-red-200 text-red-600 hover:bg-red-50 flex items-center"
                          >
                            <Trash2 size={14} className="mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Team</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{team.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteTeam(team.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  
                  <div className="px-4 py-2 bg-gray-50 flex flex-wrap justify-center md:justify-between text-xs">
                    <div className="flex space-x-4 md:space-x-6">
                      <div className="text-center">
                        <div className="text-gray-500">WK</div>
                        <div className="font-semibold">{getRoleCount(team, 'wicketkeeper')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-500">BAT</div>
                        <div className="font-semibold">{getRoleCount(team, 'batsman')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-500">AR</div>
                        <div className="font-semibold">{getRoleCount(team, 'allrounder')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-500">BOWL</div>
                        <div className="font-semibold">{getRoleCount(team, 'bowler')}</div>
                      </div>
                    </div>
                    
                    <div className="mt-2 md:mt-0 flex space-x-6">
                      <div className="text-center">
                        <div className="text-gray-500">Credits Used</div>
                        <div className="font-semibold">{team.totalCredits}/100</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <button 
                      className="p-3 w-full text-center text-purple-600 hover:bg-purple-50 transition-colors text-sm font-medium"
                      onClick={() => setSelectedTeam(team)}
                    >
                      View Full Team
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{team?.name}</DialogTitle>
                    </DialogHeader>
                    
                    {team && (
                      <div className="mt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          {team.players.map(player => (
                            <div 
                              key={player.id} 
                              className="border rounded-lg p-3 relative overflow-hidden"
                            >
                              {player.isCaptain && (
                                <div className="absolute top-0 right-0 bg-purple-600 text-white px-1.5 text-xs rounded-bl-lg">
                                  C
                                </div>
                              )}
                              {player.isViceCaptain && (
                                <div className="absolute top-0 right-0 bg-blue-600 text-white px-1.5 text-xs rounded-bl-lg">
                                  VC
                                </div>
                              )}
                              
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden mr-3">
                                  {player.image_url ? (
                                    <img src={player.image_url} alt={player.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                      {player.name.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-sm truncate max-w-[120px]">{player.name}</div>
                                  <div className="text-xs text-gray-500 capitalize">{player.role}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="pt-4 border-t">
                          <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="text-sm">
                              <span className="text-gray-500">WK: </span>
                              <span className="font-medium">{getRoleCount(team, 'wicketkeeper')}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500">BAT: </span>
                              <span className="font-medium">{getRoleCount(team, 'batsman')}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500">AR: </span>
                              <span className="font-medium">{getRoleCount(team, 'allrounder')}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500">BOWL: </span>
                              <span className="font-medium">{getRoleCount(team, 'bowler')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <DialogFooter>
                      <Button 
                        onClick={() => handleEditTeam(team as FantasyTeam)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Edit Team
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </Card>
            ))}
            
            <div className="flex justify-center">
              <Button 
                onClick={() => navigate("/create-team")}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Create New Team
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MyTeams;
