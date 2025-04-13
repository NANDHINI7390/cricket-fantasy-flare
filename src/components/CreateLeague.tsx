import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Sparkles, Calendar } from "lucide-react";

const CreateLeague = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const matches = [
    { id: 1, teamA: "India", teamB: "Australia" },
    { id: 2, teamA: "England", teamB: "Pakistan" },
    { id: 3, teamA: "South Africa", teamB: "New Zealand" },
  ];

  const handleCreateLeague = () => {
    alert(`League created for ${selectedTeam} in match ${selectedMatch.teamA} vs ${selectedMatch.teamB}!`);
    setIsModalOpen(false);
    setSelectedMatch(null);
    setSelectedTeam(null);
  };

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block py-1 px-3 rounded-full bg-indigo-800 bg-opacity-40 text-indigo-200 text-sm font-medium mb-3 backdrop-blur-sm"
          >
            CREATE & COMPETE
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
          >
            Build Your Fantasy Empire
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-indigo-100 max-w-2xl mx-auto text-lg"
          >
            Create custom leagues, invite friends, and battle for the top spot on the leaderboard with our intuitive fantasy cricket platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
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
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
              {/* Step 1: Select Match */}
              <h2 className="text-xl font-semibold mb-4 text-center">Select a Match</h2>
              <div className="space-y-2">
                {matches.map((match) => (
                  <div
                    key={match.id}
                    onClick={() => {
                      setSelectedMatch(match);
                      setSelectedTeam(null);
                    }}
                    className={`cursor-pointer p-2 border rounded text-center ${
                      selectedMatch?.id === match.id ? "bg-blue-600 text-white" : "bg-gray-100"
                    }`}
                  >
                    {match.teamA} vs {match.teamB}
                  </div>
                ))}
              </div>

              {/* Step 2: Select Team */}
              {selectedMatch && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2 text-center">Choose Your Team</h3>
                  <div className="flex justify-center gap-4">
                    {[selectedMatch.teamA, selectedMatch.teamB].map((team) => (
                      <button
                        key={team}
                        className={`px-4 py-2 rounded border ${
                          selectedTeam === team ? "bg-green-500 text-white" : "bg-gray-200"
                        }`}
                        onClick={() => setSelectedTeam(team)}
                      >
                        {team}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Create Button */}
              {selectedTeam && (
                <div className="text-center mt-6">
                  <button
                    onClick={handleCreateLeague}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-all"
                  >
                    Create League
                  </button>
                </div>
              )}

              {/* Close */}
              <div className="text-center mt-6">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedMatch(null);
                    setSelectedTeam(null);
                  }}
                  className="text-red-600 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CreateLeague;
