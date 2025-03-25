
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { captureAuthError } from "@/integrations/sentry/config";

interface EmailPasswordFormProps {
  isSignUp: boolean;
  onToggleMode: () => void;
}

export const EmailPasswordForm = ({ isSignUp, onToggleMode }: EmailPasswordFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log(`Starting ${isSignUp ? "sign up" : "sign in"} process with email: ${email}`);
      
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
            },
          },
        });

        console.log("Sign up response:", { data, error });

        if (error) {
          console.error("Sign up error:", error);
          throw error;
        }

        toast.success("Sign up successful! Please check your email to verify your account.");
        setTimeout(() => navigate("/auth"), 2000);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        console.log("Sign in response:", { data, error });

        if (error) {
          console.error("Sign in error:", error);
          throw error;
        }

        if (data.session) {
          toast.success("Successfully signed in!");
          navigate("/");
        } else {
          throw new Error("No session returned after sign in");
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      let errorMessage = "An error occurred during authentication";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        if (errorMessage.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password";
        } else if (errorMessage.includes("already registered")) {
          errorMessage = "This email is already registered. Please sign in instead.";
        }
      }
      
      setError(errorMessage);
      captureAuthError(
        error instanceof Error ? error : new Error(errorMessage),
        {
          authType: 'email',
          mode: isSignUp ? 'signup' : 'signin',
          email
        }
      );
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-sm">
          {error}
        </div>
      )}
      
      {isSignUp && (
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            className="bg-[#2A2F3C] border-[#3A3F4C] text-white"
            placeholder="johndoe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required={isSignUp}
            minLength={3}
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          className="bg-[#2A2F3C] border-[#3A3F4C] text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      
      <Button
        type="submit"
        className="w-full bg-[#9b87f5] hover:bg-[#8b77e5] text-white transition-all duration-200"
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
      </Button>
      
      <div className="text-center mt-4">
        <button
          type="button"
          onClick={onToggleMode}
          className="text-[#9b87f5] hover:text-[#8b77e5] transition-colors"
        >
          {isSignUp
            ? "Already have an account? Sign In"
            : "Don't have an account? Sign Up"}
        </button>
      </div>
    </form>
  );
};
