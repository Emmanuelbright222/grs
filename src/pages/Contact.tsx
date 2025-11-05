import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MusicBackground from "@/components/MusicBackground";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, MapPin, Phone } from "lucide-react";
import HCaptcha from "@hcaptcha/react-hcaptcha";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hcaptchaToken, setHcaptchaToken] = useState<string | null>(null);
  const hcaptchaRef = useRef<HCaptcha>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
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
    
    setIsSubmitting(true);

    try {
      // Use custom function URL if available, otherwise fallback to Supabase function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl && !import.meta.env.VITE_CUSTOM_EMAIL_FUNCTION_URL) {
        throw new Error("Supabase URL not configured. Please check your environment variables.");
      }
      
      const functionUrl = import.meta.env.VITE_CUSTOM_EMAIL_FUNCTION_URL 
        || `${supabaseUrl}/functions/v1/send-contact-email`;
      
      // Prepare headers - add Supabase auth if using Supabase function
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      
      // Add Supabase auth headers if using Supabase function (not custom URL)
      if (!import.meta.env.VITE_CUSTOM_EMAIL_FUNCTION_URL) {
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        if (!anonKey) {
          throw new Error("Supabase publishable key not configured. Please check your .env file.");
        }
        headers["apikey"] = anonKey;
        headers["Authorization"] = `Bearer ${anonKey}`;
      }
      
      const response = await fetch(
        functionUrl,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            message: formData.message,
            type: "contact",
          }),
        }
      );

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to send message";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Message Sent!",
          description: "Thank you for contacting us. We'll get back to you soon!",
        });
        setFormData({
          name: "",
          email: "",
          message: "",
        });
      } else {
        throw new Error(result.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to send message. Please check your connection and try again.";
      
      // Check for network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.error("Network error - Function URL:", import.meta.env.VITE_CUSTOM_EMAIL_FUNCTION_URL || `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-email`);
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen relative">
      <MusicBackground />
      <Navbar />
      <main className="pt-20 relative z-10">
        {/* Hero Section */}
        <section className="py-20 gradient-hero text-white">
          <div className="container mx-auto px-4 text-center">
            <Mail className="w-16 h-16 mx-auto mb-6 animate-pulse-glow" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              Get In Touch
            </h1>
            <p className="text-xl max-w-2xl mx-auto opacity-90 animate-fade-in-up">
              Have questions or want to work with us? We'd love to hear from you
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Contact Info */}
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    Contact Information
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    Reach out to us through any of these channels and we'll respond as soon as possible.
                  </p>
                </div>

                <Card className="p-6 border-0 shadow-soft hover:shadow-medium transition-smooth">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Email</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        General Inquiries
                      </p>
                      <a
                        href="mailto:info@gracerhythmsounds.org"
                        className="text-accent hover:underline"
                      >
                        info@gracerhythmsounds.org
                      </a>
                      <p className="text-sm text-muted-foreground mt-2">
                        Business
                      </p>
                      <a
                        href="mailto:support@gracerhythmsounds.org"
                        className="text-accent hover:underline"
                      >
                        support@gracerhythmsounds.org
                      </a>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-0 shadow-soft hover:shadow-medium transition-smooth">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Location</h3>
                      <p className="text-sm text-muted-foreground">
                        Global Operations
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Serving artists worldwide
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-0 shadow-soft hover:shadow-medium transition-smooth">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Social Media</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Connect with us on social platforms
                      </p>
                      <div className="flex gap-3">
                        <a
                          href="https://facebook.com/gracerhythmsounds"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline text-sm"
                        >
                          Facebook
                        </a>
                        <span className="text-muted-foreground">•</span>
                        <a
                          href="https://instagram.com/gracerhythmsounds"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline text-sm"
                        >
                          Instagram
                        </a>
                        <span className="text-muted-foreground">•</span>
                        <a
                          href="https://youtube.com/@gracerhythmsounds"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline text-sm"
                        >
                          YouTube
                        </a>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Contact Form */}
              <Card className="p-8 border-0 shadow-strong animate-scale-in">
                <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                    required
                    rows={6}
                    placeholder="How can we help you?"
                  />
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
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting || !hcaptchaToken}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
