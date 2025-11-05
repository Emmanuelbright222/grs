import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Music2, Mail, ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: "Email sent!",
        description: "Check your inbox for password reset instructions.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
              <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
              <p className="text-muted-foreground">
                {emailSent 
                  ? "Check your email for reset instructions" 
                  : "Enter your email to receive password reset instructions"}
              </p>
            </div>

            {!emailSent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="artist@example.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <div className="p-4 bg-accent/10 rounded-lg">
                  <Mail className="w-12 h-12 mx-auto mb-4 text-accent" />
                  <p className="font-medium mb-2">Check your inbox</p>
                  <p className="text-sm text-muted-foreground">
                    We've sent password reset instructions to <strong>{email}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Don't see the email? Check your spam folder.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail("");
                  }}
                  variant="hero"
                  className="w-full"
                >
                  Send Another Email
                </Button>
              </div>
            )}

            <div className="mt-6 text-center text-sm">
              <Link 
                to="/login" 
                className="text-accent hover:underline font-medium flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;

