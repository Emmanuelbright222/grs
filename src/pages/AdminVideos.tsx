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
import { Youtube, Plus, X, Save, Calendar, Trash2, Edit, ExternalLink } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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

type VideoFormState = {
  artist_name: string;
  song_title: string;
  genre: string;
  youtube_url: string;
  description: string;
  publish_date: string;
  is_featured: boolean;
};

const initialVideoFormState: VideoFormState = {
  artist_name: "",
  song_title: "",
  genre: "",
  youtube_url: "",
  description: "",
  publish_date: "",
  is_featured: false,
};

// Function to extract YouTube video ID from URL
const extractYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

// Function to get YouTube thumbnail URL
const getYouTubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

const AdminVideos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [formData, setFormData] = useState<VideoFormState>(initialVideoFormState);

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

    setCurrentUser(user);
    await loadVideos();
    setLoading(false);
  };

  const loadVideos = async () => {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .order("publish_date", { ascending: false });

    if (error) {
      console.error("Error loading videos:", error);
      toast({
        title: "Error",
        description: "Failed to load videos",
        variant: "destructive",
      });
    } else {
      setVideos(data || []);
    }
  };

  const handleOpenDialog = () => {
    setIsEditing(false);
    setEditingVideo(null);
    setFormData(initialVideoFormState);
    setIsDialogOpen(true);
  };

  const handleEdit = (video: any) => {
    setIsEditing(true);
    setEditingVideo(video);
    setFormData({
      artist_name: video.artist_name || "",
      song_title: video.song_title || "",
      genre: video.genre || "",
      youtube_url: video.youtube_url || "",
      description: video.description || "",
      publish_date: video.publish_date || "",
      is_featured: video.is_featured || false,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (!formData.artist_name || !formData.song_title || !formData.youtube_url) {
        toast({
          title: "Error",
          description: "Artist name, song title, and YouTube URL are required",
          variant: "destructive",
        });
        return;
      }

      const videoId = extractYouTubeVideoId(formData.youtube_url);
      if (!videoId) {
        toast({
          title: "Error",
          description: "Invalid YouTube URL. Please provide a valid YouTube video link.",
          variant: "destructive",
        });
        return;
      }

      const thumbnailUrl = getYouTubeThumbnail(videoId);

      // Check featured limit (3 max)
      if (formData.is_featured) {
        const { data: featuredVideos, error: countError } = await supabase
          .from("videos")
          .select("id")
          .eq("is_featured", true);

        if (countError) throw countError;

        const currentFeaturedCount = featuredVideos?.length || 0;
        const isCurrentlyFeatured = isEditing && editingVideo?.is_featured;

        if (!isCurrentlyFeatured && currentFeaturedCount >= 3) {
          toast({
            title: "Featured Limit Reached",
            description: "Maximum featured limit reached (3 max). This video will only be published. Unfeature another video to feature this one.",
            variant: "destructive",
            duration: 8000, // 8 seconds
          });
          // Set is_featured to false but continue with save
          formData.is_featured = false;
        }
      }

      const videoData: any = {
        artist_name: formData.artist_name,
        song_title: formData.song_title,
        genre: formData.genre || null,
        youtube_url: formData.youtube_url,
        youtube_video_id: videoId,
        description: formData.description || null,
        publish_date: formData.publish_date || null,
        is_featured: formData.is_featured || false,
        thumbnail_url: thumbnailUrl,
        user_id: user.id,
      };

      if (isEditing && editingVideo) {
        const { error } = await supabase
          .from("videos")
          .update(videoData)
          .eq("id", editingVideo.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Video updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("videos")
          .insert(videoData);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Video created successfully",
        });
      }

      setIsDialogOpen(false);
      await loadVideos();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save video",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    const { error } = await supabase
      .from("videos")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Video deleted successfully",
      });
      await loadVideos();
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
              <h1 className="text-2xl md:text-4xl font-bold mb-2">Manage Videos</h1>
              <p className="text-muted-foreground">Create and manage music videos</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <Button onClick={handleOpenDialog} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Create Video
              </Button>
              <Button onClick={() => navigate("/dashboard")} variant="hero" className="hidden md:inline-flex">
                Back to Dashboard
              </Button>
            </div>
          </div>

          {videos.length === 0 ? (
            <Card className="p-12 text-center border-0 shadow-soft">
              <Youtube className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">No Videos Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first video entry to get started
              </p>
              <Button onClick={handleOpenDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Create Video
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => {
                const videoId = video.youtube_video_id || extractYouTubeVideoId(video.youtube_url);
                const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;
                
                return (
                  <Card key={video.id} className="border-0 shadow-soft overflow-hidden">
                    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                      {embedUrl ? (
                        <iframe
                          src={embedUrl}
                          title={video.song_title}
                          className="absolute top-0 left-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div className="absolute top-0 left-0 w-full h-full bg-muted flex items-center justify-center">
                          <Youtube className="w-16 h-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg line-clamp-1">{video.song_title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">{video.artist_name}</p>
                        </div>
                        {video.is_featured && (
                          <span className="ml-2 px-2 py-1 bg-accent text-accent-foreground text-xs rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        {video.publish_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(video.publish_date).toLocaleDateString()}
                          </div>
                        )}
                        {video.genre && (
                          <span className="text-accent font-medium">{video.genre}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(video)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(video.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        {video.youtube_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="flex-1"
                          >
                            <a
                              href={video.youtube_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Video" : "Create New Video"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Update video information" : "Add a new music video to the platform"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="artist_name">Artist Name *</Label>
              <Input
                id="artist_name"
                value={formData.artist_name}
                onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
                placeholder="Enter artist name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="song_title">Song Title *</Label>
              <Input
                id="song_title"
                value={formData.song_title}
                onChange={(e) => setFormData({ ...formData, song_title: e.target.value })}
                placeholder="Enter song title"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="genre">Genre</Label>
                <Select
                  value={formData.genre || undefined}
                  onValueChange={(value) => setFormData({ ...formData, genre: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Afrobeat">Afrobeat</SelectItem>
                    <SelectItem value="R&B">R&B</SelectItem>
                    <SelectItem value="Hip-Hop">Hip-Hop</SelectItem>
                    <SelectItem value="Pop">Pop</SelectItem>
                    <SelectItem value="Gospel">Gospel</SelectItem>
                    <SelectItem value="Reggae">Reggae</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="publish_date">Publish Date</Label>
                <Input
                  id="publish_date"
                  type="date"
                  value={formData.publish_date}
                  onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="youtube_url">YouTube URL *</Label>
              <Input
                id="youtube_url"
                value={formData.youtube_url}
                onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Supports standard YouTube URLs (youtube.com/watch?v=...) or short URLs (youtu.be/...)
              </p>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter video description"
                rows={4}
                className="mt-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_featured: checked === true })
                }
              />
              <Label htmlFor="is_featured" className="cursor-pointer">
                Feature this video
              </Label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? "Update" : "Create"} Video
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
};

export default AdminVideos;

