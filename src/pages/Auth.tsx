import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info(`${isSignUp ? "Sign up" : "Sign in"} functionality coming soon!`);
  };

  return (
    <div className="min-h-screen bg-[#1A1F2C] text-white flex">
      {/* Welcome Section */}
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

      {/* Auth Forms Section */}
      <div className="w-full lg:w-1/2 p-8 sm:p-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.form
              key={isSignUp ? "signup" : "signin"}
              initial={{ opacity: 0, x: isSignUp ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isSignUp ? -50 : 50 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
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

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    className="bg-[#2A2F3C] border-[#3A3F4C] text-white"
                    placeholder="John Doe"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  className="bg-[#2A2F3C] border-[#3A3F4C] text-white"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  className="bg-[#2A2F3C] border-[#3A3F4C] text-white"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#9b87f5] hover:bg-[#8b77e5] text-white transition-all duration-200"
              >
                {isSignUp ? "Sign Up" : "Sign In"}
              </Button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-[#9b87f5] hover:text-[#8b77e5] transition-colors"
                >
                  {isSignUp
                    ? "Already have an account? Sign In"
                    : "Don't have an account? Sign Up"}
                </button>
              </div>
            </motion.form>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Auth;