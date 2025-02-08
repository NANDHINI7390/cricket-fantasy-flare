
import Hero from "../components/Hero";
import LiveMatches from "../components/LiveMatches";
import CreateLeague from "../components/CreateLeague";
import Footer from "../components/Footer";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white"
    >
      <Hero />
      <LiveMatches />
      <CreateLeague />
      <Footer />
    </motion.div>
  );
};

export default Index;
