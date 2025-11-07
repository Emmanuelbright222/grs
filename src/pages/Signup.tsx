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

const handleSpotifySignup = () => {
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
  sessionStorage.setItem('spotify_oauth_purpose', 'signup');

  const authUrl = new URL("https://accounts.spotify.com/authorize");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", "user-read-email user-read-private user-read-playback-state user-read-currently-playing user-library-read playlist-read-private playlist-read-collaborative");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("show_dialog", "true");

  window.location.href = authUrl.toString();
};

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const notificationSentRef = useRef(false); // Prevent duplicate notifications
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hcaptchaToken, setHcaptchaToken] = useState<string | null>(null);
  const hcaptchaRef = useRef<HCaptcha>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    artistName: "",
    email: "",
    password: "",
    confirmPassword: "",
    genre: "",
    phoneNumber: "",
    gender: "",
  });
  
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }
    return errors;
  };

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
    setPasswordErrors([]);

    try {
      // Validate password match
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Validate password strength
      const passwordValidation = validatePassword(formData.password);
      if (passwordValidation.length > 0) {
        setPasswordErrors(passwordValidation);
        throw new Error("Password does not meet requirements");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error("Please enter a valid email address");
      }

      // Build options object conditionally
      const signUpOptions: any = {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          full_name: formData.fullName,
          artist_name: formData.artistName,
          genre: formData.genre,
        },
      };
      
      if (hcaptchaToken) {
        signUpOptions.captchaToken = hcaptchaToken;
      }

      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: signUpOptions,
      });

      if (authError) {
        console.error("❌ AUTH ERROR:", authError);
        console.error("❌ Auth error details:", {
          message: authError.message,
          status: authError.status,
          code: authError.code,
          name: authError.name
        });
        
        // Check for account already exists errors (multiple possible formats)
        const errorMessageLower = (authError.message || '').toLowerCase();
        const isAccountExists = 
          errorMessageLower.includes('user already registered') ||
          errorMessageLower.includes('already registered') ||
          errorMessageLower.includes('email already exists') ||
          errorMessageLower.includes('user already exists') ||
          errorMessageLower.includes('email address is already') ||
          errorMessageLower.includes('email address already registered') ||
          authError.status === 422 || // Supabase often returns 422 for duplicate accounts
          authError.code === 'user_already_registered' ||
          authError.code === 'email_already_registered';
        
        if (isAccountExists) {
          // Reset captcha if needed
          hcaptchaRef.current?.resetCaptcha();
          setHcaptchaToken(null);
          
          toast({
            title: "Email address already exists",
            description: "Please login or reset your password or contact admin",
            variant: "destructive",
          });
          
          // Redirect to login after a short delay
          setTimeout(() => {
            navigate("/login");
          }, 2000);
          return;
        }
        
        // If captcha error, reset the captcha
        if (errorMessageLower.includes('captcha') || errorMessageLower.includes('verification')) {
          hcaptchaRef.current?.resetCaptcha();
          setHcaptchaToken(null);
        }
        
        // Provide more specific error messages for other errors
        let errorMessage = authError.message || "Failed to create account. Please try again.";
        if (errorMessageLower.includes('password')) {
          errorMessage = "Password does not meet requirements. Please check the password requirements.";
        } else if (errorMessageLower.includes('invalid email')) {
          errorMessage = "Please enter a valid email address.";
        } else if (errorMessageLower.includes('too many requests')) {
          errorMessage = "Too many signup attempts. Please wait a few minutes before trying again.";
        }
        
        throw new Error(errorMessage);
      }

      if (!authData.user) {
        console.error("❌ No user returned from signup");
        toast({
          title: "Account creation failed",
          description: "Unable to create account. Please try again or contact support.",
          variant: "destructive",
        });
        return;
      }

      console.log("🔄 Creating profile for user:", authData.user.id);
      console.log("📝 Profile data:", {
        user_id: authData.user.id,
        full_name: formData.fullName,
        artist_name: formData.artistName,
        email: formData.email,
        genre: formData.genre,
        phone_number: formData.phoneNumber || null,
        gender: formData.gender || null,
      });
      
      // Use database function to create/update profile (bypasses RLS)
      const { data: profileData, error: profileError } = await (supabase.rpc as any)('create_or_update_profile', {
          p_user_id: authData.user.id,
          p_full_name: formData.fullName,
          p_artist_name: formData.artistName,
          p_email: formData.email,
          p_genre: formData.genre,
          p_phone_number: formData.phoneNumber || null,
          p_gender: formData.gender || null,
        });

        if (profileError) {
          console.error("❌ PROFILE CREATION FAILED:", profileError);
          console.error("❌ Error details:", {
            message: profileError.message,
            code: profileError.code,
            details: profileError.details,
            hint: profileError.hint
          });
          
          // Handle specific duplicate errors - check message first
          let errorMessage = profileError.message || "Could not create profile. Please contact support.";
          let shouldRedirect = false;
          let errorTitle = "Profile creation failed";
          
          // Check error message for specific cases
          const errorMsgLower = (profileError.message || "").toLowerCase();
          
          if (errorMsgLower.includes("email already exists") || errorMsgLower.includes("email address is already")) {
            errorTitle = "Email address already exists";
            errorMessage = "Please login or reset your password or contact admin";
            shouldRedirect = true;
          } else if (errorMsgLower.includes("artist name already exists") || errorMsgLower.includes("username already exists")) {
            errorTitle = "Username already exists";
            errorMessage = "Use another username";
            shouldRedirect = false;
          } else if (errorMsgLower.includes("phone number already") || errorMsgLower.includes("phone number already in use")) {
            errorTitle = "Phone Number already existing";
            errorMessage = "Kindly login or reset your password or contact admin";
            shouldRedirect = true;
          } else if (errorMsgLower.includes("user account not found")) {
            // This shouldn't happen during signup, but if it does, show a better message
            errorTitle = "Account creation error";
            errorMessage = "There was an issue creating your account. Please try again or contact support.";
          } else if (profileError.code === "23503" || profileError.code === "23505") {
            // Foreign key constraint or unique constraint violation
            errorTitle = "Account creation failed";
            errorMessage = "The information you provided is already in use. Please use different details or login to your existing account.";
            shouldRedirect = true;
          }
          
          toast({
            title: errorTitle,
            description: errorMessage,
            variant: "destructive",
          });
          
          // Note: If profile creation failed, the auth user might be orphaned
          // This will need to be cleaned up manually or via a server-side function
          // Client-side cannot delete auth users without admin privileges
          
          // Redirect to login for email/phone already exists
          if (shouldRedirect) {
            setTimeout(() => {
              navigate("/login");
            }, 2000);
          }
          return;
        } else if (profileData) {
          console.log("✅ Profile created/updated successfully:", profileData);
          // Notify admin about new artist registration (only once)
          if (notificationSentRef.current) {
            console.log("⚠️ Notification already sent, skipping duplicate");
          } else {
            notificationSentRef.current = true;
            try {
              const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-new-artist`;
              const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
              
              console.log("Sending artist registration notification to:", functionUrl);
              
              const notifyResponse = await fetch(functionUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "apikey": anonKey || "",
                  "Authorization": `Bearer ${anonKey || ""}`,
                },
                body: JSON.stringify({
                  artist_name: formData.artistName,
                  full_name: formData.fullName,
                  email: formData.email,
                  genre: formData.genre,
                }),
              });

              console.log("Notification response status:", notifyResponse.status);

              if (!notifyResponse.ok) {
                const errorText = await notifyResponse.text();
                console.error("Failed to notify admin - Response:", {
                  status: notifyResponse.status,
                  statusText: notifyResponse.statusText,
                  error: errorText
                });
              } else {
                const result = await notifyResponse.json();
                console.log("✅ Admin notification sent successfully:", result);
              }
            } catch (notifyError: any) {
              // Log error but don't fail signup
              console.error("❌ Failed to notify admin - Exception:", {
                message: notifyError?.message,
                stack: notifyError?.stack,
                error: notifyError
              });
              // Reset flag on error so it can be retried if needed
              notificationSentRef.current = false;
            }
          }
        }
      }

      // Check if email confirmation is required
      if (authData.user && !authData.session) {
        toast({
          title: "Check your email!",
          description: "We've sent you a confirmation link. Please check your email to verify your account.",
        });
        // Navigate to login even if email confirmation is required
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        return;
      }

      toast({
        title: "Account created!",
        description: "Welcome to Grace Rhythm Sounds. Please sign in to continue.",
      });

      // Always navigate to login after signup
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Validate password in real-time
    if (name === "password" && value.length > 0) {
      setPasswordErrors(validatePassword(value));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-md">
          <Card className="p-8 border-0 shadow-strong bg-white/95 backdrop-blur-sm border border-slate-200/50">
            <div className="text-center mb-8">
              <Music2 className="w-12 h-12 mx-auto mb-4 text-accent" />
              <h2 className="text-2xl font-bold mb-2">Create Artist Account</h2>
              <p className="text-muted-foreground">
                Join Grace Rhythm Sounds
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="artistName">Artist Name</Label>
                <Input
                  id="artistName"
                  name="artistName"
                  value={formData.artistName}
                  onChange={handleChange}
                  required
                  placeholder="Your stage name"
                />
              </div>

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
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+234 800 000 0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre">Primary Genre</Label>
                <Input
                  id="genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  placeholder="e.g., Afrobeat, R&B, Hip-Hop"
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
                    minLength={8}
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
                {passwordErrors.length > 0 && (
                  <div className="text-sm text-destructive space-y-1">
                    {passwordErrors.map((error, idx) => (
                      <p key={idx} className="text-xs">• {error}</p>
                    ))}
                  </div>
                )}
                {formData.password && passwordErrors.length === 0 && (
                  <p className="text-xs text-muted-foreground">Password meets requirements ✓</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    minLength={8}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-destructive">Passwords do not match</p>
                )}
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
                {loading ? "Creating account..." : "Create Account"}
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
                  onClick={handleSpotifySignup}
                  disabled={loading}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  Sign up with Spotify
                </Button>
              )}
            </div>

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-accent hover:underline font-medium">
                  Sign in here
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

export default Signup;
