
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Completing sign in...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Log the current URL for debugging
        console.log("Current URL:", window.location.href);
        
        // Check for hash fragment in URL which indicates OAuth response
        const hasHashFragment = window.location.hash && window.location.hash.length > 0;
        
        if (hasHashFragment) {
          setMessage("Processing authentication response...");
          console.log("Has hash fragment, processing OAuth callback");
          
          // Get current session, Supabase should automatically process the hash
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Auth session error:', error);
            setMessage("Authentication failed");
            toast.error(error.message || "Authentication failed");
            setTimeout(() => navigate('/auth'), 2000);
            return;
          }
          
          if (data.session) {
            console.log("Authentication successful, session established:", data.session);
            setMessage("Authentication successful!");
            toast.success("Successfully signed in!");
            setTimeout(() => navigate('/'), 1000);
          } else {
            console.error('No session found after callback');
            setMessage("Authentication failed");
            toast.error("No session found. Please try again.");
            setTimeout(() => navigate('/auth'), 2000);
          }
        } else {
          // Check URL parameters
          const params = new URLSearchParams(window.location.search);
          console.log("URL params:", Object.fromEntries(params.entries()));
          
          // Look for code parameter (PKCE flow)
          const code = params.get('code');
          
          if (code) {
            console.log("Found code parameter, handling PKCE flow");
            // The supabase client should automatically exchange the code for tokens
            const { data, error } = await supabase.auth.getSession();
            
            if (error) {
              console.error('PKCE auth error:', error);
              setMessage("Authentication failed");
              toast.error(error.message || "Authentication failed");
              setTimeout(() => navigate('/auth'), 2000);
              return;
            }
            
            if (data.session) {
              console.log("PKCE authentication successful");
              setMessage("Authentication successful!");
              toast.success("Successfully signed in!");
              setTimeout(() => navigate('/'), 1000);
            } else {
              console.error('No session found after PKCE flow');
              setMessage("Authentication failed");
              toast.error("No session found. Please try again.");
              setTimeout(() => navigate('/auth'), 2000);
            }
          } else {
            // Check for access_token and refresh_token (legacy flow)
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            
            if (accessToken && refreshToken) {
              console.log("Found tokens in URL, setting session");
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              });
              
              if (error) {
                console.error('Auth session error:', error);
                setMessage("Authentication failed");
                toast.error(error.message || "Authentication failed");
                setTimeout(() => navigate('/auth'), 2000);
                return;
              }
              
              if (data.session) {
                setMessage("Authentication successful!");
                toast.success("Successfully signed in!");
                setTimeout(() => navigate('/'), 1000);
              }
            } else {
              // If no auth params found, check if there's an active session
              console.log("No auth params found, checking for existing session");
              const { data, error } = await supabase.auth.getSession();
              
              if (error || !data.session) {
                console.error('Auth callback error:', error || "No session found");
                setMessage("Authentication failed");
                toast.error(error?.message || "Authentication failed. Please try again.");
                setTimeout(() => navigate('/auth'), 2000);
              } else {
                setMessage("Authentication successful!");
                toast.success("Successfully signed in!");
                setTimeout(() => navigate('/'), 1000);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error during auth callback:', error);
        setMessage("Authentication failed");
        toast.error("Authentication failed. Please try again.");
        setTimeout(() => navigate('/auth'), 2000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#1A1F2C] flex items-center justify-center">
      <div className="text-white text-center">
        <h2 className="text-2xl font-bold mb-4">{message}</h2>
        <p className="mb-4">Please wait while we complete your authentication.</p>
        <Loader2 className="animate-spin mx-auto text-white" size={28} />
      </div>
    </div>
  );
};

export default AuthCallback;
