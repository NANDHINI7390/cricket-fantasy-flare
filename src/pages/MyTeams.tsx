import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MoreVertical, Edit, Copy, Users, ShieldCheck, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FantasyTeam } from "@/types/team";
import { Player, PlayerRole } from "@/types/player";

const MyTeams = () => {
  const [teams, setTeams] = useState<FantasyTeam[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyTeams();
  }, []);

  const fetchMyTeams = async () => {
    try {
      setIsLoading(true);
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        navigate("/auth");
        return;
      }
      
      // Fetch all teams for the user
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .eq('user_id', user.user.id);
        
      if (teamsError) {
        throw teamsError;
      }
      
      if (!teamsData || teamsData.length === 0) {
        setTeams([]);
        return;
      }
      
      // For each team, fetch the players and participation count
      const teamsWithDetails = await Promise.all(teamsData.map(async (team) => {
        // Get the team players
        const { data: teamPlayers, error: playersError } = await supabase
          .from('team_players')
          .select('player_id')
          .eq('team_id', team.id);
          
        if (playersError) {
          console.error("Error fetching team players:", playersError);
          return { ...team, players: [], totalCredits: 0, contests: 0 };
        }
        
        // Get the player details for each player ID
        const playerIds = teamPlayers?.map(tp => tp.player_id) || [];
        
        const { data: players, error: playerDetailsError } = await supabase
          .from('players')
          .select('*')
          .in('id', playerIds);
          
        if (playerDetailsError) {
          console.error("Error fetching player details:", playerDetailsError);
          return { ...team, players: [], totalCredits: 0, contests: 0 };
        }
        
        // Add captain and vice-captain info
        const playersWithRoles = players?.map(player => ({
          ...player,
          isCaptain: player.id === team.captain_id,
          isViceCaptain: player.id === team.vice_captain_id,
          role: player.role as PlayerRole // Type assertion here
        })) || [];
        
        // Calculate total credits
        const totalCredits = playersWithRoles.reduce((sum, player) => sum + player.credits, 0);
        
        // Count contest participations
        const { count, error: countError } = await supabase
          .from('contest_entries')
          .select('*', { count: 'exact' })
          .eq('team_id', team.id);
          
        if (countError) {
          console.error("Error counting contest entries:", countError);
          return { ...team, players: playersWithRoles, totalCredits, contests: 0 };
        }
        
        return { 
          ...team, 
          players: playersWithRoles, 
          totalCredits, 
          contests: count || 0 
        };
      }));
      
      setTeams(teamsWithDetails as FantasyTeam[]);
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast.error("Failed to load your teams");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      // Delete team players first
      const { error: teamPlayersError } = await supabase
        .from('team_players')
        .delete()
        .eq('team_id', teamId);
        
      if (teamPlayersError) {
        throw teamPlayersError;
      }
      
      // Then delete the team
      const { error: teamError } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);
        
      if (teamError) {
        throw teamError;
      }
      
      // Refresh teams
      fetchMyTeams();
      toast.success("Team deleted successfully");
    } catch (error) {
      console.error("Error deleting team:", error);
      toast.error("Failed to delete team");
    }
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
            <p className="text-gray-500">Loading teams...</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-gray-500">No teams created yet. Create your first team!</p>
            <Button onClick={() => navigate("/create-team")} className="mt-4 bg-purple-600 hover:bg-purple-700">
              Create Team
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map(team => (
              <TeamCard key={team.id} team={team} onDelete={handleDeleteTeam} />
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Button onClick={() => navigate("/create-team")} className="bg-purple-600 hover:bg-purple-700">
            Create New Team
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

interface TeamCardProps {
  team: FantasyTeam;
  onDelete: (teamId: string) => void;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, onDelete }) => {
  const navigate = useNavigate();
  
  return (
    <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{team.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate(`/edit-team/${team.id}`)}>
                <Edit className="mr-2 h-4 w-4" /> Edit Team
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" /> Copy Team
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(team.id)} className="text-red-500 focus:bg-red-50">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Team
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription>
          <MatchInfoPane matchId={team.match_id} />
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center">
          <Users className="mr-2 h-4 w-4 text-gray-500" />
          <span>{team.players?.length || 0} Players</span>
        </div>
        <div className="flex items-center">
          <ShieldCheck className="mr-2 h-4 w-4 text-gray-500" />
          <span>Total Credits: {team.totalCredits}</span>
        </div>
        <div>
          <div className="text-sm font-medium">Contest Usage</div>
          <Progress value={(team.contests / 10) * 100} />
          <div className="text-xs text-gray-500 mt-1">{team.contests} Contests</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {team.players?.map(player => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Button onClick={() => navigate(`/team-details/${team.id}`)} variant="secondary">View Details</Button>
        <Badge variant="outline">Rank: #42</Badge>
      </CardFooter>
    </Card>
  );
};

interface PlayerCardProps {
  player: Player;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  return (
    <div className="flex flex-col items-center">
      <Avatar className="h-8 w-8">
        <AvatarImage src={player.image_url || `https://avatar.vercel.sh/${player.name}.png`} alt={player.name} />
        <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <span className="text-xs mt-1">{player.name}</span>
    </div>
  );
};

interface MatchInfoPaneProps {
  matchId: string;
}

const MatchInfoPane: React.FC<MatchInfoPaneProps> = ({ matchId }) => {
  // Placeholder for match info
  return (
    <div className="text-sm text-gray-500">
      Match: {matchId}
    </div>
  );
};

export default MyTeams;
