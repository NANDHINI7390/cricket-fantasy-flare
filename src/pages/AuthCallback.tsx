
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session after OAuth sign in
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          toast.error(error.message || "Authentication failed");
          navigate('/auth');
          return;
        }
        
        if (session) {
          toast.success("Successfully signed in!");
          navigate('/');
        } else {
          console.error('No session found after authentication');
          toast.error("Authentication failed. Please try again.");
          navigate('/auth');
        }
      } catch (error) {
        console.error('Error during auth callback:', error);
        toast.error("Authentication failed. Please try again.");
        navigate('/auth');
      }
    };

    handleCallback();
  }, [navigate]);

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
