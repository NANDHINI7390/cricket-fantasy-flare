
import { motion } from "framer-motion";
import { Trophy, Users, Zap, Link2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: <Trophy className="w-6 h-6" />,
    title: "Win Big Prizes",
    description: "Compete for exclusive rewards and recognition",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Join Friends",
    description: "Create private leagues with your friends",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Real-time Updates",
    description: "Get live scores and point calculations",
  },
];

const CreateLeague = () => {
  const [leagueName, setLeagueName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  const handleCreateLeague = () => {
    if (showCreate) {
      if (!leagueName.trim()) {
        toast.error("Please enter a league name");
        return;
      }
      toast.success(`League "${leagueName}" created! Invite your friends to join.`);
      setLeagueName("");
      setShowCreate(false);
    } else {
      setShowCreate(true);
    }
  };

  const generateInviteLink = () => {
    const uniqueCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const inviteLink = `${window.location.origin}/join-league/${uniqueCode}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteLink)
        .then(() => toast.success("Invite link copied to clipboard!"))
        .catch(err => toast.error("Failed to copy invite link"));
    }
    
    return inviteLink;
  };

  const handleInviteFriends = () => {
    const inviteLink = generateInviteLink();
    
    if (navigator.share) {
      navigator.share({
        title: 'Join my Fantasy Cricket League!',
        text: 'I\'ve created a fantasy cricket league. Join now and compete with me!',
        url: inviteLink,
      }).catch(err => {
        console.error('Share failed:', err);
      });
    }
  };

  return (
    <section
      className="py-16 px-4"
      style={{ background: "linear-gradient(135deg, #8E44AD, #E91E63)" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 30, scale: 0.95, rotate: -2 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.2 }}
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
          >
            Create Your Fantasy League
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-gray-200 max-w-2xl mx-auto text-lg sm:text-xl"
          >
            Start your own league, invite friends, and compete for glory in the world's most exciting fantasy cricket experience.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20, rotate: -5 }}
              whileHover={{ scale: 1.05, rotate: 0, boxShadow: "0 8px 20px rgba(0,0,0,0.3)" }}
              whileTap={{ scale: 0.95 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, type: "spring", stiffness: 80, damping: 12 }}
              className="bg-white p-6 rounded-xl shadow-sm transition-transform"
            >
              <motion.div
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                transition={{ delay: 0.2 + index * 0.1, type: "spring", stiffness: 100 }} 
                className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4"
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          {showCreate ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-white p-6 rounded-xl shadow-md max-w-md mx-auto mb-6"
            >
              <h3 className="text-lg font-bold mb-4 text-purple-800">Create Your League</h3>
              <input
                type="text"
                value={leagueName}
                onChange={(e) => setLeagueName(e.target.value)}
                placeholder="Enter league name"
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex space-x-3">
                <button
                  onClick={handleCreateLeague}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <motion.button
                initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.6, duration: 0.6, type: "spring", stiffness: 100 }}
                whileHover={{ scale: 1.1, rotate: 2 }}
                whileTap={{ scale: 0.95, rotate: -2 }}
                onClick={handleCreateLeague}
                className="bg-white px-8 py-3 rounded-lg text-purple-800 font-semibold text-lg shadow-lg hover:bg-gray-100 transition-all"
              >
                Create League Now
              </motion.button>
              
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.6, type: "spring", stiffness: 100 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleInviteFriends}
                className="flex items-center justify-center bg-green-500 px-8 py-3 rounded-lg text-white font-semibold text-lg shadow-lg hover:bg-green-600 transition-all"
              >
                <Share2 size={20} className="mr-2" />
                Invite Friends
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CreateLeague;
