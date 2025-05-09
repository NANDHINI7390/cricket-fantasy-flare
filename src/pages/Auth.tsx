
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { EmailPasswordForm } from "@/components/auth/EmailPasswordForm";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import PageNavigation from "@/components/PageNavigation";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/');
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#1A1F2C] text-white flex flex-col">
      <div className="p-4">
        <PageNavigation />
      </div>
      
      <div className="flex flex-1">
        <div className="hidden lg:flex lg:w-1/2 p-12 items-center justify-center bg-gradient-to-br from-[#1A1F2C] to-[#2A2F3C]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-lg"
          >
            <h1 className="text-4xl font-bold mb-6">
              Welcome to Fantasy Cricket Elite
            </h1>
            <p className="text-gray-400 text-lg">
              Join thousands of cricket enthusiasts and create your dream team today.
            </p>
          </motion.div>
        </div>
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex items-center justify-center">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={isSignUp ? "signup" : "signin"}
                initial={{ opacity: 0, x: isSignUp ? 50 : -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isSignUp ? -50 : 50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">
                    {isSignUp ? "Create Account" : "Welcome Back"}
                  </h2>
                  <p className="text-gray-400">
                    {isSignUp
                      ? "Start your cricket fantasy journey"
                      : "Sign in to continue"}
                  </p>
                </div>

                <GoogleSignInButton />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[#1A1F2C] text-gray-400">
                      Or continue with email
                    </span>
                  </div>
                </div>

                <EmailPasswordForm 
                  isSignUp={isSignUp} 
                  onToggleMode={() => setIsSignUp(!isSignUp)} 
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
