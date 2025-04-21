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
import { Button } from "@/components/ui/button";
import { Loader2, Trophy, Users, Calendar, Shield, PlusCircle } from "lucide-react";



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
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <PlusCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No leagues created yet</h2>
          <p className="mt-1 text-gray-600">Get started by creating your first league.</p>
          <Button
            onClick={() => navigate("/")}
            className="mt-4 bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded"
          >
            Create League
          </Button>
        </div>
      </div>
    );
  } else {
    return (
        {leagues.length === 0 ? (
          <p className="text-center col-span-full text-gray-600">No leagues created yet.</p>
        ) : (
          leagues.map((league) => (
            <Card key={league.id} className="hover:shadow-lg transition-shadow duration-300 ease-in-out">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-teal-500" />
                  {league.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <CardDescription className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-teal-500" />
                  Entry Fee: ₹{league.entry_fee}
                </CardDescription>
                <CardDescription className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-teal-500" />
                  Total Spots: {league.total_spots}
                </CardDescription>
                 <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-teal-500" />
                  Created At: {new Date(league.created_at).toLocaleDateString()}
                </CardDescription>
                 <CardDescription className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-teal-500" />
                  Visibility: {league.is_public ? "Public" : "Private"}
                </CardDescription>
                <CardDescription className="flex items-center gap-2">
                 <Shield className="h-4 w-4 text-teal-500" />
                  Invite Code: {league.invite_code}
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Button variant="outline">View Details</Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    );
  }
}

export default LeaguePage;