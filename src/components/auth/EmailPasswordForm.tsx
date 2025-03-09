
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
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const navigate = useNavigate();

  const validateForm = (email: string, password: string) => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");
    setGeneralError("");

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
    setEmailError("");
    setPasswordError("");
    setGeneralError("");

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
      console.log(`Starting ${isSignUp ? "sign up" : "sign in"} process`);
      
      // First sign out to clear any potential conflicting sessions
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.warn("Error during sign out:", signOutError);
        // Continue anyway as this is just a precaution
      }
      
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log("Using redirect URL:", redirectUrl);
      
      if (isSignUp) {
        console.log("Signing up with:", { email, username });
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
            },
            emailRedirectTo: redirectUrl,
          },
        });

        console.log("Sign up response:", { data, error });

        if (error) {
          console.error("Sign up error:", error);
          captureAuthError(error, {
            authType: 'email',
            mode: 'signup',
            email,
            hasUsername: !!username
          });
          
          if (error.message.includes("already registered")) {
            setEmailError("This email is already registered. Please sign in instead.");
          } else {
            setGeneralError(error.message || "Sign up failed. Please try again.");
          }
          setIsLoading(false);
          return;
        }

        if (data.user && data.session) {
          toast.success("Sign up successful and signed in!");
          navigate("/");
        } else if (data.user) {
          toast.success("Sign up successful! Please check your email to verify your account.");
          setTimeout(() => navigate("/auth"), 2000);
        } else {
          const signupError = new Error("Sign up failed. Please try again.");
          captureAuthError(signupError, {
            authType: 'email',
            mode: 'signup',
            email,
            response: JSON.stringify(data)
          });
          setGeneralError("Sign up failed. Please try again.");
        }
      } else {
        console.log("Signing in with:", { email });
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        console.log("Sign in response:", { data, error });

        if (error) {
          console.error("Sign in error:", error);
          captureAuthError(error, {
            authType: 'email',
            mode: 'signin',
            email
          });
          
          if (error.message.includes("Invalid login credentials")) {
            setGeneralError("Invalid email or password");
          } else {
            setGeneralError(error.message || "Sign in failed. Please try again.");
          }
          setIsLoading(false);
          return;
        }

        if (data.session) {
          toast.success("Successfully signed in!");
          navigate("/");
        } else {
          const noSessionError = new Error("No session returned after sign in");
          captureAuthError(noSessionError, {
            authType: 'email',
            mode: 'signin',
            email,
            response: JSON.stringify(data)
          });
          setGeneralError("No session returned after sign in");
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred during authentication";
      captureAuthError(
        error instanceof Error ? error : new Error(errorMessage),
        {
          authType: 'email',
          mode: isSignUp ? 'signup' : 'signin',
        }
      );
      setGeneralError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {generalError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-sm">
          {generalError}
        </div>
      )}
      
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
