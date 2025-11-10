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
import { Music, Plus, X, Save, Calendar, Image as ImageIcon, Upload, ExternalLink, CheckCircle2, Clock, XCircle } from "lucide-react";
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

type ReleaseFormState = {
  title: string;
  artist_name: string;
  genre: string;
  release_date: string;
  release_type: string;
  streaming_url: string;
  spotify_url: string;
  apple_music_url: string;
  youtube_music_url: string;
  audiomack_url: string;
  boomplay_url: string;
  cover_url: string;
  description: string;
  is_latest_release: boolean;
  distrokid_status: string;
  distrokid_release_id: string;
  distrokid_dashboard_url: string;
};

const initialReleaseFormState: ReleaseFormState = {
  title: "",
  artist_name: "",
  genre: "",
  release_date: "",
  release_type: "",
  streaming_url: "",
  spotify_url: "",
  apple_music_url: "",
  youtube_music_url: "",
  audiomack_url: "",
  boomplay_url: "",
  cover_url: "",
  description: "",
  is_latest_release: false,
  distrokid_status: "not_distributed",
  distrokid_release_id: "",
  distrokid_dashboard_url: "",
};

const AdminReleases = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [releases, setReleases] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRelease, setEditingRelease] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [formData, setFormData] = useState<ReleaseFormState>(initialReleaseFormState);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
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

    setCurrentUser(user);

    await loadReleases();
    setLoading(false);
  };

  const loadReleases = async () => {
    const { data, error } = await supabase
      .from("releases")
      .select("*")
      .order("release_date", { ascending: false });

    if (error) {
      console.error("Error loading releases:", error);
      toast({
        title: "Error",
        description: "Failed to load releases",
        variant: "destructive",
      });
    } else {
      setReleases(data || []);
    }
  };

  const handleOpenDialog = () => {
    setIsEditing(false);
    setEditingRelease(null);
    setCoverImageFile(null);
    setFormData(initialReleaseFormState);
    setIsDialogOpen(true);
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
      let user = currentUser;

      if (!user) {
        const { data: { user: freshUser } } = await supabase.auth.getUser();
        user = freshUser;
      }

      if (!user) throw new Error("Not authenticated");

      const validationError = validateImageFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('releases')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('releases')
        .getPublicUrl(fileName);

      return publicUrl;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEdit = (release: any) => {
    setIsEditing(true);
    setEditingRelease(release);
    setFormData({
      title: release.title || "",
      artist_name: release.artist_name || "",
      genre: release.genre || "",
      release_date: release.release_date || "",
      release_type: release.release_type || "",
      streaming_url: release.streaming_url || "",
      spotify_url: release.spotify_url || "",
      apple_music_url: release.apple_music_url || "",
      youtube_music_url: release.youtube_music_url || "",
      audiomack_url: release.audiomack_url || "",
      boomplay_url: release.boomplay_url || "",
      cover_url: release.cover_url || "",
      description: release.description || "",
      is_latest_release: release.is_latest_release || false,
      distrokid_status: release.distrokid_status || "not_distributed",
      distrokid_release_id: release.distrokid_release_id || "",
      distrokid_dashboard_url: release.distrokid_dashboard_url || "",
    });
    setCoverImageFile(null);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let coverUrl = formData.cover_url;
      if (coverImageFile) {
        coverUrl = await handleImageUpload(coverImageFile);
      }

      const releaseData: any = {
        title: formData.title,
        artist_name: formData.artist_name,
        genre: formData.genre || null,
        release_date: formData.release_date || null,
        release_type: formData.release_type || null,
        streaming_url: formData.streaming_url || null,
        spotify_url: formData.spotify_url || null,
        apple_music_url: formData.apple_music_url || null,
        youtube_music_url: formData.youtube_music_url || null,
        audiomack_url: formData.audiomack_url || null,
        boomplay_url: formData.boomplay_url || null,
        cover_url: coverUrl || null,
        description: formData.description || null,
        is_latest_release: formData.is_latest_release || false,
        distrokid_status: formData.distrokid_status || "not_distributed",
        distrokid_release_id: formData.distrokid_release_id || null,
        distrokid_dashboard_url: formData.distrokid_dashboard_url || null,
        distrokid_submitted_at: formData.distrokid_status !== "not_distributed" && !editingRelease?.distrokid_submitted_at 
          ? new Date().toISOString() 
          : editingRelease?.distrokid_submitted_at || null,
        user_id: user.id,
      };

      if (isEditing && editingRelease) {
        const { error } = await supabase
          .from("releases")
          .update(releaseData)
          .eq("id", editingRelease.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Release updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("releases")
          .insert(releaseData);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Release created successfully",
        });
      }

      setIsDialogOpen(false);
      await loadReleases();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save release",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this release?")) return;

    const { error } = await supabase
      .from("releases")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete release",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Release deleted successfully",
      });
      await loadReleases();
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
              <h1 className="text-2xl md:text-4xl font-bold mb-2">Manage Releases</h1>
              <p className="text-muted-foreground">Create and manage music releases</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <Button onClick={handleOpenDialog} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Create Release
              </Button>
              <Button onClick={() => navigate("/dashboard")} variant="hero" className="hidden md:inline-flex">
                Back to Dashboard
              </Button>
            </div>
          </div>

          {releases.length === 0 ? (
            <Card className="p-12 text-center border-0 shadow-soft">
              <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">No Releases Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first release to get started
              </p>
              <Button onClick={handleOpenDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Create Release
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {releases.map((release) => (
                <Card key={release.id} className="overflow-hidden border-0 shadow-soft">
                  {release.cover_url && (
                    <div className="aspect-square bg-muted overflow-hidden">
                      <img
                        src={release.cover_url}
                        alt={release.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 truncate">{release.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{release.artist_name}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      {release.release_date && (
                        <span>{new Date(release.release_date).getFullYear()}</span>
                      )}
                      {release.genre && <span>{release.genre}</span>}
                      {release.release_type && <span>{release.release_type}</span>}
                    </div>
                    {release.distrokid_status && release.distrokid_status !== "not_distributed" && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 text-xs">
                          {release.distrokid_status === "live" && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          )}
                          {release.distrokid_status === "pending" && (
                            <Clock className="w-3.5 h-3.5 text-yellow-500" />
                          )}
                          {release.distrokid_status === "processing" && (
                            <Clock className="w-3.5 h-3.5 text-blue-500" />
                          )}
                          {release.distrokid_status === "rejected" && (
                            <XCircle className="w-3.5 h-3.5 text-red-500" />
                          )}
                          <span className="capitalize font-medium">
                            DistroKid: {release.distrokid_status.replace("_", " ")}
                          </span>
                          {release.distrokid_dashboard_url && (
                            <a
                              href={release.distrokid_dashboard_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="hero"
                        size="sm"
                        onClick={() => handleEdit(release)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(release.id)}
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
            <DialogTitle>{isEditing ? "Edit Release" : "Create New Release"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Update release information" : "Add a new music release"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Music Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter music title"
                required
              />
            </div>

            <div>
              <Label htmlFor="artist_name">Artist Name *</Label>
              <Input
                id="artist_name"
                value={formData.artist_name}
                onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
                placeholder="Enter artist name"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="genre">Category/Genre</Label>
                <Select
                  value={formData.genre}
                  onValueChange={(value) => setFormData({ ...formData, genre: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pop">Pop</SelectItem>
                    <SelectItem value="R&B">R&B</SelectItem>
                    <SelectItem value="Hip-Hop">Hip-Hop</SelectItem>
                    <SelectItem value="Afrobeat">Afrobeat</SelectItem>
                    <SelectItem value="Gospel">Gospel</SelectItem>
                    <SelectItem value="Reggae">Reggae</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="release_type">Type</Label>
                <Select
                  value={formData.release_type}
                  onValueChange={(value) => setFormData({ ...formData, release_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Album">Album</SelectItem>
                    <SelectItem value="EP">EP</SelectItem>
                    <SelectItem value="Compilation">Compilation</SelectItem>
                    <SelectItem value="Single">Single</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="release_date">Release Year</Label>
              <Input
                id="release_date"
                type="date"
                value={formData.release_date}
                onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="cover_image">Cover Image</Label>
              <div className="space-y-2">
                <Input
                  id="cover_image"
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
                      setCoverImageFile(file);
                      setFormData({ ...formData, cover_url: "" }); // Clear URL if file is selected
                    }
                  }}
                  disabled={uploadingImage}
                />
                <p className="text-xs text-muted-foreground">
                  JPEG or PNG only (Max 5MB). Or enter URL below.
                </p>
                {coverImageFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {coverImageFile.name}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <Label htmlFor="cover_url" className="text-sm text-muted-foreground">Or enter image URL</Label>
                <Input
                  id="cover_url"
                  value={formData.cover_url}
                  onChange={(e) => {
                    setFormData({ ...formData, cover_url: e.target.value });
                    setCoverImageFile(null); // Clear file if URL is entered
                  }}
                  placeholder="https://example.com/image.jpg"
                  disabled={uploadingImage || !!coverImageFile}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="streaming_url">Streaming Link (Legacy - Optional)</Label>
              <Input
                id="streaming_url"
                type="url"
                value={formData.streaming_url}
                onChange={(e) => setFormData({ ...formData, streaming_url: e.target.value })}
                placeholder="https://open.spotify.com/..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use platform-specific URLs below for better organization
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Platform-Specific Links (Optional)</h3>
              
              <div>
                <Label htmlFor="spotify_url">Spotify URL</Label>
                <Input
                  id="spotify_url"
                  type="url"
                  value={formData.spotify_url}
                  onChange={(e) => setFormData({ ...formData, spotify_url: e.target.value })}
                  placeholder="https://open.spotify.com/album/..."
                />
              </div>

              <div>
                <Label htmlFor="apple_music_url">Apple Music URL</Label>
                <Input
                  id="apple_music_url"
                  type="url"
                  value={formData.apple_music_url}
                  onChange={(e) => setFormData({ ...formData, apple_music_url: e.target.value })}
                  placeholder="https://music.apple.com/album/..."
                />
              </div>

              <div>
                <Label htmlFor="youtube_music_url">YouTube Music URL</Label>
                <Input
                  id="youtube_music_url"
                  type="url"
                  value={formData.youtube_music_url}
                  onChange={(e) => setFormData({ ...formData, youtube_music_url: e.target.value })}
                  placeholder="https://music.youtube.com/playlist/..."
                />
              </div>

              <div>
                <Label htmlFor="audiomack_url">Audiomack URL</Label>
                <Input
                  id="audiomack_url"
                  type="url"
                  value={formData.audiomack_url}
                  onChange={(e) => setFormData({ ...formData, audiomack_url: e.target.value })}
                  placeholder="https://audiomack.com/..."
                />
              </div>

              <div>
                <Label htmlFor="boomplay_url">Boomplay URL</Label>
                <Input
                  id="boomplay_url"
                  type="url"
                  value={formData.boomplay_url}
                  onChange={(e) => setFormData({ ...formData, boomplay_url: e.target.value })}
                  placeholder="https://www.boomplay.com/..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Release description..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_latest_release"
                checked={formData.is_latest_release}
                onCheckedChange={(checked) => setFormData({ ...formData, is_latest_release: checked as boolean })}
              />
              <Label htmlFor="is_latest_release" className="cursor-pointer">
                Latest Release (appears on homepage "Latest Releases" section)
              </Label>
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold text-sm mb-3">DistroKid Distribution</h3>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="distrokid_status">Distribution Status</Label>
                  <Select
                    value={formData.distrokid_status}
                    onValueChange={(value) => setFormData({ ...formData, distrokid_status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_distributed">Not Distributed</SelectItem>
                      <SelectItem value="pending">Pending Submission</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="live">Live on Platforms</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="distrokid_release_id">DistroKid Release ID</Label>
                  <Input
                    id="distrokid_release_id"
                    value={formData.distrokid_release_id}
                    onChange={(e) => setFormData({ ...formData, distrokid_release_id: e.target.value })}
                    placeholder="e.g., DK-12345 or submission reference"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Reference ID from DistroKid dashboard
                  </p>
                </div>

                <div>
                  <Label htmlFor="distrokid_dashboard_url">DistroKid Dashboard URL</Label>
                  <Input
                    id="distrokid_dashboard_url"
                    type="url"
                    value={formData.distrokid_dashboard_url}
                    onChange={(e) => setFormData({ ...formData, distrokid_dashboard_url: e.target.value })}
                    placeholder="https://distrokid.com/hyperfollow/..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Direct link to this release in DistroKid dashboard
                  </p>
                </div>
              </div>
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
                    {isEditing ? "Update" : "Create"} Release
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

export default AdminReleases;

