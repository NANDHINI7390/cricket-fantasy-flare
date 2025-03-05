
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface EmailPasswordFormProps {
  isSignUp: boolean;
  onToggleMode: () => void;
}

export const EmailPasswordForm = ({ isSignUp, onToggleMode }: EmailPasswordFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const validateForm = (email: string, password: string) => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    }

    if (!password || password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const username = formData.get("username") as string;

    // Validate form fields
    if (!validateForm(email, password)) {
      setIsLoading(false);
      return;
    }

    try {
      // First sign out to clear any potential conflicting sessions
      await supabase.auth.signOut();
      
      if (isSignUp) {
        console.log("Signing up with:", { email, password, username });
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
            },
          },
        });

        if (error) {
          console.error("Sign up error:", error);
          throw error;
        }

        if (data.user && data.session) {
          toast.success("Sign up successful and signed in!");
          navigate("/");
        } else {
          toast.success("Sign up successful! Please check your email to verify your account.");
        }
      } else {
        console.log("Signing in with:", { email });
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

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
      toast.error(error instanceof Error ? error.message : "An error occurred during authentication");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isSignUp && (
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            type="text"
            className="bg-[#2A2F3C] border-[#3A3F4C] text-white"
            placeholder="johndoe"
            required={isSignUp}
            minLength={3}
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          className="bg-[#2A2F3C] border-[#3A3F4C] text-white"
          placeholder="you@example.com"
          required
        />
        {emailError && <p className="text-sm text-red-500">{emailError}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          className="bg-[#2A2F3C] border-[#3A3F4C] text-white"
          required
          minLength={6}
        />
        {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
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
