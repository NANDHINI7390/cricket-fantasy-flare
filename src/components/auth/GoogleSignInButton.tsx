
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const GoogleSignInButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Debug: Log Supabase info on component mount
  useEffect(() => {
    console.log("Supabase URL:", supabase.supabaseUrl);
    console.log("Provider capabilities:", supabase.auth);
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      
      // Clear any existing sessions that might be causing conflicts
      await supabase.auth.signOut();
      
      // Get the current URL for redirect
      const currentUrl = window.location.origin;
      const redirectUrl = `${currentUrl}/auth/callback`;
      
      // Log information for debugging
      console.log("Base URL:", currentUrl);
      console.log("Redirect URL:", redirectUrl);
      setDebugInfo(`Preparing OAuth: ${redirectUrl}`);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error('Google sign in error details:', error);
        setDebugInfo(`OAuth error: ${error.message}`);
        throw error;
      }

      if (data?.url) {
        console.log("Redirecting to OAuth URL:", data.url);
        setDebugInfo(`Redirecting to: ${data.url}`);
        // Using window.location.href for direct redirect
        window.location.href = data.url;
      } else {
        throw new Error("No redirect URL returned from Supabase");
      }
    } catch (error) {
      console.error('Detailed Google sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred with Google sign in";
      setDebugInfo(`Error: ${errorMessage}`);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Button
        onClick={handleGoogleSignIn}
        className="w-full bg-white hover:bg-gray-100 text-gray-900 flex items-center justify-center gap-2"
        type="button"
        disabled={isLoading}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {isLoading ? "Signing in..." : "Continue with Google"}
      </Button>
      
      {debugInfo && (
        <div className="mt-2 p-2 bg-gray-800 text-gray-300 rounded text-xs overflow-auto max-h-20">
          <code className="whitespace-pre-wrap break-all">{debugInfo}</code>
        </div>
      )}
    </div>
  );
};
