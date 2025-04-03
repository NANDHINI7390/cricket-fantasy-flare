
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Share2 } from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/auth");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Fantasy Cricket Elite',
        text: 'Join me on Fantasy Cricket Elite - The ultimate cricket fantasy league!',
        url: window.location.href,
      }).then(() => {
        toast.success('Thanks for sharing!');
      }).catch((error) => {
        console.error('Error sharing:', error);
        copyToClipboard();
      });
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Invite link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  return (
    <section className="relative h-[80vh] flex flex-col items-center justify-center bg-gray-900 text-white px-6 md:px-12 overflow-hidden">
      {/* Background Image with optimized loading */}
      <div className="absolute inset-0 z-0">
        <picture>
          <source 
            srcSet="https://images.pexels.com/photos/18918174/pexels-photo-18918174/free-photo-of-crowd-with-flags-on-stadium.jpeg?auto=compress&cs=tinysrgb&w=1200" 
            media="(min-width: 768px)"
          />
          <img
            src="https://images.pexels.com/photos/18918174/pexels-photo-18918174/free-photo-of-crowd-with-flags-on-stadium.jpeg?auto=compress&cs=tinysrgb&w=600"
            alt="Cricket Stadium"
            className="w-full h-full object-cover min-h-screen bg-center bg-no-repeat"
            loading="eager"
            fetchPriority="high"
          />
        </picture>
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center w-full max-w-3xl"
      >
        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-lg sm:text-xl text-blue-300 font-medium mb-2"
        >
          THE ULTIMATE CRICKET FANTASY EXPERIENCE
        </motion.p>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-4xl sm:text-5xl font-extrabold uppercase tracking-wide"
        >
          Fantasy Cricket Elite 
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
          <motion.button
            onClick={handleGetStarted}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-blue-500 text-white text-lg font-semibold rounded-md shadow-lg hover:bg-blue-600 transition-all"
          >
            Get Started 🚀
          </motion.button>
          <motion.button
            onClick={() => navigate("/learn-more")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 border border-white text-white text-lg font-semibold rounded-md hover:bg-white hover:text-black transition-all"
          >
            Learn More
          </motion.button>
          <motion.button
            onClick={handleShare}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-md shadow-md hover:bg-green-700 transition-all flex items-center justify-center"
          >
            <Share2 size={20} className="mr-2" />
            Invite Friends
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
