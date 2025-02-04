import { motion } from "framer-motion";
import { Trophy, Users, Zap } from "lucide-react";

const features = [
  {
    icon: <Trophy className="w-6 h-6" />,
    title: "Win Big Prizes",
    description: "Compete for exclusive rewards and recognition",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Join Friends",
    description: "Create private leagues with your friends",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Real-time Updates",
    description: "Get live scores and point calculations",
  },
];

const CreateLeague = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-secondary mb-4"
          >
            Create Your Fantasy League
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 max-w-2xl mx-auto"
          >
            Start your own league, invite friends, and compete for glory in the world's most exciting fantasy cricket experience.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary px-8 py-3 rounded-lg text-white font-semibold text-lg shadow-lg hover:bg-primary/90 transition-colors"
          >
            Create League Now
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default CreateLeague;