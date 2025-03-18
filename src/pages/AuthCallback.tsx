
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import { captureAuthError } from '@/integrations/sentry/config';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Processing authentication...");
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Log the current URL for debugging
        const currentUrl = window.location.href;
        console.log("Auth callback URL:", currentUrl);
        setDebugInfo(`Processing: ${currentUrl}`);
        
        // Simple check for hash or query parameters
        const hasParameters = 
          (window.location.hash && window.location.hash.length > 0) ||
          (window.location.search && window.location.search.length > 0);
        
        if (!hasParameters) {
          setMessage("No authentication data found in URL");
          setErrorOccurred(true);
          setDebugInfo("Missing authentication parameters in callback URL");
          toast.error("Authentication failed - no callback data");
          setTimeout(() => navigate('/auth'), 5000);
          return;
        }
        
        // The supabase client will automatically process the auth callback
        // Just need to wait a moment
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get the current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Auth session error:', sessionError);
          setMessage(`Authentication failed: ${sessionError.message}`);
          setErrorOccurred(true);
          toast.error(sessionError.message || "Authentication failed");
          setTimeout(() => navigate('/auth'), 5000);
          return;
        }
        
        // Final session check
        if (sessionData?.session) {
          console.log("Authentication successful!");
          setMessage("Authentication successful!");
          toast.success("Successfully signed in!");
          setTimeout(() => navigate('/'), 1500);
        } else {
          console.error('No session found after authentication');
          setMessage("Authentication failed - no session established");
          setErrorOccurred(true);
          toast.error("Authentication failed. Please try again.");
          setTimeout(() => navigate('/auth'), 5000);
        }
      } catch (error) {
        console.error('Error during auth callback:', error);
        setMessage("Authentication process failed");
        setErrorOccurred(true);
        setDebugInfo(error instanceof Error ? error.message : String(error));
        toast.error("Authentication failed. Please try again.");
        setTimeout(() => navigate('/auth'), 5000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#1A1F2C] flex items-center justify-center p-4">
      <div className="text-white text-center max-w-md p-6 rounded-lg bg-[#2A2F3C] w-full">
        <div className="mb-6">
          {errorOccurred ? (
            <AlertCircle className="mx-auto text-red-400 mb-4" size={36} />
          ) : (
            <Loader2 className="animate-spin mx-auto text-white mb-4" size={36} />
          )}
        </div>
        
        <h2 className={`text-2xl font-bold mb-4 ${errorOccurred ? 'text-red-400' : 'text-white'}`}>
          {message}
        </h2>
        
        <p className="mb-6">
          {errorOccurred 
            ? "There was a problem with authentication. You'll be redirected to the login page shortly." 
            : "Please wait while we complete your authentication."}
        </p>
        
        {debugInfo && (
          <div className="mt-4 p-3 bg-gray-800 rounded text-xs text-left overflow-auto max-h-60">
            <p className="font-mono break-words whitespace-pre-wrap">{debugInfo}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
