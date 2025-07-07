import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, Home, CreditCard, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

const PaymentCanceled = () => {
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
              <div className="rounded-full bg-red-100 p-3">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl text-red-600">
              Payment Canceled
            </CardTitle>
            <CardDescription>
              Your payment was canceled. No charges have been made to your account.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link to="/subscription">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Try Again
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Return Home
                </Link>
              </Button>
              
              <Button asChild variant="ghost" className="w-full">
                <Link to="/wallet">
                  <CreditCard className="h-4 w-4 mr-2" />
                  View Wallet
                </Link>
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground mt-4">
              If you experienced any issues, please contact our support team.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentCanceled;