import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MusicBackground from "@/components/MusicBackground";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Music2, Upload } from "lucide-react";

const Collaborate = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    artistName: "",
    genre: "",
    message: "",
  });
  const [demoFile, setDemoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let fileUrl = null;

      // Upload demo file if provided
      if (demoFile) {
        setUploading(true);
        const fileExt = demoFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('audio-demos')
          .upload(filePath, demoFile);

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('audio-demos')
          .getPublicUrl(filePath);
        
        fileUrl = publicUrl;
        setUploading(false);
      }

      // Save to public_demo_submissions (for unauthenticated users)
      const { error: dbError } = await supabase
        .from('public_demo_submissions')
        .insert({
          name: formData.name,
          email: formData.email,
          artist_name: formData.artistName,
          genre: formData.genre,
          message: formData.message,
          file_url: fileUrl,
        });

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Send email notification
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
            artistName: formData.artistName,
            genre: formData.genre,
            type: "collaborate",
            demoUrl: fileUrl,
          }),
        }
      );

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to submit request";
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
          title: "Request Submitted!",
          description: "We've received your collaboration request. We'll be in touch soon!",
        });
        setFormData({
          name: "",
          email: "",
          artistName: "",
          genre: "",
          message: "",
        });
        setDemoFile(null);
      } else {
        throw new Error(result.error || "Failed to submit request");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      
      let errorMessage = error instanceof Error ? error.message : "Failed to submit request. Please try again.";
      
      // Check for network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        const functionUrl = import.meta.env.VITE_CUSTOM_EMAIL_FUNCTION_URL 
          || `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-email`;
        console.error("Network error - Function URL:", functionUrl);
        console.error("Supabase URL configured:", !!import.meta.env.VITE_SUPABASE_URL);
        errorMessage = "Cannot connect to email service. Please check your Supabase configuration or contact support.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 20MB.",
          variant: "destructive",
        });
        return;
      }
      setDemoFile(file);
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
            <Music2 className="w-16 h-16 mx-auto mb-6 animate-pulse-glow" />
            <h1 className="text-3xl md:text-6xl font-bold mb-6 animate-fade-in">
              Let's Collaborate
            </h1>
            <p className="text-xl max-w-2xl mx-auto opacity-90 animate-fade-in-up">
              Join the Grace Rhythm Sounds family and take your music to new heights
            </p>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto mb-16">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <Card className="p-8 border-0 shadow-soft animate-scale-in">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🎤</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">For Artists</h3>
                  <p className="text-muted-foreground text-sm">
                    Submit your demo and get discovered by our A&R team
                  </p>
                </Card>

                <Card className="p-8 border-0 shadow-soft animate-scale-in" style={{ animationDelay: "0.1s" }}>
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🎹</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">For Producers</h3>
                  <p className="text-muted-foreground text-sm">
                    Collaborate with our artists on exciting projects
                  </p>
                </Card>

                <Card className="p-8 border-0 shadow-soft animate-scale-in" style={{ animationDelay: "0.2s" }}>
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">✍️</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">For Churches & Charities</h3>
                  <p className="text-muted-foreground text-sm">
                    Partner with us to host spirit-filled events, invite artists, and support kingdom impact
                  </p>
                </Card>
              </div>
            </div>

            {/* Form Section */}
            <Card className="max-w-3xl mx-auto p-8 md:p-12 border-0 shadow-strong animate-fade-in bg-white/95 backdrop-blur-sm border border-slate-200/50">
              <h2 className="text-3xl font-bold mb-4 text-center">
                Submit Your Collaboration Request
              </h2>
              <p className="text-muted-foreground mb-6 text-center">
                Don't have an account?{" "}
                <Link to="/signup" className="text-accent hover:underline font-medium">
                  Create account to submit
                </Link>
              </p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="artistName">Artist/Producer/Organization Name</Label>
                    <Input
                      id="artistName"
                      name="artistName"
                      value={formData.artistName}
                      onChange={handleChange}
                      placeholder="Your stage name, church, or organization"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="genre">Primary Genre / Event Type</Label>
                    <Input
                      id="genre"
                      name="genre"
                      value={formData.genre}
                      onChange={handleChange}
                      placeholder="e.g., Afrobeat, R&B, Hip-Hop, or Church Event, Charity Concert"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Tell Us About Your Project or Event Request *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Share details about your music, experience, event details, or what you're looking to achieve. For churches and charities, please include event date, location, and type of performance needed..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="demo">Upload Demo (Optional)</Label>
                  <label htmlFor="demo" className="block">
                    <div className="border-2 border-dashed border-input rounded-lg p-8 text-center hover:border-accent transition-smooth cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      {demoFile ? (
                        <div>
                          <p className="text-sm font-medium mb-1">{demoFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(demoFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-muted-foreground mb-1">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            MP3, WAV (Max 20MB)
                          </p>
                        </>
                      )}
                    </div>
                  </label>
                  <input
                    type="file"
                    id="demo"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting || uploading}
                >
                  {uploading ? "Uploading demo..." : isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            </Card>

            {/* Donation Section */}
            <Card className="max-w-3xl mx-auto mt-8 p-8 md:p-12 border-0 shadow-strong animate-fade-in bg-gradient-to-br from-accent/10 to-primary/10 backdrop-blur-sm border border-accent/20">
              <div className="text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💝</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                  Support Our Local Events
                </h2>
                <p className="text-muted-foreground mb-6 text-base md:text-lg">
                  Help us continue spreading the gospel through music by supporting our local events. 
                  Your contributions in cash and kind make a meaningful difference in our mission.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={() => {
                      const subject = encodeURIComponent("Donation Support for Local Events");
                      const body = encodeURIComponent("Hello Grace Rhythm Sounds,\n\nI would like to support your local events through donation (cash or kind).\n\nPlease contact me to discuss how I can contribute.\n\nThank you!");
                      window.location.href = `mailto:info@gracerhythmsounds.com?subject=${subject}&body=${body}`;
                    }}
                    className="group"
                  >
                    Donate via Email
                    <span className="ml-2">📧</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      window.open("https://wa.me/2347045501149?text=Hello%20Grace%20Rhythm%20Sounds,%20I%20would%20like%20to%20support%20your%20local%20events%20through%20donation.", "_blank");
                    }}
                    className="group"
                  >
                    Contact via WhatsApp
                    <span className="ml-2">💬</span>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-6">
              <Card className="p-6 border-0 shadow-soft">
                <h3 className="text-lg font-bold mb-2">
                  How long does it take to hear back?
                </h3>
                <p className="text-muted-foreground">
                  We review all submissions within 1-3 days. High-priority demos may receive faster responses.
                </p>
              </Card>
              <Card className="p-6 border-0 shadow-soft">
                <h3 className="text-lg font-bold mb-2">
                  What genres do you accept?
                </h3>
                <p className="text-muted-foreground">
                  We're open to all genres, with a focus on Afrobeat, R&B, Hip-Hop, Pop, and Soul.
                </p>
              </Card>
              <Card className="p-6 border-0 shadow-soft">
                <h3 className="text-lg font-bold mb-2">
                  Do you accept international artists?
                </h3>
                <p className="text-muted-foreground">
                  Absolutely! Grace Rhythm Sounds is a global label welcoming talent from all corners of the world.
                </p>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Collaborate;
