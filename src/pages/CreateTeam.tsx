import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { Player, PlayerRole, SelectedPlayer } from "@/types/player";

const CreateTeam = () => {
  const [availablePlayers, setAvailablePlayers] = useState<SelectedPlayer[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[]>([]);
  const [teamName, setTeamName] = useState("");
  const [matchId, setMatchId] = useState("");
  const [captainId, setCaptainId] = useState<string | null>(null);
  const [viceCaptainId, setViceCaptainId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCredits, setTotalCredits] = useState(0);
  const [budget, setBudget] = useState(100);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlayers();
  }, []);

  useEffect(() => {
    // Calculate total credits whenever selectedPlayers changes
    const newTotalCredits = selectedPlayers.reduce((sum, player) => sum + player.credits, 0);
    setTotalCredits(newTotalCredits);
  }, [selectedPlayers]);

  const fetchPlayers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('players')
        .select('*');
        
      if (error) {
        throw error;
      }
      
      // Transform the data to include selected status and ensure proper typing
      const playersWithSelectedStatus = data.map(player => ({
        ...player,
        selected: false,
        role: player.role as PlayerRole, // Type assertion to match our enum
      }));
      
      setAvailablePlayers(playersWithSelectedStatus as SelectedPlayer[]);
    } catch (error) {
      console.error("Error fetching players:", error);
      toast.error("Failed to load players");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayerSelect = (player: SelectedPlayer) => {
    if (player.selected) {
      // Deselect player
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
      setAvailablePlayers(availablePlayers.map(p =>
        p.id === player.id ? { ...p, selected: false, isCaptain: false, isViceCaptain: false } : p
      ));
      if (captainId === player.id) setCaptainId(null);
      if (viceCaptainId === player.id) setViceCaptainId(null);
    } else {
      // Select player
      if (selectedPlayers.length < 11) {
        setSelectedPlayers([...selectedPlayers, { ...player, selected: true }]);
        setAvailablePlayers(availablePlayers.map(p =>
          p.id === player.id ? { ...p, selected: true } : p
        ));
      } else {
        toast.error("You can select only 11 players");
      }
    }
  };

  const handleCaptainSelect = (player: SelectedPlayer) => {
    if (captainId === player.id) {
      // Deselect captain
      setCaptainId(null);
      setAvailablePlayers(availablePlayers.map(p =>
        p.id === player.id ? { ...p, isCaptain: false } : p
      ));
      setSelectedPlayers(selectedPlayers.map(p =>
        p.id === player.id ? { ...p, isCaptain: false } : p
      ));
    } else {
      // Select captain
      setCaptainId(player.id);
      // Ensure only one captain is selected
      setAvailablePlayers(availablePlayers.map(p => ({
        ...p,
        isCaptain: p.id === player.id,
        isViceCaptain: p.id === viceCaptainId ? false : p.isViceCaptain,
      })));
      setSelectedPlayers(selectedPlayers.map(p => ({
        ...p,
        isCaptain: p.id === player.id,
        isViceCaptain: p.id === viceCaptainId ? false : p.isViceCaptain,
      })));
    }
  };

  const handleViceCaptainSelect = (player: SelectedPlayer) => {
    if (viceCaptainId === player.id) {
      // Deselect vice-captain
      setViceCaptainId(null);
      setAvailablePlayers(availablePlayers.map(p =>
        p.id === player.id ? { ...p, isViceCaptain: false } : p
      ));
      setSelectedPlayers(selectedPlayers.map(p =>
        p.id === player.id ? { ...p, isViceCaptain: false } : p
      ));
    } else {
      // Select vice-captain
      setViceCaptainId(player.id);
      // Ensure only one vice-captain is selected
      setAvailablePlayers(availablePlayers.map(p => ({
        ...p,
        isViceCaptain: p.id === player.id,
        isCaptain: p.id === captainId ? false : p.isCaptain,
      })));
      setSelectedPlayers(selectedPlayers.map(p => ({
        ...p,
        isViceCaptain: p.id === player.id,
        isCaptain: p.id === captainId ? false : p.isCaptain,
      })));
    }
  };

  const handleSubmit = async () => {
    if (selectedPlayers.length !== 11) {
      toast.error("Please select exactly 11 players");
      return;
    }

    if (!teamName) {
      toast.error("Please enter a team name");
      return;
    }

    if (!matchId) {
      toast.error("Please enter a match ID");
      return;
    }

    if (!captainId) {
      toast.error("Please select a captain");
      return;
    }

    if (!viceCaptainId) {
      toast.error("Please select a vice-captain");
      return;
    }

    try {
      setIsLoading(true);
      const { data: user } = await supabase.auth.getUser();

      if (!user.user) {
        navigate("/auth");
        return;
      }

      // Insert team data
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert({
          user_id: user.user.id,
          name: teamName,
          match_id: matchId,
          captain_id: captainId,
          vice_captain_id: viceCaptainId,
        })
        .select('id')
        .single();

      if (teamError) {
        throw teamError;
      }

      // Insert team players
      const teamPlayers = selectedPlayers.map(player => ({
        team_id: teamData.id,
        player_id: player.id,
      }));

      const { error: teamPlayersError } = await supabase
        .from('team_players')
        .insert(teamPlayers);

      if (teamPlayersError) {
        throw teamPlayersError;
      }

      toast.success("Team created successfully!");
      navigate("/my-teams");
    } catch (error) {
      console.error("Error creating team:", error);
      toast.error("Failed to create team");
    } finally {
      setIsLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Team</h1>
          <p className="text-gray-600">Select 11 players and name your team</p>
        </div>

        <Card className="p-6 mb-6 bg-white shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="teamName" className="block text-sm font-medium text-gray-700">
                Team Name
              </Label>
              <Input
                type="text"
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
              />
            </div>
            <div>
              <Label htmlFor="matchId" className="block text-sm font-medium text-gray-700">
                Match ID
              </Label>
              <Input
                type="text"
                id="matchId"
                value={matchId}
                onChange={(e) => setMatchId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6 bg-white shadow-md">
          <h2 className="text-xl font-semibold mb-4">Available Players</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {isLoading ? (
              <p className="text-center text-gray-500">Loading players...</p>
            ) : (
              availablePlayers.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onSelect={handlePlayerSelect}
                  onCaptainSelect={handleCaptainSelect}
                  onViceCaptainSelect={handleViceCaptainSelect}
                  isCaptain={player.isCaptain || false}
                  isViceCaptain={player.isViceCaptain || false}
                  isSelected={player.selected}
                  disabled={selectedPlayers.length >= 11 && !player.selected}
                />
              ))
            )}
          </div>
        </Card>

        <Card className="p-6 mb-6 bg-white shadow-md">
          <h2 className="text-xl font-semibold mb-4">Selected Players ({selectedPlayers.length}/11)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {selectedPlayers.length > 0 ? (
              selectedPlayers.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onSelect={handlePlayerSelect}
                  onCaptainSelect={handleCaptainSelect}
                  onViceCaptainSelect={handleViceCaptainSelect}
                  isCaptain={player.isCaptain || false}
                  isViceCaptain={player.isViceCaptain || false}
                  isSelected={player.selected}
                />
              ))
            ) : (
              <p className="text-center text-gray-500">No players selected yet</p>
            )}
          </div>
          <div className="mt-4 flex justify-between items-center">
            <div className="text-gray-700 font-semibold">
              Total Credits: {totalCredits} / {budget}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? "Creating..." : "Create Team"}
            </Button>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

interface PlayerCardProps {
  player: SelectedPlayer;
  onSelect: (player: SelectedPlayer) => void;
  onCaptainSelect: (player: SelectedPlayer) => void;
  onViceCaptainSelect: (player: SelectedPlayer) => void;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  isSelected: boolean;
  disabled?: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, onSelect, onCaptainSelect, onViceCaptainSelect, isCaptain, isViceCaptain, isSelected, disabled }) => {
  return (
    <Card className={`bg-white shadow-md hover:shadow-lg transition-shadow ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-md">{player.name}</h3>
          <span className="text-sm text-gray-500">Credits: {player.credits}</span>
        </div>
        <div className="text-sm text-gray-600 mb-2">
          Team: {player.team}
        </div>
        <div className="text-sm text-gray-600 mb-2">
          Role: {player.role}
        </div>
        <div className="flex justify-between items-center">
          <Button
            variant={isSelected ? "destructive" : "outline"}
            onClick={() => onSelect(player)}
            disabled={disabled}
            className="text-xs"
          >
            {isSelected ? "Deselect" : "Select"}
          </Button>
          <div>
            <Button
              variant={isCaptain ? "default" : "outline"}
              onClick={() => onCaptainSelect(player)}
              disabled={disabled || !isSelected}
              className="text-xs mr-1"
            >
              {isCaptain ? "Captain" : "Set Captain"}
            </Button>
            <Button
              variant={isViceCaptain ? "default" : "outline"}
              onClick={() => onViceCaptainSelect(player)}
              disabled={disabled || !isSelected}
              className="text-xs"
            >
              {isViceCaptain ? "Vice-Captain" : "Set VC"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CreateTeam;
