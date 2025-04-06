
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, Award, Share2, Shield, Trophy, Users } from "lucide-react";
import { Button } from "../ui/button";
import CreateLeagueModal from "./CreateLeagueModal";
import { toast } from "sonner";

const LeagueFeatureCards = () => {
  const [createLeagueOpen, setCreateLeagueOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const handleCardClick = (cardId: string) => {
    setSelectedCard(cardId);
    
    switch (cardId) {
      case "create":
        setCreateLeagueOpen(true);
        break;
      case "teams":
        toast.info("Team creation will be available soon!");
        break;
      case "track":
        toast.info("Live points tracking will be available once the season starts!");
        break;
      default:
        break;
    }
  };

  const cardData = [
    {
      id: "create",
      icon: <Trophy className="w-10 h-10 text-purple-400" />,
      title: "Start Your Own League",
      description: "Create your own fantasy league and invite friends to join.",
      action: "Create League"
    },
    {
      id: "teams",
      icon: <Users className="w-10 h-10 text-blue-400" />,
      title: "Choose Match & Create Team",
      description: "Select an upcoming match and build your fantasy team.",
      action: "Build Team"
    },
    {
      id: "track",
      icon: <Award className="w-10 h-10 text-pink-400" />,
      title: "Track Points in Real-Time",
      description: "Watch your team earn points live during matches.",
      action: "View Demo"
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {cardData.map((card) => (
          <motion.div
            key={card.id}
            variants={item}
            whileHover={{ 
              y: -8, 
              boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
              background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)"
            }}
            className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-10 p-6 rounded-xl cursor-pointer transition-all hover:border-white hover:border-opacity-20 group"
            onClick={() => handleCardClick(card.id)}
          >
            <div className="bg-gradient-to-br from-white to-white/30 bg-opacity-10 w-16 h-16 rounded-lg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              {card.icon}
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">{card.title}</h3>
            <p className="text-indigo-100 text-opacity-80 mb-4 group-hover:text-opacity-100 transition-colors">{card.description}</p>
            <div className="flex items-center text-indigo-200 font-medium group-hover:text-white transition-colors">
              <span>{card.action}</span>
              <ChevronRight className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" />
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <Button
          onClick={() => setCreateLeagueOpen(true)}
          className="relative overflow-hidden group border-none bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg"
        >
          <span className="absolute top-0 left-0 w-full h-full bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></span>
          <Trophy className="h-5 w-5 mr-2 inline-block" />
          Create League Now
        </Button>
        
        <div className="mt-4 text-sm text-indigo-200 flex items-center justify-center">
          <Share2 className="h-4 w-4 mr-1" />
          <span>Invite friends to play together and win exciting prizes!</span>
        </div>
      </motion.div>
      
      <CreateLeagueModal 
        open={createLeagueOpen} 
        onOpenChange={setCreateLeagueOpen} 
      />
    </div>
  );
};

export default LeagueFeatureCards;
