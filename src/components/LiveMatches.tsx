import { motion } from "framer-motion";
import { toast } from "sonner";

const matches = [
  {
    id: 1,
    team1: "India",
    team2: "Australia",
    score1: "285/4",
    score2: "240/6",
    overs: "45.2",
    status: "LIVE",
  },
  {
    id: 2,
    team1: "England",
    team2: "South Africa",
    time: "Tomorrow, 14:30",
    status: "UPCOMING",
  },
  {
    id: 3,
    team1: "New Zealand",
    team2: "Pakistan",
    time: "Today, 19:00",
    status: "UPCOMING",
  },
];

const LiveMatches = () => {
  const handleViewDetails = (matchId: number) => {
    toast.info("Match details feature coming soon!");
    console.log("Viewing match details for match:", matchId);
  };

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-secondary mb-8 text-center">Live Matches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  match.status === "LIVE" 
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {match.status}
                </span>
                <span className="text-sm text-gray-500">
                  {match.status === "LIVE" ? `${match.overs} overs` : match.time}
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{match.team1}</span>
                  {match.score1 && <span className="text-gray-700">{match.score1}</span>}
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{match.team2}</span>
                  {match.score2 && <span className="text-gray-700">{match.score2}</span>}
                </div>
              </div>
              
              <button 
                onClick={() => handleViewDetails(match.id)}
                className="w-full mt-6 bg-primary/10 text-primary font-medium py-2 rounded-lg hover:bg-primary/20 transition-colors"
              >
                View Details
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LiveMatches;