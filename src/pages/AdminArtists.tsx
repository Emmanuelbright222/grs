import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Music, Calendar, RefreshCw, Plus, X, Save, Phone, Upload, Trash2, MoreVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminArtists = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [artists, setArtists] = useState<any[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    artist_name: "",
    email: "",
    phone_number: "",
    genre: "",
    bio: "",
    gender: "",
    is_featured: false,
    is_approved: false,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [artistImageFile, setArtistImageFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingArtistImage, setUploadingArtistImage] = useState(false);

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

    await loadAllArtists();
    setLoading(false);
  };

  const loadAllArtists = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading artists:", error);
      toast({
        title: "Error loading artists",
        description: error.message || "Failed to load artist list",
        variant: "destructive",
      });
    } else {
      console.log("Loaded artists:", data?.length || 0);
      setArtists(data || []);
    }
  };

  const handleArtistClick = (artist: any) => {
    setSelectedArtist(artist);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEditArtist = (artist: any) => {
    setSelectedArtist(artist);
    setIsEditing(true);
    setFormData({
      full_name: artist.full_name || "",
      artist_name: artist.artist_name || "",
      email: artist.email || "",
      phone_number: artist.phone_number || "",
      genre: artist.genre || "",
      bio: artist.bio || "",
      gender: artist.gender || "",
      is_featured: artist.is_featured || false,
      is_approved: artist.is_approved || false,
      spotify_url: artist.spotify_url || "",
      apple_music_url: artist.apple_music_url || "",
      youtube_music_url: artist.youtube_music_url || "",
      audiomack_url: artist.audiomack_url || "",
      boomplay_url: artist.boomplay_url || "",
    });
    setAvatarFile(null);
    setArtistImageFile(null);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteArtist = async (artist: any) => {
    if (!confirm(`Are you sure you want to delete "${artist.artist_name || artist.full_name}"? This will delete the user account and ALL related data. This action cannot be undone.`)) {
      return;
    }

    try {
      console.log("Attempting to delete artist:", artist.id);
      const userId = artist.user_id;
      
      // Step 1: Delete all related data first (before deleting profile/auth user)
      
      // Delete streaming platform connections
      if (userId) {
        await supabase
          .from("streaming_platform_connections")
          .delete()
          .eq("user_id", userId);
        
        // Delete streaming analytics
        await supabase
          .from("streaming_analytics")
          .delete()
          .eq("user_id", userId);
      }
      
      // Delete demo submissions (by user_id or profile id)
      if (userId) {
        await supabase
          .from("demo_submissions")
          .delete()
          .eq("user_id", userId);
      }
      
      // Delete profile (this might cascade some related data)
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", artist.id);

      if (profileError) {
        console.error("Delete profile error:", profileError);
        throw profileError;
      }

      // Step 2: Delete auth user if exists (this must be done via admin API or edge function)
      if (userId) {
        try {
          // Call an edge function to delete the auth user (requires admin privileges)
          const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`;
          const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
          
          const { data: { session } } = await supabase.auth.getSession();
          
          const deleteResponse = await fetch(functionUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session?.access_token || anonKey}`,
              "apikey": anonKey || "",
            },
            body: JSON.stringify({ userId }),
          });

          if (!deleteResponse.ok) {
            console.warn("Failed to delete auth user, but profile was deleted");
          }
        } catch (authError) {
          console.warn("Error deleting auth user:", authError);
          // Continue even if auth user deletion fails - profile is already deleted
        }
      }

      console.log("Delete successful");

      toast({
        title: "Success",
        description: "Artist and all related data deleted successfully",
      });

      // Reload artists list
      await loadAllArtists();
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete artist. Make sure you have admin permissions.",
        variant: "destructive",
      });
    }
  };

  const validateImageFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const validExtensions = ['jpg', 'jpeg', 'png'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(file.type) || !fileExt || !validExtensions.includes(fileExt)) {
      return "Please upload a JPEG or PNG image file only.";
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return "Image size must be less than 5MB.";
    }
    
    return null;
  };

  const handleAvatarUpload = async (file: File): Promise<string> => {
    setUploadingAvatar(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const validationError = validateImageFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `${user.id}/avatar_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleArtistImageUpload = async (file: File): Promise<string> => {
    setUploadingArtistImage(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const validationError = validateImageFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `${user.id}/artist_${Date.now()}.${fileExt}`;

      // Use avatars bucket for artist images as well, or create a separate bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } finally {
      setUploadingArtistImage(false);
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
              <h1 className="text-2xl md:text-4xl font-bold mb-2">All Artists</h1>
              <p className="text-muted-foreground">
                Manage and view all registered artists ({artists.length} total)
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <Button 
                onClick={async () => {
                  setLoading(true);
                  await loadAllArtists();
                  setLoading(false);
                }} 
                variant="outline"
                disabled={loading}
                className="w-full sm:w-auto"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Create Artist
              </Button>
              <Button onClick={() => navigate("/dashboard")} variant="hero" className="hidden md:inline-flex">
                Back to Dashboard
              </Button>
            </div>
          </div>

          {artists.length === 0 ? (
            <Card className="p-12 text-center border-0 shadow-soft">
              <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">No Artists Yet</h3>
              <p className="text-muted-foreground">
                No artists have registered yet.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {artists.map((artist) => (
                <Card
                  key={artist.id}
                  className="overflow-hidden border-0 shadow-soft hover:shadow-strong transition-smooth"
                >
                  <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                    {artist.artist_image_url || artist.avatar_url ? (
                      <img
                        src={artist.artist_image_url || artist.avatar_url}
                        alt={artist.artist_name || artist.full_name || "Artist"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-24 h-24 text-muted-foreground" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 truncate">
                      {artist.artist_name || artist.full_name || "Unknown Artist"}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {artist.full_name && artist.artist_name ? artist.full_name : ""}
                    </p>
                    {artist.email && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">{artist.email}</p>
                    )}
                    {artist.phone_number && (
                      <p className="text-xs text-muted-foreground truncate">{artist.phone_number}</p>
                    )}
                    {artist.created_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Joined: {new Date(artist.created_at).toLocaleDateString()}
                      </p>
                    )}
                    {artist.genre && (
                      <p className="text-xs text-accent mt-1">{artist.genre}</p>
                    )}
                    <div className="flex gap-2 mt-1">
                      {artist.is_featured && (
                        <p className="text-xs text-green-600 font-medium">⭐ Featured</p>
                      )}
                      {artist.is_approved && (
                        <p className="text-xs text-blue-600 font-medium">✓ Approved</p>
                      )}
                      {!artist.is_approved && (
                        <p className="text-xs text-orange-600 font-medium">⚠ Pending</p>
                      )}
                    </div>
                  </div>
                  <div className="p-2 pt-0 border-t">
                    {/* Mobile: Dropdown Menu */}
                    <div className="md:hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-full">
                            <MoreVertical className="w-4 h-4 mr-2" />
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleArtistClick(artist);
                          }}>
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleEditArtist(artist);
                          }}>
                            Edit
                          </DropdownMenuItem>
                          {artist.user_id && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dashboard?artist_id=${artist.id}`);
                              }}>
                                View Dashboard
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteArtist(artist);
                            }}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {/* Desktop: Button Row */}
                    <div className="hidden md:flex gap-2">
                      <Button
                        variant="hero"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArtistClick(artist);
                        }}
                        className="flex-1"
                      >
                        View
                      </Button>
                      <Button
                        variant="hero"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditArtist(artist);
                        }}
                        className="flex-1"
                      >
                        Edit
                      </Button>
                      {artist.user_id && (
                        <Button
                          variant="hero"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard?artist_id=${artist.id}`);
                          }}
                          title="View Dashboard"
                        >
                          Dashboard
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteArtist(artist);
                        }}
                        title="Delete Artist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Artist Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Artist Profile</DialogTitle>
            <DialogDescription>
              Complete profile information for this artist
            </DialogDescription>
          </DialogHeader>
          {selectedArtist && (
            <div className="space-y-4">
              <div className="flex items-center gap-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                    {selectedArtist.avatar_url ? (
                      <img
                        src={selectedArtist.avatar_url}
                        alt={selectedArtist.artist_name || selectedArtist.full_name || "Artist"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">
                    {selectedArtist.artist_name || selectedArtist.full_name || "Unknown Artist"}
                  </h2>
                  {selectedArtist.full_name && selectedArtist.artist_name && (
                    <p className="text-muted-foreground mb-2">{selectedArtist.full_name}</p>
                  )}
                  {selectedArtist.genre && (
                    <span className="inline-block px-3 py-1 bg-accent/20 text-accent rounded-full text-sm">
                      {selectedArtist.genre}
                    </span>
                  )}
                  </div>
                </div>

                {/* Artist Image Display */}
                {selectedArtist.artist_image_url && (
                  <div className="pt-4 border-t">
                    <Label className="text-sm text-muted-foreground mb-2 block">Artist Image</Label>
                    <img
                      src={selectedArtist.artist_image_url}
                      alt="Artist Image"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}

              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    {selectedArtist.email ? (
                      <a 
                        href={`mailto:${selectedArtist.email}`}
                        className="font-medium text-accent hover:underline"
                      >
                        {selectedArtist.email}
                      </a>
                    ) : (
                      <p className="font-medium">-</p>
                    )}
                  </div>
                </div>
                {selectedArtist.phone_number && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone Number</p>
                      <a 
                        href={`https://wa.me/${selectedArtist.phone_number.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-accent hover:underline"
                      >
                        {selectedArtist.phone_number}
                      </a>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date Joined</p>
                    <p className="font-medium">
                      {selectedArtist.created_at 
                        ? new Date(selectedArtist.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>

              {selectedArtist.bio && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Bio</p>
                  <p className="whitespace-pre-wrap">{selectedArtist.bio}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Artist Dialog */}
      <Dialog open={isCreateDialogOpen || isEditing} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setIsEditing(false);
          setAvatarFile(null);
          setArtistImageFile(null);
          setFormData({
            full_name: "",
            artist_name: "",
            email: "",
            phone_number: "",
            genre: "",
            bio: "",
            gender: "",
            is_featured: false,
            is_approved: false,
            spotify_url: "",
            apple_music_url: "",
            youtube_music_url: "",
            audiomack_url: "",
            boomplay_url: "",
          });
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Artist" : "Create New Artist"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Update artist information" : "Add a new artist to the platform"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <Label htmlFor="artist_name">Artist Name *</Label>
                <Input
                  id="artist_name"
                  value={formData.artist_name}
                  onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
                  placeholder="Enter artist/stage name"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="artist@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="+234 800 000 0000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="genre">Genre</Label>
              <Select
                value={formData.genre}
                onValueChange={(value) => setFormData({ ...formData, genre: value })}
              >
                <SelectTrigger>
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
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Artist biography..."
                rows={4}
              />
            </div>

            {/* Streaming Platform URLs */}
            <div className="space-y-3 pt-4 border-t">
              <h3 className="font-semibold text-sm">Streaming Platform Links (Optional)</h3>
              
              <div>
                <Label htmlFor="spotify_url">Spotify URL</Label>
                <Input
                  id="spotify_url"
                  type="url"
                  value={formData.spotify_url}
                  onChange={(e) => setFormData({ ...formData, spotify_url: e.target.value })}
                  placeholder="https://open.spotify.com/artist/..."
                />
              </div>

              <div>
                <Label htmlFor="apple_music_url">Apple Music URL</Label>
                <Input
                  id="apple_music_url"
                  type="url"
                  value={formData.apple_music_url}
                  onChange={(e) => setFormData({ ...formData, apple_music_url: e.target.value })}
                  placeholder="https://music.apple.com/artist/..."
                />
              </div>

              <div>
                <Label htmlFor="youtube_music_url">YouTube Music URL</Label>
                <Input
                  id="youtube_music_url"
                  type="url"
                  value={formData.youtube_music_url}
                  onChange={(e) => setFormData({ ...formData, youtube_music_url: e.target.value })}
                  placeholder="https://music.youtube.com/channel/..."
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

            {/* Avatar Upload */}
            <div>
              <Label>Profile Picture (Avatar)</Label>
              <div className="space-y-2">
                <Input
                  id="avatar_upload"
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
                      setAvatarFile(file);
                    }
                  }}
                  disabled={uploadingAvatar}
                />
                {avatarFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {avatarFile.name}
                  </p>
                )}
                {isEditing && selectedArtist?.avatar_url && !avatarFile && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-1">Current avatar:</p>
                    <img
                      src={selectedArtist.avatar_url}
                      alt="Current avatar"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Artist Image Upload */}
            <div>
              <Label>Artist Image (Large image for artist pages)</Label>
              <div className="space-y-2">
                <Input
                  id="artist_image_upload"
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
                      setArtistImageFile(file);
                    }
                  }}
                  disabled={uploadingArtistImage}
                />
                {artistImageFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {artistImageFile.name}
                  </p>
                )}
                {isEditing && selectedArtist?.artist_image_url && !artistImageFile && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-1">Current artist image:</p>
                    <img
                      src={selectedArtist.artist_image_url}
                      alt="Current artist image"
                      className="w-48 h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                JPEG or PNG only (Max 5MB)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_approved"
                checked={formData.is_approved}
                onCheckedChange={(checked) => setFormData({ ...formData, is_approved: checked as boolean })}
              />
              <Label htmlFor="is_approved" className="cursor-pointer">
                Approved (appears on Artists page)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked as boolean })}
              />
              <Label htmlFor="is_featured" className="cursor-pointer">
                Featured Artist (appears on homepage)
              </Label>
            </div>

            <div className="flex gap-2 justify-end">
              <Button 
                variant="hero" 
                className="bg-muted text-muted-foreground hover:bg-muted/80"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setIsEditing(false);
                  setAvatarFile(null);
                  setArtistImageFile(null);
                  setFormData({
                    full_name: "",
                    artist_name: "",
                    email: "",
                    phone_number: "",
                    genre: "",
                    bio: "",
                    is_featured: false,
                    is_approved: false,
                  });
                }}
              >
                Cancel
              </Button>
              <Button onClick={async () => {
                try {
                  if (!formData.artist_name || !formData.email) {
                    toast({
                      title: "Error",
                      description: "Artist name and email are required",
                      variant: "destructive",
                    });
                    return;
                  }

                  // Upload images first if selected
                  let avatarUrl: string | null = null;
                  let artistImageUrl: string | null = null;

                  if (avatarFile) {
                    avatarUrl = await handleAvatarUpload(avatarFile);
                  }

                  if (artistImageFile) {
                    artistImageUrl = await handleArtistImageUpload(artistImageFile);
                  }

                  if (isEditing && selectedArtist) {
                    const updateData: any = {
                      full_name: formData.full_name || null,
                      artist_name: formData.artist_name,
                      email: formData.email,
                      phone_number: formData.phone_number || null,
                      genre: formData.genre || null,
                      bio: formData.bio || null,
                      gender: formData.gender || null,
                      is_featured: formData.is_featured,
                      is_approved: formData.is_approved,
                      spotify_url: formData.spotify_url || null,
                      apple_music_url: formData.apple_music_url || null,
                      youtube_music_url: formData.youtube_music_url || null,
                      audiomack_url: formData.audiomack_url || null,
                      boomplay_url: formData.boomplay_url || null,
                    };

                    // Only update image URLs if new images were uploaded
                    if (avatarUrl) {
                      updateData.avatar_url = avatarUrl;
                    }
                    if (artistImageUrl) {
                      updateData.artist_image_url = artistImageUrl;
                    }

                    const { error } = await supabase
                      .from("profiles")
                      .update(updateData)
                      .eq("id", selectedArtist.id);

                    if (error) throw error;
                    toast({
                      title: "Success",
                      description: "Artist updated successfully",
                    });
                  } else {
                    // Create new profile using admin function (bypasses RLS)
                    const { data, error } = await supabase.rpc('admin_create_profile', {
                      p_full_name: formData.full_name || null,
                      p_artist_name: formData.artist_name,
                      p_email: formData.email,
                      p_phone_number: formData.phone_number || null,
                      p_genre: formData.genre || null,
                      p_bio: formData.bio || null,
                      p_gender: formData.gender || null,
                      p_is_featured: formData.is_featured || false,
                      p_is_approved: formData.is_approved || false,
                      p_avatar_url: avatarUrl,
                      p_artist_image_url: artistImageUrl,
                      p_spotify_url: formData.spotify_url || null,
                      p_apple_music_url: formData.apple_music_url || null,
                      p_youtube_music_url: formData.youtube_music_url || null,
                      p_audiomack_url: formData.audiomack_url || null,
                      p_boomplay_url: formData.boomplay_url || null,
                    });

                    if (error) throw error;
                    toast({
                      title: "Success",
                      description: "Artist created successfully",
                    });
                  }

                  setIsCreateDialogOpen(false);
                  setIsEditing(false);
                  setAvatarFile(null);
                  setArtistImageFile(null);
                  await loadAllArtists();
                  setFormData({
                    full_name: "",
                    artist_name: "",
                    email: "",
                    phone_number: "",
                    genre: "",
                    bio: "",
                    gender: "",
                    is_featured: false,
                    is_approved: false,
                  });
                } catch (error: any) {
                  toast({
                    title: "Error",
                    description: error.message || "Failed to save artist",
                    variant: "destructive",
                  });
                }
              }} disabled={uploadingAvatar || uploadingArtistImage}>
                {uploadingAvatar || uploadingArtistImage ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditing ? "Update" : "Create"} Artist
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

export default AdminArtists;

