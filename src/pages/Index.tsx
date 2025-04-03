
import Hero from "../components/Hero";
import LiveMatches from "../components/LiveMatches";
import CreateLeague from "../components/CreateLeague";
import Footer from "../components/Footer";
import PageNavigation from "@/components/PageNavigation";
import { motion } from "framer-motion";
import ChatWidget from "@/components/chat/ChatWidget";

const Index = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white"
    >
      <div className="container mx-auto px-4 py-4">
        <PageNavigation className="mb-4" />
      </div>
      <Hero />
      <LiveMatches />
      <CreateLeague />
      <Footer />
      <div className="text-center py-4 text-sm text-gray-500 bg-gray-100">
        © {new Date().getFullYear()} Fantasy Cricket Elite. All rights reserved.
      </div>
      <ChatWidget />
    </motion.div>
  );
};

export default Index;
