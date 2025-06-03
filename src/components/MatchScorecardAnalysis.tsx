
import React, { useState, useEffect } from "react";
import { 
  fetchMatchScorecard, 
  analyzeScorecardData,
  ScorecardData,
  BattingStats,
  BowlingStats
} from "@/utils/cricket-api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Star, 
  Users, 
  Loader2, 
  AlertCircle,
  Database,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface MatchScorecardAnalysisProps {
  matchId: string;
}

const MatchScorecardAnalysis: React.FC<MatchScorecardAnalysisProps> = ({ matchId }) => {
  const [scorecard, setScorecard] = useState<ScorecardData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<string>("batsmen");

  useEffect(() => {
    if (matchId) {
      fetchScorecardData(matchId);
    }
  }, [matchId]);

  const fetchScorecardData = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchMatchScorecard(id);
      
      if (!data) {
        throw new Error("Failed to fetch scorecard data");
      }
      
      console.log("Fetched scorecard data:", data);
      setScorecard(data);
      
      // Analyze the scorecard data
      const analysisResult = analyzeScorecardData(data);
      console.log("Analysis result:", analysisResult);
      setAnalysis(analysisResult);
      
      toast.success("Scorecard data loaded successfully");
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to load scorecard data. Please try again later.");
      toast.error("Failed to load scorecard data");
    } finally {
      setLoading(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
        <p className="text-gray-600">Loading match scorecard data...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-red-600 font-medium">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => fetchScorecardData(matchId)}
          className="mt-2"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  // Render empty state
  if (!scorecard || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Database className="h-12 w-12 text-gray-400" />
        <p className="text-gray-600">No scorecard data available</p>
        <Button 
          variant="outline" 
          onClick={() => fetchScorecardData(matchId)}
          className="mt-2"
        >
          Load Scorecard
        </Button>
      </div>
    );
  }

  // Check if the analysis data has proper structure before rendering
  const hasBatsmenData = analysis.topBatsmen && analysis.topBatsmen.length > 0;
  const hasBowlersData = analysis.topBowlers && analysis.topBowlers.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{scorecard.name || "Match Scorecard"}</h2>
        <p className="text-gray-600">{scorecard.venue || "Venue not available"} • {scorecard.date || "Date not available"}</p>
        <div className="mt-2">
          <Badge variant="outline" className="mr-2 bg-gray-100">
            {scorecard.matchType?.toUpperCase() || "MATCH"}
          </Badge>
          <Badge variant={scorecard.status?.toLowerCase().includes("won") ? "default" : "secondary"}>
            {scorecard.status || "Status not available"}
          </Badge>
        </div>
      </div>

      {hasBatsmenData || hasBowlersData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Top Batsman */}
          {hasBatsmenData && (
            <Card className="p-4 border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-white">
              <div className="flex items-start">
                <div className="p-2 bg-blue-100 rounded-full mr-4">
                  <Star className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm uppercase text-blue-700 font-semibold tracking-wide">Top Batsman</h3>
                  <p className="text-xl font-bold text-gray-800 mt-1">{analysis.topBatsmen[0].name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {analysis.topBatsmen[0].runs} runs ({analysis.topBatsmen[0].balls} balls) • SR: {analysis.topBatsmen[0].strike_rate}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Top Bowler */}
          {hasBowlersData && (
            <Card className="p-4 border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-white">
              <div className="flex items-start">
                <div className="p-2 bg-green-100 rounded-full mr-4">
                  <Star className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm uppercase text-green-700 font-semibold tracking-wide">Top Bowler</h3>
                  <p className="text-xl font-bold text-gray-800 mt-1">{analysis.topBowlers[0].name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {analysis.topBowlers[0].wickets}/{analysis.topBowlers[0].runs} ({analysis.topBowlers[0].overs} overs) • Eco: {analysis.topBowlers[0].economy}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      ) : (
        <div className="mb-8 bg-amber-50 p-4 rounded-lg border border-amber-200">
          <p className="text-amber-800 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
            Limited player analysis available for this match
          </p>
        </div>
      )}

      <Tabs defaultValue="batsmen" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-2 mb-4">
          <TabsTrigger value="batsmen">Top Batsmen</TabsTrigger>
          <TabsTrigger value="bowlers">Top Bowlers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="batsmen" className="mt-0">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Runs</TableHead>
                  <TableHead className="text-right">Balls</TableHead>
                  <TableHead className="text-right">4s</TableHead>
                  <TableHead className="text-right">6s</TableHead>
                  <TableHead className="text-right">SR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hasBatsmenData ? (
                  analysis.topBatsmen.map((batsman: BattingStats, index: number) => (
                    <TableRow key={`${batsman.name}-${index}`}>
                      <TableCell className="font-medium">
                        {batsman.name}
                        {index === 0 && <Badge className="ml-2 bg-purple-100 text-purple-800 hover:bg-purple-200">Top Scorer</Badge>}
                      </TableCell>
                      <TableCell className="text-right">{batsman.runs}</TableCell>
                      <TableCell className="text-right">{batsman.balls}</TableCell>
                      <TableCell className="text-right">{batsman.fours}</TableCell>
                      <TableCell className="text-right">{batsman.sixes}</TableCell>
                      <TableCell className="text-right">{batsman.strike_rate}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                      No batting data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
        
        <TabsContent value="bowlers" className="mt-0">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Overs</TableHead>
                  <TableHead className="text-right">Runs</TableHead>
                  <TableHead className="text-right">Wickets</TableHead>
                  <TableHead className="text-right">Economy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hasBowlersData ? (
                  analysis.topBowlers.map((bowler: BowlingStats, index: number) => (
                    <TableRow key={`${bowler.name}-${index}`}>
                      <TableCell className="font-medium">
                        {bowler.name}
                        {index === 0 && <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">Top Bowler</Badge>}
                      </TableCell>
                      <TableCell className="text-right">{bowler.overs}</TableCell>
                      <TableCell className="text-right">{bowler.runs}</TableCell>
                      <TableCell className="text-right">{bowler.wickets}</TableCell>
                      <TableCell className="text-right">{bowler.economy}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                      No bowling data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MatchScorecardAnalysis;
