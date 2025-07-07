import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Home, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    // Refresh subscription status after successful payment
    const refreshSubscription = async () => {
      try {
        await supabase.functions.invoke('check-subscription');
      } catch (error) {
        console.error('Error refreshing subscription:', error);
      }
    };

    if (sessionId) {
      refreshSubscription();
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="text-center">
          <CardHeader>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl text-green-600">
              Payment Successful!
            </CardTitle>
            <CardDescription>
              Thank you for your payment. Your transaction has been completed successfully.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {sessionId && (
              <div className="text-sm text-muted-foreground">
                <p>Session ID: {sessionId}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Return Home
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link to="/wallet">
                  <CreditCard className="h-4 w-4 mr-2" />
                  View Wallet
                </Link>
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground mt-4">
              You will receive a confirmation email shortly with your payment details.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;