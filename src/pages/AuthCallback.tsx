<<<<<<< HEAD
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
=======

import { useEffect } from 'react';
>>>>>>> 5aa5e727b210e659d01506a074ac77042fc6aeec
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
<<<<<<< HEAD
=======
        // Get the session after OAuth sign in
>>>>>>> 5aa5e727b210e659d01506a074ac77042fc6aeec
        const { data: { session }, error } = await supabase.auth.getSession();
<<<<<<< HEAD

        if (error) {
          console.error("Session error:", error);
          toast.error("Authentication failed. Please try again.");
          navigate("/login");
          return;
        }

=======
        
        if (error) throw error;
        
>>>>>>> 5aa5e727b210e659d01506a074ac77042fc6aeec
        if (session) {
<<<<<<< HEAD
<<<<<<< HEAD
          toast.success("Successfully signed in!");
          navigate("/dashboard"); // Redirect to your desired page
=======
          // If we're in a popup, send message to parent window
=======
          // Check if this window is a popup
>>>>>>> 665f79e6f27ccbe7d05b913e79b095a73783bbac
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
>>>>>>> 5aa5e727b210e659d01506a074ac77042fc6aeec
        }
<<<<<<< HEAD
      } catch (err) {
        console.error("Unexpected error during authentication:", err);
        toast.error("An unexpected error occurred. Please try again.");
        navigate("/login");
=======
      } catch (error) {
        console.error('Error during auth callback:', error);
        if (window.opener) {
          window.opener.postMessage({ 
            type: 'GOOGLE_SIGN_IN_ERROR', 
            error: error instanceof Error ? error.message : 'Authentication failed' 
          }, '*');
          window.close();
        }
>>>>>>> 5aa5e727b210e659d01506a074ac77042fc6aeec
      }
    };

    checkSession();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A1F2C] text-white text-center">
      <h2 className="text-2xl font-bold mb-4">Completing sign-in...</h2>
      <p>Please wait while we complete your authentication.</p>
    </div>
  );
};

export default AuthCallback;
