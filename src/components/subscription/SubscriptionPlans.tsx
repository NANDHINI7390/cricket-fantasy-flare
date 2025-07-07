import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface SubscriptionPlansProps {
  currentTier?: string | null;
  onSubscriptionChange?: () => void;
}

const plans = [
  {
    name: "Basic",
    price: 9.99,
    interval: "month",
    description: "Perfect for casual players",
    features: [
      "Join up to 5 contests per day",
      "Basic player analysis",
      "Email support",
      "Standard rewards"
    ],
    icon: <Zap className="h-6 w-6" />,
    popular: false
  },
  {
    name: "Premium", 
    price: 19.99,
    interval: "month",
    description: "For serious fantasy players",
    features: [
      "Unlimited contests",
      "Advanced AI recommendations",
      "Priority support",
      "Exclusive contests",
      "Enhanced analytics",
      "Custom team suggestions"
    ],
    icon: <Crown className="h-6 w-6" />,
    popular: true
  },
  {
    name: "Enterprise",
    price: 49.99,
    interval: "month", 
    description: "Maximum competitive advantage",
    features: [
      "Everything in Premium",
      "Personal account manager",
      "Advanced statistics",
      "API access",
      "Custom integrations",
      "White-label options"
    ],
    icon: <Crown className="h-6 w-6" />,
    popular: false
  }
];

export const SubscriptionPlans = ({ currentTier, onSubscriptionChange }: SubscriptionPlansProps) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: typeof plans[0]) => {
    try {
      setLoading(plan.name);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          mode: 'subscription',
          // You can create price IDs in Stripe dashboard and use them here
          // For now using default pricing in the function
        }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
        onSubscriptionChange?.();
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error("Failed to start subscription process");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {plans.map((plan, index) => (
        <motion.div
          key={plan.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card 
            className={`relative h-full ${
              plan.popular 
                ? 'border-primary shadow-lg scale-105' 
                : 'border-border'
            } ${
              currentTier === plan.name 
                ? 'ring-2 ring-primary bg-primary/5' 
                : ''
            }`}
          >
            {plan.popular && (
              <Badge 
                className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground"
              >
                Most Popular
              </Badge>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-2">
                {plan.icon}
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/{plan.interval}</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                onClick={() => handleSubscribe(plan)}
                disabled={loading === plan.name || currentTier === plan.name}
                className={`w-full mt-6 ${
                  plan.popular 
                    ? 'bg-primary hover:bg-primary/90' 
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
                variant={plan.popular ? "default" : "secondary"}
              >
                {loading === plan.name ? (
                  "Processing..."
                ) : currentTier === plan.name ? (
                  "Current Plan"
                ) : (
                  `Subscribe to ${plan.name}`
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};