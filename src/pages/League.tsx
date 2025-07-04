import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, Trophy, Users, Calendar, Shield, Coins, Share2 } from "lucide-react";
import LeagueDetailsModal from "@/components/LeagueDetailsModal";

// Type definition for the League data
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

const LeaguePage = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch leagues from localStorage on component mount
  useEffect(() => {
    const fetchLeagues = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const storedLeagues = localStorage.getItem("fantasy_leagues");
        if (storedLeagues) {
          const parsedLeagues = JSON.parse(storedLeagues);
          setLeagues(parsedLeagues);
        } else {
          setLeagues([]);
        }
      } catch (err: any) {
        console.error("Error fetching leagues:", err);
        setError("Failed to load leagues. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeagues();
  }, []);

  // Handle league deletion with confirmation
  const handleDeleteLeague = (leagueId: string) => {
    const updatedLeagues = leagues.filter((league) => league.id !== leagueId);
    setLeagues(updatedLeagues);
    localStorage.setItem("fantasy_leagues", JSON.stringify(updatedLeagues));
    // Also remove participants for this league
    localStorage.removeItem(`participants_${leagueId}`);
  };

  // Handle sharing via WhatsApp
  const handleShareLeague = (league: League) => {
    const joinUrl = `${window.location.origin}/join-league/${league.invite_code}`;
    const message = `Join my fantasy cricket league "${league.name}"! Use this invite code: ${league.invite_code}. Click here to join: ${joinUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  // Navigate to home page to create a new league
  const handleCreateLeague = () => {
    navigate("/");
  };

  // Handle view details
  const handleViewDetails = (league: League) => {
    setSelectedLeague(league);
    setIsModalOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="mr-2 h-8 w-8 animate-spin text-teal-500" />
        <p className="text-gray-600">Loading leagues...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center text-red-500 py-12">
        <p>{error}</p>
      </div>
    );
  }

  // Empty state
  if (leagues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 rounded-lg shadow-md">
        <div className="text-center">
          <PlusCircle className="mx-auto h-24 w-24 text-teal-500 mb-6" />
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">
            No leagues created yet
          </h2>
          <p className="mt-1 text-lg text-gray-600 mb-8">
            Dive into the action! Start your own league and invite your friends to join.
          </p>
          <Button
            onClick={handleCreateLeague}
            className="bg-teal-500 hover:bg-teal-600 text-white text-lg px-6 py-3 rounded-md"
          >
            Create League
          </Button>
        </div>
      </div>
    );
  }

  // Render league list
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Header with Create New League button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Leagues</h1>
        <Button
          onClick={handleCreateLeague}
          className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md"
        >
          Create New League
        </Button>
      </div>

      {/* League cards */}
      <div className="space-y-4">
        {leagues.map((league) => (
          <Card
            key={league.id}
            className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300 rounded-md"
          >
            <CardHeader className="p-4">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-teal-500" />
                <span className="text-lg font-semibold text-gray-800 truncate">
                  {league.name}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Coins className="h-4 w-4 text-teal-500" />
                  Entry Fee: ₹{league.entry_fee}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-teal-500" />
                  {league.total_spots} Spots
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-teal-500" />
                  Starts: {new Date(league.start_at).toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="h-4 w-4 text-teal-500" />
                  {league.is_public ? "Public" : "Private"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  Invite Code: <span className="font-mono">{league.invite_code}</span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-teal-500 text-teal-500 hover:bg-teal-50"
                  onClick={() => handleShareLeague(league)}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between">
              <Button
                variant="outline"
                className="border-teal-500 text-teal-500 hover:bg-teal-50"
                onClick={() => handleViewDetails(league)}
              >
                View Details
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="bg-red-500 hover:bg-red-600 text-white">
                    Delete League
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this league? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-500 hover:bg-red-600 text-white"
                      onClick={() => handleDeleteLeague(league.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>

      <LeagueDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        league={selectedLeague}
      />
    </div>
  );
};

export default LeaguePage;