
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, ChevronRight, ChevronsLeft, Loader2, Share2, Trophy, Users, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { SelectedPlayer } from "@/types/player";
import { FantasyTeam } from "@/types/team";

type CreateLeagueModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Match = {
  match_id: string;
  team1_name: string;
  team2_name: string;
  time: string;
};

const mockPlayers = [
  { id: "1", name: "Virat Kohli", team: "IND", role: "batsman", credits: 10, image_url: null, stats: null, created_at: "", updated_at: "", selected: false },
  { id: "2", name: "Rohit Sharma", team: "IND", role: "batsman", credits: 9.5, image_url: null, stats: null, created_at: "", updated_at: "", selected: false },
  { id: "3", name: "Jasprit Bumrah", team: "IND", role: "bowler", credits: 9, image_url: null, stats: null, created_at: "", updated_at: "", selected: false },
  { id: "4", name: "Hardik Pandya", team: "IND", role: "allrounder", credits: 8.5, image_url: null, stats: null, created_at: "", updated_at: "", selected: false },
  { id: "5", name: "Ravindra Jadeja", team: "IND", role: "allrounder", credits: 8.5, image_url: null, stats: null, created_at: "", updated_at: "", selected: false },
  { id: "6", name: "KL Rahul", team: "IND", role: "batsman", credits: 8, image_url: null, stats: null, created_at: "", updated_at: "", selected: false },
  { id: "7", name: "Rishabh Pant", team: "IND", role: "wicketkeeper", credits: 8.5, image_url: null, stats: null, created_at: "", updated_at: "", selected: false },
  { id: "8", name: "Babar Azam", team: "PAK", role: "batsman", credits: 10, image_url: null, stats: null, created_at: "", updated_at: "", selected: false },
  { id: "9", name: "Shaheen Afridi", team: "PAK", role: "bowler", credits: 9, image_url: null, stats: null, created_at: "", updated_at: "", selected: false },
  { id: "10", name: "Mohammad Rizwan", team: "PAK", role: "wicketkeeper", credits: 9, image_url: null, stats: null, created_at: "", updated_at: "", selected: false },
  { id: "11", name: "Shadab Khan", team: "PAK", role: "allrounder", credits: 8.5, image_url: null, stats: null, created_at: "", updated_at: "", selected: false },
  { id: "12", name: "Naseem Shah", team: "PAK", role: "bowler", credits: 8, image_url: null, stats: null, created_at: "", updated_at: "", selected: false },
  { id: "13", name: "Fakhar Zaman", team: "PAK", role: "batsman", credits: 8, image_url: null, stats: null, created_at: "", updated_at: "", selected: false },
  { id: "14", name: "Haris Rauf", team: "PAK", role: "bowler", credits: 8, image_url: null, stats: null, created_at: "", updated_at: "", selected: false },
];

