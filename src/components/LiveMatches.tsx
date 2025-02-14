import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const LiveMatches = () => {
  useEffect(() => {
    const testApi = async () => {
      try {
        const response = await supabase.functions.invoke("fetch-cricket-matches", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log("API Test Response:", response);
      } catch (error) {
        console.error("API Test Error:", error);
      }
    };

    testApi();
  }, []);

  return <div>Testing API...</div>;
};

export default LiveMatches;
