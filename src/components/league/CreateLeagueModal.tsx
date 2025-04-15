
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, ChevronRight, ChevronsLeft, Loader2, Search, Share2, Trophy, Users, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SelectedPlayer, PlayerRole } from "@/types/player";
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

const mockPlayers: SelectedPlayer[] = [
  { id: "1", name: "Virat Kohli", team: "IND", role: "batsman" as PlayerRole, credits: 10, image_url: null, stats: null, created_at: "", updated_at: "", selected: false },
  { id: "2", name: "Rohit Sharma", team: "IND", role: "batsman" as PlayerRole, credits: 9.5, image_url: null, stats: null, created_at: "", updated_at: "", selected: false },
  { id: "3", name: "Jasprit Bumrah", team: "IND", role: "bowler" as PlayerRole, credits: 9, image_url: null, stats: null, created_at: "", updated_at: "", selected: false },
  { id: "4", name: "Hardik Pandya", team: "IND", role: "allrounder" as PlayerRole, credits: 8.5, image_url: null, stats: null, created_at: "", updated_at: "", selected: false },
  { id: "5", name: "Ravindra Jadeja", team: "IND", role: "allrounder" as PlayerRole, credits: 8.5, image_url: null, stats: null, created_at: "", updated_at: "", selected: false },
  { id: "6", name: "KL Rahul", team: "IND", role: "batsman" as PlayerRole, credits: 8, image_url: null, stats: null, created_at: "", updated_at: "", selected: false },
  { id: "7", name: "Rishabh Pant", team: "IND", role: "wicketkeeper" as PlayerRole, credits: 8.5, image_url: null, stats: null, created_at: "", updated_at: "", selected: false },
  { id: "8", name: "Babar Azam", team: "PAK", role: "batsman" as PlayerRole, credits: 10, image_url: null, stats: null, created_at: "", updated_at: "", selected: false },
  { id: "9", name: "Shaheen Afridi", team: "PAK", role: "bowler" as PlayerRole, credits: 9, image_url: null, stats: null, created_at: "", updated_at: "", selected: false },
  { id: "10", name: "Mohammad Rizwan", team: "PAK", role: "wicketkeeper" as PlayerRole, credits: 9, image_url: null, stats: null, created_at: "", updated_at: "", selected: false },
  { id: "11", name: "Shadab Khan", team: "PAK", role: "allrounder" as PlayerRole, credits: 8.5, image_url: null, stats: null, created_at: "", updated_at: "", selected: false },
  { id: "12", name: "Naseem Shah", team: "PAK", role: "bowler" as PlayerRole, credits: 8, image_url: null, stats: null, created_at: "", updated_at: "", selected: false },
  { id: "13", name: "Fakhar Zaman", team: "PAK", role: "batsman" as PlayerRole, credits: 8, image_url: null, stats: null, created_at: "", updated_at: "", selected: false },
  { id: "14", name: "Haris Rauf", team: "PAK", role: "bowler" as PlayerRole, credits: 8, image_url: null, stats: null, created_at: "", updated_at: "", selected: false },
];

