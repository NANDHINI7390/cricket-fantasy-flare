import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Hero = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    // For now, we'll show a toast since user authentication isn't implemented yet
    toast.info("Sign up functionality coming soon!");
    // This would typically navigate to a sign-up page
    // navigate("/signup");
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
      <img
  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpEM8fdTpCEnlSrnhzc8ebosd1M4tx8VBvEA&s"
  alt="Cricket Stadium"
  className="w-full h-auto max-h-[500px] md:max-h-[700px] object-cover rounded-lg shadow-lg"
  loading="lazy"
/>

        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center px-4"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold text-white mb-6"
        >
          Fantasy Cricket Elite
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-xl md:text-2xl text-gray-200 mb-8"
        >
          Build Your Dream Team. Compete. Win.
        </motion.p>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGetStarted}
          className="bg-primary px-8 py-3 rounded-lg text-white font-semibold text-lg shadow-lg hover:bg-primary/90 transition-colors"
        >
          Get Started
        </motion.button>
      </motion.div>
    </section>
  );
};

export default Hero;