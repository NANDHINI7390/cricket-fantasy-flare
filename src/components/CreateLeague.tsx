
import { useState } from "react";
import { motion } from "framer-motion";
import LeagueFeatureCards from "./league/LeagueFeatureCards";
import CreateLeagueModal from "./league/CreateLeagueModal";
import { Button } from "./ui/button";
import { Users, Sparkles, Trophy, Calendar, Shield } from "lucide-react";

const CreateLeague = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background gradient and decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900"></div>
      <div className="absolute top-0 left-0 w-full h-64 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-700 via-transparent to-transparent opacity-20"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full filter blur-3xl opacity-10"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full filter blur-3xl opacity-10"></div>
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMSI+PHBhdGggZD0iTTM2IDM0aDR2MWgtNHYtMXptMC0yaDF2NGgtMXYtNHptLTUgMmg0djFoLTR2LTF6bTAtMmgxdjRoLTF2LTR6TTI1IDI0aDR2MWgtNHYtMXptMC0yaDF2NGgtMXYtNHptLTUgMmg0djFoLTR2LTF6bTAtMmgxdjRoLTF2LTR6bS01LTZoNHYxaC00di0xem0wLTJoMXY0aC0xdi00em0tNSAyaDR2MWgtNHYtMXptMC0yaDF2NGgtMXYtNHptLTUgMTJoNHYxaC00di0xem0wLTJoMXY0aC0xdi00em0tNSAyaDR2MWgtNHYtMXptMC0yaDF2NGgtMXYtNHptLTUgMTJoNHYxaC00di0xem0wLTJoMXY0aC0xdi00em0tNSAyaDR2MWgtNHYtMXptMC0yaDF2NGgtMXYtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10"></div>

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

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:shadow-lg"
          >
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-md">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Win Big Prizes</h3>
            <p className="text-indigo-100">Compete for exciting rewards and climb the leaderboard with your fantasy skills.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:shadow-lg"
          >
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-md">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Play With Friends</h3>
            <p className="text-indigo-100">Create private leagues and invite friends to join the fantasy cricket action.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:shadow-lg"
          >
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-md">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Expert Analysis</h3>
            <p className="text-indigo-100">Get AI-powered insights to build the perfect team and maximize your points.</p>
          </motion.div>
        </div>

        <LeagueFeatureCards />
        
        {/* Modal for league creation */}
        <CreateLeagueModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      </div>
    </section>
  );
};

export default CreateLeague;
