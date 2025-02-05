import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Hero = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    toast.info("Sign up functionality coming soon!");
  };

  return (
    <section className="relative h-screen flex items-center justify-center bg-gray-900">
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpEM8fdTpCEnlSrnhzc8ebosd1M4tx8VBvEA&s"
          alt="Cricket Stadium"
          className="w-full h-full object-cover opacity-80"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/50" /> 
      </div>

      {/* Content Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center p-6 sm:p-12 bg-gray-800/80 border border-gray-700 shadow-xl rounded-xl w-[90%] max-w-3xl"
      >
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight"
        >
          Fantasy Cricket Elite 🏏
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-8"
        >
          Build your dream team. Compete in leagues. Win big.
        </motion.p>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGetStarted}
          className="px-8 py-3 bg-blue-500 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-all"
        >
          Get Started 🚀
        </motion.button>
      </motion.div>
    </section>
  );
};

export default Hero;
