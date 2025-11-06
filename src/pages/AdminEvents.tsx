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
import { Calendar, Plus, X, Save, MapPin, Ticket, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AdminEvents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    artist_name: "",
    event_date: "",
    event_time: "",
    location: "",
    venue: "",
    description: "",
    image_url: "",
    ticket_url: "",
  });
  const [eventImageFile, setEventImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/login");
      return;
    }

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

    await loadEvents();
    setLoading(false);
  };

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });

    if (error) {
      console.error("Error loading events:", error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    } else {
      setEvents(data || []);
    }
  };

  const validateImageFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(file.type) || (fileExt && !['jpg', 'jpeg', 'png'].includes(fileExt))) {
      return "Please upload a JPEG or PNG image file only.";
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return "Image size must be less than 5MB.";
    }
    
    return null;
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    setUploadingImage(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const validationError = validateImageFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('events')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('events')
        .getPublicUrl(fileName);

      return publicUrl;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleOpenDialog = () => {
    setIsEditing(false);
    setEditingEvent(null);
    setEventImageFile(null);
    setFormData({
      title: "",
      artist_name: "",
      event_date: "",
      event_time: "",
      location: "",
      venue: "",
      description: "",
      image_url: "",
      ticket_url: "",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (event: any) => {
    setIsEditing(true);
    setEditingEvent(event);
    setEventImageFile(null);
    setFormData({
      title: event.title || "",
      artist_name: event.artist_name || "",
      event_date: event.event_date || "",
      event_time: event.event_time || "",
      location: event.location || "",
      venue: event.venue || "",
      description: event.description || "",
      image_url: event.image_url || "",
      ticket_url: event.ticket_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let imageUrl = formData.image_url;
      if (eventImageFile) {
        imageUrl = await handleImageUpload(eventImageFile);
      }

      const eventData: any = {
        title: formData.title,
        artist_name: formData.artist_name || null,
        event_date: formData.event_date || null,
        event_time: formData.event_time || null,
        location: formData.location,
        venue: formData.venue || null,
        description: formData.description || null,
        image_url: imageUrl || null,
        ticket_url: formData.ticket_url || null,
        user_id: user.id,
        is_past_event: formData.event_date ? new Date(formData.event_date) < new Date() : false,
      };

      if (isEditing && editingEvent) {
        const { error } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", editingEvent.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Event updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("events")
          .insert(eventData);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Event created successfully",
        });
      }

      setIsDialogOpen(false);
      await loadEvents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save event",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
      await loadEvents();
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
              <h1 className="text-2xl md:text-4xl font-bold mb-2">Manage Events</h1>
              <p className="text-muted-foreground">Create and manage events</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <Button onClick={handleOpenDialog} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
              <Button onClick={() => navigate("/dashboard")} variant="hero" className="hidden md:inline-flex">
                Back to Dashboard
              </Button>
            </div>
          </div>

          {events.length === 0 ? (
            <Card className="p-12 text-center border-0 shadow-soft">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">No Events Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first event to get started
              </p>
              <Button onClick={handleOpenDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event.id} className="overflow-hidden border-0 shadow-soft">
                  {event.image_url && (
                    <div className="aspect-video bg-muted overflow-hidden">
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 truncate">{event.title}</h3>
                    {event.artist_name && (
                      <p className="text-sm text-muted-foreground mb-2">{event.artist_name}</p>
                    )}
                    <div className="space-y-1 text-xs text-muted-foreground mb-3">
                      {event.event_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(event.event_date).toLocaleDateString()}</span>
                          {event.event_time && <span> at {event.event_time}</span>}
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{event.location}</span>
                          {event.venue && <span> - {event.venue}</span>}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="hero"
                        size="sm"
                        onClick={() => handleEdit(event)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(event.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Event" : "Create New Event"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Update event information" : "Add a new event"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter event title"
                required
              />
            </div>

            <div>
              <Label htmlFor="artist_name">Artist Name</Label>
              <Input
                id="artist_name"
                value={formData.artist_name}
                onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
                placeholder="Enter artist name (optional)"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event_date">Event Date *</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="event_time">Event Time</Label>
                <Input
                  id="event_time"
                  type="time"
                  value={formData.event_time}
                  onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, Country"
                  required
                />
              </div>

              <div>
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="Venue name (optional)"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="event_image">Event Image</Label>
              <div className="space-y-2">
                <Input
                  id="event_image"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const validationError = validateImageFile(file);
                      if (validationError) {
                        toast({
                          title: "Invalid file",
                          description: validationError,
                          variant: "destructive",
                        });
                        return;
                      }
                      setEventImageFile(file);
                      setFormData({ ...formData, image_url: "" }); // Clear URL if file is selected
                    }
                  }}
                  disabled={uploadingImage}
                />
                <p className="text-xs text-muted-foreground">
                  JPEG or PNG only (Max 5MB). Or enter URL below.
                </p>
                {eventImageFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {eventImageFile.name}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <Label htmlFor="image_url" className="text-sm text-muted-foreground">Or enter image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => {
                    setFormData({ ...formData, image_url: e.target.value });
                    setEventImageFile(null); // Clear file if URL is entered
                  }}
                  placeholder="https://example.com/image.jpg"
                  disabled={uploadingImage || !!eventImageFile}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ticket_url">Ticket URL</Label>
              <Input
                id="ticket_url"
                type="url"
                value={formData.ticket_url}
                onChange={(e) => setFormData({ ...formData, ticket_url: e.target.value })}
                placeholder="https://ticketmaster.com/..."
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Event description..."
                rows={4}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={uploadingImage}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={uploadingImage}>
                {uploadingImage ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditing ? "Update" : "Create"} Event
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AdminEvents;

