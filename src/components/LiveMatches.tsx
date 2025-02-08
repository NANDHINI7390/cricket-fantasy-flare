import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";
import { ChevronRight } from "lucide-react";

const matches = [
  {
    id: 1,
    team1: { name: "India", logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8iD-oFluh_Uzf831rNAMcw1okMOUUJbwYww&s" },
    team2: { name: "Australia", logo: "https://via.placeholder.com/30?text=AUS" },
    score1: "285/4",
    score2: "240/6",
    overs: "45.2",
    status: "LIVE",
  },
  {
    id: 2,
    team1: { name: "England", logo: "https://via.placeholder.com/30?text=ENG" },
    team2: { name: "South Africa", logo: "https://via.placeholder.com/30?text=SA" },
    time: "Tomorrow, 14:30",
    status: "UPCOMING",
  },
  {
    id: 3,
    team1: { name: "New Zealand", logo: "https://via.placeholder.com/30?text=NZ" },
    team2: { name: "Pakistan", logo: "https://via.placeholder.com/30?text=PAK" },
    time: "Today, 19:00",
    status: "UPCOMING",
  },
];

const LiveMatches = () => {
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);

  const handleViewDetails = (matchId: number) => {
    setSelectedMatch(matchId);
    toast.info("Detailed match insights coming soon!");
    console.log("Viewing match details for match:", matchId);
  };

  return (
    <section className="py-16 px-6 bg-gradient-to-b from-purple-200 to-pink-100">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">
          Live <span className="text-purple-600">Cricket Matches</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {matches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ scale: 1.03, boxShadow: "0px 10px 20px rgba(0,0,0,0.2)" }}
              className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500 relative"
            >
              {/* Match Status Badge */}
              <div className="absolute top-4 right-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-bold text-white ${
                    match.status === "LIVE"
                      ? "bg-gradient-to-r from-red-500 to-pink-500"
                      : "bg-gradient-to-r from-gray-500 to-gray-700"
                  }`}
                >
                  {match.status}
                </span>
              </div>

              {/* Match Info */}
              <div className="flex flex-col space-y-4">
                {/* Teams Row */}
                {[match.team1, match.team2].map((team, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img src={team.logo} alt={team.name} className="w-8 h-8 rounded-full" />
                      <span className="text-lg font-semibold text-gray-800">{team.name}</span>
                    </div>
                    {match.status === "LIVE" && (
                      <span
                        className={`text-lg font-medium ${
                          i === 0 ? "text-green-600" : "text-gray-700"
                        }`}
                      >
                        {i === 0 ? match.score1 : match.score2}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Time or Overs */}
              <p className="text-gray-600 mt-4 text-sm">
                {match.status === "LIVE" ? `${match.overs} overs` : match.time}
              </p>

              {/* View Details Button */}
              <motion.button
                onClick={() => handleViewDetails(match.id)}
                whileHover={{ scale: 1.05 }}
                className="flex items-center justify-center w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                View Details <ChevronRight className="ml-2 w-5 h-5" />
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Selected Match Info */}
        {selectedMatch && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 p-6 bg-white rounded-xl shadow-lg text-center"
          >
            <h3 className="text-xl font-semibold text-gray-900">
              Match {selectedMatch} details coming soon!
            </h3>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default LiveMatches;
