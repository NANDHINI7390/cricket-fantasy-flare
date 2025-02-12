import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Attempt to get the session after OAuth sign in
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session) {
          // If we're in a popup (i.e. window.opener exists), notify the parent window
          if (window.opener) {
            window.opener.postMessage(
              { type: 'GOOGLE_SIGN_IN_SUCCESS' },
              window.location.origin
            );
            window.close(); // Close the popup
          } else {
            // If not in a popup, simply redirect to home
            window.location.href = '/';
          }
        } else {
          // If no session is found, handle the error appropriately
          console.error('No session found after OAuth callback.');
          if (window.opener) {
            window.opener.postMessage(
              { type: 'GOOGLE_SIGN_IN_ERROR', error: 'No session found' },
              window.location.origin
            );
            window.close();
          } else {
            window.location.href = '/error';
          }
        }
      } catch (error) {
        console.error('Error during auth callback:', error);
        if (window.opener) {
          window.opener.postMessage(
            { type: 'GOOGLE_SIGN_IN_ERROR', error },
            window.location.origin
          );
          window.close();
        } else {
          // Optionally, handle errors when not in a popup
          window.location.href = '/error';
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
