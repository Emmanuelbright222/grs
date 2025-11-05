import { useState } from "react";
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

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    artistName: "",
    email: "",
    password: "",
    confirmPassword: "",
    genre: "",
    phoneNumber: "",
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

      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: formData.fullName,
            artist_name: formData.artistName,
            genre: formData.genre,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        console.log("🔄 Creating profile for user:", authData.user.id);
        console.log("📝 Profile data:", {
          user_id: authData.user.id,
          full_name: formData.fullName,
          artist_name: formData.artistName,
          email: formData.email,
          genre: formData.genre,
        });
        
        // Use database function to create/update profile (bypasses RLS)
        const { data: profileData, error: profileError } = await supabase
          .rpc('create_or_update_profile', {
            p_user_id: authData.user.id,
            p_full_name: formData.fullName,
            p_artist_name: formData.artistName,
            p_email: formData.email,
            p_genre: formData.genre,
            p_phone_number: formData.phoneNumber || null,
          });

        if (profileError) {
          console.error("❌ PROFILE CREATION FAILED:", profileError);
          
          // Handle specific duplicate errors
          let errorMessage = profileError.message || "Could not create profile. Please contact support.";
          if (profileError.message?.includes("Email already exists")) {
            errorMessage = "This email is already registered. Please use a different email or sign in.";
          } else if (profileError.message?.includes("Artist name already exists")) {
            errorMessage = "This artist name is already taken. Please choose a different name.";
          } else if (profileError.message?.includes("Phone number already in use")) {
            errorMessage = "This phone number is already in use. Please use a different number.";
          } else if (profileError.code === "23503") {
            errorMessage = "Account creation failed. Please try again or contact support.";
          }
          
          toast({
            title: "Profile creation failed",
            description: errorMessage,
            variant: "destructive",
          });
          return;
        } else if (profileData) {
          console.log("✅ Profile created/updated successfully:", profileData);
          // Notify admin about new artist registration
          try {
            const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-new-artist`;
            const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
            
            await fetch(functionUrl, {
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
          } catch (notifyError) {
            // Silently fail - notification is not critical
            if (import.meta.env.DEV) {
              console.error("Failed to notify admin:", notifyError);
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
          <Card className="p-8 border-0 shadow-strong">
            <div className="text-center mb-8">
              <Music2 className="w-12 h-12 mx-auto mb-4 text-accent" />
              <h1 className="text-3xl font-bold mb-2">Create Artist Account</h1>
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

              <Button
                type="submit"
                variant="hero"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

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