const CreateLeagueModal = ({ open, onOpenChange }: CreateLeagueModalProps) => {
  const [step, setStep] = useState(1);
  const [leagueName, setLeagueName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [players, setPlayers] = useState<SelectedPlayer[]>(mockPlayers);
  const [filteredPlayers, setFilteredPlayers] = useState<SelectedPlayer[]>(mockPlayers);
  const [searchQuery, setSearchQuery] = useState("");
  const [captainId, setCaptainId] = useState("");
  const [viceCaptainId, setViceCaptainId] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transitionClass, setTransitionClass] = useState("");
  const [showContinueButton, setShowContinueButton] = useState(false);

  // Refs for scrolling and steppers
  const contentRef = useRef<HTMLDivElement>(null);
  const nextStepTimeout = useRef<NodeJS.Timeout | null>(null);

  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ["cricket-matches"],
    queryFn: async () => {
      // In a real app, fetch from your API
      const currentDate = new Date();
      return [
        { 
          match_id: "m1", 
          team1_name: "India", 
          team2_name: "Pakistan", 
          time: "Tomorrow, 2:30 PM" 
        },
        { 
          match_id: "m2", 
          team1_name: "Australia", 
          team2_name: "England", 
          time: `${currentDate.getDate()+1} Apr, 10:00 AM` 
        },
        { 
          match_id: "m3", 
          team1_name: "South Africa", 
          team2_name: "New Zealand", 
          time: `${currentDate.getDate()+3} Apr, 3:00 PM` 
        },
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

  // Check if player selection is complete
  const isSelectionComplete = selectedPlayersCount === 11 && captainId && viceCaptainId && !hasTeamLimitExceeded;

  // Animation for step transition
  const applyStepTransition = (newStep: number) => {
    // Add exiting animation
    setTransitionClass("animate-fadeOut");
    
    // After short delay, change step and add entering animation
    setTimeout(() => {
      setStep(newStep);
      setTransitionClass("animate-fadeIn");
      
      // Clear transition class after animation completes
      setTimeout(() => {
        setTransitionClass("");
      }, 500);
      
      // Scroll to top of content when changing steps
      if (contentRef.current) {
        contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 300);
  };

  useEffect(() => {
    if (open) {
      // Reset form when modal opens
      setStep(1);
      setLeagueName("");
      setIsPublic(false);
      setSelectedMatchId("");
      setPlayers(mockPlayers);
      setFilteredPlayers(mockPlayers);
      setSearchQuery("");
      setCaptainId("");
      setViceCaptainId("");
      setTransitionClass("");
      setShowContinueButton(false);
      
      // Clear any pending timeouts
      if (nextStepTimeout.current) {
        clearTimeout(nextStepTimeout.current);
      }
    }
  }, [open]);

  // Track selection completion and show continue button immediately
  useEffect(() => {
    if (step === 2) {
      if (isSelectionComplete) {
        // Show continue button when selection is complete
        setShowContinueButton(true);
        
        // Show success toast
        toast.success("Team selection complete! Click Continue to proceed.");
      } else {
        setShowContinueButton(false);
      }
    }
  }, [isSelectionComplete, step]);

  // Filter players based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPlayers(players);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = players.filter(
        player => 
          player.name.toLowerCase().includes(query) || 
          player.team.toLowerCase().includes(query) ||
          player.role.toLowerCase().includes(query)
      );
      setFilteredPlayers(filtered);
    }
  }, [searchQuery, players]);

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
      isCaptain: player.id === playerId,
      isViceCaptain: player.id === viceCaptainId
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
      isCaptain: player.id === captainId,
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
      applyStepTransition(2);
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
      applyStepTransition(3);
    } else if (step === 3) {
      applyStepTransition(4);
      generateInviteCode();
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      applyStepTransition(step - 1);
    }
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
      
      // Show success and transition to final step
      applyStepTransition(4);
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

  // Add CSS classes for step transitions
  useEffect(() => {
    if (!open) return;
    
    // Add step transition classes to index.css
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-20px); }
      }
      
      .animate-fadeIn {
        animation: fadeIn 0.4s ease-out forwards;
      }
      
      .animate-fadeOut {
        animation: fadeOut 0.3s ease-in forwards;
      }
      
      /* Highlight pulse for continue button */
      @keyframes pulse-highlight {
        0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); }
        100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
      }
      
      .pulse-highlight {
        animation: pulse-highlight 1.5s infinite;
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, [open]);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className={`space-y-6 ${transitionClass}`}>
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-primary/10 p-2.5 rounded-full">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <Label htmlFor="league-name" className="text-lg font-semibold">League Name</Label>
              </div>
              <Input
                id="league-name"
                placeholder="Enter a name for your league"
                value={leagueName}
                onChange={(e) => setLeagueName(e.target.value)}
                className="h-12 text-base bg-white border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            
            <div className="space-y-3 bg-gray-50 p-5 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-5 w-5 text-blue-600" />
                <Label htmlFor="public-league" className="text-lg font-semibold">League Visibility</Label>
              </div>
              <div className="flex items-center space-x-2 bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                <Switch
                  id="public-league"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <div>
                  <Label htmlFor="public-league" className="font-medium">{isPublic ? "Public League" : "Private League"}</Label>
                  <p className="text-sm text-gray-500 mt-1">
                    {isPublic ? 
                      "Anyone can find and join this league" : 
                      "Only people with the invite link can join this league"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-blue-100 p-2.5 rounded-full">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <Label htmlFor="match-select" className="text-lg font-semibold">Select Match</Label>
              </div>
              <Select
                onValueChange={(value) => setSelectedMatchId(value)}
                value={selectedMatchId}>
                <SelectTrigger className="h-12 bg-white border-gray-200">
                  <SelectValue placeholder="Select a match for your league" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] bg-white">
                  {matchesLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <span>Loading matches...</span>
                    </div>
                  ) : (
                    matches?.map((match) => (
                      <SelectItem 
                        key={match.match_id} 
                        value={match.match_id}
                        className="py-3"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{match.team1_name} vs {match.team2_name}</span>
                          <span className="text-xs text-gray-500">{match.time}</span>
                        </div>
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
          <div className={`space-y-4 ${transitionClass}`}>
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-medium">Select Your Dream Team</h3>
              <Badge variant="outline" className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-bold border-white">
                {selectedPlayersCount}/11
              </Badge>
            </div>
            
            <div className="relative">
              <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm mb-4">
                <div className="px-3 text-gray-400">
                  <Search className="h-5 w-5" />
                </div>
                <Input
                  placeholder="Search players by name, team or role"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="px-3 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            
            <ScrollArea className="h-[42vh] pr-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-1">
                {filteredPlayers.map((player) => (
                  <Card 
                    key={player.id} 
                    className={`border overflow-hidden transition-all hover:shadow-md ${
                      player.selected 
                        ? 'border-primary bg-primary/5 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{player.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs border-gray-200 bg-gray-50">
                              {player.team}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize border-gray-200 bg-gray-50">
                              {player.role}
                            </Badge>
                            <span className="text-xs text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded">
                              {player.credits} Cr
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {player.selected && (
                            <div className="flex gap-1.5">
                              <Button 
                                size="sm" 
                                variant={player.isCaptain ? "default" : "outline"}
                                onClick={() => handleSetCaptain(player.id)}
                                className={`text-xs h-8 w-8 p-0 font-bold rounded-full ${player.isCaptain ? 'bg-green-600 hover:bg-green-700 border-green-600' : 'border-gray-300'}`}
                              >
                                C
                              </Button>
                              <Button 
                                size="sm" 
                                variant={player.isViceCaptain ? "default" : "outline"}
                                onClick={() => handleSetViceCaptain(player.id)}
                                className={`text-xs h-8 w-8 p-0 font-bold rounded-full ${player.isViceCaptain ? 'bg-blue-600 hover:bg-blue-700 border-blue-600' : 'border-gray-300'}`}
                              >
                                VC
                              </Button>
                            </div>
                          )}
                          <Button 
                            size="sm" 
                            variant={player.selected ? "destructive" : "default"}
                            onClick={() => handlePlayerSelection(player.id)}
                            className={`h-9 ${player.selected ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'}`}
                          >
                            {player.selected ? "Remove" : "Select"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredPlayers.length === 0 && (
                  <div className="col-span-2 flex flex-col items-center justify-center py-10 text-gray-500">
                    <Search className="h-12 w-12 mb-2 opacity-20" />
                    <p>No players found matching "{searchQuery}"</p>
                    <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2">
                      Clear search
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100 shadow-sm mt-4">
              <div className="text-sm font-medium text-blue-800 mb-2">Team Selection Rules:</div>
              <ul className="grid grid-cols-2 gap-3">
                <li className={`flex items-center text-sm ${selectedPlayersCount === 11 ? "text-green-600" : "text-gray-600"}`}>
                  {selectedPlayersCount === 11 ? 
                    <Check className="h-4 w-4 mr-1" /> : 
                    <div className="h-4 w-4 rounded-full border border-gray-300 mr-1"></div>
                  }
                  11 players total
                </li>
                <li className={`flex items-center text-sm ${!hasTeamLimitExceeded ? "text-green-600" : "text-gray-600"}`}>
                  {!hasTeamLimitExceeded ? 
                    <Check className="h-4 w-4 mr-1" /> : 
                    <div className="h-4 w-4 rounded-full border border-gray-300 mr-1"></div>
                  }
                  Max 7 per team
                </li>
                <li className={`flex items-center text-sm ${captainId ? "text-green-600" : "text-gray-600"}`}>
                  {captainId ? 
                    <Check className="h-4 w-4 mr-1" /> : 
                    <div className="h-4 w-4 rounded-full border border-gray-300 mr-1"></div>
                  }
                  1 Captain (2x points)
                </li>
                <li className={`flex items-center text-sm ${viceCaptainId ? "text-green-600" : "text-gray-600"}`}>
                  {viceCaptainId ? 
                    <Check className="h-4 w-4 mr-1" /> : 
                    <div className="h-4 w-4 rounded-full border border-gray-300 mr-1"></div>
                  }
                  1 Vice-Captain (1.5x)
                </li>
              </ul>
            </div>
            
            {/* Always show continue button - but enable it only when selection is complete */}
            <div className="mt-4 flex justify-center">
              <Button
                onClick={handleNextStep}
                disabled={!isSelectionComplete}
                className={`w-full py-6 text-lg font-medium ${
                  showContinueButton ? 'pulse-highlight bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' : 
                  'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Continue to Review
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        );
        
      case 3:
        const selectedMatch = matches?.find(m => m.match_id === selectedMatchId);
        return (
          <div className={`space-y-5 ${transitionClass}`}>
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-5 rounded-lg text-center shadow-lg">
              <h3 className="text-xl font-bold mb-1">Almost There!</h3>
              <p className="text-purple-100">Review your league details before creating</p>
            </div>
            
            <ScrollArea className="h-[50vh] pr-4">
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                    <h4 className="font-semibold text-lg">League Details</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-500">League Name</p>
                      <p className="font-medium">{leagueName}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-500">Type</p>
                      <div className="flex items-center">
                        <Badge variant={isPublic ? "default" : "secondary"} className="mt-1">
                          {isPublic ? "Public" : "Private"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <Users className="h-5 w-5 text-blue-500 mr-2" />
                    <h4 className="font-semibold text-lg">Match</h4>
                  </div>
                  
                  {selectedMatch && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-md border border-blue-100">
                      <div className="font-bold text-gray-800 flex justify-between items-center">
                        <span>{selectedMatch.team1_name}</span>
                        <span className="text-sm bg-white px-2 py-1 rounded text-gray-500">VS</span>
                        <span>{selectedMatch.team2_name}</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-2 text-center">{selectedMatch.time}</div>
                    </div>
                  )}
                </div>
                
                <div className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <Users className="h-5 w-5 text-green-500 mr-2" />
                    <h4 className="font-semibold text-lg">Your Team</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                    {selectedPlayers.map(player => (
                      <div 
                        key={player.id}
                        className="flex items-center justify-between bg-gray-50 p-2.5 rounded-md border hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{player.name}</span>
                          <Badge variant="outline" className="text-xs border-gray-200 bg-white">
                            {player.team}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          {player.isCaptain && (
                            <Badge className="bg-green-600">C</Badge>
                          )}
                          {player.isViceCaptain && (
                            <Badge className="bg-blue-600">VC</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        );
        
      case 4:
        return (
          <div className={`space-y-8 text-center ${transitionClass}`}>
            <div className="mx-auto bg-gradient-to-r from-green-400 to-emerald-500 w-20 h-20 rounded-full flex items-center justify-center shadow-lg">
              <Check className="h-10 w-10 text-white" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">League Created!</h3>
              <p className="text-gray-600">Share this invite code with friends to join your league</p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg flex flex-col items-center border border-purple-100 shadow-md">
              <span className="font-mono font-bold text-xl bg-white px-4 py-2 rounded-md border border-gray-200 mb-4 tracking-wide shadow-sm">
                {inviteCode}
              </span>
              <Button
                variant="outline"
                onClick={copyInviteLink}
                className="w-full bg-white border-purple-200 hover:bg-purple-50 transition-colors"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Copy Invite Link
              </Button>
            </div>
            
            <div className="pt-4">
              <Button
                onClick={() => onOpenChange(false)}
                className="w-full text-lg py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-md"
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
      <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden border bg-white rounded-xl shadow-xl">
        <div className="absolute inset-0 bg-black/50 -z-10" onClick={() => onOpenChange(false)} />
        
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-5">
          <DialogTitle className="text-xl font-bold text-center">
            {step < 4 ? `Create Your Fantasy League ${step}/3` : "Invite Friends"}
          </DialogTitle>
        </div>
        
        {/* Step progress indicators */}
        {step < 4 && (
          <div className="flex justify-between px-4 py-3 bg-gradient-to-r from-indigo-50 to-blue-50 border-b sticky top-0 z-10">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex-1 flex flex-col items-center p-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 transition-colors
                  ${stepNumber < step ? 'bg-green-600 text-white shadow-md' : 
                    stepNumber === step ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-500'}
                `}>
                  {stepNumber < step ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    stepNumber
                  )}
                </div>
                <span className={`text-xs font-medium ${stepNumber === step ? 'text-blue-700' : 'text-gray-600'}`}>
                  {stepNumber === 1 ? "League Setup" : 
                   stepNumber === 2 ? "Select Team" : "Review"}
                </span>
              </div>
            ))}
          </div>
        )}
        
        <div className="p-6 bg-gradient-to-br from-white to-gray-50" ref={contentRef}>
          {renderStep()}
        </div>
        
        {/* Navigation buttons - Fixed at bottom to always stay visible */}
        {step < 4 && (
          <div className="flex justify-between p-4 border-t bg-gray-50 sticky bottom-0">
            <Button
              variant="outline"
              onClick={step > 1 ? handlePrevStep : () => onOpenChange(false)}
              className="w-28 border-gray-300 bg-white hover:bg-gray-100 transition-colors"
            >
              {step > 1 ? (
                <>
                  <ChevronsLeft className="h-4 w-4 mr-1.5" />
                  Back
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-1.5" />
                  Cancel
                </>
              )}
            </Button>
            
            {step === 2 && !isSelectionComplete ? (
              <div className="text-sm text-gray-500 font-medium">
                Select 11 players, 1 Captain & 1 Vice-Captain
              </div>
            ) : (
              <Button
                onClick={step === 3 ? handleSubmit : handleNextStep}
                className={`min-w-28 shadow-sm transition-all ${step === 3 ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                disabled={isSubmitting || (step === 2 && !isSelectionComplete)}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    {step === 3 ? "Create" : "Continue"} 
                    {step < 3 && <ChevronRight className="h-4 w-4 ml-1.5" />}
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateLeagueModal;
