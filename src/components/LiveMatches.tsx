
import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

// API Keys & URLs
const API_KEY = "fc3aea268114e8b77bd56fb22bcd5f1709b67913cefa9041f3faf99e4e8c3aca";
const BASE_URL = "https://apiv2.api-cricket.com/cricket/";

const fetchLiveMatches = async () => {
  try {
    const response = await fetch(`${BASE_URL}?method=get_livescore&APIkey=${API_KEY}`);
    const data = await response.json();

    if (data.result && data.result.length > 0) {
      return data.result;
    }
    console.warn("No live matches found.");
    return [];
  } catch (error) {
    console.error("Error fetching live matches:", error);
    return [];
  }
};

const fetchUpcomingMatches = async () => {
  try {
    const response = await fetch(`${BASE_URL}?method=get_events&APIkey=${API_KEY}&date_start=2025-02-24&date_stop=2025-02-26`);
    const data = await response.json();

    if (data.result && data.result.length > 0) {
      return data.result;
    }
    console.warn("No upcoming matches found.");
    return [];
  } catch (error) {
    console.error("Error fetching upcoming matches:", error);
    return [];
  }
};

const LiveMatches = () => {
  const { data: liveMatches, isLoading: loadingLive } = useQuery({
    queryKey: ["liveMatches"],
    queryFn: fetchLiveMatches,
    refetchInterval: 60000,
  });

  const { data: upcomingMatches, isLoading: loadingUpcoming } = useQuery({
    queryKey: ["upcomingMatches"],
    queryFn: fetchUpcomingMatches,
    refetchInterval: 300000,
  });

  // Render match cards
  const renderMatchCard = (match, isLive) => (
    <Card key={match.id} className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="text-center">
            <img
              src={match.home_team_logo || "/placeholder.svg"}
              alt={match.event_home_team}
              className="w-16 h-16 mx-auto mb-2 object-contain"
            />
            <h3 className="font-semibold text-sm">{match.event_home_team}</h3>
            {isLive && <p className="text-sm text-gray-600">{match.event_home_final_result}</p>}
          </div>

          <div className="text-center">
            <div className="text-xl font-bold">VS</div>
            <span className={`px-2 py-1 rounded text-xs ${isLive ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>
              {isLive ? "LIVE" : "Upcoming"}
            </span>
          </div>

          <div className="text-center">
            <img
              src={match.away_team_logo || "/placeholder.svg"}
              alt={match.event_away_team}
              className="w-16 h-16 mx-auto mb-2 object-contain"
            />
            <h3 className="font-semibold text-sm">{match.event_away_team}</h3>
            {isLive && <p className="text-sm text-gray-600">{match.event_away_final_result}</p>}
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>{isLive ? `Venue: ${match.event_stadium}` : `Starts at: ${match.event_date_start}`}</p>
        </div>

        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={() => toast.info("Match details coming soon!")} className="w-full max-w-xs">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <CardHeader className="text-center mb-6">
        <CardTitle>Live Matches</CardTitle>
      </CardHeader>
      {loadingLive ? (
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : liveMatches?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveMatches.map((match) => renderMatchCard(match, true))}
        </div>
      ) : (
        <div className="text-center text-gray-500">No live matches available</div>
      )}

      <CardHeader className="text-center mb-6 mt-8">
        <CardTitle>Upcoming Matches</CardTitle>
      </CardHeader>
      {loadingUpcoming ? (
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : upcomingMatches?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingMatches.map((match) => renderMatchCard(match, false))}
        </div>
      ) : (
        <div className="text-center text-gray-500">No upcoming matches available</div>
      )}
    </div>
  );
};

export default LiveMatches;
