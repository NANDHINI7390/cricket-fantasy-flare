
import Hero from "../components/Hero";
import LiveMatches from "../components/LiveMatches";
import CreateLeague from "../components/CreateLeague";
import Footer from "../components/Footer";
import PageNavigation from "@/components/PageNavigation";
import { motion } from "framer-motion";
import ChatWidget from "@/components/chat/ChatWidget";
import { useEffect } from "react";
import { MessageSquare, Sparkles, Trophy, Users, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      className="min-h-screen bg-gradient-to-b from-white to-gray-50"
    >
      <div className="container mx-auto px-4 py-4">
        <PageNavigation className="mb-4" />
      </div>
      <Hero />
      <LiveMatches />
      
      {/* AI Assistant Highlight Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 opacity-70"></div>
        <div className="absolute top-0 left-0 w-full h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-200 via-transparent to-transparent opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center mb-16"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-3">
              POWERED BY AI
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cricket Fantasy, <span className="text-blue-600">Smarter</span> Than Ever
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get match insights, expert recommendations, and strategic advice from our AI cricket assistant.
            </p>
          </motion.div>

          <div className="flex flex-col-reverse md:flex-row items-center gap-8 md:gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="md:w-1/2 space-y-6"
            >
              <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-6">
                <div className="flex mb-4">
                  <div className="bg-blue-600 text-white p-2 rounded-lg">
                    <Sparkles size={24} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-gray-800">Live Match Analysis</h3>
                    <p className="text-gray-600">Real-time insights based on ongoing gameplay</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="mt-1 mr-2 bg-green-100 text-green-600 p-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">Pitch condition updates and how it affects gameplay</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mt-1 mr-2 bg-green-100 text-green-600 p-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">Momentum shifts and key turning points</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mt-1 mr-2 bg-green-100 text-green-600 p-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">Player match-ups and historical performance data</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-6">
                <div className="flex mb-4">
                  <div className="bg-purple-600 text-white p-2 rounded-lg">
                    <Trophy size={24} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-gray-800">Team Selection Advice</h3>
                    <p className="text-gray-600">Data-driven recommendations for your fantasy team</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="mt-1 mr-2 bg-green-100 text-green-600 p-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">Captain & vice-captain suggestions based on form</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mt-1 mr-2 bg-green-100 text-green-600 p-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">Unexpected value picks with high point potential</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mt-1 mr-2 bg-green-100 text-green-600 p-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">Team balance optimization for maximum points</span>
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-blue-600 border-blue-600 hover:bg-blue-50 inline-flex items-center"
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  <span>Chat with AI Assistant</span>
                </Button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="md:w-1/2 relative"
            >
              <div className="relative z-10 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex items-center">
                  <MessageSquare size={20} className="mr-2" />
                  <h3 className="font-medium">Cricket Fantasy AI</h3>
                  <span className="bg-green-500 text-xs ml-2 px-1.5 py-0.5 rounded-full text-white font-semibold">
                    LIVE
                  </span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%]">
                    <p className="font-medium">Welcome to Cricket Fantasy AI! I can help with team selection, match analysis, and strategy tips. What would you like to know?</p>
                  </div>
                  
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%]">
                      <p>Who should I pick as captain for the India vs Australia match?</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-[90%]">
                    <p>Based on current form and pitch conditions in Sydney, <span className="font-semibold">Virat Kohli</span> is the top captain choice with an average of 62.5 at this venue. For vice-captain, consider <span className="font-semibold">Mitchell Starc</span> who has taken 15 wickets in the last 4 matches here.</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="bg-white p-2 rounded-lg border border-gray-200">
                        <div className="text-xs text-gray-500">Kohli's last 5 innings</div>
                        <div className="text-sm font-medium">98, 45, 76, 122*, 35</div>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-gray-200">
                        <div className="text-xs text-gray-500">Starc's last 5 matches</div>
                        <div className="text-sm font-medium">3/24, 4/51, 2/30, 3/28, 1/45</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%]">
                      <p>Any value picks that others might overlook?</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-[90%] animate-pulse-slow">
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full bg-blue-600 flex items-center justify-center">
                        <div className="h-1 w-1 rounded-full bg-white"></div>
                      </div>
                      <div className="h-4 w-4 rounded-full bg-blue-600 flex items-center justify-center">
                        <div className="h-1 w-1 rounded-full bg-white"></div>
                      </div>
                      <div className="h-4 w-4 rounded-full bg-blue-600 flex items-center justify-center">
                        <div className="h-1 w-1 rounded-full bg-white"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-1/4 -right-10 h-40 w-40 bg-pink-400 rounded-full filter blur-3xl opacity-20"></div>
              <div className="absolute -bottom-5 -left-10 h-40 w-40 bg-blue-400 rounded-full filter blur-3xl opacity-20"></div>
            </motion.div>
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