const CreateLeagueModal = ({ open, onOpenChange }: CreateLeagueModalProps) => {
  const [step, setStep] = useState(1);
  const [leagueName, setLeagueName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [players, setPlayers] = useState<SelectedPlayer[]>(mockPlayers);
  const [captainId, setCaptainId] = useState("");
  const [viceCaptainId, setViceCaptainId] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ["cricket-matches"],
    queryFn: async () => {
      // In a real app, fetch from your API
      return [
        { match_id: "m1", team1_name: "India", team2_name: "Pakistan", time: "Tomorrow, 2:30 PM" },
        { match_id: "m2", team1_name: "Australia", team2_name: "England", time: "Apr 10, 10:00 AM" },
        { match_id: "m3", team1_name: "South Africa", team2_name: "New Zealand", time: "Apr 12, 3:00 PM" },
      ] as Match[];
    },
  });

  const selectedPlayers = players.filter(p => p.selected);
  const selectedPlayersCount = selectedPlayers.length;
  const maxPlayersPerTeam = 7;
  
  const teamCounts = selectedPlayers.reduce((acc, player) => {
    acc[player.team] = (acc[player.team] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const hasTeamLimitExceeded = Object.values(teamCounts).some(count => count > maxPlayersPerTeam);

  useEffect(() => {
    if (open) {
      // Reset form when modal opens
      setStep(1);
      setLeagueName("");
      setIsPublic(false);
      setSelectedMatchId("");
      setPlayers(mockPlayers);
      setCaptainId("");
      setViceCaptainId("");
    }
  }, [open]);

  const generateInviteCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setInviteCode(code);
    return code;
  };

  const handlePlayerSelection = (playerId: string) => {
    const updatedPlayers = players.map(player => {
      if (player.id === playerId) {
        // If already selected, toggle off
        if (player.selected) {
          // If this player was captain or vice-captain, clear those roles
          if (player.id === captainId) setCaptainId("");
          if (player.id === viceCaptainId) setViceCaptainId("");
          return { ...player, selected: false, isCaptain: false, isViceCaptain: false };
        }

        // If trying to select but already have 11 players, show error
        if (selectedPlayersCount >= 11 && !player.selected) {
          toast.error("You can only select 11 players");
          return player;
        }

        // Check team limit before selecting
        const playerTeam = player.team;
        if ((teamCounts[playerTeam] || 0) >= maxPlayersPerTeam) {
          toast.error(`You can only select ${maxPlayersPerTeam} players from one team`);
          return player;
        }

        return { ...player, selected: true };
      }
      return player;
    });
    
    setPlayers(updatedPlayers);
  };

  const handleSetCaptain = (playerId: string) => {
    // Make sure player is selected first
    if (!players.find(p => p.id === playerId)?.selected) {
      toast.error("Player must be selected to be captain");
      return;
    }

    // If this player is vice-captain, remove that role
    if (playerId === viceCaptainId) {
      setViceCaptainId("");
    }

    setCaptainId(playerId);
    
    // Update the players state to reflect captain status
    const updatedPlayers = players.map(player => ({
      ...player,
      isCaptain: player.id === playerId
    }));
    
    setPlayers(updatedPlayers);
  };

  const handleSetViceCaptain = (playerId: string) => {
    // Make sure player is selected first
    if (!players.find(p => p.id === playerId)?.selected) {
      toast.error("Player must be selected to be vice-captain");
      return;
    }

    // If this player is captain, remove that role
    if (playerId === captainId) {
      setCaptainId("");
    }

    setViceCaptainId(playerId);
    
    // Update the players state to reflect vice-captain status
    const updatedPlayers = players.map(player => ({
      ...player,
      isViceCaptain: player.id === playerId
    }));
    
    setPlayers(updatedPlayers);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!leagueName.trim()) {
        toast.error("Please enter a league name");
        return;
      }
      if (!selectedMatchId) {
        toast.error("Please select a match");
        return;
      }
    } else if (step === 2) {
      if (selectedPlayersCount !== 11) {
        toast.error("Please select exactly 11 players");
        return;
      }
      if (hasTeamLimitExceeded) {
        toast.error(`You can only select ${maxPlayersPerTeam} players from one team`);
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
    }

    setStep(prev => prev + 1);
    
    // Generate invite code when reaching the invite step
    if (step === 3) {
      generateInviteCode();
    }
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Prepare team data
      const team: Partial<FantasyTeam> = {
        name: `${leagueName} Team`,
        match_id: selectedMatchId,
        captain_id: captainId,
        vice_captain_id: viceCaptainId,
        players: selectedPlayers
      };
      
      // In a real app, you would save to database here
      console.log("Creating League:", { 
        name: leagueName, 
        isPublic, 
        matchId: selectedMatchId,
        team,
        inviteCode
      });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("League created successfully!");
      
      // Save to localStorage for demo purposes
      const existingLeagues = JSON.parse(localStorage.getItem('fantasy_leagues') || '[]');
      const newLeague = {
        id: Math.random().toString(36).substring(2, 9),
        name: leagueName,
        isPublic,
        matchId: selectedMatchId,
        team,
        inviteCode,
        createdAt: new Date().toISOString()
      };
      
      existingLeagues.push(newLeague);
      localStorage.setItem('fantasy_leagues', JSON.stringify(existingLeagues));
      
      // Close modal and reset
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create league");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/join-league/${inviteCode}`;
    navigator.clipboard.writeText(link)
      .then(() => toast.success("Invite link copied to clipboard"))
      .catch(() => toast.error("Failed to copy invite link"));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="league-name">League Name</Label>
              <Input
                id="league-name"
                placeholder="Enter a name for your league"
                value={leagueName}
                onChange={(e) => setLeagueName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="public-league"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <Label htmlFor="public-league">Public League</Label>
              </div>
              <p className="text-sm text-gray-500">
                {isPublic ? 
                  "Anyone can find and join this league" : 
                  "Only people with the invite link can join this league"}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="match-select">Select Match</Label>
              <Select
                onValueChange={(value) => setSelectedMatchId(value)}
                value={selectedMatchId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a match" />
                </SelectTrigger>
                <SelectContent>
                  {matchesLoading ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Loading matches...</span>
                    </div>
                  ) : (
                    matches?.map((match) => (
                      <SelectItem key={match.match_id} value={match.match_id}>
                        {match.team1_name} vs {match.team2_name} ({match.time})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Select 11 Players</h3>
              <div className="text-sm">
                <span className={selectedPlayersCount === 11 ? "text-green-500 font-bold" : "text-gray-500"}>
                  {selectedPlayersCount}/11
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
              {players.map((player) => (
                <Card 
                  key={player.id} 
                  className={`border overflow-hidden ${
                    player.selected ? 'border-primary bg-primary/5' : 'border-gray-200'
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{player.name}</div>
                        <div className="text-sm text-gray-500">
                          {player.team} • {player.role}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {player.selected && (
                          <>
                            <Button 
                              size="sm" 
                              variant={player.isCaptain ? "default" : "outline"}
                              onClick={() => handleSetCaptain(player.id)}
                              className="text-xs px-2 h-8"
                            >
                              C
                            </Button>
                            <Button 
                              size="sm" 
                              variant={player.isViceCaptain ? "default" : "outline"}
                              onClick={() => handleSetViceCaptain(player.id)}
                              className="text-xs px-2 h-8"
                            >
                              VC
                            </Button>
                          </>
                        )}
                        <Button 
                          size="sm" 
                          variant={player.selected ? "destructive" : "default"}
                          onClick={() => handlePlayerSelection(player.id)}
                          className="w-20 h-8"
                        >
                          {player.selected ? "Remove" : "Select"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium">Selection Rules:</div>
              <ul className="text-xs text-gray-600 space-y-1 mt-1">
                <li className="flex items-center">
                  <span className={selectedPlayersCount === 11 ? "text-green-500" : "text-gray-700"}>
                    <Check className="h-3 w-3 inline mr-1" />
                    Select exactly 11 players
                  </span>
                </li>
                <li className="flex items-center">
                  <span className={!hasTeamLimitExceeded ? "text-green-500" : "text-gray-700"}>
                    <Check className="h-3 w-3 inline mr-1" />
                    Maximum 7 players from one team
                  </span>
                </li>
                <li className="flex items-center">
                  <span className={captainId ? "text-green-500" : "text-gray-700"}>
                    <Check className="h-3 w-3 inline mr-1" />
                    Select 1 Captain (2x points)
                  </span>
                </li>
                <li className="flex items-center">
                  <span className={viceCaptainId ? "text-green-500" : "text-gray-700"}>
                    <Check className="h-3 w-3 inline mr-1" />
                    Select 1 Vice-Captain (1.5x points)
                  </span>
                </li>
              </ul>
            </div>
          </div>
        );
        
      case 3:
        const selectedMatch = matches?.find(m => m.match_id === selectedMatchId);
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Review Your League</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <span className="text-sm text-gray-500">League Name:</span>
                <div className="font-medium">{leagueName}</div>
              </div>
              
              <div>
                <span className="text-sm text-gray-500">League Type:</span>
                <div className="font-medium">{isPublic ? "Public" : "Private"}</div>
              </div>
              
              <div>
                <span className="text-sm text-gray-500">Match:</span>
                <div className="font-medium">
                  {selectedMatch ? `${selectedMatch.team1_name} vs ${selectedMatch.team2_name}` : ""}
                </div>
                <div className="text-sm text-gray-500">{selectedMatch?.time}</div>
              </div>
              
              <div>
                <span className="text-sm text-gray-500">Team:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {selectedPlayers.map(player => (
                    <div 
                      key={player.id}
                      className="text-sm flex items-center justify-between bg-white p-2 rounded border"
                    >
                      <span>{player.name}</span>
                      {player.isCaptain && (
                        <Badge variant="default" className="ml-1">C</Badge>
                      )}
                      {player.isViceCaptain && (
                        <Badge variant="secondary" className="ml-1">VC</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6 text-center">
            <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-xl font-bold">League Created!</h3>
              <p className="text-gray-500 mt-1">Share this invite code with friends</p>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-between">
              <span className="font-mono font-medium text-lg">{inviteCode}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={copyInviteLink}
              >
                <Share2 className="h-4 w-4 mr-1" />
                Copy Link
              </Button>
            </div>
            
            <div className="pt-4">
              <Button
                onClick={() => onOpenChange(false)}
                className="w-full"
              >
                Done
              </Button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {step < 4 ? `Create Fantasy League ${step}/3` : "Invite Friends"}
          </DialogTitle>
        </DialogHeader>
        
        {/* Step progress indicators */}
        {step < 4 && (
          <div className="flex justify-between mb-4">
            {[1, 2, 3].map((stepNumber) => (
              <div 
                key={stepNumber}
                className={`flex-1 h-2 rounded-full mx-1 ${
                  stepNumber === step ? 'bg-primary' : 
                  stepNumber < step ? 'bg-primary/70' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        )}
        
        {renderStep()}
        
        {/* Navigation buttons */}
        {step < 4 && (
          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              onClick={step > 1 ? handlePrevStep : () => onOpenChange(false)}
              className="w-28"
            >
              {step > 1 ? (
                <>
                  <ChevronsLeft className="h-4 w-4 mr-1" />
                  Back
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </>
              )}
            </Button>
            
            <Button
              onClick={step === 3 ? handleSubmit : handleNextStep}
              className="w-28"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  {step === 3 ? "Create League" : "Next"} 
                  {step < 3 && <ChevronRight className="h-4 w-4 ml-1" />}
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateLeagueModal;
