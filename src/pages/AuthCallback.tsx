
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
        // Check for hash fragment in URL which indicates OAuth response
        const hasHashFragment = window.location.hash && window.location.hash.length > 0;
        
        if (hasHashFragment) {
          setMessage("Processing authentication response...");
          // Let Supabase handle the hash fragment
          const { data, error } = await supabase.auth.getSession();
          
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
          } else {
            console.error('No session found after callback');
            setMessage("Authentication failed");
            toast.error("No session found. Please try again.");
            setTimeout(() => navigate('/auth'), 2000);
          }
        } else {
          // If no hash fragment, check if there's an active session
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
