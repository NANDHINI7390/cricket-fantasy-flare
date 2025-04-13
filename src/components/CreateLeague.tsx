import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Users, Sparkles, Trophy, Calendar, Shield } from "lucide-react";
import CreateLeagueModal from "./league/CreateLeagueModal";
import LeagueFeatureCards from "./league/LeagueFeatureCards";

const mockMatches = [
  { id: 1, teams: "IND vs AUS", time: "Starts in 2h" },
  { id: 2, teams: "ENG vs PAK", time: "Starts in 4h" },
  { id: 3, teams: "SA vs NZ", time: "Starts in 6h" },
];

const mockContests = [
  { id: 101, name: "Mega Contest", prize: "₹5 Lakhs", entry: "₹49" },
  { id: 102, name: "Head to Head", prize: "₹1000", entry: "₹50" },
  { id: 103, name: "Practice Contest", prize: "Free", entry: "₹0" },
];

const CreateLeague = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState(mockMatches[0].id);

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Backgrounds & overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,...')] opacity-10"></div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Hero */}
        <div className="text-center mb-12">
          <motion.div className="inline-block py-1 px-3 rounded-full bg-indigo-800 text-indigo-200 text-sm mb-3 backdrop-blur-sm">CREATE & COMPETE</motion.div>
          <motion.h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Build Your Fantasy Empire</motion.h2>
          <motion.p className="text-indigo-100 max-w-2xl mx-auto text-lg">Create custom leagues, invite friends, and battle for the top spot.</motion.p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button onClick={() => setIsModalOpen(true)} size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-6 rounded-xl"> <Sparkles className="mr-2 h-5 w-5" /> Create Your League Now </Button>
            <Button variant="outline" size="lg" className="border-2 border-white/30 bg-white/10 text-white px-8 py-6 rounded-xl"> <Calendar className="mr-2 h-5 w-5" /> Upcoming Contests </Button>
          </div>
        </div>

        {/* Match Cards */}
        <div className="overflow-x-auto mb-10">
          <div className="flex gap-4 w-max px-2">
            {mockMatches.map((match) => (
              <div
                key={match.id}
                onClick={() => setSelectedMatchId(match.id)}
                className={`min-w-[200px] p-4 rounded-xl cursor-pointer transition-all border ${selectedMatchId === match.id ? "bg-purple-600 border-white" : "bg-white/10 border-white/20 hover:bg-white/15"}`}
              >
                <h3 className="text-white font-bold text-lg">{match.teams}</h3>
                <p className="text-indigo-200 text-sm">{match.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contests Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {mockContests.map((contest) => (
            <div key={contest.id} className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:bg-white/15 transition-all">
              <h3 className="text-white text-xl font-bold mb-2">{contest.name}</h3>
              <p className="text-indigo-100 mb-1">Prize: <span className="font-semibold text-green-300">{contest.prize}</span></p>
              <p className="text-indigo-100 mb-4">Entry Fee: <span className="text-yellow-200">{contest.entry}</span></p>
              <div className="flex gap-3">
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white w-full">Join</Button>
                <Button onClick={() => setIsModalOpen(true)} size="sm" variant="outline" className="border-white/30 text-white w-full">Create</Button>
              </div>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <LeagueFeatureCards />

        {/* Modal */}
        <CreateLeagueModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      </div>
    </section>
  );
};

export default CreateLeague;
