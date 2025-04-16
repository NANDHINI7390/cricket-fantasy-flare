import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, ChevronRight, Loader2, Trophy, Users, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

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

// Mock user ID (since we can't use Supabase auth)
const MOCK_USER_ID = "user-123";

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
  const contentRef = useRef<HTMLDivElement>(null);

  // Fetch matches (mock data; no API needed)
  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ["cricket-matches"],
    queryFn: async () => {
      const currentDate = new Date();
      return [
        { match_id: "m1", team1_name: "India", team2_name: "Pakistan", time: "Tomorrow, 2:30 PM" },
        { match_id: "m2", team1_name: "Australia", team2_name: "England", time: `${currentDate.getDate() + 1} Apr, 10:00 AM` },
        { match_id: "m3", team1_name: "South Africa", team2_name: "New Zealand", time: `${currentDate.getDate() + 3} Apr, 3:00 PM` },
      ] as Match[];
    },
  });

  // Fetch teams (mock data; no API needed)
  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ["fantasy-teams"],
    queryFn: async () => {
      return [
        { team_id: "t1", name: "Dream Team 1" },
        { team_id: "t2", name: "Champions XI" },
      ] as Team[];
    },
  });

  // Reset form and scroll to top when modal opens
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
      // Scroll to top when modal opens
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 100);
    }
  }, [open]);

  // Scroll to top when step changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [step]);

  // Validate form inputs
  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};
    if (!formData.leagueName.trim()) errors.leagueName = "League name is required";
    else if (formData.leagueName.length > 50) errors.leagueName = "Max 50 characters";
    if (formData.entryFee < 0) errors.entryFee = "Entry fee cannot be negative";
    if (formData.totalSpots < 2) errors.totalSpots = "Minimum 2 spots";
    else if (formData.totalSpots > 1000) errors.totalSpots = "Maximum 1000 spots";
    if (!formData.matchId) errors.matchId = "Select a match";
    if (!formData.teamId) errors.teamId = "Select a team";
    return errors;
  };

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Handle form submission using localStorage
  const handleSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fix the errors in the form");
      // Scroll to the first error
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.getElementById(`${firstErrorField}-input`);
      if (errorElement && contentRef.current) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Prepare league data
      const leagueData = {
        id: Math.random().toString(36).substring(2, 9),
        name: formData.leagueName,
        entry_fee: formData.entryFee,
        total_spots: formData.totalSpots,
        match_id: formData.matchId,
        team_id: formData.teamId,
        is_public: formData.isPublic,
        creator_id: MOCK_USER_ID,
        invite_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        created_at: new Date().toISOString(),
      };

      // Save to localStorage
      const existingLeagues = JSON.parse(localStorage.getItem("fantasy_leagues") || "[]");
      existingLeagues.push(leagueData);
      localStorage.setItem("fantasy_leagues", JSON.stringify(existingLeagues));

      toast.success("League created successfully!");
      setStep(2); // Move to success step
    } catch (error: any) {
      toast.error("Failed to create league");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
   
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            {/* League Name */}
            <div className="space-y-1">
              <Label htmlFor="league-name-input" className="flex items-center gap-2 text-base font-semibold">
                <Trophy className="h-5 w-5 text-indigo-600" />
                League Name
              </Label>
              <Input
                id="league-name-input"
                placeholder="Enter league name"
                value={formData.leagueName}
                onChange={(e) => handleInputChange("leagueName", e.target.value)}
                className={`h-10 ${formErrors.leagueName ? "border-red-500" : ""}`}
              />
              {formErrors.leagueName && <p className="text-sm text-red-500">{formErrors.leagueName}</p>}
            </div>

            {/* Entry Fee */}
            <div className="space-y-1">
              <Label htmlFor="entry-fee-input" className="flex items-center gap-2 text-base font-semibold">
                <Users className="h-5 w-5 text-indigo-600" />
                Entry Fee
              </Label>
              <Input
                id="entry-fee-input"
                type="number"
                placeholder="Enter fee (0 for free)"
                value={formData.entryFee}
                onChange={(e) => handleInputChange("entryFee", Number(e.target.value))}
                className={`h-10 ${formErrors.entryFee ? "border-red-500" : ""}`}
              />
              {formErrors.entryFee && <p className="text-sm text-red-500">{formErrors.entryFee}</p>}
            </div>

            {/* Total Spots */}
            <div className="space-y-1">
              <Label htmlFor="total-spots-input" className="flex items-center gap-2 text-base font-semibold">
                <Users className="h-5 w-5 text-indigo-600" />
                Total Spots
              </Label>
              <Input
                id="total-spots-input"
                type="number"
                placeholder="Enter spots (min 2)"
                value={formData.totalSpots}
                onChange={(e) => handleInputChange("totalSpots", Number(e.target.value))}
                className={`h-10 ${formErrors.totalSpots ? "border-red-500" : ""}`}
              />
              {formErrors.totalSpots && <p className="text-sm text-red-500">{formErrors.totalSpots}</p>}
            </div>

            {/* League Visibility */}
            <div className="space-y-1 bg-gray-50 p-3 rounded-lg">
              <Label htmlFor="public-league" className="flex items-center gap-2 text-base font-semibold">
                <Users className="h-5 w-5 text-indigo-600" />
                League Visibility
              </Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="public-league"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => handleInputChange("isPublic", checked)}
                />
                <div>
                  <Label htmlFor="public-league">{formData.isPublic ? "Public" : "Private"}</Label>
                  <p className="text-sm text-gray-500">
                    {formData.isPublic ? "Open to all" : "Invite-only"}
                  </p>
                </div>
              </div>
            </div>

            {/* Match Selection */}
            <div className="space-y-1">
              <Label htmlFor="match-select-input" className="flex items-center gap-2 text-base font-semibold">
                <Users className="h-5 w-5 text-indigo-600" />
                Select Match
              </Label>
              <Select onValueChange={(value) => handleInputChange("matchId", value)} value={formData.matchId}>
                <SelectTrigger className={`h-10 ${formErrors.matchId ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Choose a match" />
                </SelectTrigger>
                <SelectContent>
                  {matchesLoading ? (
                    <div className="p-4 flex items-center">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Loading...
                    </div>
                  ) : (
                    matches?.map((match) => (
                      <SelectItem key={match.match_id} value={match.match_id}>
                        {match.team1_name} vs {match.team2_name} - {match.time}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {formErrors.matchId && <p className="text-sm text-red-500">{formErrors.matchId}</p>}
            </div>

            {/* Team Selection */}
            <div className="space-y-1">
              <Label htmlFor="team-select-input" className="flex items-center gap-2 text-base font-semibold">
                <Users className="h-5 w-5 text-indigo-600" />
                Select Team
              </Label>
              <Select onValueChange={(value) => handleInputChange("teamId", value)} value={formData.teamId}>
                <SelectTrigger className={`h-10 ${formErrors.teamId ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Choose a team" />
                </SelectTrigger>
                <SelectContent>
                  {teamsLoading ? (
                    <div className="p-4 flex items-center">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Loading...
                    </div>
                  ) : (
                    teams?.map((team) => (
                      <SelectItem key={team.team_id} value={team.team_id}>
                        {team.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {formErrors.teamId && <p className="text-sm text-red-500">{formErrors.teamId}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4"
          >
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold">League Created!</h3>
            <p className="text-gray-600">Your league is ready. Invite friends to join!</p>
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-700"
            >
              Done
            </Button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogContent className="sm:max-w-[500px] p-0 bg-white rounded-xl max-h-[85vh] flex flex-col">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col h-full"
            >
              {/* Header */}
              <div className="bg-indigo-600 text-white p-3">
                <h2 className="text-lg font-bold text-center">
                  {step === 1 ? "Create League" : "Success"}
                </h2>
              </div>

              {/* Scrollable Content */}
              <ScrollArea className="flex-1 p-4 sm:p-6" ref={contentRef}>
                {renderStep()}
              </ScrollArea>

              {/* Footer */}
              {step === 1 && (
                <div className="p-3 border-t bg-gray-50">
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      className="w-24 sm:w-28"
                    >
                      <X className="h-4 w-4 mr-1 sm:mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-24 sm:w-28 bg-indigo-600 hover:bg-indigo-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 sm:mr-2 animate-spin" />
                          Creating
                        </>
                      ) : (
                        <>
                          Create
                          <ChevronRight className="h-4 w-4 ml-1 sm:ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default CreateLeagueModal;