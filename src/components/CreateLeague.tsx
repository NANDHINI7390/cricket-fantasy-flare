// Save as CreateLeague.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { CricketBat, Trophy, Calendar, CheckCircle, X, Users } from "lucide-react";

const CreateLeague = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: Match, 2: Team, 3: League Settings, 4: Confirm
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [leagueSettings, setLeagueSettings] = useState({
    name: "",
    type: "public", // public or private
    entryFee: 0,
    maxPlayers: 10,
  });
  const [leagueCreated, setLeagueCreated] = useState(false);

  const matches = [
    {
      id: 1,
      teamA: "India",
      teamB: "Australia",
      date: "Apr 16, 2025",
      time: "7:30 PM",
      format: "T20",
    },
    {
      id: 2,
      teamA: "England",
      teamB: "Pakistan",
      date: "Apr 17, 2025",
      time: "3:00 PM",
      format: "ODI",
    },
    {
      id: 3,
      teamA: "South Africa",
      teamB: "New Zealand",
      date: "Apr 18, 2025",
      time: "6:00 PM",
      format: "T20",
    },
  ];

  const players = {
    India: [
      { id: 1, name: "Virat Kohli", role: "Batsman", credits: 9.5 },
      { id: 2, name: "Rohit Sharma", role: "Batsman", credits: 9.0 },
      { id: 3, name: "Jasprit Bumrah", role: "Bowler", credits: 8.5 },
      { id: 4, name: "Ravindra Jadeja", role: "All-Rounder", credits: 8.0 },
    ],
    Australia: [
      { id: 5, name: "Steve Smith", role: "Batsman", credits: 9.0 },
      { id: 6, name: "Pat Cummins", role: "Bowler", credits: 8.5 },
      { id: 7, name: "Glenn Maxwell", role: "All-Rounder", credits: 8.5 },
      { id: 8, name: "David Warner", role: "Batsman", credits: 9.0 },
    ],
    // Add other teams' players as needed
  };

  const handlePlayerSelect = (player) => {
    if (selectedPlayers.length < 11 && !selectedPlayers.includes(player)) {
      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  const handlePlayerRemove = (playerId) => {
    setSelectedPlayers(selectedPlayers.filter((p) => p.id !== playerId));
  };

  const handleLeagueSettingsChange = (field, value) => {
    setLeagueSettings({ ...leagueSettings, [field]: value });
  };

  const handleCreateLeague = () => {
    setLeagueCreated(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setStep(1);
    setSelectedMatch(null);
    setSelectedPlayers([]);
    setLeagueSettings({ name: "", type: "public", entryFee: 0, maxPlayers: 10 });
    setLeagueCreated(false);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <section className="py-16 relative bg-gradient-to-b from-emerald-950 to-emerald-900 overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[url('/cricket-field-pattern.png')] bg-cover" />
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-amber-500/20 text-amber-200 text-sm font-semibold mb-4 backdrop-blur-sm"
          >
            <Trophy className="w-4 h-4" /> FANTASY CRICKET
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl font-extrabold text-white mb-4 tracking-tight"
          >
            Build Your Cricket Dynasty
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-emerald-100 max-w-2xl mx-auto text-lg font-light"
          >
            Create your league, pick your dream team, and compete for glory in epic fantasy cricket battles.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              onClick={() => setIsModalOpen(true)}
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold px-10 py-7 h-auto text-xl shadow-lg hover:shadow-amber-500/50 transition-all duration-300 rounded-2xl w-full sm:w-auto group"
            >
              <CricketBat className="mr-2 h-6 w-6 group-hover:animate-pulse" /> Create League
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-2 border-amber-400/40 bg-emerald-800/30 backdrop-blur-sm text-amber-200 hover:bg-amber-500/20 hover:text-white px-10 py-7 h-auto text-xl transition-all duration-300 rounded-2xl w-full sm:w-auto"
            >
              <Calendar className="mr-2 h-6 w-6" /> Match Schedule
            </Button>
          </motion.div>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4"
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0, rotateX: 10 }}
                animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                exit={{ scale: 0.85, opacity: 0, rotateX: 10 }}
                className="bg-gradient-to-b from-emerald-800 to-emerald-900 rounded-2xl p-6 w-full max-w-lg relative shadow-2xl shadow-emerald-500/20"
              >
                <button
                  onClick={handleCloseModal}
                  className="absolute top-4 right-4 text-amber-300 hover:text-red-500 transition-transform hover:scale-110"
                >
                  <X className="w-6 h-6" />
                </button>

                {!leagueCreated ? (
                  <>
                    <h2 className="text-3xl font-bold text-white mb-6 text-center tracking-tight">
                      Create Your League
                    </h2>

                    {/* Step Indicator */}
                    <div className="flex justify-between mb-4">
                      {["Match", "Team", "Settings", "Confirm"].map((label, index) => (
                        <div
                          key={label}
                          className={`text-sm font-medium ${
                            step > index + 1 ? "text-emerald-400" : step === index + 1 ? "text-amber-300" : "text-gray-500"
                          }`}
                        >
                          {label}
                        </div>
                      ))}
                    </div>

                    {/* Step 1: Match Selection */}
                    {step === 1 && (
                      <>
                        <p className="mb-3 text-amber-200 font-medium text-lg">Select a Match:</p>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {matches.map((match) => (
                            <motion.div
                              key={match.id}
                              onClick={() => {
                                setSelectedMatch(match);
                                nextStep();
                              }}
                              whileHover={{ scale: 1.02, backgroundColor: "#064e3b" }}
                              className="cursor-pointer p-4 rounded-xl bg-emerald-700/50 hover:bg-emerald-600/70 transition-all flex justify-between items-center"
                            >
                              <div>
                                <p className="text-white font-semibold">
                                  {match.teamA} vs {match.teamB}
                                </p>
                                <p className="text-sm text-amber-300">
                                  {match.date} | {match.time} | {match.format}
                                </p>
                              </div>
                              <div className="text-amber-400 text-sm font-medium">
                                Select →
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Step 2: Team Selection */}
                    {step === 2 && (
                      <>
                        <p className="mb-3 text-amber-200 font-medium text-lg">
                          Build Your Team ({selectedPlayers.length}/11)
                        </p>
                        <div className="max-h-64 overflow-y-auto space-y-2">
                          {[...players[selectedMatch.teamA], ...players[selectedMatch.teamB]].map((player) => (
                            <motion.div
                              key={player.id}
                              onClick={() => handlePlayerSelect(player)}
                              className={`p-3 rounded-md bg-emerald-700/50 ${
                                selectedPlayers.includes(player)
                                  ? "border-2 border-amber-400"
                                  : "hover:bg-emerald-600/70"
                              } transition-all cursor-pointer flex justify-between items-center`}
                              whileHover={{ scale: 1.02 }}
                            >
                              <div>
                                <p className="text-white font-medium">{player.name}</p>
                                <p className="text-sm text-amber-300">{player.role}</p>
                              </div>
                              <p className="text-amber-400">{player.credits} Cr</p>
                            </motion.div>
                          ))}
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button
                            onClick={prevStep}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                          >
                            Back
                          </Button>
                          <Button
                            onClick={nextStep}
                            disabled={selectedPlayers.length !== 11}
                            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                          >
                            Next
                          </Button>
                        </div>
                      </>
                    )}

                    {/* Step 3: League Settings */}
                    {step === 3 && (
                      <>
                        <p className="mb-3 text-amber-200 font-medium text-lg">League Settings</p>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm text-amber-300">League Name</label>
                            <input
                              type="text"
                              value={leagueSettings.name}
                              onChange={(e) => handleLeagueSettingsChange("name", e.target.value)}
                              className="w-full mt-1 p-2 rounded-md bg-emerald-700/50 text-white border border-amber-400/40"
                              placeholder="My Cricket League"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-amber-300">League Type</label>
                            <select
                              value={leagueSettings.type}
                              onChange={(e) => handleLeagueSettingsChange("type", e.target.value)}
                              className="w-full mt-1 p-2 rounded-md bg-emerald-700/50 text-white border border-amber-400/40"
                            >
                              <option value="public">Public</option>
                              <option value="private">Private</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-sm text-amber-300">Entry Fee (₹)</label>
                            <input
                              type="number"
                              value={leagueSettings.entryFee}
                              onChange={(e) =>
                                handleLeagueSettingsChange("entryFee", Number(e.target.value))
                              }
                              className="w-full mt-1 p-2 rounded-md bg-emerald-700/50 text-white border border-amber-400/40"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-amber-300">Max Players</label>
                            <input
                              type="number"
                              value={leagueSettings.maxPlayers}
                              onChange={(e) =>
                                handleLeagueSettingsChange("maxPlayers", Number(e.target.value))
                              }
                              className="w-full mt-1 p-2 rounded-md bg-emerald-700/50 text-white border border-amber-400/40"
                              min="2"
                              max="100"
                            />
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button
                            onClick={prevStep}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                          >
                            Back
                          </Button>
                          <Button
                            onClick={nextStep}
                            disabled={!leagueSettings.name}
                            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                          >
                            Next
                          </Button>
                        </div>
                      </>
                    )}

                    {/* Step 4: Confirm */}
                    {step === 4 && (
                      <>
                        <p className="mb-3 text-amber-200 font-medium text-lg">Review & Confirm</p>
                        <div className="space-y-3 text-white">
                          <p>
                            <strong>Match:</strong> {selectedMatch.teamA} vs {selectedMatch.teamB} (
                            {selectedMatch.format})
                          </p>
                          <p>
                            <strong>Team ({selectedPlayers.length}):</strong>{" "}
                            {selectedPlayers.map((p) => p.name).join(", ")}
                          </p>
                          <p>
                            <strong>League:</strong> {leagueSettings.name} (
                            {leagueSettings.type})
                          </p>
                          <p>
                            <strong>Entry Fee:</strong> ₹{leagueSettings.entryFee}
                          </p>
                          <p>
                            <strong>Max Players:</strong> {leagueSettings.maxPlayers}
                          </p>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button
                            onClick={prevStep}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                          >
                            Back
                          </Button>
                          <Button
                            onClick={handleCreateLeague}
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
                          >
                            Create League
                          </Button>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  // League Created Summary
                  <div className="text-center space-y-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    >
                      <CheckCircle className="mx-auto text-emerald-400 w-16 h-16" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white">League Created!</h3>
                    <p className="text-sm text-amber-200">
                      <strong>{leagueSettings.name}</strong>
                      <br />
                      Match: {selectedMatch.teamA} vs {selectedMatch.teamB}
                      <br />
                      Players: {selectedPlayers.length}/11
                      <br />
                      Type: {leagueSettings.type.charAt(0).toUpperCase() + leagueSettings.type.slice(1)}
                      <br />
                      Entry Fee: ₹{leagueSettings.entryFee}
                    </p>
                    <Button
                      onClick={handleCloseModal}
                      className="mt-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-6 w-full rounded-xl"
                    >
                      Join the Action!
                    </Button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default CreateLeague;