import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, ChevronRight, Loader2, Trophy, Users, X, ArrowLeft, Calendar, Shield } from "lucide-react";
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

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ["fantasy-teams"],
    queryFn: async () => {
      return [
        { team_id: "t1", name: "Dream Team 1" },
        { team_id: "t2", name: "Champions XI" },
      ] as Team[];
    },
  });

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
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 100);
    }
  }, [open]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [step]);

  const handleInputChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateStep = (step: number): FormErrors => {
    let errors: FormErrors = {};
    switch (step) {
      case 1:
        if (!formData.leagueName.trim()) errors.leagueName = "League name is required";
        else if (formData.leagueName.length > 50) errors.leagueName = "Max 50 characters";
        if (formData.entryFee < 0) errors.entryFee = "Entry fee cannot be negative";
        if (formData.totalSpots < 2) errors.totalSpots = "Minimum 2 spots";
        else if (formData.totalSpots > 1000) errors.totalSpots = "Maximum 1000 spots";
        break;
      case 2:
        if (!formData.matchId) errors.matchId = "Select a match";
        break;
      case 3:
        if (!formData.teamId) errors.teamId = "Select a team";
        break;
    }
    return errors;
  };

  const handleNext = () => {
    const errors = validateStep(step);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fix the errors in the form");
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.getElementById(`${firstErrorField}`);
      if (errorElement && contentRef.current) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      setStep(step + 1);
      setFormErrors({});
    }
  };

  const handlePrevious = () => setStep(step - 1);

  const handleSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fix the errors in the form");
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.getElementById(`${firstErrorField}`);
      if (errorElement && contentRef.current) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
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

      const existingLeagues = JSON.parse(localStorage.getItem("fantasy_leagues") || "[]");
      existingLeagues.push(leagueData);
      localStorage.setItem("fantasy_leagues", JSON.stringify(existingLeagues));

      onOpenChange(false);
      toast.success("League created successfully!");
    } catch (error: any) {
      toast.error("Failed to create league");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-5 bg-white p-5 rounded-xl shadow-md border border-gray-100"
          >
            <div className="space-y-2">
              <Label htmlFor="league-name" className="flex items-center gap-2 text-base font-semibold text-gray-800">
                <Trophy className="h-5 w-5 text-teal-500" />
                League Name
              </Label>
              <Input
                id="league-name"
                placeholder="e.g. Ultimate Cricket Showdown"
                value={formData.leagueName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("leagueName", e.target.value)
                }
                className={`h-11 border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 rounded-lg transition-all ${
                  formErrors.leagueName ? "border-red-500" : ""
                }`}
              />
              {formErrors.leagueName && <p className="text-red-500 text-sm mt-1">{formErrors.leagueName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry-fee" className="flex items-center gap-2 text-base font-semibold text-gray-800">
                <Users className="h-5 w-5 text-teal-500" />
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
                className={`h-11 border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 rounded-lg transition-all ${
                  formErrors.entryFee ? "border-red-500" : ""
                }`}
              />
              {formErrors.entryFee && <p className="text-red-500 text-sm mt-1">{formErrors.entryFee}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="total-spots" className="flex items-center gap-2 text-base font-semibold text-gray-800">
                <Users className="h-5 w-5 text-teal-500" />
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
                className={`h-11 border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 rounded-lg transition-all ${
                  formErrors.totalSpots ? "border-red-500" : ""
                }`}
              />
              {formErrors.totalSpots && <p className="text-red-500 text-sm mt-1">{formErrors.totalSpots}</p>}
            </div>

            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <Label htmlFor="isPublic" className="flex items-center gap-2 text-base font-semibold text-gray-800">
                <Shield className="h-5 w-5 text-teal-500" />
                League Type
              </Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => handleInputChange("isPublic", checked)}
                  className="data-[state=checked]:bg-teal-500"
                />
                <Label htmlFor="isPublic" className="text-sm text-gray-600">
                  {formData.isPublic ? "Public" : "Private"}
                </Label>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-5 bg-white p-5 rounded-xl shadow-md border border-gray-100"
          >
            <div className="space-y-2">
              <Label htmlFor="matchId" className="flex items-center gap-2 text-base font-semibold text-gray-800">
                <Calendar className="h-5 w-5 text-teal-500" />
                Select Match
              </Label>
              <Select
                onValueChange={(value: string) => handleInputChange("matchId", value)}
                defaultValue={formData.matchId}
              >
                <SelectTrigger
                  className={`h-11 border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 rounded-lg transition-all ${
                    formErrors.matchId ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select a match" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                  {matchesLoading ? (
                    <SelectItem value="" disabled className="bg-white hover:bg-gray-100 px-4 py-2">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                      Loading matches...
                    </SelectItem>
                  ) : matches ? (
                    matches.map((match: Match) => (
                      <SelectItem
                        className="bg-white hover:bg-gray-100 px-4 py-2 transition-colors"
                        key={match.match_id}
                        value={match.match_id}
                      >
                        {match.team1_name} vs {match.team2_name} ({match.time})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled className="bg-white hover:bg-gray-100 px-4 py-2">
                      Failed to load matches
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {formErrors.matchId && <p className="text-red-500 text-sm mt-1">{formErrors.matchId}</p>}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-5 bg-white p-5 rounded-xl shadow-md border border-gray-100"
          >
            <div className="space-y-2">
              <Label htmlFor="teamId" className="flex items-center gap-2 text-base font-semibold text-gray-800">
                <Users className="h-5 w-5 text-teal-500" />
                Select Team
              </Label>
              <Select
                onValueChange={(value: string) => handleInputChange("teamId", value)}
                defaultValue={formData.teamId}
              >
                <SelectTrigger
                  className={`h-11 border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 rounded-lg transition-all ${
                    formErrors.teamId ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                  {teamsLoading ? (
                    <SelectItem value="" disabled className="bg-white hover:bg-gray-100 px-4 py-2">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                      Loading teams...
                    </SelectItem>
                  ) : teams ? (
                    teams.map((team: Team) => (
                      <SelectItem
                        className="bg-white hover:bg-gray-100 px-4 py-2 transition-colors"
                        key={team.team_id}
                        value={team.team_id}
                      >
                        {team.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled className="bg-white hover:bg-gray-100 px-4 py-2">
                      Failed to load teams
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {formErrors.teamId && <p className="text-red-500 text-sm mt-1">{formErrors.teamId}</p>}
            </div>
          </motion.div>
        );

      case 4:
        const selectedMatch = matches?.find((match) => match.match_id === formData.matchId);
        const selectedTeam = teams?.find((team) => team.team_id === formData.teamId);

        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-5 bg-white p-5 rounded-xl shadow-md border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Check className="h-5 w-5 text-teal-500" />
              Confirm League Details
            </h3>
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-5 rounded-lg shadow-inner">
              <div className="space-y-3 text-gray-700">
                <p className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-teal-500" />
                  <strong>League Name:</strong> {formData.leagueName}
                </p>
                <p className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-teal-500" />
                  <strong>Entry Fee:</strong> ₹{formData.entryFee}
                </p>
                <p className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-teal-500" />
                  <strong>Total Spots:</strong> {formData.totalSpots}
                </p>
                <p className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-teal-500" />
                  <strong>Visibility:</strong> {formData.isPublic ? "Public" : "Private"}
                </p>
                {selectedMatch && (
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-teal-500" />
                    <strong>Match:</strong> {selectedMatch.team1_name} vs {selectedMatch.team2_name}
                  </p>
                )}
                {selectedTeam && (
                  <p className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-teal-500" />
                    <strong>Team:</strong> {selectedTeam.name}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        );

      default:
        return (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-teal-500" />
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        );
    }
  };

  const stepTitles = ["League Details", "Select Match", "Select Team", "Confirm"];

  const renderProgressBar = () => (
    <div className="relative w-full h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
      <motion.div
        className="absolute h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"
        initial={{ width: "0%" }}
        animate={{ width: `${((step - 1) / (stepTitles.length - 1)) * 100}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 flex justify-between items-center">
        {stepTitles.map((_, index) => (
          <div
            key={index}
            className={`w-5 h-5 rounded-full border-2 ${
              index + 1 <= step ? "bg-teal-500 border-teal-500" : "bg-white border-gray-300"
            } ${index === 0 ? "ml-1" : index === stepTitles.length - 1 ? "mr-1" : ""}`}
          />
        ))}
      </div>
    </div>
  );

  const renderNavigationButtons = () => (
    <div className="flex justify-between mt-6 gap-3">
      {step > 1 && (
        <Button
          variant="outline"
          onClick={handlePrevious}
          className="flex-1 h-11 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
      )}
      {step < stepTitles.length ? (
        <Button
          onClick={handleNext}
          disabled={isSubmitting || Object.keys(validateStep(step)).length > 0}
          className="flex-1 h-11 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white rounded-lg shadow-md transition-all"
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || Object.keys(validateForm()).length > 0}
          className="flex-1 h-11 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg shadow-md transition-all"
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
          <DialogContent className="sm:max-w-[550px] p-0 bg-transparent rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col h-full bg-white rounded-2xl"
            >
              {/* Gradient Header */}
              <DialogHeader className="relative bg-gradient-to-r from-teal-500 to-blue-500 p-4 rounded-t-2xl">
                <DialogTitle className="text-xl font-bold text-white text-center">
                  {stepTitles[step - 1]}
                </DialogTitle>
                <Button
                  variant="ghost"
                  className="absolute right-3 top-3 text-white hover:bg-white/20 p-1 rounded-full"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </DialogHeader>

              {/* Progress Bar */}
              <div className="px-6 pt-4">{renderProgressBar()}</div>

              {/* Scrollable Content */}
              <ScrollArea className="flex-1 px-6 pb-4" ref={contentRef}>
                {renderStep()}
              </ScrollArea>

              {/* Error Messages */}
              {Object.keys(formErrors).length > 0 && (
                <div className="px-6 pb-4">
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg shadow-sm">
                    <ul className="list-disc list-inside">
                      {Object.values(formErrors).map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Fixed Footer */}
              <div className="p-4 bg-gray-50 rounded-b-2xl border-t border-gray-200">
                {renderNavigationButtons()}
              </div>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default CreateLeagueModal;
