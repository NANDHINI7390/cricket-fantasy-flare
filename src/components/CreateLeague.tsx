
import { motion } from "framer-motion";
import LeagueFeatureCards from "./league/LeagueFeatureCards";

const CreateLeague = () => {
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

        <LeagueFeatureCards />
      </div>
    </section>
  );
};

export default CreateLeague;
