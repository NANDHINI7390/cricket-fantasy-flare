// Save as CreateLeague.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Sparkles, Calendar, CheckCircle, X } from "lucide-react";

const CreateLeague = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [leagueCreated, setLeagueCreated] = useState(false);

  const matches = [
    { id: 1, teamA: "India", teamB: "Australia" },
    { id: 2, teamA: "England", teamB: "Pakistan" },
    { id: 3, teamA: "South Africa", teamB: "New Zealand" },
  ];

  const handleCreateLeague = () => {
    setLeagueCreated(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMatch(null);
    setSelectedTeam(null);
    setLeagueCreated(false);
  };

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block py-1 px-3 rounded-full bg-indigo-800/40 text-indigo-200 text-sm font-medium mb-3 backdrop-blur-sm"
          >
            CREATE & COMPETE
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Build Your Fantasy Empire
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-indigo-100 max-w-2xl mx-auto text-lg"
          >
            Create custom leagues, invite friends, and battle for the top spot on the leaderboard with our intuitive fantasy cricket platform.
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
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium px-8 py-6 h-auto text-lg shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl w-full sm:w-auto"
            >
              <Sparkles className="mr-2 h-5 w-5" /> Create Your League Now
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 px-8 py-6 h-auto text-lg transition-all duration-300 rounded-xl w-full sm:w-auto"
            >
              <Calendar className="mr-2 h-5 w-5" /> Upcoming Contests
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
              className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl p-6 w-full max-w-md relative"
              >
                <button
                  onClick={handleCloseModal}
                  className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition-transform hover:rotate-90"
                >
                  <X />
                </button>

                {!leagueCreated ? (
                  <>
                    <h2 className="text-2xl font-semibold mb-4 text-center">Create a League</h2>

                    {/* Match selection */}
                    {!selectedMatch && (
                      <>
                        <p className="mb-2 text-gray-700 font-medium">Choose a Match:</p>
                        <div className="space-y-2">
                          {matches.map((match) => (
                            <div
                              key={match.id}
                              onClick={() => setSelectedMatch(match)}
                              className="cursor-pointer p-3 border rounded-md bg-gray-50 hover:bg-indigo-100 transition"
                            >
                              <strong>{match.teamA}</strong> vs <strong>{match.teamB}</strong>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Team selection */}
                    {selectedMatch && !selectedTeam && (
                      <>
                        <p className="mt-4 mb-2 text-gray-700 font-medium">Select Your Team:</p>
                        <div className="flex gap-4">
                          {[selectedMatch.teamA, selectedMatch.teamB].map((team) => (
                            <button
                              key={team}
                              onClick={() => setSelectedTeam(team)}
                              className="flex-1 p-3 bg-gray-100 hover:bg-green-500 hover:text-white rounded-md transition"
                            >
                              {team}
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Final Step */}
                    {selectedTeam && (
                      <div className="mt-6">
                        <p className="text-sm text-gray-600 mb-2">You're all set!</p>
                        <Button
                          onClick={handleCreateLeague}
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                          Create League
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  // League Created Summary
                  <div className="text-center space-y-4">
                    <CheckCircle className="mx-auto text-green-500 w-12 h-12" />
                    <h3 className="text-xl font-semibold text-gray-800">League Created Successfully!</h3>
                    <p className="text-sm text-gray-600">
                      Match: <strong>{selectedMatch.teamA} vs {selectedMatch.teamB}</strong><br />
                      Your Team: <strong>{selectedTeam}</strong>
                    </p>
                    <Button onClick={handleCloseModal} className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white">
                      Done
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
