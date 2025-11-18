import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bell, Send, RefreshCw, ArrowLeft, Users, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminAnnouncements = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [artists, setArtists] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    recipient: "all", // "all" or specific artist user_id
  });

  useEffect(() => {
    checkAuthAndLoadArtists();
  }, []);

  const checkAuthAndLoadArtists = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      navigate("/login");
      return;
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData || roleData.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    await loadArtists();
    setLoading(false);
  };

  const loadArtists = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, artist_name, full_name, email")
      .not("user_id", "is", null)
      .order("artist_name", { ascending: true });

    if (error) {
      console.error("Error loading artists:", error);
      toast({
        title: "Error",
        description: "Failed to load artists",
        variant: "destructive",
      });
    } else {
      setArtists(data || []);
    }
  };

  const handleSendAnnouncement = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both title and message",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const dashboardUrl = `${window.location.origin}/dashboard`;

      // Determine recipients
      const recipients =
        formData.recipient === "all"
          ? artists.filter((a) => a.user_id && a.email)
          : artists.filter((a) => a.user_id === formData.recipient);

      if (recipients.length === 0) {
        toast({
          title: "Error",
          description: "No recipients found",
          variant: "destructive",
        });
        setSending(false);
        return;
      }

      // Create notifications in database
      const notificationsToInsert = recipients.map((artist) => ({
        user_id: artist.user_id,
        title: formData.title,
        message: formData.message,
        created_by: user.id,
        notification_type: "announcement",
      }));

      const { error: notificationError } = await supabase
        .from("notifications")
        .insert(notificationsToInsert);

      if (notificationError) throw notificationError;

      // Send emails via edge function
      const emailPromises = recipients.map(async (artist) => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const response = await fetch(
            `${supabaseUrl}/functions/v1/send-notification-email`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session?.access_token || ""}`,
              },
              body: JSON.stringify({
                artistEmail: artist.email,
                artistName: artist.artist_name || artist.full_name || "Artist",
                dashboardUrl: dashboardUrl,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            console.error(`Failed to send email to ${artist.email}:`, errorData);
          }
        } catch (error) {
          console.error(`Error sending email to ${artist.email}:`, error);
        }
      });

      await Promise.allSettled(emailPromises);

      toast({
        title: "Success",
        description: `Announcement sent to ${recipients.length} artist(s)`,
      });

      setIsDialogOpen(false);
      setFormData({
        title: "",
        message: "",
        recipient: "all",
      });
    } catch (error: any) {
      console.error("Error sending announcement:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send announcement",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-3 mb-2">
                <Bell className="w-8 h-8 text-accent" />
                <h1 className="text-2xl md:text-4xl font-bold">Announcements</h1>
              </div>
              <p className="text-muted-foreground">
                Send announcements to artists ({artists.length} total artists)
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="w-full sm:w-auto"
              >
                <Send className="w-4 h-4 mr-2" />
                New Announcement
              </Button>
              <Button
                onClick={() => navigate("/dashboard")}
                variant="hero"
                className="hidden md:inline-flex"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>

          <Card className="p-8 border-0 shadow-soft">
            <div className="text-center py-12">
              <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">Create Announcements</h3>
              <p className="text-muted-foreground mb-6">
                Send important messages to artists. They will receive email
                notifications and see the announcement in their dashboard.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Send className="w-4 h-4 mr-2" />
                Create Announcement
              </Button>
            </div>
          </Card>

          {/* Create Announcement Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Announcement</DialogTitle>
                <DialogDescription>
                  Send an announcement to one or all artists. They will receive
                  an email notification.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="recipient">Recipient</Label>
                  <Select
                    value={formData.recipient}
                    onValueChange={(value) =>
                      setFormData({ ...formData, recipient: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          All Artists
                        </div>
                      </SelectItem>
                      {artists.map((artist) => (
                        <SelectItem key={artist.user_id} value={artist.user_id}>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {artist.artist_name || artist.full_name || artist.email}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter announcement title"
                    className="mt-1"
                    disabled={sending}
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Enter your announcement message..."
                    rows={8}
                    className="mt-1"
                    disabled={sending}
                  />
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={sending}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSendAnnouncement} disabled={sending}>
                    {sending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Announcement
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminAnnouncements;

