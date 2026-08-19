import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SpotifyCallback = () => {
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
        const purpose = sessionStorage.getItem('spotify_oauth_purpose'); // 'login', 'signup', or null (dashboard connection)
        const storedState = sessionStorage.getItem('spotify_oauth_state');
        
        // Verify state matches
        if (state !== storedState) {
          throw new Error("Invalid state parameter");
        }

        // Clear session storage
        sessionStorage.removeItem('spotify_oauth_state');
        sessionStorage.removeItem('spotify_oauth_purpose');

        // Call edge function
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const functionUrl = `${supabaseUrl}/functions/v1/spotify-oauth`;
        
        // Get session if user is already logged in (for dashboard connection)
        const { data: { session } } = await supabase.auth.getSession();
        
        // Prepare headers
        const headers: HeadersInit = {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
        };
        
        // Add auth header if user is logged in (for connecting to existing account)
        if (session && !purpose) {
          headers.Authorization = `Bearer ${session.access_token}`;
        }

        // Forward the OAuth callback to edge function
        const response = await fetch(functionUrl, {
          method: "POST",
          headers,
          body: JSON.stringify({ code, state, purpose }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(errorData.error || "Failed to authenticate with Spotify");
        }

        const result = await response.json();

        // If login/signup, the edge function returns a session token
        if (purpose === 'login' || purpose === 'signup') {
          if (result.session?.access_token) {
            // Set the session
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: result.session.access_token,
              refresh_token: result.session.refresh_token || '',
            });
            
            if (sessionError) {
              // If setSession fails, try signing in with email (if we have userId)
              if (result.userId) {
                // User was created, but we need to get a proper session
                // Try to sign in with password reset or magic link
                throw new Error("Session setup failed. Please try logging in with your email.");
              }
              throw sessionError;
            }

            toast({
              title: purpose === 'signup' ? "Account created!" : "Welcome back!",
              description: purpose === 'signup' 
                ? "Your account has been created successfully."
                : "You've successfully signed in.",
            });
            navigate("/dashboard");
          } else if (result.userId && result.email) {
            // Fallback: User was created but no session tokens
            // Send magic link to email
            const { error: magicError } = await supabase.auth.signInWithOtp({
              email: result.email,
            });
            
            if (!magicError) {
              toast({
                title: "Account created!",
                description: "Please check your email to complete sign in.",
              });
              navigate("/login");
            } else {
              throw new Error("Failed to create session. Please try logging in with your email.");
            }
          } else {
            throw new Error("Failed to create session");
          }
        } else {
          // Dashboard connection (existing user)
          toast({
            title: "Success!",
            description: "Spotify account connected successfully.",
          });
          navigate("/dashboard?spotify_connected=true");
        }
      } catch (error: any) {
        console.error("Spotify callback error:", error);
        toast({
          title: "Connection Error",
          description: error.message || "Failed to connect Spotify account.",
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
        <p className="text-muted-foreground">Connecting your Spotify account...</p>
      </div>
    </div>
  );
};

export default SpotifyCallback;

