
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const CRICAPI_KEY = Deno.env.get("CRICAPI_KEY");

interface CricketMatch {
  id: string;
  name: string;
  status: string;
  venue?: string;
  dateTimeGMT?: string;
  teams: string[];
  teamInfo?: Array<{
    name: string;
    shortname: string;
    img: string;
  }>;
  score?: Array<{
    r: number;
    w: number;
    o: number;
    inning: string;
  }>;
  matchType?: string;
  matchStarted?: boolean;
  matchEnded?: boolean;
  category?: string;
  localDateTime?: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Starting cricket data fetch with API key status:", CRICAPI_KEY ? "Available" : "Missing");
    
    if (!CRICAPI_KEY) {
      throw new Error("CRICAPI_KEY not found in environment variables");
    }

    // Fetch current matches
    console.log("Fetching current matches...");
    const currentMatchesResponse = await fetch(
      `https://api.cricapi.com/v1/currentMatches?apikey=${CRICAPI_KEY}&offset=0`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Cricket-Fantasy-App/1.0'
        }
      }
    );
    
    if (!currentMatchesResponse.ok) {
      throw new Error(`Current matches API failed: ${currentMatchesResponse.status} ${currentMatchesResponse.statusText}`);
    }
    
    const currentMatches = await currentMatchesResponse.json();
    console.log("Current matches API response status:", currentMatches.status);
    console.log("Current matches count:", currentMatches.data?.length || 0);

    // Fetch live scores
    console.log("Fetching live scores...");
    const scoresResponse = await fetch(
      `https://api.cricapi.com/v1/cricScore?apikey=${CRICAPI_KEY}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Cricket-Fantasy-App/1.0'
        }
      }
    );
    
    let scores = { data: [] };
    if (scoresResponse.ok) {
      scores = await scoresResponse.json();
      console.log("Live scores count:", scores.data?.length || 0);
    } else {
      console.warn("Live scores API failed, continuing with current matches only");
    }

    if (currentMatches.status !== "success" || !currentMatches.data) {
      throw new Error(`Invalid response from cricket API: ${currentMatches.status || 'Unknown error'}`);
    }

    // Process and combine data
    const allMatches = currentMatches.data.map((match: any) => {
      const scoreData = scores.data?.find((s: any) => s.id === match.id);
      
      // Format match time to IST
      let localDateTime = '';
      if (match.dateTimeGMT) {
        try {
          const matchDate = new Date(match.dateTimeGMT);
          const istFormatter = new Intl.DateTimeFormat('en-IN', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          });
          localDateTime = istFormatter.format(matchDate);
        } catch (err) {
          console.warn("Error formatting date:", err);
          localDateTime = match.dateTimeGMT;
        }
      }

      // Determine category based on status and time
      let category = "Upcoming";
      const now = new Date();
      
      if (match.dateTimeGMT) {
        const matchTime = new Date(match.dateTimeGMT);
        const timeDiff = matchTime.getTime() - now.getTime();
        
        if (timeDiff > 0) {
          category = "Upcoming";
        } else {
          const statusLower = (match.status || "").toLowerCase();
          
          if (statusLower.includes("live") || 
              match.matchStarted === true && !match.matchEnded) {
            category = "Live";
          } 
          else if (statusLower.includes("won") || 
                  statusLower.includes("drawn") || 
                  statusLower.includes("match ended") ||
                  statusLower.includes("completed") ||
                  match.matchEnded === true) {
            category = "Completed";
          }
          else if (timeDiff > -12 * 60 * 60 * 1000) {
            category = "Live";
          }
          else {
            category = "Completed";
          }
        }
      }

      return {
        ...match,
        score: scoreData?.score || match.score || [],
        teams: match.teams || scoreData?.teams || [],
        teamInfo: match.teamInfo || scoreData?.teamInfo || [],
        localDateTime,
        category
      };
    });

    // Filter recent matches (last week for completed)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentMatches = allMatches.filter((match: any) => {
      if (match.category === "Live" || match.category === "Upcoming") {
        return true;
      }
      
      if (match.category === "Completed" && match.dateTimeGMT) {
        const matchDate = new Date(match.dateTimeGMT);
        return matchDate > oneWeekAgo;
      }
      
      return true;
    });

    // Sort matches: Live > Upcoming > Completed
    const sortedMatches = recentMatches.sort((a: any, b: any) => {
      const categoryOrder = { 'Live': 0, 'Upcoming': 1, 'Completed': 2 };
      const categoryDiff = 
        categoryOrder[a.category as keyof typeof categoryOrder] - 
        categoryOrder[b.category as keyof typeof categoryOrder];
      
      if (categoryDiff !== 0) return categoryDiff;
      
      if (a.category === 'Upcoming' && b.category === 'Upcoming') {
        const timeA = a.dateTimeGMT ? new Date(a.dateTimeGMT).getTime() : 0;
        const timeB = b.dateTimeGMT ? new Date(b.dateTimeGMT).getTime() : 0;
        return timeA - timeB;
      }
      
      if (a.category === 'Completed') {
        const timeA = a.dateTimeGMT ? new Date(a.dateTimeGMT).getTime() : 0;
        const timeB = b.dateTimeGMT ? new Date(b.dateTimeGMT).getTime() : 0;
        return timeB - timeA;
      }
      
      return 0;
    });

    console.log(`Successfully processed ${sortedMatches.length} matches`);

    return new Response(
      JSON.stringify({
        success: true,
        data: sortedMatches,
        count: sortedMatches.length,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error("Error fetching cricket data:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        data: [],
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
