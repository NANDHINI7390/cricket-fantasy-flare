
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, CricketBall, Share2, Shield, Trophy, Users } from "lucide-react";
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
      icon: <Trophy className="w-10 h-10 text-purple-600" />,
      title: "Start Your Own League",
      description: "Create your own fantasy league and invite friends to join.",
      action: "Create League"
    },
    {
      id: "teams",
      icon: <Users className="w-10 h-10 text-blue-600" />,
      title: "Choose Match & Create Team",
      description: "Select an upcoming match and build your fantasy team.",
      action: "Build Team"
    },
    {
      id: "track",
      icon: <CricketBall className="w-10 h-10 text-green-600" />,
      title: "Track Points in Real-Time",
      description: "Watch your team earn points live during matches.",
      action: "View Demo"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cardData.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20, rotate: -5 }}
            whileHover={{ scale: 1.03, rotate: 0, boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.95 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ 
              delay: index * 0.1, 
              type: "spring", 
              stiffness: 80, 
              damping: 12
            }}
            className="bg-white p-6 rounded-xl shadow-sm transition-transform cursor-pointer"
            onClick={() => handleCardClick(card.id)}
          >
            <motion.div
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              transition={{ 
                delay: 0.2 + index * 0.1, 
                type: "spring", 
                stiffness: 100 
              }} 
              className="w-16 h-16 rounded-lg flex items-center justify-center mb-4"
            >
              {card.icon}
            </motion.div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">{card.title}</h3>
            <p className="text-gray-600 mb-4">{card.description}</p>
            <div className="flex items-center text-primary font-medium">
              <span>{card.action}</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="text-center">
        <Button
          onClick={() => setCreateLeagueOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg transform transition hover:-translate-y-1"
        >
          <Trophy className="h-5 w-5 mr-2" />
          Create League Now
        </Button>
        
        <div className="mt-4 text-sm text-gray-500 flex items-center justify-center">
          <Share2 className="h-4 w-4 mr-1" />
          <span>Invite friends to play together and win exciting prizes!</span>
        </div>
      </div>
      
      <CreateLeagueModal 
        open={createLeagueOpen} 
        onOpenChange={setCreateLeagueOpen} 
      />
    </div>
  );
};

export default LeagueFeatureCards;
