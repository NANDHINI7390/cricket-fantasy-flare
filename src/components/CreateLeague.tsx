import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LeagueFeatureCards from "./league/LeagueFeatureCards";
import CreateLeagueModal from "./league/CreateLeagueModal";
import { Button } from "./ui/button";
import { Users, Sparkles, Trophy, Calendar, Shield } from "lucide-react";

const CreateLeague = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950">
      {/* Background Decorations */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0aDR2MWgtNHYtMXptMC0yaDF2NGgtMXYtNHptLTUgMmg0djFoLTR2LTF6bTAtMmgxdjRoLTF2LTR6TTI1IDI0aDR2MWgtNHYtMXptMC0yaDF2NGgtMXYtNHptLTUgMmg0djFoLTR2LTF6bTAtMmgxdjRoLTF2LTR6bS01LTZoNHYxaC00di0xem0wLTJoMXY0aC0xdi00em0tNSAyaDR2MWgtNHYtMXptMC0yaDF2NGgtMXYtNHptLTUgMTJoNHYxaC00di0xem0wLTJoMXY0aC0xdi00em0tNSAyaDR2MWgtNHYtMXptMC0yaDF2NGgtMXYtNHptLTUgMTJoNHYxaC00di0xem0wLTJoMXY0aC0xdi00em0tNSAyaDR2MWgtNHYtMXptMC0yaDF2NGgtMXYtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10"></div>
      <div className="absolute top-0 left-0 w-full h-48 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-600 via-transparent to-transparent opacity-20"></div>
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full filter blur-3xl opacity-10"></div>
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full filter blur-3xl opacity-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12 lg:mb-16"
        >
          <motion.div variants={itemVariants} className="inline-block py-2 px-4 rounded-full bg-indigo-800/40 text-indigo-200 text-sm font-semibold mb-4 backdrop-blur-sm">
            CREATE & COMPETE
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-4 tracking-tight"
          >
            Build Your Fantasy Empire
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-indigo-200 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed"
          >
            Craft custom leagues, rally your friends, and dominate the leaderboard with our cutting-edge fantasy cricket platform.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              onClick={() => setIsModalOpen(true)}
              size="lg"
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
            >
              <Sparkles className="mr-2 h-5 w-5" /> Create League Now
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-2 border-indigo-300/50 bg-indigo-900/20 backdrop-blur-sm text-indigo-100 hover:bg-indigo-900/30 hover:text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-xl transition-all duration-300 w-full sm:w-auto"
            >
              <Calendar className="mr-2 h-5 w-5" /> Upcoming Contests
            </Button>
          </motion.div>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16"
        >
          {[
            {
              icon: <Trophy className="h-6 w-6 text-white" />,
              title: "Win Big Prizes",
              description: "Compete for thrilling rewards and showcase your fantasy skills on the leaderboard.",
              gradient: "from-green-500 to-emerald-500",
            },
            {
              icon: <Users className="h-6 w-6 text-white" />,
              title: "Play With Friends",
              description: "Create private leagues and challenge your friends to epic fantasy cricket battles.",
              gradient: "from-blue-500 to-indigo-500",
            },
            {
              icon: <Shield className="h-6 w-6 text-white" />,
              title: "Expert Analysis",
              description: "Leverage AI-powered insights to build winning teams and maximize your points.",
              gradient: "from-purple-500 to-pink-500",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-indigo-900/30 backdrop-blur-sm rounded-xl p-5 sm:p-6 border border-indigo-300/20 hover:bg-indigo-900/40 hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.02 }}
            >
              <div
                className={`bg-gradient-to-br ${feature.gradient} w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-md`}
              >
                {feature.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-indigo-200 text-sm sm:text-base">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* League Feature Cards */}
        <LeagueFeatureCards />

        {/* Modal for League Creation */}
        <AnimatePresence>
          {isModalOpen && (
            <CreateLeagueModal
              open={isModalOpen}
              onOpenChange={setIsModalOpen}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default CreateLeague;