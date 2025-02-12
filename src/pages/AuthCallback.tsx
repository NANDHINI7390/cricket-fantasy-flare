
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session after OAuth sign in
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session) {
          // Check if this window is a popup
          if (window.opener) {
            // Send success message to parent window
            window.opener.postMessage({ 
              type: 'GOOGLE_SIGN_IN_SUCCESS',
              session 
            }, '*');
            // Close the popup
            window.close();
          } else {
            // If not in popup, redirect to home
            window.location.href = '/';
          }
        }
      } catch (error) {
        console.error('Error during auth callback:', error);
        if (window.opener) {
          window.opener.postMessage({ 
            type: 'GOOGLE_SIGN_IN_ERROR', 
            error: error instanceof Error ? error.message : 'Authentication failed' 
          }, '*');
          window.close();
        }
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-[#1A1F2C] flex items-center justify-center">
      <div className="text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Completing sign in...</h2>
        <p>Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
