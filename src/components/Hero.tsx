import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Hero = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    toast.info("Sign up functionality coming soon!");
  };

  return (
    <section className="relative h-[80vh] flex flex-col items-center justify-center bg-gray-900 text-white px-6 md:px-12 overflow-hidden">

      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/18918174/pexels-photo-18918174/free-photo-of-crowd-with-flags-on-stadium.jpeg?auto=compress&cs=tinysrgb&w=600"
          alt="Cricket Stadium"
          className="w-full h-full object-cover min-h-screen bg-center bg-no-repeat"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center w-full max-w-3xl"
      >
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-4xl sm:text-5xl font-extrabold uppercase tracking-wide"
        >
          Fantasy Cricket Elite 🏏
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mt-4 leading-relaxed"
        >
          Build your ultimate team, dominate the leaderboard, and win exclusive rewards.
        </motion.p>

        {/* Call-To-Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={handleGetStarted}
            className="px-6 py-3 bg-blue-500 text-white text-lg font-semibold rounded-md shadow-md hover:bg-blue-600 transition-all"
          >
            Get Started 🚀
          </button>
          <button
            onClick={() => navigate("/learn-more")}
            className="px-6 py-3 border border-white text-white text-lg font-semibold rounded-md hover:bg-white hover:text-black transition-all"
          >
            Learn More
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
