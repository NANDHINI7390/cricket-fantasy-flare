
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, Copy, Users, Star, Trophy, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Player type definition
type Player = {
  id: string;
  name: string;
  team: string;
  role: "batsman" | "bowler" | "allrounder" | "wicketkeeper";
  credits: number;
  image?: string;
  isCaptain: boolean;
  isViceCaptain: boolean;
};

// Team type definition
type FantasyTeam = {
  id: string;
  name: string;
  players: Player[];
  totalPoints: number;
  totalCredits: number;
  contests: number;
  createdAt: string;
};

// Sample teams data
const sampleTeams: FantasyTeam[] = [
  {
    id: "1",
    name: "Champions XI",
    players: [
      { id: "1", name: "Virat Kohli", team: "India", role: "batsman", credits: 10.5, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Virat_Kohli.jpg/440px-Virat_Kohli.jpg", isCaptain: true, isViceCaptain: false },
      { id: "2", name: "Rohit Sharma", team: "India", role: "batsman", credits: 10, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Rohit_Sharma_during_the_India_vs_Australia_4th_Test_match_at_Narendra_Modi_Stadium.jpg/440px-Rohit_Sharma_during_the_India_vs_Australia_4th_Test_match_at_Narendra_Modi_Stadium.jpg", isCaptain: false, isViceCaptain: true },
      { id: "3", name: "Jasprit Bumrah", team: "India", role: "bowler", credits: 9.5, isCaptain: false, isViceCaptain: false },
      { id: "4", name: "Kane Williamson", team: "New Zealand", role: "batsman", credits: 9, isCaptain: false, isViceCaptain: false },
      { id: "5", name: "Pat Cummins", team: "Australia", role: "bowler", credits: 9, isCaptain: false, isViceCaptain: false },
      { id: "6", name: "Ben Stokes", team: "England", role: "allrounder", credits: 9.5, isCaptain: false, isViceCaptain: false },
      { id: "7", name: "Babar Azam", team: "Pakistan", role: "batsman", credits: 9, isCaptain: false, isViceCaptain: false },
      { id: "8", name: "Jos Buttler", team: "England", role: "wicketkeeper", credits: 8.5, isCaptain: false, isViceCaptain: false },
      { id: "9", name: "Rashid Khan", team: "Afghanistan", role: "bowler", credits: 8.5, isCaptain: false, isViceCaptain: false },
      { id: "10", name: "Quinton de Kock", team: "South Africa", role: "wicketkeeper", credits: 8, isCaptain: false, isViceCaptain: false },
      { id: "11", name: "Mitchell Starc", team: "Australia", role: "bowler", credits: 8.5, isCaptain: false, isViceCaptain: false },
    ],
    totalPoints: 325,
    totalCredits: 98.5,
    contests: 3,
    createdAt: "2023-10-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Dream Team",
    players: [
      { id: "2", name: "Rohit Sharma", team: "India", role: "batsman", credits: 10, isCaptain: true, isViceCaptain: false },
      { id: "5", name: "Pat Cummins", team: "Australia", role: "bowler", credits: 9, isCaptain: false, isViceCaptain: true },
      { id: "13", name: "David Warner", team: "Australia", role: "batsman", credits: 8, isCaptain: false, isViceCaptain: false },
      { id: "14", name: "Trent Boult", team: "New Zealand", role: "bowler", credits: 8, isCaptain: false, isViceCaptain: false },
      { id: "15", name: "Rishabh Pant", team: "India", role: "wicketkeeper", credits: 8, isCaptain: false, isViceCaptain: false },
      { id: "3", name: "Jasprit Bumrah", team: "India", role: "bowler", credits: 9.5, isCaptain: false, isViceCaptain: false },
      { id: "7", name: "Babar Azam", team: "Pakistan", role: "batsman", credits: 9, isCaptain: false, isViceCaptain: false },
      { id: "9", name: "Rashid Khan", team: "Afghanistan", role: "bowler", credits: 8.5, isCaptain: false, isViceCaptain: false },
      { id: "11", name: "Mitchell Starc", team: "Australia", role: "bowler", credits: 8.5, isCaptain: false, isViceCaptain: false },
      { id: "12", name: "Hardik Pandya", team: "India", role: "allrounder", credits: 8.5, isCaptain: false, isViceCaptain: false },
      { id: "6", name: "Ben Stokes", team: "England", role: "allrounder", credits: 9.5, isCaptain: false, isViceCaptain: false },
    ],
    totalPoints: 285,
    totalCredits: 96.5,
    contests: 2,
    createdAt: "2023-10-10T15:45:00Z",
  },
];

const MyTeams = () => {
  const [teams, setTeams] = useState<FantasyTeam[]>(sampleTeams);
  const [selectedTeam, setSelectedTeam] = useState<FantasyTeam | null>(null);
  const navigate = useNavigate();

  const handleEditTeam = (team: FantasyTeam) => {
    // In a real app, this would navigate to the team edit page with the team ID
    navigate(`/create-team?edit=${team.id}`);
  };

  const handleCloneTeam = (team: FantasyTeam) => {
    const newTeam = {
      ...team,
      id: `clone-${team.id}-${Date.now()}`,
      name: `${team.name} (Copy)`,
      createdAt: new Date().toISOString(),
    };
    
    setTeams([...teams, newTeam]);
    toast.success(`Team "${team.name}" has been cloned`);
  };

  const handleDeleteTeam = (teamId: string) => {
    setTeams(teams.filter(team => team.id !== teamId));
    toast.success("Team has been deleted successfully");
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

        {teams.length === 0 ? (
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
                          <span>{team.totalPoints} pts</span>
                        </div>
                        <div className="flex items-center">
                          <Users size={14} className="mr-1" />
                          <span>{team.contests} contests</span>
                        </div>
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          <span>{new Date(team.createdAt).toLocaleDateString()}</span>
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
                                  {player.image ? (
                                    <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
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
                        onClick={() => handleEditTeam(team)}
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
