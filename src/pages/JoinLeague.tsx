
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronsLeft, Loader2, Shield, Trophy } from "lucide-react";
import { toast } from "sonner";
import PageNavigation from "@/components/PageNavigation";

const JoinLeague = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [league, setLeague] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    // In a real app, fetch league details from API/database
    setTimeout(() => {
      const savedLeagues = JSON.parse(localStorage.getItem('fantasy_leagues') || '[]');
      const foundLeague = savedLeagues.find((l: any) => l.inviteCode === code);
      
      if (foundLeague) {
        setLeague(foundLeague);
      }
      
      setLoading(false);
    }, 1000);
  }, [code]);

  const handleJoinLeague = async () => {
    setJoining(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, save to database
      toast.success("Successfully joined the league!");
      navigate("/my-teams");
    } catch (error) {
      console.error(error);
      toast.error("Failed to join league");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4">
        <PageNavigation className="mb-4" />
        
        <div className="max-w-3xl mx-auto mt-8">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ChevronsLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          
          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
              <p className="mt-4 text-gray-500">Loading league details...</p>
            </div>
          ) : !league ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">League Not Found</h2>
              <p className="text-gray-500 mb-6">
                The league you're looking for doesn't exist or the invite code is invalid.
              </p>
              <Button
                onClick={() => navigate("/")}
              >
                Return to Home
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-6 text-white">
                <h1 className="text-2xl font-bold">{league.name}</h1>
                <p className="opacity-80">Invitation Code: {code}</p>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">League Details</h2>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span className="text-gray-500">League Type:</span>
                      <span>{league.isPublic ? "Public" : "Private"}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Created:</span>
                      <span>{new Date(league.createdAt).toLocaleDateString()}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Match:</span>
                      <span>{league.team?.match_id}</span>
                    </li>
                  </ul>
                </div>
                
                <div className="border-t pt-6">
                  <Button
                    onClick={handleJoinLeague}
                    className="w-full"
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
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinLeague;
