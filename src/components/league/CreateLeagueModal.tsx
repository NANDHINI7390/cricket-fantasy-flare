import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, ChevronRight, ChevronsLeft, Loader2, Trophy, Users, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createClient } from "@supabase/supabase-js";

type CreateLeagueModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Match = {
  match_id: string;
  team1_name: string;
  team2_name: string;
  time: string;
};

type Team = {
  team_id: string;
  name: string;
  players: string[]; // Array of player IDs
  captain_id: string;
  vice_captain_id: string;
};

type FormData = {
  leagueName: string;
  entryFee: number;
  totalSpots: number;
  matchId: string;
  teamId: string;
  isPublic: boolean;
};

type FormErrors = {
  leagueName?: string;
  entryFee?: string;
  totalSpots?: string;
  matchId?: string;
  teamId?: string;
};

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CreateLeagueModal = ({ open, onOpenChange }: CreateLeagueModalProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    leagueName: "",
    entryFee: 0,
    totalSpots: 2,
    matchId: "",
    teamId: "",
    isPublic: false,
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transitionClass, setTransitionClass] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  // Fetch matches
  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ["cricket-matches"],
    queryFn: async () => {
      // Replace with your actual API call
      const currentDate = new Date();
      return [
        {
          match_id: "m1",
          team1_name: "India",
          team2_name: "Pakistan",
          time: "Tomorrow, 2:30 PM",
        },
        {
          match_id: "m2",
          team1_name: "Australia",
          team2_name: "England",
          time: `${currentDate.getDate() + 1} Apr, 10:00 AM`,
        },
        {
          match_id: "m3",
          team1_name: "South Africa",
          team2_name: "New Zealand",
          time: `${currentDate.getDate() + 3} Apr, 3:00 PM`,
        },
      ] as Match[];
    },
  });

  // Fetch teams (mock data; replace with Supabase query)
  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ["fantasy-teams"],
    queryFn: async () => {
      // In a real app, fetch from Supabase
      return [
        { team_id: "t1", name: "Dream Team 1", players: [], captain_id: "", vice_captain_id: "" },
        { team_id: "t2", name: "Champions XI", players: [], captain_id: "", vice_captain_id: "" },
      ] as Team[];
    },
  });

  // Animation for step transition
  const applyStepTransition = (newStep: number) => {
    setTransitionClass("animate-fadeOut");
    setTimeout(() => {
      setStep(newStep);
      setTransitionClass("animate-fadeIn");
      setTimeout(() => setTransitionClass(""), 500);
      if (contentRef.current) {
        contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 300);
  };

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setStep(1);
      setFormData({
        leagueName: "",
        entryFee: 0,
        totalSpots: 2,
        matchId: "",
        teamId: "",
        isPublic: false,
      });
      setFormErrors({});
      setTransitionClass("");
    }
  }, [open]);

  // Add CSS animations
  useEffect(() => {
    if (!open) return;
    const styleElement = document.createElement("style");
    styleElement.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-20px); }
      }
      .animate-fadeIn {
        animation: fadeIn 0.4s ease-out forwards;
      }
      .animate-fadeOut {
        animation: fadeOut 0.3s ease-in forwards;
      }
    `;
    document.head.appendChild(styleElement);
    return () => document.head.removeChild(styleElement);
  }, [open]);

  // Form validation
  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};
    if (!formData.leagueName.trim()) {
      errors.leagueName = "League name is required";
    } else if (formData.leagueName.length > 50) {
      errors.leagueName = "League name must be 50 characters or less";
    }
    if (formData.entryFee < 0) {
      errors.entryFee = "Entry fee cannot be negative";
    }
    if (formData.totalSpots < 2) {
      errors.totalSpots = "Total spots must be at least 2";
    } else if (formData.totalSpots > 1000) {
      errors.totalSpots = "Total spots cannot exceed 1000";
    }
    if (!formData.matchId) {
      errors.matchId = "Please select a match";
    }
    if (!formData.teamId) {
      errors.teamId = "Please select a team";
    }
    return errors;
  };

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for the field when user starts typing
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error("User not authenticated");
      }

      const leagueData = {
        name: formData.leagueName,
        entry_fee: formData.entryFee,
        total_spots: formData.totalSpots,
        match_id: formData.matchId,
        team_id: formData.teamId,
        is_public: formData.isPublic,
        creator_id: userData.user.id,
        created_at: new Date().toISOString(),
        invite_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      };

      const { error } = await supabase.from("leagues").insert([leagueData]);
      if (error) {
        throw new Error(error.message);
      }

      toast.success("League created successfully!");
      applyStepTransition(2); // Move to success step
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create league");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className={`space-y-6 ${transitionClass}`}>
            {/* League Name */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-indigo-600" />
                <Label htmlFor="league-name" className="text-base font-semibold">League Name</Label>
              </div>
              <Input
                id="league-name"
                placeholder="Enter your league name"
                value={formData.leagueName}
                onChange={(e) => handleInputChange("leagueName", e.target.value)}
                className={`h-12 bg-white border-gray-200 ${formErrors.leagueName ? "border-red-500" : ""}`}
              />
              {formErrors.leagueName && (
                <p className="text-sm text-red-500">{formErrors.leagueName}</p>
              )}
            </div>

            {/* Entry Fee */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                <Label htmlFor="entry-fee" className="text-base font-semibold">Entry Fee</Label>
              </div>
              <Input
                id="entry-fee"
                type="number"
                placeholder="Enter entry fee (0 for free)"
                value={formData.entryFee}
                onChange={(e) => handleInputChange("entryFee", Number(e.target.value))}
                className={`h-12 bg-white border-gray-200 ${formErrors.entryFee ? "border-red-500" : ""}`}
              />
              {formErrors.entryFee && (
                <p className="text-sm text-red-500">{formErrors.entryFee}</p>
              )}
            </div>

            {/* Total Spots */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                <Label htmlFor="total-spots" className="text-base font-semibold">Total Spots</Label>
              </div>
              <Input
                id="total-spots"
                type="number"
                placeholder="Enter total spots (min 2)"
                value={formData.totalSpots}
                onChange={(e) => handleInputChange("totalSpots", Number(e.target.value))}
                className={`h-12 bg-white border-gray-200 ${formErrors.totalSpots ? "border-red-500" : ""}`}
              />
              {formErrors.totalSpots && (
                <p className="text-sm text-red-500">{formErrors.totalSpots}</p>
              )}
            </div>

            {/* League Visibility */}
            <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                <Label htmlFor="public-league" className="text-base font-semibold">League Visibility</Label>
              </div>
              <div className="flex items-center space-x-2 bg-white p-3 rounded-md border border-gray-200">
                <Switch
                  id="public-league"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => handleInputChange("isPublic", checked)}
                />
                <div>
                  <Label htmlFor="public-league" className="font-medium">
                    {formData.isPublic ? "Public League" : "Private League"}
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.isPublic
                      ? "Anyone can find and join this league"
                      : "Only people with the invite link can join"}
                  </p>
                </div>
              </div>
            </div>

            {/* Match Selection */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                <Label htmlFor="match-select" className="text-base font-semibold">Select Match</Label>
              </div>
              <Select
                onValueChange={(value) => handleInputChange("matchId", value)}
                value={formData.matchId}
              >
                <SelectTrigger className={`h-12 bg-white border-gray-200 ${formErrors.matchId ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Select a match" />
                </SelectTrigger>
                <SelectContent className="bg-white max-h-[300px]">
                  {matchesLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <span>Loading matches...</span>
                    </div>
                  ) : (
                    matches?.map((match) => (
                      <SelectItem key={match.match_id} value={match.match_id} className="py-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{match.team1_name} vs {match.team2_name}</span>
                          <span className="text-xs text-gray-500">{match.time}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {formErrors.matchId && (
                <p className="text-sm text-red-500">{formErrors.matchId}</p>
              )}
            </div>

            {/* Team Selection */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                <Label htmlFor="team-select" className="text-base font-semibold">Select Team</Label>
              </div>
              <Select
                onValueChange={(value) => handleInputChange("teamId", value)}
                value={formData.teamId}
              >
                <SelectTrigger className={`h-12 bg-white border-gray-200 ${formErrors.teamId ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent className="bg-white max-h-[300px]">
                  {teamsLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <span>Loading teams...</span>
                    </div>
                  ) : (
                    teams?.map((team) => (
                      <SelectItem key={team.team_id} value={team.team_id} className="py-3">
                        <span className="font-medium">{team.name}</span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {formErrors.teamId && (
                <p className="text-sm text-red-500">{formErrors.teamId}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className={`space-y-6 text-center ${transitionClass}`}>
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <Check className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">League Created!</h3>
            <p className="text-gray-600">Your league has been successfully created. Invite friends to join!</p>
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full py-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
            >
              Done
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 bg-white rounded-xl shadow-xl">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4">
          <DialogTitle className="text-lg font-bold text-center">
            {step === 1 ? "Create Your Fantasy League" : "Success"}
          </DialogTitle>
        </div>
        <ScrollArea className="max-h-[70vh] p-6" ref={contentRef}>
          {renderStep()}
        </ScrollArea>
        {step === 1 && (
          <div className="flex justify-between p-4 border-t bg-gray-50">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-28 border-gray-300 bg-white hover:bg-gray-100"
            >
              <X className="h-4 w-4 mr-1.5" />
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-28 bg-indigo-600 hover:bg-indigo-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create
                  <ChevronRight className="h-4 w-4 ml-1.5" />
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateLeagueModal;