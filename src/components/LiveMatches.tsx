
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { Match, Team, CricketApiResponse, TeamsApiResponse } from "@/types/cricket";
import { Loader2 } from "lucide-react";

const API_KEY = "a52ea237-09e7-4d69-b7cc-e4f0e79fb8ae";
const BASE_URL = "https://api.cricapi.com/v1";

const LiveMatches = () => {
  // Use React Query for efficient data fetching and caching
  const { data: liveMatches, isLoading: loadingLive } = useQuery({
    queryKey: ["liveMatches"],
    queryFn: async (): Promise<Match[]> => {
      const response = await fetch(
        `${BASE_URL}/matches?apikey=${API_KEY}&offset=0&per_page=5`
      );
      if (!response.ok) throw new Error("Failed to fetch live matches");
      const data: CricketApiResponse = await response.json();
      return data.data || [];
    },
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  const { data: upcomingMatches, isLoading: loadingUpcoming } = useQuery({
    queryKey: ["upcomingMatches"],
    queryFn: async (): Promise<Match[]> => {
      const response = await fetch(
        `${BASE_URL}/upcoming?apikey=${API_KEY}&offset=0&per_page=5`
      );
      if (!response.ok) throw new Error("Failed to fetch upcoming matches");
      const data: CricketApiResponse = await response.json();
      return data.data || [];
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: async (): Promise<Team[]> => {
      const response = await fetch(`${BASE_URL}/teams?apikey=${API_KEY}`);
      if (!response.ok) throw new Error("Failed to fetch teams");
      const data: TeamsApiResponse = await response.json();
      return data.data || [];
    },
    staleTime: Infinity, // Cache team data indefinitely as it rarely changes
  });

  const getTeamLogo = (teamName: string) => {
    const team = teams?.find((t) => t.name === teamName);
    return team?.img || "/placeholder.svg";
  };

  const renderMatchCard = (match: Match, isLive: boolean) => (
    <Card key={match.id} className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="text-center">
            <img
              src={getTeamLogo(match.teams[0])}
              alt={match.teams[0]}
              className="w-16 h-16 mx-auto mb-2 object-contain"
            />
            <h3 className="font-semibold text-sm">{match.teams[0]}</h3>
            {isLive && (
              <p className="text-sm text-gray-600">
                {match.score?.[0]?.r}/{match.score?.[0]?.w} ({match.score?.[0]?.o})
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
              src={getTeamLogo(match.teams[1])}
              alt={match.teams[1]}
              className="w-16 h-16 mx-auto mb-2 object-contain"
            />
            <h3 className="font-semibold text-sm">{match.teams[1]}</h3>
            {isLive && (
              <p className="text-sm text-gray-600">
                {match.score?.[1]?.r}/{match.score?.[1]?.w} ({match.score?.[1]?.o})
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
