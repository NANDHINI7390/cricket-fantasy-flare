
import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface MatchData {
  match_id: string;
  team1_name: string;
  team1_logo: string;
  team2_name: string;
  team2_logo: string;
  score1: string | null;
  score2: string | null;
  overs: string | null;
  status: 'LIVE' | 'UPCOMING';
  time: string | null;
}

const LiveMatches = () => {
  const { data: matches, isLoading } = useQuery({
    queryKey: ["matches"],
    queryFn: async (): Promise<MatchData[]> => {
      const { data, error } = await supabase.functions.invoke('fetch-cricket-matches');
      if (error) throw error;
      return data;
    },
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  const liveMatches = matches?.filter(match => match.status === 'LIVE') || [];
  const upcomingMatches = matches?.filter(match => match.status === 'UPCOMING') || [];

  const renderMatchCard = (match: MatchData) => (
    <Card key={match.match_id} className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="text-center">
            <img
              src={match.team1_logo || "/placeholder.svg"}
              alt={match.team1_name}
              className="w-16 h-16 mx-auto mb-2 object-contain"
            />
            <h3 className="font-semibold text-sm">{match.team1_name}</h3>
            {match.status === 'LIVE' && match.score1 && (
              <p className="text-sm text-gray-600">{match.score1}</p>
            )}
          </div>

          <div className="text-center">
            <div className="text-xl font-bold">VS</div>
            <div className="mt-2">
              <span
                className={`px-2 py-1 rounded text-xs ${
                  match.status === 'LIVE'
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                }`}
              >
                {match.status}
              </span>
            </div>
          </div>

          <div className="text-center">
            <img
              src={match.team2_logo || "/placeholder.svg"}
              alt={match.team2_name}
              className="w-16 h-16 mx-auto mb-2 object-contain"
            />
            <h3 className="font-semibold text-sm">{match.team2_name}</h3>
            {match.status === 'LIVE' && match.score2 && (
              <p className="text-sm text-gray-600">{match.score2}</p>
            )}
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          {match.status === 'LIVE' ? (
            <p>Overs: {match.overs || 'N/A'}</p>
          ) : (
            <p>Starts at: {match.time}</p>
          )}
        </div>

        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            onClick={() => toast.info("Match details coming soon!")}
            className="w-full max-w-xs"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderMatchSection = (
    title: string,
    matches: MatchData[],
    isLoading: boolean
  ) => (
    <section className="mb-8">
      <CardHeader className="text-center mb-6">
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      {isLoading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : matches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map(renderMatchCard)}
        </div>
      ) : (
        <div className="text-center text-gray-500">No matches available</div>
      )}
    </section>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {renderMatchSection("Live Matches", liveMatches, isLoading)}
      {renderMatchSection("Upcoming Matches", upcomingMatches, isLoading)}
    </div>
  );
};

export default LiveMatches;
