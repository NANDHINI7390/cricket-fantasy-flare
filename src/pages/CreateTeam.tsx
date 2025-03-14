
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { captureAuthError } from "@/integrations/sentry/config";

const MAX_PLAYERS = 11;
const MAX_CREDITS = 100;

type Player = {
  id: string;
  name: string;
  team: string;
  role: "batsman" | "bowler" | "allrounder" | "wicketkeeper";
  credits: number;
  image?: string;
  stats?: {
    matches: number;
    runs?: number;
    wickets?: number;
    economy?: number;
    average?: number;
  };
  selected: boolean;
};

// Sample players data (in a real app, this would come from an API)
const samplePlayers: Player[] = [
  { id: "1", name: "Virat Kohli", team: "India", role: "batsman", credits: 10.5, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Virat_Kohli.jpg/440px-Virat_Kohli.jpg", stats: { matches: 254, runs: 12169, average: 57.4 }, selected: false },
  { id: "2", name: "Rohit Sharma", team: "India", role: "batsman", credits: 10, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Rohit_Sharma_during_the_India_vs_Australia_4th_Test_match_at_Narendra_Modi_Stadium.jpg/440px-Rohit_Sharma_during_the_India_vs_Australia_4th_Test_match_at_Narendra_Modi_Stadium.jpg", stats: { matches: 227, runs: 9825, average: 48.6 }, selected: false },
  { id: "3", name: "Jasprit Bumrah", team: "India", role: "bowler", credits: 9.5, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Jasprit_Bumrah_2018.jpg/440px-Jasprit_Bumrah_2018.jpg", stats: { matches: 72, wickets: 141, economy: 4.5 }, selected: false },
  { id: "4", name: "Kane Williamson", team: "New Zealand", role: "batsman", credits: 9, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Kane_Williamson_2018_NZ.jpg/440px-Kane_Williamson_2018_NZ.jpg", stats: { matches: 203, runs: 8603, average: 52.4 }, selected: false },
  { id: "5", name: "Pat Cummins", team: "Australia", role: "bowler", credits: 9, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Pat_Cummins_2018_cropped.jpg/440px-Pat_Cummins_2018_cropped.jpg", stats: { matches: 50, wickets: 217, economy: 3.28 }, selected: false },
  { id: "6", name: "Ben Stokes", team: "England", role: "allrounder", credits: 9.5, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Ben_Stokes_2021.jpg/440px-Ben_Stokes_2021.jpg", stats: { matches: 89, runs: 5529, wickets: 174 }, selected: false },
  { id: "7", name: "Babar Azam", team: "Pakistan", role: "batsman", credits: 9, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Babar_Azam_in_2022.jpg/440px-Babar_Azam_in_2022.jpg", stats: { matches: 105, runs: 5142, average: 56.5 }, selected: false },
  { id: "8", name: "Jos Buttler", team: "England", role: "wicketkeeper", credits: 8.5, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Jos_Buttler_2017.jpg/440px-Jos_Buttler_2017.jpg", stats: { matches: 151, runs: 4732, average: 41.1 }, selected: false },
  { id: "9", name: "Rashid Khan", team: "Afghanistan", role: "bowler", credits: 8.5, image: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Rashid_Khan_Arman.jpg", stats: { matches: 89, wickets: 183, economy: 4.2 }, selected: false },
  { id: "10", name: "Quinton de Kock", team: "South Africa", role: "wicketkeeper", credits: 8, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Quinton_de_Kock.jpg/440px-Quinton_de_Kock.jpg", stats: { matches: 140, runs: 5740, average: 44.8 }, selected: false },
  { id: "11", name: "Mitchell Starc", team: "Australia", role: "bowler", credits: 8.5, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Mitchell_Starc_26_January_2015.jpg/440px-Mitchell_Starc_26_January_2015.jpg", stats: { matches: 110, wickets: 236, economy: 5.1 }, selected: false },
  { id: "12", name: "Hardik Pandya", team: "India", role: "allrounder", credits: 8.5, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Hardik_Pandya_in_2019.jpg/440px-Hardik_Pandya_in_2019.jpg", stats: { matches: 84, runs: 1774, wickets: 74 }, selected: false },
  { id: "13", name: "David Warner", team: "Australia", role: "batsman", credits: 8, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/David_Warner_February_2016.jpg/440px-David_Warner_February_2016.jpg", stats: { matches: 241, runs: 8700, average: 42.4 }, selected: false },
  { id: "14", name: "Trent Boult", team: "New Zealand", role: "bowler", credits: 8, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Trent_Boult.jpg/440px-Trent_Boult.jpg", stats: { matches: 170, wickets: 317, economy: 4.9 }, selected: false },
  { id: "15", name: "Rishabh Pant", team: "India", role: "wicketkeeper", credits: 8, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Rishabh_Pant_the_Indian_Cricket_Player.jpg/440px-Rishabh_Pant_the_Indian_Cricket_Player.jpg", stats: { matches: 54, runs: 2271, average: 43.7 }, selected: false },
];

const CreateTeam = () => {
  const [players, setPlayers] = useState<Player[]>(samplePlayers);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [teamName, setTeamName] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const navigate = useNavigate();

  const selectedCredits = selectedPlayers.reduce((sum, player) => sum + player.credits, 0);
  const remainingCredits = MAX_CREDITS - selectedCredits;

  const roleCountMap = {
    batsman: selectedPlayers.filter(p => p.role === "batsman").length,
    bowler: selectedPlayers.filter(p => p.role === "bowler").length,
    allrounder: selectedPlayers.filter(p => p.role === "allrounder").length,
    wicketkeeper: selectedPlayers.filter(p => p.role === "wicketkeeper").length,
  };

  const handlePlayerToggle = (player: Player) => {
    const isSelected = selectedPlayers.some(p => p.id === player.id);

    if (isSelected) {
      // Remove player
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
      setPlayers(players.map(p => p.id === player.id ? { ...p, selected: false } : p));
    } else {
      // Add player
      if (selectedPlayers.length >= MAX_PLAYERS) {
        toast.error(`You can select maximum ${MAX_PLAYERS} players`);
        return;
      }

      if (player.credits > remainingCredits) {
        toast.error(`Not enough credits left (${remainingCredits.toFixed(1)})`);
        return;
      }

      // Role-based validation
      if (
        (player.role === "wicketkeeper" && roleCountMap.wicketkeeper >= 1) ||
        (player.role === "batsman" && roleCountMap.batsman >= 5) ||
        (player.role === "bowler" && roleCountMap.bowler >= 5) ||
        (player.role === "allrounder" && roleCountMap.allrounder >= 3)
      ) {
        toast.error(`You've reached the maximum limit for ${player.role}s`);
        return;
      }

      setSelectedPlayers([...selectedPlayers, player]);
      setPlayers(players.map(p => p.id === player.id ? { ...p, selected: true } : p));
    }
  };

  const saveTeam = async () => {
    if (selectedPlayers.length < MAX_PLAYERS) {
      toast.error(`Please select ${MAX_PLAYERS} players to create a team`);
      return;
    }

    if (!teamName.trim()) {
      toast.error("Please give your team a name");
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        toast.error("You must be logged in to create a team");
        return;
      }

      const captain = selectedPlayers[0].id; // Default first player as captain
      const viceCaptain = selectedPlayers[1].id; // Default second player as vice captain

      // In a real app, save this to your database
      console.log({
        teamName,
        players: selectedPlayers.map(p => p.id),
        captain,
        viceCaptain,
        userId: user.user.id
      });

      toast.success("Your team has been created successfully!");
      navigate("/contests");
    } catch (error) {
      console.error("Error saving team:", error);
      captureAuthError("Failed to save fantasy team", { teamName, playerCount: selectedPlayers.length });
      toast.error("Failed to save your team. Please try again.");
    }
  };

  const filteredPlayers = players.filter(player => {
    const matchesFilter = activeFilter === "all" || player.role === activeFilter;
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-8 px-4 bg-gradient-to-r from-indigo-50 to-purple-50"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Dream Team</h1>
          <p className="text-gray-600">Select 11 players within 100 credits</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team Selection Panel */}
          <div className="lg:col-span-2">
            <Card className="p-4 shadow-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-2">
                  <button 
                    className={`px-4 py-2 rounded-full text-sm font-medium ${activeFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setActiveFilter('all')}
                  >
                    All
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-full text-sm font-medium ${activeFilter === 'batsman' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setActiveFilter('batsman')}
                  >
                    BAT
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-full text-sm font-medium ${activeFilter === 'bowler' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setActiveFilter('bowler')}
                  >
                    BOWL
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-full text-sm font-medium ${activeFilter === 'allrounder' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setActiveFilter('allrounder')}
                  >
                    AR
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-full text-sm font-medium ${activeFilter === 'wicketkeeper' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setActiveFilter('wicketkeeper')}
                  >
                    WK
                  </button>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Search players..."
                    className="px-4 py-2 border rounded-full text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3 mt-4">
                {filteredPlayers.map(player => (
                  <div 
                    key={player.id}
                    className={`flex items-center p-3 rounded-lg border ${player.selected ? 'border-purple-500 bg-purple-50' : 'border-gray-200'} hover:shadow-md transition-all`}
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                      {player.image ? (
                        <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-800">
                          {player.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-grow">
                      <h3 className="font-semibold">{player.name}</h3>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>{player.team}</span>
                        <span className="mx-2">•</span>
                        <span className="capitalize">{player.role}</span>
                      </div>
                    </div>
                    <div className="text-right flex items-center">
                      <div className="mr-4">
                        <div className="font-semibold text-gray-900">{player.credits} Cr</div>
                        <div className="text-xs text-gray-500">
                          {player.role === "batsman" ? `${player.stats?.average} Avg` : 
                           player.role === "bowler" ? `${player.stats?.wickets} Wkts` : 
                           `${player.stats?.runs} Runs`}
                        </div>
                      </div>
                      <button 
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          player.selected 
                            ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                        onClick={() => handlePlayerToggle(player)}
                      >
                        {player.selected ? '-' : '+'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Team Summary Panel */}
          <div className="lg:col-span-1">
            <Card className="p-4 shadow-md bg-white sticky top-4">
              <div className="mb-4">
                <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  id="teamName"
                  placeholder="Enter your team name"
                  className="w-full px-3 py-2 border rounded-md"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
              </div>

              <div className="flex justify-between p-3 bg-gray-50 rounded-lg mb-4">
                <div>
                  <div className="text-sm text-gray-500">Players Selected</div>
                  <div className="font-bold text-lg">{selectedPlayers.length}/{MAX_PLAYERS}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Credits Left</div>
                  <div className="font-bold text-lg">{remainingCredits.toFixed(1)}/{MAX_CREDITS}</div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Your Selection</h3>
                <div className="grid grid-cols-4 gap-2">
                  <div className={`text-center p-2 rounded-lg ${roleCountMap.wicketkeeper > 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <div className="font-semibold">WK</div>
                    <div className="text-xl font-bold">{roleCountMap.wicketkeeper}</div>
                    <div className="text-xs text-gray-500">1 needed</div>
                  </div>
                  <div className={`text-center p-2 rounded-lg ${roleCountMap.batsman >= 3 ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <div className="font-semibold">BAT</div>
                    <div className="text-xl font-bold">{roleCountMap.batsman}</div>
                    <div className="text-xs text-gray-500">3-5 needed</div>
                  </div>
                  <div className={`text-center p-2 rounded-lg ${roleCountMap.allrounder >= 1 ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <div className="font-semibold">AR</div>
                    <div className="text-xl font-bold">{roleCountMap.allrounder}</div>
                    <div className="text-xs text-gray-500">1-3 needed</div>
                  </div>
                  <div className={`text-center p-2 rounded-lg ${roleCountMap.bowler >= 3 ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <div className="font-semibold">BOWL</div>
                    <div className="text-xl font-bold">{roleCountMap.bowler}</div>
                    <div className="text-xs text-gray-500">3-5 needed</div>
                  </div>
                </div>
              </div>

              {selectedPlayers.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Players</h3>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {selectedPlayers.map(player => (
                      <div key={player.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                            {player.image ? (
                              <img src={player.image} alt={player.name} className="w-full h-full object-cover rounded-full" />
                            ) : (
                              player.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{player.name}</div>
                            <div className="text-xs text-gray-500 capitalize">{player.role}</div>
                          </div>
                        </div>
                        <div className="text-xs font-medium">{player.credits} Cr</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={saveTeam}
              >
                SAVE TEAM
              </Button>

              <div className="mt-4 text-xs text-gray-500 space-y-2">
                <div className="flex items-start">
                  <Info size={14} className="mr-1 mt-0.5 text-purple-500" />
                  <span>You must select 1 Wicket-Keeper, 3-5 Batsmen, 1-3 All-Rounders, and 3-5 Bowlers.</span>
                </div>
                <div className="flex items-start">
                  <AlertCircle size={14} className="mr-1 mt-0.5 text-amber-500" />
                  <span>Total credits should not exceed 100.</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CreateTeam;
