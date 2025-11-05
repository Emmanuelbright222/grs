import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Music2, Eye, EyeOff } from "lucide-react";
import HCaptcha from "@hcaptcha/react-hcaptcha";

const handleSpotifyLogin = () => {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  
  if (!clientId || clientId === "YOUR_SPOTIFY_CLIENT_ID") {
    return;
  }

  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const redirectUri = isLocal 
    ? `http://172.20.10.2:8080/auth/spotify/callback`
    : `${window.location.origin}/auth/spotify/callback`;

  // Generate a random state for security
  const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  sessionStorage.setItem('spotify_oauth_state', state);
  sessionStorage.setItem('spotify_oauth_purpose', 'login');

  const authUrl = new URL("https://accounts.spotify.com/authorize");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", "user-read-email user-read-private user-read-playback-state user-read-currently-playing user-library-read playlist-read-private playlist-read-collaborative");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("show_dialog", "true");

  window.location.href = authUrl.toString();
};

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hcaptchaToken, setHcaptchaToken] = useState<string | null>(null);
  const hcaptchaRef = useRef<HCaptcha>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hcaptchaToken) {
      toast({
        title: "Verification Required",
        description: "Please complete the hCaptcha verification",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
        options: {
          captchaToken: hcaptchaToken || undefined,
        },
      });

      if (error) {
        // If captcha error, reset the captcha
        if (error.message?.includes('captcha') || error.message?.includes('verification')) {
          hcaptchaRef.current?.resetCaptcha();
          setHcaptchaToken(null);
        }
        throw error;
      }

      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-md">
          <Card className="p-8 border-0 shadow-strong bg-white/95 backdrop-blur-sm border border-slate-200/50">
            <div className="text-center mb-8">
              <Music2 className="w-12 h-12 mx-auto mb-4 text-accent" />
              <h1 className="text-3xl font-bold mb-2">Artist Login</h1>
              <p className="text-muted-foreground">
                Access your artist dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="artist@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-center">
                <HCaptcha
                  sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY || "10000000-ffff-ffff-ffff-000000000001"}
                  onVerify={(token) => {
                    setHcaptchaToken(token);
                  }}
                  onExpire={() => {
                    setHcaptchaToken(null);
                  }}
                  onError={(err) => {
                    console.error("hCaptcha error:", err);
                    toast({
                      title: "Captcha Error",
                      description: "Please refresh the page and try again",
                      variant: "destructive",
                    });
                  }}
                  ref={hcaptchaRef}
                  theme="light"
                />
              </div>

              <Button
                type="submit"
                variant="hero"
                className="w-full"
                disabled={loading || !hcaptchaToken}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white/95 px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              {import.meta.env.VITE_SPOTIFY_CLIENT_ID && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleSpotifyLogin}
                  disabled={loading}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  Sign in with Spotify
                </Button>
              )}
            </div>

            <div className="mt-6 space-y-3 text-center text-sm">
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="text-accent hover:underline font-medium">
                  Sign up here
                </Link>
              </p>
              <p className="text-muted-foreground">
                <Link to="/forgot-password" className="text-accent hover:underline font-medium">
                  Forgot your password?
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
