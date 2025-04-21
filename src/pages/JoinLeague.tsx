import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronsLeft, Loader2, Shield, Trophy, Users, Calendar, Coins } from "lucide-react";
import { toast } from "sonner";
import PageNavigation from "@/components/PageNavigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Type definitions
type League = {
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
  start_at: string; // Added to store the start date and time
};

type Team = {
  team_id: string;
  name: string;
};

type Participant = {
  id: string;
  user_id: string;
  team_id: string | null;
  joined_at: string;
};

const JoinLeague = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [league, setLeague] = useState<League | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [joining, setJoining] = useState<boolean>(false);
  const [hasJoined, setHasJoined] = useState<boolean>(false);

  // Mock user ID (replace with actual user ID from auth in production)
  const mockUserId = "user-456";

  // Fetch league details and initialize teams
  useEffect(() => {
    const fetchLeagueAndTeams = async () => {
      setLoading(true);
      try {
        // Fetch league from localStorage
        const savedLeagues = JSON.parse(localStorage.getItem("fantasy_leagues") || "[]");
        const foundLeague = savedLeagues.find((l: League) => l.invite_code === code);
        if (foundLeague) {
          setLeague(foundLeague);

          // Fetch participants for this league
          const storedParticipants = localStorage.getItem(`participants_${foundLeague.id}`);
          const leagueParticipants: Participant[] = storedParticipants ? JSON.parse(storedParticipants) : [];
          setParticipants(leagueParticipants);
        }

        // Fetch or initialize teams in localStorage
        const storedTeams = localStorage.getItem("fantasy_teams");
        if (!storedTeams) {
          const mockTeams: Team[] = [
            { team_id: "t1", name: "Dream Team 1" },
            { team_id: "t2", name: "Champions XI" },
          ];
          localStorage.setItem("fantasy_teams", JSON.stringify(mockTeams));
          setTeams(mockTeams);
        } else {
          setTeams(JSON.parse(storedTeams));
        }
      } catch (error) {
        console.error("Error fetching league:", error);
        toast.error("Failed to load league details.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeagueAndTeams();
  }, [code]);

  // Handle joining the league
  const handleJoinLeague = async () => {
    if (!league) return;

    setJoining(true);
    try {
      // Check if league is full
      if (participants.length >= league.total_spots) {
        throw new Error("This league is already full.");
      }

      // Check if user has already joined
      if (participants.some((p) => p.user_id === mockUserId)) {
        throw new Error("You have already joined this league.");
      }

      // Add user to participants
      const newParticipant: Participant = {
        id: Math.random().toString(36).substring(2, 9),
        user_id: mockUserId,
        team_id: null, // Will be set after team selection
        joined_at: new Date().toISOString(),
      };
      const updatedParticipants = [...participants, newParticipant];
      setParticipants(updatedParticipants);
      localStorage.setItem(`participants_${league.id}`, JSON.stringify(updatedParticipants));

      toast.success("Successfully joined the league! Please select your team.");
    } catch (error: any) {
      console.error("Error joining league:", error);
      toast.error(error.message || "Failed to join league.");
    } finally {
      setJoining(false);
    }
  };

  // Handle team selection and confirmation
  const handleConfirmTeam = () => {
    if (!selectedTeam) {
      toast.error("Please select a team.");
      return;
    }

    // Update participant's team
    const updatedParticipants = participants.map((p) =>
      p.user_id === mockUserId ? { ...p, team_id: selectedTeam } : p
    );
    setParticipants(updatedParticipants);
    localStorage.setItem(`participants_${league?.id}`, JSON.stringify(updatedParticipants));
    setHasJoined(true);
    toast.success("Team selected! You are now a member of the league.");
  };

  // Navigate back to previous page
  const handleBack = () => {
    navigate(-1);
  };

  // Navigate to My Teams page
  const handleViewTeams = () => {
    navigate("/my-teams");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-4">
          <PageNavigation className="mb-4" />
          <div className="max-w-3xl mx-auto mt-8">
            <Button variant="outline" onClick={handleBack} className="mb-6">
              <ChevronsLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
              <p className="mt-4 text-gray-500">Loading league details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // League not found state
  if (!league) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-4">
          <PageNavigation className="mb-4" />
          <div className="max-w-3xl mx-auto mt-8">
            <Button variant="outline" onClick={handleBack} className="mb-6">
              <ChevronsLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">League Not Found</h2>
              <p className="text-gray-500 mb-6">
                The league you're looking for doesn't exist or the invite code is invalid.
              </p>
              <Button onClick={() => navigate("/")}>Return to Home</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // League joined state - show details
  if (hasJoined) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-4">
          <PageNavigation className="mb-4" />
          <div className="max-w-3xl mx-auto mt-8">
            <Button variant="outline" onClick={handleBack} className="mb-6">
              <ChevronsLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-6 text-white">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Trophy className="h-6 w-6" />
                  {league.name}
                </h1>
                <p className="opacity-80">Invitation Code: {code}</p>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2">League Details</h2>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <Shield className="h-4 w-4" />
                        League Type:
                      </span>
                      <span>{league.is_public ? "Public" : "Private"}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Starts:
                      </span>
                      <span>{new Date(league.start_at).toLocaleString()}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        Match:
                      </span>
                      <span>{league.match_id}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <Coins className="h-4 w-4" />
                        Entry Fee:
                      </span>
                      <span>₹{league.entry_fee}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Spots:
                      </span>
                      <span>{participants.length}/{league.total_spots} Filled</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-2">Participants</h2>
                  {participants.length === 0 ? (
                    <p className="text-sm text-gray-600">No participants yet.</p>
                  ) : (
                    <ul className="space-y-2 text-sm text-gray-600">
                      {participants.map((p) => (
                        <li key={p.id} className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-teal-500" />
                          User {p.user_id} (Team: {p.team_id ? teams.find(t => t.team_id === p.team_id)?.name : "Not selected"})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-2">Rules</h2>
                  <p className="text-sm text-gray-600">
                    - Select a team before the league starts.<br />
                    - Points are awarded based on player performance.<br />
                    - Top 3 participants win prizes.
                  </p>
                </div>
                <Button onClick={handleViewTeams} className="w-full bg-teal-500 hover:bg-teal-600 text-white">
                  View My Teams
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Team selection state - after joining but before confirming team
  if (participants.some((p) => p.user_id === mockUserId && !p.team_id)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-4">
          <PageNavigation className="mb-4" />
          <div className="max-w-3xl mx-auto mt-8">
            <Button variant="outline" onClick={handleBack} className="mb-6">
              <ChevronsLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-6 text-white">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Trophy className="h-6 w-6" />
                  Select Team for {league.name}
                </h1>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <Label htmlFor="team-select" className="text-sm font-medium text-gray-700">
                    Select Your Team
                  </Label>
                  <Select onValueChange={setSelectedTeam} value={selectedTeam}>
                    <SelectTrigger id="team-select" className="mt-1 h-10 border-gray-300 focus:border-teal-500 rounded-md">
                      <SelectValue placeholder="Select a team" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 rounded-md">
                      {teams.length === 0 ? (
                        <SelectItem value="" disabled>
                          No teams available
                        </SelectItem>
                      ) : (
                        teams.map((team) => (
                          <SelectItem key={team.team_id} value={team.team_id}>
                            {team.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleConfirmTeam}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white"
                  disabled={joining}
                >
                  {joining ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <Trophy className="h-4 w-4 mr-2" />
                      Confirm Team
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Initial state - join league
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4">
        <PageNavigation className="mb-4" />
        <div className="max-w-3xl mx-auto mt-8">
          <Button variant="outline" onClick={handleBack} className="mb-6">
            <ChevronsLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-6 text-white">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Trophy className="h-6 w-6" />
                {league.name}
              </h1>
              <p className="opacity-80">Invitation Code: {code}</p>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">League Details</h2>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      League Type:
                    </span>
                    <span>{league.is_public ? "Public" : "Private"}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Starts:
                    </span>
                    <span>{new Date(league.start_at).toLocaleString()}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <Trophy className="h-4 w-4" />
                      Match:
                    </span>
                    <span>{league.match_id}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <Coins className="h-4 w-4" />
                      Entry Fee:
                    </span>
                    <span>₹{league.entry_fee}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Spots:
                    </span>
                    <span>{participants.length}/{league.total_spots} Filled</span>
                  </li>
                </ul>
              </div>
              <div className="border-t pt-6">
                <Button
                  onClick={handleJoinLeague}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white"
                  disabled={joining}
                >
                  {joining ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Joining League...
                    </>
                  ) : (
                    <>
                      <Trophy className="h-4 w-4 mr-2" />
                      Join League
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinLeague;