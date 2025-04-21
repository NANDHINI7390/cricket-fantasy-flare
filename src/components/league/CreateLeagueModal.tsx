import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";

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
  const navigate = useNavigate();

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
    console.log("Step:", step, "Validation errors:", errors);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please correct the errors to continue", {
        description: Object.values(errors).join(", "),
      });
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
    console.log("Submit validation errors:", errors);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please correct the errors to create the league", {
        description: Object.values(errors).join(", "),
      });
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
      toast.success("League created successfully!", {
        description: `Invite code: ${leagueData.invite_code}`,
      });
      navigate("/leagues");
    } catch (error: any) {
      toast.error("Failed to create league");
    } finally{
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
          <div className="space-y-3 p-3">
            <div>
              <Label htmlFor="league-name" className="text-base font-medium text-gray-700">
                League Name
              </Label>
              <Input
                id="league-name"
                placeholder="Enter league name"
                value={formData.leagueName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("leagueName", e.target.value)
                }
                className={`mt-1 h-10 border-gray-300 focus:border-teal-500 rounded-md ${
                  formErrors.leagueName ? "border-red-500" : ""
                }`}
              />
              {formErrors.leagueName && (
                <p className="text-red-500 text-sm mt-1">{formErrors.leagueName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="entry-fee" className="text-base font-medium text-gray-700">
                Entry Fee (₹)
              </Label>
              <Input
                id="entry-fee"
                type="number"
                placeholder="0"
                value={formData.entryFee}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("entryFee", Number(e.target.value))
                }
                className={`mt-1 h-10 border-gray-300 focus:border-teal-500 rounded-md ${
                  formErrors.entryFee ? "border-red-500" : ""
                }`}
              />
              {formErrors.entryFee && (
                <p className="text-red-500 text-sm mt-1">{formErrors.entryFee}</p>
              )}
            </div>

            <div>
              <Label htmlFor="total-spots" className="text-base font-medium text-gray-700">
                Total Spots
              </Label>
              <Input
                id="total-spots"
                type="number"
                placeholder="2"
                value={formData.totalSpots}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("totalSpots", Number(e.target.value))
                }
                className={`mt-1 h-10 border-gray-300 focus:border-teal-500 rounded-md ${
                  formErrors.totalSpots ? "border-red-500" : ""
                }`}
              />
              {formErrors.totalSpots && (
                <p className="text-red-500 text-sm mt-1">{formErrors.totalSpots}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isPublic" className="text-base font-medium text-gray-700">
                Public League
              </Label>
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => handleInputChange("isPublic", checked)}
                className="data-[state=checked]:bg-teal-500"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-3 p-3">
            <div>
              <Label htmlFor="matchId" className="text-base font-medium text-gray-700">
                Select Match
              </Label>
              <Select
                onValueChange={(value: string) => handleInputChange("matchId", value)}
                value={formData.matchId}
              >
                <SelectTrigger
                  className={`mt-1 h-10 border-gray-300 focus:border-teal-500 rounded-md ${
                    formErrors.matchId ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select a match" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 rounded-md">
                  {matchesLoading ? (
                    <SelectItem value="" disabled>
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

      case 3:
        return (
          <div className="space-y-3 p-3">
            <div>
              <Label htmlFor="teamId" className="text-base font-medium text-gray-700">
                Select Team
              </Label>
              <Select
                onValueChange={(value: string) => handleInputChange("teamId", value)}
                value={formData.teamId}
              >
                <SelectTrigger
                  className={`mt-1 h-10 border-gray-300 focus:border-teal-500 rounded-md ${
                    formErrors.teamId ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 rounded-md">
                  {teamsLoading ? (
                    <SelectItem value="" disabled>
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

      case 4:
        const selectedMatch = matches?.find((match) => match.match_id === formData.matchId);
        const selectedTeam = teams?.find((team) => team.team_id === formData.teamId);

        return (
          <div className="space-y-3 p-3">
            <h3 className="text-base font-medium text-gray-700">Review Details</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Name:</strong> {formData.leagueName}
              </p>
              <p>
                <strong>Entry Fee:</strong> ₹{formData.entryFee}
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
          <div className="text-center py-4 text-gray-600">Loading...</div>
        );
    }
  };

  const stepTitles = ["League Details", "Select Match", "Select Team", "Confirm"];

  const renderProgressBar = () => (
    <div className="flex justify-center gap-2 py-2">
      {stepTitles.map((_, index) => (
        <div
          key={index}
          className={`w-2 h-2 rounded-full ${
            index + 1 <= step ? "bg-teal-500" : "bg-gray-300"
          }`}
        />
      ))}
    </div>
  );

  const renderNavigationButtons = () => {
    console.log("Rendering navigation buttons for step:", step);
    return (
      <div className="flex gap-2 navigation-buttons">
        {step > 1 && (
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="w-1/2 h-10 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Back
          </Button>
        )}
        {step < stepTitles.length ? (
          <Button
            onClick={handleNext}
            disabled={isSubmitting || Object.keys(validateStep(step)).length > 0}
            className={`h-10 bg-teal-500 text-white hover:bg-teal-600 rounded-md disabled:bg-gray-200 disabled:text-gray-500 ${
              step === 1 ? "w-full" : "w-1/2"
            }`}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(validateForm()).length > 0}
            className="w-1/2 h-10 bg-teal-500 text-white hover:bg-teal-600 rounded-md disabled:bg-gray-200 disabled:text-gray-500"
          >
            {isSubmitting ? "Creating..." : "Create League"}
          </Button>
        )}
      </div>
    );
  };

  return (
    <>
      <style>
        {`
          .dialog-content {
            width: 100%;
            max-width: 500px;
            margin: 0 auto;
          }
          @media (max-width: 640px) {
            .dialog-content {
              max-width: 100%;
              margin: 0 10px;
            }
            .navigation-buttons {
              flex-direction: column;
              gap: 0.5rem;
            }
            .navigation-buttons button {
              width: 100%;
            }
          }
        `}
      </style>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="dialog-content p-0 bg-white rounded-lg max-h-[90vh] flex flex-col">
          <DialogHeader className="p-3 border-b border-gray-200">
            <DialogTitle className="text-base font-semibold text-gray-800 text-center">
              {stepTitles[step - 1]}
            </DialogTitle>
            <Button
              variant="ghost"
              className="absolute right-2 top-2 text-gray-500 hover:bg-gray-100 p-1"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <div className="px-3 py-2">{renderProgressBar()}</div>

          <div className="flex-1 p-3 overflow-y-auto" ref={contentRef}>
           {renderStep()}
          </div>
          
          <div className="p-3 border-t border-gray-200">
            {renderNavigationButtons()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateLeagueModal;