
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
  const [detailedDebug, setDetailedDebug] = useState<any>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Log the current URL for debugging
        const currentUrl = window.location.href;
        console.log("Auth callback URL:", currentUrl);
        setDebugInfo(`Processing: ${currentUrl}`);
        
        // Check for hash fragment in URL which indicates OAuth response
        const hasHashFragment = window.location.hash && window.location.hash.length > 0;
        const hasQueryParams = window.location.search && window.location.search.length > 0;
        
        if (!hasHashFragment && !hasQueryParams) {
          const noAuthDataError = new Error("No authentication data found in URL");
          captureAuthError(noAuthDataError, {
            callbackUrl: currentUrl,
            authType: 'callback',
            callbackStage: 'init'
          });
          
          setMessage("No authentication data found in URL");
          setErrorOccurred(true);
          setDebugInfo("Missing authentication parameters in callback URL");
          toast.error("Authentication failed - no callback data");
          setTimeout(() => navigate('/auth'), 5000);
          return;
        }
        
        setDetailedDebug({
          url: currentUrl,
          hash: window.location.hash,
          search: window.location.search,
          origin: window.location.origin
        });
        
        if (hasHashFragment) {
          setMessage("Processing hash fragment...");
          console.log("Hash fragment found:", window.location.hash);
          setDebugInfo(`Hash fragment: ${window.location.hash}`);
        }
        
        if (hasQueryParams) {
          setMessage("Processing query parameters...");
          console.log("Query parameters found:", window.location.search);
          setDebugInfo(`Query parameters: ${window.location.search}`);
          
          // Check for error in query parameters
          const params = new URLSearchParams(window.location.search);
          if (params.get('error')) {
            const errorDesc = params.get('error_description') || params.get('error');
            console.error('OAuth error:', errorDesc);
            
            captureAuthError(`OAuth error: ${errorDesc}`, {
              callbackUrl: currentUrl,
              authType: 'callback',
              callbackStage: 'queryParams',
              oauthError: errorDesc
            });
            
            setMessage(`Authentication error: ${errorDesc}`);
            setErrorOccurred(true);
            setDebugInfo(`OAuth error: ${errorDesc}`);
            toast.error(`Auth failed: ${errorDesc}`);
            setTimeout(() => navigate('/auth'), 5000);
            return;
          }
        }
        
        // Get the current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Auth session error:', sessionError);
          
          captureAuthError(sessionError, {
            callbackUrl: currentUrl,
            authType: 'callback',
            callbackStage: 'getSession'
          });
          
          setMessage(`Authentication failed: ${sessionError.message}`);
          setErrorOccurred(true);
          setDebugInfo(JSON.stringify(sessionError, null, 2));
          toast.error(sessionError.message || "Authentication failed");
          setTimeout(() => navigate('/auth'), 5000);
          return;
        }
        
        // If no session is present yet, try to exchange the auth code
        if (!sessionData?.session) {
          try {
            // Try to parse the hash or query parameters
            console.log("No session found, attempting to parse auth parameters");
            setMessage("Exchanging authentication token...");
            
            // Give Supabase a moment to process the hash
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check session again
            const { data: refreshedSession, error: refreshError } = await supabase.auth.getSession();
            
            if (refreshError) {
              captureAuthError(refreshError, {
                callbackUrl: currentUrl,
                authType: 'callback',
                callbackStage: 'refreshSession'
              });
              
              throw refreshError;
            }
            
            if (!refreshedSession?.session) {
              const noSessionError = new Error("Failed to establish session after token exchange");
              captureAuthError(noSessionError, {
                callbackUrl: currentUrl,
                authType: 'callback',
                callbackStage: 'refreshSession',
                response: JSON.stringify(refreshedSession)
              });
              
              throw noSessionError;
            }
            
            setDetailedDebug(prev => ({
              ...prev,
              refreshedSession: !!refreshedSession?.session
            }));
            
            console.log("Session established after token exchange");
          } catch (exchangeError) {
            console.error('Token exchange error:', exchangeError);
            
            captureAuthError(
              exchangeError instanceof Error ? exchangeError : new Error(String(exchangeError)),
              {
                callbackUrl: currentUrl,
                authType: 'callback',
                callbackStage: 'tokenExchange'
              }
            );
            
            setMessage(`Token exchange failed: ${exchangeError instanceof Error ? exchangeError.message : String(exchangeError)}`);
            setErrorOccurred(true);
            setDebugInfo(JSON.stringify(exchangeError, null, 2));
            toast.error("Failed to complete authentication");
            setTimeout(() => navigate('/auth'), 5000);
            return;
          }
        }
        
        // Final session check
        const { data: finalSession } = await supabase.auth.getSession();
        
        if (finalSession?.session) {
          console.log("Session established for user:", finalSession.session.user.id);
          setMessage("Authentication successful!");
          setDebugInfo(`User authenticated: ${finalSession.session.user.email}`);
          toast.success("Successfully signed in!");
          setTimeout(() => navigate('/'), 1500);
        } else {
          console.error('No session found after authentication');
          
          captureAuthError("No session established", {
            callbackUrl: currentUrl,
            authType: 'callback',
            callbackStage: 'finalCheck',
            finalResponse: JSON.stringify(finalSession)
          });
          
          setMessage("No session established");
          setErrorOccurred(true);
          setDebugInfo("Authentication completed but no session was created");
          toast.error("Authentication failed. Please try again.");
          setTimeout(() => navigate('/auth'), 5000);
        }
      } catch (error) {
        console.error('Error during auth callback:', error);
        
        captureAuthError(
          error instanceof Error ? error : new Error(String(error)),
          {
            authType: 'callback',
            callbackStage: 'uncaught'
          }
        );
        
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
        
        {detailedDebug && (
          <div className="mt-4 p-3 bg-gray-800 rounded text-xs text-left overflow-auto max-h-60">
            <p className="font-mono break-words whitespace-pre-wrap">
              {JSON.stringify(detailedDebug, null, 2)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
