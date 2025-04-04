
import Hero from "../components/Hero";
import LiveMatches from "../components/LiveMatches";
import CreateLeague from "../components/CreateLeague";
import Footer from "../components/Footer";
import PageNavigation from "@/components/PageNavigation";
import { motion } from "framer-motion";
import ChatWidget from "@/components/chat/ChatWidget";
import { useEffect } from "react";
import { MessageSquare } from "lucide-react";

const Index = () => {
  // Set page title and description for better SEO
  useEffect(() => {
    document.title = "Fantasy Cricket Elite - The Ultimate Cricket Fantasy Experience with AI";
    // Add meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Build your ultimate cricket team with AI-powered assistance, dominate the leaderboard, and win exclusive rewards in Fantasy Cricket Elite!");
    } else {
      const newMetaDesc = document.createElement('meta');
      newMetaDesc.name = "description";
      newMetaDesc.content = "Build your ultimate cricket team with AI-powered assistance, dominate the leaderboard, and win exclusive rewards in Fantasy Cricket Elite!";
      document.head.appendChild(newMetaDesc);
    }
    
    // Add keywords meta tag
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      const newMetaKeywords = document.createElement('meta');
      newMetaKeywords.name = "keywords";
      newMetaKeywords.content = "fantasy cricket, cricket fantasy league, IPL fantasy, cricket predictions, fantasy sports, cricket AI assistant";
      document.head.appendChild(newMetaKeywords);
    }
  }, []);

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
      
      {/* AI Assistant Highlight Section */}
      <section className="py-12 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2">
              <div className="inline-block mb-4 bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-sm font-medium">
                NEW FEATURE
              </div>
              <h2 className="text-3xl font-bold mb-4 text-gray-800">
                AI-Powered Cricket Assistant
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Get real-time match insights, player performance data, and expert team recommendations with our AI assistant. Make informed decisions for your fantasy team based on advanced analytics and predictions.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-600 p-1 rounded-full mr-2">✓</span>
                  <span>Live scores and detailed match statistics</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-600 p-1 rounded-full mr-2">✓</span>
                  <span>Captain & vice-captain recommendations</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-600 p-1 rounded-full mr-2">✓</span>
                  <span>Fantasy team suggestions based on player form</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-600 p-1 rounded-full mr-2">✓</span>
                  <span>Match predictions and player performance insights</span>
                </li>
              </ul>
            </div>
            <div className="md:w-1/2 relative">
              <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-200">
                <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg flex items-center">
                  <MessageSquare size={20} className="mr-2" />
                  <h3 className="font-medium">Cricket Fantasy AI</h3>
                  <span className="bg-green-500 text-xs ml-2 px-1.5 py-0.5 rounded-full text-white font-semibold">
                    AI
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="bg-gray-200 rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
                    <p>👋 Welcome to Cricket Fantasy AI! How can I help you today?</p>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-2 max-w-[80%]">
                      <p>Who should I pick as captain today?</p>
                    </div>
                  </div>
                  <div className="bg-gray-200 rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
                    <p>Based on recent form and today's matchups, I recommend Virat Kohli as captain. He has an excellent record against this bowling attack with an average of 45.8 and strike rate of 136.2 in the last 5 matches.</p>
                  </div>
                </div>
                <div className="px-4 py-3 text-center text-sm text-gray-500">
                  Try our AI assistant by clicking the chat icon →
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-blue-500 text-white p-3 rounded-full animate-bounce shadow-lg">
                <MessageSquare size={24} />
              </div>
            </div>
          </div>
        </div>
      </section>
      
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
