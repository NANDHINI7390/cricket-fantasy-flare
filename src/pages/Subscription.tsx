import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SubscriptionPlans } from "@/components/subscription/SubscriptionPlans";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import PageNavigation from "@/components/PageNavigation";

const Subscription = () => {
  const { user } = useAuth();
  const [currentTier, setCurrentTier] = useState<string | null>(null);

  const fetchSubscriptionData = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase.functions.invoke('check-subscription');
      if (data?.subscription_tier) {
        setCurrentTier(data.subscription_tier);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, [user]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-8 px-4 bg-gradient-to-b from-background to-secondary/20"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="mb-6">
          <PageNavigation />
        </div>
        
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock premium features and take your fantasy cricket experience to the next level
          </p>
        </header>

        {user && (
          <div className="mb-8 max-w-md mx-auto">
            <SubscriptionStatus />
          </div>
        )}

        <SubscriptionPlans 
          currentTier={currentTier} 
          onSubscriptionChange={fetchSubscriptionData}
        />

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            All plans include a 7-day free trial. Cancel anytime.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Subscription;