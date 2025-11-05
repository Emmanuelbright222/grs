import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const BoomplayCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state"); // user_id
      const error = searchParams.get("error");

      if (error) {
        toast({
          title: "Connection Error",
          description: error,
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      if (!code || !state) {
        toast({
          title: "Error",
          description: "Missing authorization code or state.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.id !== state) {
          throw new Error("User mismatch");
        }

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const functionUrl = `${supabaseUrl}/functions/v1/boomplay-oauth`;
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Not authenticated");

        const response = await fetch(`${functionUrl}?code=${code}&state=${state}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(errorData.error || "Failed to connect Boomplay");
        }

        toast({
          title: "Success!",
          description: "Boomplay account connected successfully.",
        });
        navigate("/dashboard?boomplay_connected=true");
      } catch (error: any) {
        console.error("Boomplay callback error:", error);
        toast({
          title: "Connection Error",
          description: error.message || "Failed to connect Boomplay account.",
          variant: "destructive",
        });
        navigate("/dashboard");
      }
    };

    handleCallback();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Connecting your Boomplay account...</p>
      </div>
    </div>
  );
};

export default BoomplayCallback;

