
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, User, CreditCard, Trophy, LogOut } from "lucide-react";
import { captureAuthError } from "@/integrations/sentry/config";

interface UserProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  email: string | null;
  wallet_balance?: number;
  contests_joined?: number;
  contests_won?: number;
}

const Profile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        
        // Get the current user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw userError;
        }
        
        if (!userData.user) {
          toast.error("Please sign in to view your profile");
          navigate("/auth");
          return;
        }
        
        setEmail(userData.user.email || "");
        
        // Get the user profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userData.user.id)
          .single();
        
        if (profileError && profileError.code !== "PGRST116") {
          throw profileError;
        }
        
        // For now, we'll mock some wallet and contest data until we implement those tables
        const userProfile: UserProfile = {
          id: userData.user.id,
          username: profileData?.username || null,
          avatar_url: profileData?.avatar_url || null,
          email: userData.user.email,
          wallet_balance: 0, // Mock data - will be replaced with real data later
          contests_joined: 0, // Mock data - will be replaced with real data later
          contests_won: 0, // Mock data - will be replaced with real data later
        };
        
        setProfile(userProfile);
        setUsername(userProfile.username || "");
      } catch (error) {
        console.error("Error fetching profile:", error);
        captureAuthError(
          error instanceof Error ? error : new Error("Failed to fetch profile"),
          { source: "Profile Page" }
        );
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [navigate]);

  const handleUpdateProfile = async () => {
    if (!profile) return;
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from("profiles")
        .update({ username })
        .eq("id", profile.id);
        
      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, username } : null);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      captureAuthError(
        error instanceof Error ? error : new Error("Failed to update profile"),
        { source: "Profile Update" }
      );
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      captureAuthError(
        error instanceof Error ? error : new Error("Failed to sign out"),
        { source: "Profile Logout" }
      );
      toast.error("Failed to log out");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1A1F2C] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1F2C] py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-white mb-8">My Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="bg-[#2A2F3C] text-white border-none shadow-lg">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription className="text-gray-400">
                  Update your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={email}
                    disabled
                    className="bg-[#3A3F4C] border-[#4A4F5C] text-white"
                  />
                  <p className="text-xs text-gray-400">
                    Email cannot be changed
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-[#3A3F4C] border-[#4A4F5C] text-white"
                    placeholder="Choose a username"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="bg-transparent border-gray-600 text-white hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateProfile}
                  disabled={isSaving}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card className="bg-[#2A2F3C] text-white border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Wallet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold">₹{profile?.wallet_balance || 0}</p>
                  <p className="text-gray-400 mt-1">Available Balance</p>
                </div>
                <div className="mt-4">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Add Money
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#2A2F3C] text-white border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="mr-2 h-5 w-5" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-[#3A3F4C] rounded-lg">
                    <p className="text-gray-400 text-sm">Contests Joined</p>
                    <p className="text-xl font-bold">{profile?.contests_joined || 0}</p>
                  </div>
                  <div className="text-center p-3 bg-[#3A3F4C] rounded-lg">
                    <p className="text-gray-400 text-sm">Contests Won</p>
                    <p className="text-xl font-bold">{profile?.contests_won || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
