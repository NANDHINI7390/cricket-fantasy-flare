import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, ChevronRight, Loader2, Trophy, Users, X, ArrowLeft } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch"; // Assuming you have a Switch component
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
    matchId: "m1", // Setting default values to avoid errors, will be fixed later
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
    }
  }, [open]);

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateStep = (step: number): FormErrors => {
    let errors: FormErrors = {};

    switch (step) {
      case 1:
        if (!formData.leagueName.trim()) {
          errors.leagueName = "League name is required";
        } else if (formData.leagueName.length > 50) {
          errors.leagueName = "Max 50 characters";
        }
        if (formData.entryFee < 0) {
          errors.entryFee = "Entry fee cannot be negative";
        }
        if (formData.totalSpots < 2) {
          errors.totalSpots = "Minimum 2 spots";
        } else if (formData.totalSpots > 1000) {
          errors.totalSpots = "Maximum 1000 spots";
        }
        break;
      case 2:
        if (!formData.matchId) {
          errors.matchId = "Select a match";
        }
        break;
      case 3:
        if (!formData.teamId) {
          errors.teamId = "Select a team";
        }
        break;
    }

    return errors;
  };

  const handleNext = () => {
    const errors = validateStep(step);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fix the errors in the form");
    } else {
      setStep(step + 1);
      setFormErrors({}); // Clear errors when moving to the next step
    }
  };

  const handlePrevious = () => setStep(step - 1);

  // Handle form submission using localStorage
  const handleSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fix the errors in the form");
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

      setStep(4); // Move to success step
      toast.success("League created successfully!");
    } catch (error: any) {
      toast.error("Failed to create league");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1: // League Details
        return (
          <div className="space-y-4">
            {/* League Name */}
            <div className="space-y-2">
              <Label htmlFor="league-name" className="flex items-center gap-2 text-base font-semibold">
                <Trophy className="h-5 w-5 text-indigo-600" />
                League Name
              </Label>
              <Input
                id="league-name"
                placeholder="Enter league name"
                value={formData.leagueName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("leagueName", e.target.value)
                }
                className={formErrors.leagueName ? "border-red-500" : ""}
              />
            </div>

            {/* Entry Fee */}
            <div className="space-y-2">
              <Label htmlFor="entry-fee" className="flex items-center gap-2 text-base font-semibold">
                <Users className="h-5 w-5 text-indigo-600" />
                Entry Fee
              </Label>
              <Input
                id="entry-fee"
                type="number"
                placeholder="Enter fee (0 for free)"
                value={formData.entryFee}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("entryFee", Number(e.target.value))
                }
                className={formErrors.entryFee ? "border-red-500" : ""}
              />
            </div>

            {/* Total Spots */}
            <div className="space-y-2">
              <Label htmlFor="total-spots" className="flex items-center gap-2 text-base font-semibold">
                <Users className="h-5 w-5 text-indigo-600" />
                Total Spots
              </Label>
              <Input
                id="total-spots"
                type="number"
                placeholder="Enter spots (min 2)"
                value={formData.totalSpots}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("totalSpots", Number(e.target.value))
                }
                className={formErrors.totalSpots ? "border-red-500" : ""}
              />
            </div>

            {/* Public/Private League */}
            <div className="flex items-center justify-between">
              <Label htmlFor="isPublic" className="text-base font-semibold">
                League Type
              </Label>
              <div className="flex items-center space-x-2">
                <Switch id="isPublic" checked={formData.isPublic} onCheckedChange={(checked) => handleInputChange("isPublic", checked)} />
                <Label htmlFor="isPublic" className="text-sm text-gray-500">
                  {formData.isPublic ? "Public" : "Private"}
                </Label>
              </div>
            </div>
          </div>
        );

      case 2: // Match Selection
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="matchId" className="text-base font-semibold">
                Select Match
              </Label>
              <Select
                onValueChange={(value: string) => handleInputChange("matchId", value)}
                defaultValue={formData.matchId}
              >
                <SelectTrigger className={formErrors.matchId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a match" />
                </SelectTrigger>
                <SelectContent>
                  {matchesLoading ? (
                    <SelectItem value="" disabled>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading matches...
                    </SelectItem>
                  ) : matches ? (
                    matches.map((match: Match) => (
                      <SelectItem key={match.match_id} value={match.match_id}>
                        {match.team1_name} vs {match.team2_name} ({match.time})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      Failed to load matches
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {formErrors.matchId && (
                <p className="text-red-500 text-sm mt-1">{formErrors.matchId}</p>
              )}
            </div>
          </div>
        );

      case 3: // Team Selection
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teamId" className="text-base font-semibold">
                Select Team
              </Label>
              <Select
                onValueChange={(value: string) => handleInputChange("teamId", value)}
                defaultValue={formData.teamId}
              >
                <SelectTrigger className={formErrors.teamId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  {teamsLoading ? (
                    <SelectItem value="" disabled>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading teams...
                    </SelectItem>
                  ) : teams ? (
                    teams.map((team: Team) => (
                      <SelectItem key={team.team_id} value={team.team_id}>
                        {team.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      Failed to load teams
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {formErrors.teamId && (
                <p className="text-red-500 text-sm mt-1">{formErrors.teamId}</p>
              )}
            </div>
          </div>
        );

      case 4: // Confirmation
        const selectedMatch = matches?.find((match) => match.match_id === formData.matchId);
        const selectedTeam = teams?.find((team) => team.team_id === formData.teamId);

        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Confirm League Details</h3>
            <div className="rounded-md bg-gray-50 p-4">
              <p>
                <strong>League Name:</strong> {formData.leagueName}
              </p>
              <p>
                <strong>Entry Fee:</strong> {formData.entryFee}
              </p>
              <p>
                <strong>Total Spots:</strong> {formData.totalSpots}
              </p>
              <p>
                <strong>Visibility:</strong> {formData.isPublic ? "Public" : "Private"}
              </p>
              {selectedMatch && (
                <p>
                  <strong>Match:</strong> {selectedMatch.team1_name} vs {selectedMatch.team2_name}
                </p>
              )}
              {selectedTeam && (
                <p>
                  <strong>Team:</strong> {selectedTeam.name}
                </p>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="mt-4">Loading...</p>
          </div>
        );
    }
  };

  const stepTitles = ["League Details", "Select Match", "Select Team", "Confirm"];

  const renderProgressBar = () => (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
      <div
        className="bg-indigo-600 h-2.5 rounded-full"
        style={{ width: `${((step - 1) / (stepTitles.length - 1)) * 100}%` }}
      ></div>
    </div>
  );

  const renderNavigationButtons = () => (
    <div className="flex justify-between mt-6">
      {step > 1 && (
        <Button variant="outline" onClick={handlePrevious}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
      )}

      {step < stepTitles.length ? (
        <Button onClick={handleNext} disabled={isSubmitting}>
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create League"
          )}
        </Button>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogContent className="sm:max-w-[500px] p-6 bg-white rounded-lg shadow-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-center">
                  {stepTitles[step - 1]}
                </DialogTitle>
              </DialogHeader>

              {renderProgressBar()}

              <ScrollArea className="max-h-[400px] py-2">
                {renderStep()}
              </ScrollArea>

              {Object.keys(formErrors).length > 0 && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                  <ul>
                    {Object.values(formErrors).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {step !== 4 ? renderNavigationButtons() : (
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create League"
                    )}
                  </Button>
                </div>
              )}

              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 text-center"
                />
              )}
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default CreateLeagueModal;
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-6"
          >
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold">League Created!</h3>
            <p className="text-gray-600">Your league is ready. Invite friends to join!</p>
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full py-6 bg-indigo-600 hover:bg-indigo-700"
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
          <DialogContent className="sm:max-w-[500px] p-0 bg-white rounded-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-indigo-600 text-white p-4">
                <h2 className="text-lg font-bold text-center">
                  {step === 1 ? "Create League" : "Success"}
                </h2>
              </div>
              <ScrollArea className="max-h-[70vh] p-6" ref={contentRef}>
                {renderStep()}
              </ScrollArea>
              {step === 1 && (
                <div className="flex justify-between p-4 border-t bg-gray-50">
                  <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="w-28"
                  >
                    <X className="h-4 w-4 mr-2" />
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
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
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