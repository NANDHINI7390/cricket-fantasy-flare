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
  const [creditsUsed, setCreditsUsed] = useState(0);

  const contentRef = useRef<HTMLDivElement>(null);

  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ["cricket-matches"],
    queryFn: async () => {
      const currentDate = new Date();
      return [
        { match_id: "m1", team1_name: "India", team2_name: "Pakistan", time: "Tomorrow, 2:30 PM" },
        { match_id: "m2", team1_name: "Australia", team2_name: "England", time: `${currentDate.getDate() + 1} Apr, 10:00 AM` },
        { match_id: "m3", team1_name: "South Africa", team2_name: "New Zealand", time: `${currentDate.getDate() + 3} Apr, 3:00 PM` },
      ] as Match[];
    },
  });

  const selectedPlayers = players.filter((p) => p.selected);
  const selectedPlayersCount = selectedPlayers.length;
  const maxPlayersPerTeam = 7;
  const maxCredits = 100;

  const teamCounts = selectedPlayers.reduce(
    (acc, player) => {
      acc[player.team] = (acc[player.team] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const hasTeamLimitExceeded = Object.values(teamCounts).some((count) => count > maxPlayersPerTeam);
  const roleCounts = selectedPlayers.reduce(
    (acc, player) => {
      acc[player.role] = (acc[player.role] || 0) + 1;
      return acc;
    },
    {} as Record<PlayerRole, number>
  );

  const isSelectionValid = () => {
    return (
      selectedPlayersCount === 11 &&
      captainId &&
      viceCaptainId &&
      !hasTeamLimitExceeded &&
      creditsUsed <= maxCredits &&
      roleCounts.batsman >= 3 &&
      roleCounts.bowler >= 3 &&
      roleCounts.allrounder >= 1 &&
      roleCounts.wicketkeeper >= 1
    );
  };

  useEffect(() => {
    if (open) {
      setStep(1);
      setLeagueName("");
      setIsPublic(false);
      setSelectedMatchId("");
      setPlayers(mockPlayers);
      setFilteredPlayers(mockPlayers);
      setSearchQuery("");
      setCaptainId("");
      setViceCaptainId("");
      setInviteCode("");
      setTransitionClass("");
      setCreditsUsed(0);
    }
  }, [open]);

  useEffect(() => {
    const totalCredits = selectedPlayers.reduce((sum, player) => sum + player.credits, 0);
    setCreditsUsed(totalCredits);
  }, [selectedPlayers]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPlayers(players);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = players.filter(
        (player) =>
          player.name.toLowerCase().includes(query) ||
          player.team.toLowerCase().includes(query) ||
          player.role.toLowerCase().includes(query)
      );
      setFilteredPlayers(filtered);
    }
  }, [searchQuery, players]);

  const applyStepTransition = (newStep: number) => {
    setTransitionClass("animate-slideOut");
    setTimeout(() => {
      setStep(newStep);
      setTransitionClass("animate-slideIn");
      setTimeout(() => {
        setTransitionClass("");
      }, 500);
      if (contentRef.current) {
        contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 300);
  };

  const generateInviteCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setInviteCode(code);
    return code;
  };

  const handlePlayerSelection = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;

    const updatedPlayers = players.map((p) => {
      if (p.id === playerId) {
        if (p.selected) {
          if (p.id === captainId) setCaptainId("");
          if (p.id === viceCaptainId) setViceCaptainId("");
          return { ...p, selected: false, isCaptain: false, isViceCaptain: false };
        }

        if (selectedPlayersCount >= 11) {
          toast.error("You can only select 11 players");
          return p;
        }

        if ((teamCounts[player.team] || 0) >= maxPlayersPerTeam) {
          toast.error(`You can only select ${maxPlayersPerTeam} players from one team`);
          return p;
        }

        const newCredits = creditsUsed + player.credits;
        if (newCredits > maxCredits) {
          toast.error(`Credit limit exceeded! Available: ${maxCredits - creditsUsed}`);
          return p;
        }

        return { ...p, selected: true };
      }
      return p;
    });

    setPlayers(updatedPlayers);
  };

  const handleSetCaptain = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    if (!player?.selected) {
      toast.error("Player must be selected to be captain");
      return;
    }

    if (playerId === viceCaptainId) {
      setViceCaptainId("");
    }

    setCaptainId(playerId);
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        isCaptain: p.id === playerId,
        isViceCaptain: p.id === viceCaptainId,
      }))
    );
  };

  const handleSetViceCaptain = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    if (!player?.selected) {
      toast.error("Player must be selected to be vice-captain");
      return;
    }

    if (playerId === captainId) {
      setCaptainId("");
    }

    setViceCaptainId(playerId);
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        isCaptain: p.id === captainId,
        isViceCaptain: p.id === playerId,
      }))
    );
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
      if (creditsUsed > maxCredits) {
        toast.error(`Credit limit exceeded! Used: ${creditsUsed}/${maxCredits}`);
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
      if (
        roleCounts.batsman < 3 ||
        roleCounts.bowler < 3 ||
        roleCounts.allrounder < 1 ||
        roleCounts.wicketkeeper < 1
      ) {
        toast.error(
          "Team composition invalid! Minimum: 3 Batsmen, 3 Bowlers, 1 All-rounder, 1 Wicketkeeper"
        );
        return;
      }
      applyStepTransition(3);
    } else if (step === 3) {
      handleSubmit();
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
      const team: Partial<FantasyTeam> = {
        name: `${leagueName} Team`,
        match_id: selectedMatchId,
        captain_id: captainId,
        vice_captain_id: viceCaptainId,
        players: selectedPlayers,
      };

      console.log("Creating League:", {
        name: leagueName,
        isPublic,
        matchId: selectedMatchId,
        team,
        inviteCode,
      });

      await new Promise((resolve) => setTimeout(resolve, 1500));
      generateInviteCode();
      toast.success("League created successfully!");

      const existingLeagues = JSON.parse(localStorage.getItem("fantasy_leagues") || "[]");
      const newLeague = {
        id: Math.random().toString(36).substring(2, 9),
        name: leagueName,
        isPublic,
        matchId: selectedMatchId,
        team,
        inviteCode,
        createdAt: new Date().toISOString(),
      };

      existingLeagues.push(newLeague);
      localStorage.setItem("fantasy_leagues", JSON.stringify(existingLeagues));

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
    navigator.clipboard.writeText(link).then(() => toast.success("Invite link copied!"));
  };

  useEffect(() => {
    if (!open) return;
    const styleElement = document.createElement("style");
    styleElement.innerHTML = `
      @keyframes slideIn {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes slideOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(-20px); }
      }
      .animate-slideIn {
        animation: slideIn 0.5s ease-out forwards;
      }
      .animate-slideOut {
        animation: slideOut 0.3s ease-in forwards;
      }
      .pulse-glow {
        animation: pulse-glow 2s infinite;
      }
      @keyframes pulse-glow {
        0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
        70% { box-shadow: 0 0 0 12px rgba(34, 197, 94, 0); }
        100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
      }
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #60a5fa;
        border-radius: 8px;
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
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-5 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="h-6 w-6 text-orange-500" />
                <Label className="text-xl font-bold text-gray-800">Name Your League</Label>
              </div>
              <Input
                placeholder="E.g., Cricket Champions League"
                value={leagueName}
                onChange={(e) => setLeagueName(e.target.value)}
                className="h-12 bg-white/80 backdrop-blur-sm border-orange-200 focus:border-orange-400 text-lg rounded-lg shadow-inner"
              />
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-5 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-6 w-6 text-blue-500" />
                <Label className="text-xl font-bold text-gray-800">League Type</Label>
              </div>
              <div className="flex items-center justify-between bg-white/80 p-4 rounded-lg shadow-inner border border-blue-100">
                <div>
                  <Label className="text-base font-semibold">
                    {isPublic ? "Public League" : "Private League"}
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {isPublic
                      ? "Open to everyone"
                      : "Invite-only with a unique code"}
                  </p>
                </div>
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-6 w-6 text-green-500" />
                <Label className="text-xl font-bold text-gray-800">Choose Match</Label>
              </div>
              <Select onValueChange={setSelectedMatchId} value={selectedMatchId}>
                <SelectTrigger className="h-12 bg-white/80 border-green-200 focus:border-green-400 text-lg rounded-lg shadow-inner">
                  <SelectValue placeholder="Pick a match" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-lg shadow-lg max-h-64">
                  {matchesLoading ? (
                    <div className="p-4 text-center">
                      <Loader2 className="h-5 w-5 animate-spin inline-block mr-2" />
                      Loading...
                    </div>
                  ) : (
                    matches?.map((match) => (
                      <SelectItem
                        key={match.match_id}
                        value={match.match_id}
                        className="py-3 px-4 hover:bg-green-50"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">{match.team1_name} vs {match.team2_name}</span>
                          <span className="text-sm text-gray-500">{match.time}</span>
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
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-xl shadow-lg flex justify-between items-center">
              <h3 className="text-lg font-bold">Build Your Dream Team</h3>
              <div className="flex items-center gap-4">
                <Badge className="bg-yellow-400 text-purple-900">
                  {selectedPlayersCount}/11
                </Badge>
                <Badge className="bg-green-400 text-purple-900">
                  Credits: {maxCredits - creditsUsed}/{maxCredits}
                </Badge>
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center bg-white/90 border border-purple-200 rounded-lg shadow-sm">
                <Search className="h-5 w-5 text-purple-500 mx-3" />
                <Input
                  placeholder="Search players..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 border-0 focus:ring-0 bg-transparent"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    onClick={() => setSearchQuery("")}
                    className="p-2"
                  >
                    <X className="h-4 w-4 text-purple-500" />
                  </Button>
                )}
              </div>
            </div>

            <ScrollArea className="h-[45vh] custom-scrollbar rounded-lg">
              <div className="grid grid-cols-1 gap-3 p-1">
                {filteredPlayers.map((player) => (
                  <Card
                    key={player.id}
                    className={`bg-white/95 backdrop-blur-sm border ${
                      player.selected
                        ? "border-purple-400 shadow-purple-200 shadow-md"
                        : "border-gray-200"
                    } rounded-lg overflow-hidden hover:shadow-lg transition-all`}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-bold">{player.name[0]}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{player.name}</div>
                          <div className="flex gap-2 mt-1">
                            <Badge className="bg-purple-100 text-purple-700">{player.team}</Badge>
                            <Badge className="bg-blue-100 text-blue-700 capitalize">{player.role}</Badge>
                            <Badge className="bg-yellow-100 text-yellow-700">{player.credits} Cr</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {player.selected && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant={player.isCaptain ? "default" : "outline"}
                              onClick={() => handleSetCaptain(player.id)}
                              className={`w-8 h-8 rounded-full p-0 ${
                                player.isCaptain
                                  ? "bg-green-500 hover:bg-green-600"
                                  : "border-purple-300"
                              }`}
                            >
                              C
                            </Button>
                            <Button
                              size="sm"
                              variant={player.isViceCaptain ? "default" : "outline"}
                              onClick={() => handleSetViceCaptain(player.id)}
                              className={`w-8 h-8 rounded-full p-0 ${
                                player.isViceCaptain
                                  ? "bg-blue-500 hover:bg-blue-600"
                                  : "border-purple-300"
                              }`}
                            >
                              VC
                            </Button>
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant={player.selected ? "destructive" : "default"}
                          onClick={() => handlePlayerSelection(player.id)}
                          className={`h-8 ${
                            player.selected
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-purple-500 hover:bg-purple-600"
                          }`}
                        >
                          {player.selected ? "Remove" : "Add"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {!filteredPlayers.length && (
                  <div className="text-center py-10 text-gray-500">
                    <Search className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>No players found for "{searchQuery}"</p>
                    <Button
                      variant="link"
                      onClick={() => setSearchQuery("")}
                      className="mt-2"
                    >
                      Clear Search
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100 shadow-sm">
              <h4 className="font-semibold text-purple-800 mb-2">Team Composition</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className={`flex items-center gap-2 ${selectedPlayersCount === 11 ? "text-green-600" : ""}`}>
                  <Check className={`h-4 w-4 ${selectedPlayersCount === 11 ? "" : "text-gray-400"}`} />
                  Players: {selectedPlayersCount}/11
                </div>
                <div className={`flex items-center gap-2 ${creditsUsed <= maxCredits ? "text-green-600" : "text-red-600"}`}>
                  <Check className={`h-4 w-4 ${creditsUsed <= maxCredits ? "" : "text-gray-400"}`} />
                  Credits: {creditsUsed}/{maxCredits}
                </div>
                <div className={`flex items-center gap-2 ${roleCounts.batsman >= 3 ? "text-green-600" : ""}`}>
                  <Check className={`h-4 w-4 ${roleCounts.batsman >= 3 ? "" : "text-gray-400"}`} />
                  Batsmen: {roleCounts.batsman || 0}/3+
                </div>
                <div className={`flex items-center gap-2 ${roleCounts.bowler >= 3 ? "text-green-600" : ""}`}>
                  <Check className={`h-4 w-4 ${roleCounts.bowler >= 3 ? "" : "text-gray-400"}`} />
                  Bowlers: {roleCounts.bowler || 0}/3+
                </div>
                <div className={`flex items-center gap-2 ${roleCounts.allrounder >= 1 ? "text-green-600" : ""}`}>
                  <Check className={`h-4 w-4 ${roleCounts.allrounder >= 1 ? "" : "text-gray-400"}`} />
                  All-rounders: {roleCounts.allrounder || 0}/1+
                </div>
                <div className={`flex items-center gap-2 ${roleCounts.wicketkeeper >= 1 ? "text-green-600" : ""}`}>
                  <Check className={`h-4 w-4 ${roleCounts.wicketkeeper >= 1 ? "" : "text-gray-400"}`} />
                  Wicketkeepers: {roleCounts.wicketkeeper || 0}/1+
                </div>
                <div className={`flex items-center gap-2 ${!hasTeamLimitExceeded ? "text-green-600" : ""}`}>
                  <Check className={`h-4 w-4 ${!hasTeamLimitExceeded ? "" : "text-gray-400"}`} />
                  Max 7 per team
                </div>
                <div className={`flex items-center gap-2 ${captainId && viceCaptainId ? "text-green-600" : ""}`}>
                  <Check className={`h-4 w-4 ${captainId && viceCaptainId ? "" : "text-gray-400"}`} />
                  Captain & Vice-Captain
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        const selectedMatch = matches?.find((m) => m.match_id === selectedMatchId);
        return (
          <div className={`space-y-5 ${transitionClass}`}>
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-5 rounded-xl shadow-lg text-center">
              <h3 className="text-xl font-bold">Review Your League</h3>
              <p className="text-green-100 mt-1">Everything set? Let’s create it!</p>
            </div>

            <ScrollArea className="h-[50vh] custom-scrollbar">
              <div className="space-y-4">
                <Card className="bg-white/95 p-4 rounded-xl shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <Trophy className="h-5 w-5 text-orange-500" />
                    <h4 className="font-bold text-lg text-gray-800">League Info</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-semibold">{leagueName}</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Type</p>
                      <Badge className={isPublic ? "bg-green-500" : "bg-blue-500"}>
                        {isPublic ? "Public" : "Private"}
                      </Badge>
                    </div>
                  </div>
                </Card>

                <Card className="bg-white/95 p-4 rounded-xl shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="h-5 w-5 text-blue-500" />
                    <h4 className="font-bold text-lg text-gray-800">Match</h4>
                  </div>
                  {selectedMatch && (
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="font-bold text-lg">{selectedMatch.team1_name} vs {selectedMatch.team2_name}</div>
                      <p className="text-sm text-gray-600 mt-1">{selectedMatch.time}</p>
                    </div>
                  )}
                </Card>

                <Card className="bg-white/95 p-4 rounded-xl shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="h-5 w-5 text-purple-500" />
                    <h4 className="font-bold text-lg text-gray-800">Your Team</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {selectedPlayers.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between bg-purple-50 p-3 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{player.name}</span>
                          <Badge className="bg-purple-100 text-purple-700">{player.team}</Badge>
                        </div>
                        <div className="flex gap-1">
                          {player.isCaptain && <Badge className="bg-green-500">C</Badge>}
                          {player.isViceCaptain && <Badge className="bg-blue-500">VC</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </ScrollArea>
          </div>
        );

      case 4:
        return (
          <div className={`space-y-6 text-center ${transitionClass}`}>
            <div className="mx-auto bg-green-500 w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
              <Check className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">League Created!</h3>
              <p className="text-gray-600 mt-2">Invite friends to join the fun!</p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl shadow-sm">
              <div className="font-mono text-2xl font-bold bg-white p-3 rounded-lg shadow-inner mb-4">
                {inviteCode}
              </div>
              <Button
                onClick={copyInviteLink}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Copy Invite Link
              </Button>
            </div>
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full bg-purple-500 hover:bg-purple-600"
            >
              Done
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-5">
          <DialogTitle className="text-2xl font-bold text-white text-center">
            {step < 4 ? `Create Fantasy League (${step}/3)` : "Invite Friends"}
          </DialogTitle>
        </div>

        {step < 4 && (
          <div className="flex justify-center gap-4 py-3 bg-gray-50 border-b">
            {["Setup", "Team", "Review"].map((label, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                  step > index + 1
                    ? "bg-green-500 text-white"
                    : step === index + 1
                    ? "bg-purple-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                <span className="font-semibold">{label}</span>
                {step > index + 1 && <Check className="h-4 w-4" />}
              </div>
            ))}
          </div>
        )}

        <div className="p-6 bg-gradient-to-b from-white to-gray-50" ref={contentRef}>
          {renderStep()}
        </div>

        {step < 4 && (
          <div className="flex justify-between p-4 bg-gray-50 border-t">
            <Button
              variant="outline"
              onClick={step > 1 ? handlePrevStep : () => onOpenChange(false)}
              className="bg-white border-purple-300 hover:bg-purple-50"
            >
              {step > 1 ? (
                <>
                  <ChevronsLeft className="h-4 w-4 mr-2" />
                  Back
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </>
              )}
            </Button>
            <Button
              onClick={handleNextStep}
              disabled={isSubmitting || (step === 2 && !isSelectionValid())}
              className={`pulse-glow ${
                step === 3 ? "bg-green-500 hover:bg-green-600" : "bg-purple-500 hover:bg-purple-600"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  {step === 3 ? "Create League" : step === 2 ? "Review Team" : "Next"}
                  <ChevronRight className="h-4 w-4 ml-2" />
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