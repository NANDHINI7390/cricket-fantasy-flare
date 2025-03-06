
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Processing authentication...");
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Log the current URL for debugging
        const currentUrl = window.location.href;
        console.log("Auth callback URL:", currentUrl);
        setDebugInfo(`Processing: ${currentUrl}`);
        
        // Check for hash fragment in URL which indicates OAuth response
        const hasHashFragment = window.location.hash && window.location.hash.length > 0;
        
        if (hasHashFragment) {
          setMessage("Processing hash fragment...");
          console.log("Hash fragment found:", window.location.hash);
          
          // Let Supabase handle the hash fragment
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Auth session error:', error);
            setMessage(`Authentication failed: ${error.message}`);
            setDebugInfo(JSON.stringify(error));
            toast.error(error.message || "Authentication failed");
            setTimeout(() => navigate('/auth'), 3000);
            return;
          }
          
          if (data.session) {
            console.log("Session established:", data.session.user.id);
            setMessage("Authentication successful!");
            toast.success("Successfully signed in!");
            setTimeout(() => navigate('/'), 1000);
          } else {
            console.error('No session found after hash fragment processing');
            setMessage("No session found");
            setDebugInfo("No session data returned");
            toast.error("Authentication failed. Please try again.");
            setTimeout(() => navigate('/auth'), 3000);
          }
        } else {
          // Check URL parameters
          const params = new URLSearchParams(window.location.search);
          console.log("URL params:", Object.fromEntries(params.entries()));
          setDebugInfo(`URL params: ${window.location.search}`);
          
          // Look for code parameter (standard OAuth flow)
          const code = params.get('code');
          
          if (code) {
            console.log("Code parameter found:", code);
            setMessage("Processing authorization code...");
            
            // Exchange the code for a session
            const { data, error } = await supabase.auth.getSession();
            
            if (error) {
              console.error('Auth code exchange error:', error);
              setMessage(`Authentication failed: ${error.message}`);
              setDebugInfo(JSON.stringify(error));
              toast.error(error.message || "Authentication failed");
              setTimeout(() => navigate('/auth'), 3000);
              return;
            }
            
            if (data.session) {
              console.log("Code exchange successful, user authenticated");
              setMessage("Authentication successful!");
              toast.success("Successfully signed in!");
              setTimeout(() => navigate('/'), 1000);
            } else {
              console.error('No session found after code exchange');
              setMessage("No session found after code exchange");
              setDebugInfo("Code found but no session returned");
              toast.error("Authentication failed. Please try again.");
              setTimeout(() => navigate('/auth'), 3000);
            }
          } else {
            // Check if there's an active session already
            console.log("No code or hash found, checking for existing session");
            setMessage("Checking for existing session...");
            
            const { data, error } = await supabase.auth.getSession();
            
            if (error) {
              console.error('Session check error:', error);
              setMessage(`Session check failed: ${error.message}`);
              setDebugInfo(JSON.stringify(error));
              toast.error(error.message || "Authentication failed");
              setTimeout(() => navigate('/auth'), 3000);
            } else if (data.session) {
              console.log("Existing session found");
              setMessage("Existing session found!");
              toast.success("Already signed in!");
              setTimeout(() => navigate('/'), 1000);
            } else {
              console.error('No authentication parameters or session found');
              setMessage("No authentication data found");
              setDebugInfo("No code, hash, or session found");
              toast.error("Authentication failed. Please try again.");
              setTimeout(() => navigate('/auth'), 3000);
            }
          }
        }
      } catch (error) {
        console.error('Error during auth callback:', error);
        setMessage("Authentication process failed");
        setDebugInfo(error instanceof Error ? error.message : String(error));
        toast.error("Authentication failed. Please try again.");
        setTimeout(() => navigate('/auth'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#1A1F2C] flex items-center justify-center">
      <div className="text-white text-center max-w-md p-6 rounded-lg bg-[#2A2F3C]">
        <h2 className="text-2xl font-bold mb-4">{message}</h2>
        <p className="mb-4">Please wait while we complete your authentication.</p>
        <Loader2 className="animate-spin mx-auto text-white mb-4" size={28} />
        
        {debugInfo && (
          <div className="mt-4 p-3 bg-gray-800 rounded text-xs text-left overflow-auto max-h-40">
            <p className="font-mono break-words">{debugInfo}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
