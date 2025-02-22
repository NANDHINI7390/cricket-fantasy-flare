
import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { Match, Team, CricketApiResponse, TeamsApiResponse } from "@/types/cricket";
import { Loader2 } from "lucide-react";

// Mock data for when API is unavailable
const mockLiveMatches: Match[] = [
  {
    id: "1",
    name: "India vs Australia",
    status: "Live",
    venue: "Melbourne Cricket Ground",
    date: "2024-02-22",
    dateTimeGMT: "2024-02-22T09:00:00.000Z",
    teams: ["India", "Australia"],
    teamInfo: [
      { id: "1", name: "India", img: "https://media.crictracker.com/media/teams/5d81d08309d172c6c956b604_teams.jpg" },
      { id: "2", name: "Australia", img: "https://media.crictracker.com/media/teams/5d81d08309d172c6c956b605_teams.jpg" }
    ],
    score: [
      { r: 245, w: 4, o: 35.2 },
      { r: 189, w: 3, o: 28.4 }
    ]
  },
  {
    id: "2",
    name: "England vs South Africa",
    status: "Live",
    venue: "Lords Cricket Ground",
    date: "2024-02-22",
    dateTimeGMT: "2024-02-22T10:00:00.000Z",
    teams: ["England", "South Africa"],
    teamInfo: [
      { id: "3", name: "England", img: "https://media.crictracker.com/media/teams/5d81d08309d172c6c956b607_teams.jpg" },
      { id: "4", name: "South Africa", img: "https://media.crictracker.com/media/teams/5d81d08309d172c6c956b608_teams.jpg" }
    ],
    score: [
      { r: 156, w: 2, o: 25.3 },
      { r: 120, w: 4, o: 20.1 }
    ]
  }
];

const mockUpcomingMatches: Match[] = [
  {
    id: "3",
    name: "New Zealand vs Pakistan",
    status: "Upcoming",
    venue: "Eden Park",
    date: "2024-02-23",
    dateTimeGMT: "2024-02-23T03:00:00.000Z",
    teams: ["New Zealand", "Pakistan"],
    teamInfo: [
      { id: "5", name: "New Zealand", img: "https://media.crictracker.com/media/teams/5d81d08309d172c6c956b609_teams.jpg" },
      { id: "6", name: "Pakistan", img: "https://media.crictracker.com/media/teams/5d81d08309d172c6c956b610_teams.jpg" }
    ],
    score: []
  },
  {
    id: "4",
    name: "Sri Lanka vs Bangladesh",
    status: "Upcoming",
    venue: "R. Premadasa Stadium",
    date: "2024-02-23",
    dateTimeGMT: "2024-02-23T05:00:00.000Z",
    teams: ["Sri Lanka", "Bangladesh"],
    teamInfo: [
      { id: "7", name: "Sri Lanka", img: "https://media.crictracker.com/media/teams/5d81d08309d172c6c956b611_teams.jpg" },
      { id: "8", name: "Bangladesh", img: "https://media.crictracker.com/media/teams/5d81d08309d172c6c956b612_teams.jpg" }
    ],
    score: []
  }
];

const LiveMatches = () => {
  const { data: liveMatches, isLoading: loadingLive } = useQuery({
    queryKey: ["liveMatches"],
    queryFn: async (): Promise<Match[]> => {
      try {
        console.info("Fetching matches...");
        const response = await fetch(
          `${import.meta.env.VITE_CRICKET_API_URL}/matches` || 
          "https://api.cricapi.com/v1/matches?apikey=YOUR_API_KEY&offset=0&per_page=5"
        );
        const data: CricketApiResponse = await response.json();
        console.info("API Response:", data);
        
        if (data.status) {
          return data.data;
        }
        console.info("Using mock data due to API status:", data.status);
        return mockLiveMatches;
      } catch (error) {
        console.error("Error fetching matches:", error);
        return mockLiveMatches;
      }
    },
    refetchInterval: 60000,
  });

  const { data: upcomingMatches, isLoading: loadingUpcoming } = useQuery({
    queryKey: ["upcomingMatches"],
    queryFn: async (): Promise<Match[]> => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_CRICKET_API_URL}/upcoming` ||
          "https://api.cricapi.com/v1/upcoming?apikey=YOUR_API_KEY&offset=0&per_page=5"
        );
        const data: CricketApiResponse = await response.json();
        if (data.status) {
          return data.data;
        }
        return mockUpcomingMatches;
      } catch (error) {
        console.error("Error fetching upcoming matches:", error);
        return mockUpcomingMatches;
      }
    },
    refetchInterval: 300000,
  });

  const getTeamLogo = (match: Match, teamName: string): string => {
    // First try to get logo from teamInfo
    const teamInfo = match.teamInfo?.find(t => t.name === teamName);
    if (teamInfo?.img) {
      return teamInfo.img;
    }

    // If no logo found in teamInfo, return placeholder
    return "/placeholder.svg";
  };

  const renderMatchCard = (match: Match, isLive: boolean) => (
    <Card key={match.id} className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="text-center">
            <img
              src={getTeamLogo(match, match.teams[0])}
              alt={match.teams[0]}
              className="w-16 h-16 mx-auto mb-2 object-contain"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = "/placeholder.svg";
              }}
            />
            <h3 className="font-semibold text-sm">{match.teams[0]}</h3>
            {isLive && match.score?.[0] && (
              <p className="text-sm text-gray-600">
                {match.score[0].r}/{match.score[0].w} ({match.score[0].o})
              </p>
            )}
          </div>

          <div className="text-center">
            <div className="text-xl font-bold">VS</div>
            <div className="mt-2">
              <span
                className={`px-2 py-1 rounded text-xs ${
                  isLive
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                }`}
              >
                {isLive ? "LIVE" : "Upcoming"}
              </span>
            </div>
          </div>

          <div className="text-center">
            <img
              src={getTeamLogo(match, match.teams[1])}
              alt={match.teams[1]}
              className="w-16 h-16 mx-auto mb-2 object-contain"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = "/placeholder.svg";
              }}
            />
            <h3 className="font-semibold text-sm">{match.teams[1]}</h3>
            {isLive && match.score?.[1] && (
              <p className="text-sm text-gray-600">
                {match.score[1].r}/{match.score[1].w} ({match.score[1].o})
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          {isLive ? (
            <p>Venue: {match.venue}</p>
          ) : (
            <p>Starts at: {new Date(match.dateTimeGMT).toLocaleString()}</p>
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
    matches: Match[] | undefined,
    isLoading: boolean,
    isLive: boolean
  ) => (
    <section className="mb-8">
      <CardHeader className="text-center mb-6">
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      {isLoading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : matches?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => renderMatchCard(match, isLive))}
        </div>
      ) : (
        <div className="text-center text-gray-500">No matches available</div>
      )}
    </section>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {renderMatchSection("Live Matches", liveMatches, loadingLive, true)}
      {renderMatchSection("Upcoming Matches", upcomingMatches, loadingUpcoming, false)}
    </div>
  );
};

export default LiveMatches;
