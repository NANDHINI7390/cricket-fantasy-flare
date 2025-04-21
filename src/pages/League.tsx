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
  Button,
  buttonVariants,
} from "@/components/ui/button";
import { Loader2, Trophy, Users, Calendar, Shield, PlusCircle, Coins } from "lucide-react";
import { cn } from "@/lib/utils";




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
};

const LeaguePage = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeagues = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Simulate fetching data from Supabase/database
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const storedLeagues = localStorage.getItem("fantasy_leagues");
        if (storedLeagues) {
          const parsedLeagues = JSON.parse(storedLeagues);
          setLeagues(parsedLeagues);
        }
      } catch (err: any) {
        console.error("Error fetching leagues:", err);
        setError("Failed to load leagues.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeagues();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="mr-2 h-8 w-8 animate-spin text-teal-500" />
        <p>Loading leagues...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (leagues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 rounded-lg shadow-md">
        <div className="text-center">
          <PlusCircle className="mx-auto h-20 w-20 text-teal-500 mb-6" />
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">
            No leagues created yet
          </h2>
          <p className="mt-1 text-lg text-gray-600 mb-6">
            Get started by creating your first league and inviting your friends!
          </p>
          <Button
            onClick={() => navigate("/")}
            className={cn(buttonVariants({ size: "lg" }), "bg-teal-500 hover:bg-teal-600 text-white")}
          >
            Create League
          </Button>
        </div>
      </div>
    );
  } else {
    return (<div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Leagues</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {leagues.map((league) => (
          <Card
            key={league.id}
            className="hover:shadow-lg transition-shadow duration-300 ease-in-out"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-teal-500" />
                <span className="text-lg font-semibold">{league.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <Coins className="h-5 w-5 text-yellow-500" />
                  <span>Entry Fee: ₹{league.entry_fee}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span>{league.total_spots} Spots</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="h-5 w-5 text-green-500" />
                  <span>Created: {new Date(league.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Shield className="h-5 w-5 text-indigo-500" />
                  <span>{league.is_public ? "Public" : "Private"}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Invite Code: <span className="font-mono">{league.invite_code}</span>
              </p>
            </CardContent>
            {/*  You can uncomment this CardFooter if you have a view details page
              <CardFooter>
                <Button className="w-full" variant="outline">
                  View Details
                </Button>
              </CardFooter> 
            */}
          </Card>
        ))}
      </div>
    );
  }
};

export default LeaguePage;