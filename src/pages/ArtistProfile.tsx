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
import { User, Edit2, Save, X, Camera, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const ArtistProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    artist_name: "",
    genre: "",
    bio: "",
    avatarFile: null as File | null,
    artistImageFile: null as File | null,
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingArtistImage, setUploadingArtistImage] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/login");
      return;
    }

    await loadProfile(user.id);
    setLoading(false);
  };

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error loading profile:", error);
        return null;
      } else {
        console.log("Profile loaded in ArtistProfile:", data);
        setProfile(data || null);
        if (data) {
          setProfileForm({
            full_name: data.full_name || "",
            artist_name: data.artist_name || "",
            genre: data.genre || "",
            bio: data.bio || "",
            avatarFile: null,
            artistImageFile: null,
          });
        }
        return data;
      }
    } catch (err) {
      console.error("Exception loading profile:", err);
      return null;
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

  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Validate file
      const validationError = validateImageFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      // Upload to storage - fix path (don't include 'avatars' prefix)
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      toast({
        title: "Avatar updated!",
        description: "Your profile picture has been updated successfully.",
      });

      // Reload profile to get updated avatar_url
      const updatedProfile = await loadProfile(user.id);
      
      // Update local state immediately for instant feedback
      if (updatedProfile) {
        setProfile(updatedProfile);
        // Reset avatar file in form
        setProfileForm({
          ...profileForm,
          avatarFile: null,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload avatar.",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleArtistImageUpload = async (file: File) => {
    setUploadingArtistImage(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const validationError = validateImageFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/artist-image-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ artist_image_url: publicUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      toast({
        title: "Artist image updated!",
        description: "Your artist image has been updated successfully.",
      });

      // Reload profile to get updated artist_image_url
      const updatedProfile = await loadProfile(user.id);
      
      // Update local state immediately
      if (updatedProfile) {
        setProfile(updatedProfile);
        // Reset artist image file in form
        setProfileForm({
          ...profileForm,
          artistImageFile: null,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload artist image.",
        variant: "destructive",
      });
    } finally {
      setUploadingArtistImage(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload avatar if selected
      if (profileForm.avatarFile) {
        await handleAvatarUpload(profileForm.avatarFile);
      }

      // Upload artist image if selected
      if (profileForm.artistImageFile) {
        await handleArtistImageUpload(profileForm.artistImageFile);
      }

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: profileForm.full_name,
          artist_name: profileForm.artist_name,
          genre: profileForm.genre,
          bio: profileForm.bio,
        })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      toast({
        title: "Profile updated!",
        description: "Your profile has been saved successfully.",
      });

      // Reset form files
      setProfileForm({
        ...profileForm,
        avatarFile: null,
        artistImageFile: null,
      });
      
      setIsEditingProfile(false);
      
      // Reload and update profile
      const updatedProfile = await loadProfile(user.id);
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save profile.",
        variant: "destructive",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const getProfileCompletion = () => {
    if (!profile) return 0;
    let completed = 0;
    const total = 8; // full_name, artist_name, email, genre, bio, avatar_url, artist_image_url, phone_number
    
    if (profile.full_name) completed++;
    if (profile.artist_name) completed++;
    if (profile.email) completed++;
    if (profile.genre) completed++;
    if (profile.bio) completed++;
    if (profile.avatar_url) completed++;
    if (profile.artist_image_url) completed++;
    if (profile.phone_number) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const getMissingFields = () => {
    if (!profile) return [];
    const missing: string[] = [];
    if (!profile.full_name) missing.push("Full Name");
    if (!profile.artist_name) missing.push("Artist Name");
    if (!profile.email) missing.push("Email");
    if (!profile.genre) missing.push("Genre");
    if (!profile.bio) missing.push("Bio");
    if (!profile.avatar_url) missing.push("Profile Picture");
    if (!profile.artist_image_url) missing.push("Artist Image");
    if (!profile.phone_number) missing.push("Phone Number");
    return missing;
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
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-1xl md:text-4xl font-bold mb-2">My Profile</h1>
              <p className="text-muted-foreground">
                Manage your profile information
              </p>
            </div>
            <Button onClick={() => navigate("/dashboard")} variant="hero" className="hidden md:inline-flex">
              Back to Dashboard
            </Button>
          </div>

          <Card className="p-8 border-0 shadow-soft mb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6 gap-4">
              <div className="text-center md:text-left">
                <div className="flex items-center gap-4 justify-center md:justify-start mb-2">
                  <User className="w-8 h-8 text-accent" />
                  <h2 className="text-1xl font-bold">Profile Information</h2>
                </div>
                <p className="text-muted-foreground">Edit and update your details</p>
              </div>
              <div className="flex justify-center md:justify-end">
                {!isEditingProfile ? (
                  <Button onClick={() => setIsEditingProfile(true)} variant="hero" size="sm">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile} disabled={savingProfile || uploadingAvatar || uploadingArtistImage} size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      {savingProfile || uploadingAvatar || uploadingArtistImage ? "Saving..." : "Save"}
                    </Button>
                    <Button 
                      onClick={() => {
                        setIsEditingProfile(false);
                        if (profile) {
                          setProfileForm({
                            full_name: profile.full_name || "",
                            artist_name: profile.artist_name || "",
                            genre: profile.genre || "",
                            bio: profile.bio || "",
                            avatarFile: null,
                            artistImageFile: null,
                          });
                        }
                      }} 
                      variant="hero" 
                      size="sm"
                      disabled={savingProfile || uploadingAvatar || uploadingArtistImage}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Completion Indicator */}
            {getProfileCompletion() < 100 && (
              <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-accent" />
                  <h3 className="font-semibold">Complete Your Profile</h3>
                  <span className="ml-auto text-sm font-medium">{getProfileCompletion()}% Complete</span>
                </div>
                <Progress value={getProfileCompletion()} className="mb-2" />
                <p className="text-sm text-muted-foreground">
                  Missing: {getMissingFields().join(", ")}
                </p>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  {profile?.avatar_url && profile.avatar_url.trim() ? (
                    <img
                      key={`profile-avatar-${profile.avatar_url}`}
                      src={`${profile.avatar_url}?t=${Date.now()}`}
                      alt={profile?.artist_name || profile?.full_name || "Profile"}
                      className="w-32 h-32 rounded-full object-cover border-4 border-accent/20"
                      onError={(e) => {
                        console.error("Profile avatar failed to load:", profile.avatar_url);
                        e.currentTarget.style.display = "none";
                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                        if (placeholder) placeholder.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-accent/20 ${profile?.avatar_url && profile.avatar_url.trim() ? 'hidden' : ''}`}
                  >
                    <User className="w-16 h-16 text-muted-foreground" />
                  </div>
                  {isEditingProfile && (
                    <label className="absolute bottom-0 right-0 w-10 h-10 bg-accent rounded-full flex items-center justify-center cursor-pointer hover:bg-accent/80 transition-colors">
                      <Camera className="w-5 h-5 text-white" />
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        className="hidden"
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
                            setProfileForm({ ...profileForm, avatarFile: file });
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
                {isEditingProfile && profileForm.avatarFile && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {profileForm.avatarFile.name}
                  </p>
                )}

                {/* Artist Image Upload (Separate from Avatar) */}
                {isEditingProfile && (
                  <div className="mt-6 w-full">
                    <Label className="text-sm text-muted-foreground mb-2 block">Artist Image (Optional)</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                      {profile?.artist_image_url ? (
                        <img
                          src={profile.artist_image_url}
                          alt="Artist Image"
                          className="w-full h-48 object-cover rounded-lg mb-2"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mb-2">No artist image uploaded</p>
                      )}
                      <div className="flex flex-col items-center gap-2">
                        <input
                          type="file"
                          id="artist-image-upload"
                          accept="image/jpeg,image/jpg,image/png"
                          className="hidden"
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
                              setProfileForm({ ...profileForm, artistImageFile: file });
                              // Auto-upload immediately when file is selected
                              handleArtistImageUpload(file);
                            }
                          }}
                        />
                        <label htmlFor="artist-image-upload" className="cursor-pointer inline-block">
                          <Button type="button" variant="hero" size="sm" disabled={uploadingArtistImage} className="text-white" onClick={(e) => {
                            e.preventDefault();
                            document.getElementById("artist-image-upload")?.click();
                          }}>
                            {uploadingArtistImage ? "Uploading..." : profileForm.artistImageFile ? "Change Image" : "Upload Artist Image"}
                          </Button>
                        </label>
                      </div>
                      {profileForm.artistImageFile && (
                        <p className="text-xs text-muted-foreground mt-2">{profileForm.artistImageFile.name}</p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Upload a larger image for artist pages (JPEG or PNG, max 5MB)
                    </p>
                  </div>
                )}
                {!isEditingProfile && profile?.artist_image_url && (
                  <div className="mt-6 w-full">
                    <Label className="text-sm text-muted-foreground mb-2 block">Artist Image</Label>
                    <img
                      src={profile.artist_image_url}
                      alt="Artist Image"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Profile Details */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <Label htmlFor="full_name" className="text-sm text-muted-foreground">Full Name</Label>
                  {isEditingProfile ? (
                    <Input
                      id="full_name"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                      className="mt-1"
                      disabled={savingProfile || uploadingAvatar || uploadingArtistImage}
                    />
                  ) : (
                    <p className="font-medium mt-1">{profile?.full_name || "-"}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="artist_name" className="text-sm text-muted-foreground">Artist Name</Label>
                  {isEditingProfile ? (
                    <Input
                      id="artist_name"
                      value={profileForm.artist_name}
                      onChange={(e) => setProfileForm({ ...profileForm, artist_name: e.target.value })}
                      className="mt-1"
                      disabled={savingProfile || uploadingAvatar || uploadingArtistImage}
                    />
                  ) : (
                    <p className="font-medium mt-1">{profile?.artist_name || "-"}</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <p className="font-medium mt-1">{profile?.email || "-"}</p>
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Phone Number</Label>
                  <p className="font-medium mt-1">{profile?.phone_number || "-"}</p>
                </div>
                <div>
                  <Label htmlFor="genre" className="text-sm text-muted-foreground">Genre</Label>
                  {isEditingProfile ? (
                    <Input
                      id="genre"
                      value={profileForm.genre}
                      onChange={(e) => setProfileForm({ ...profileForm, genre: e.target.value })}
                      placeholder="e.g., Afrobeat, R&B, Hip-Hop"
                      className="mt-1"
                      disabled={savingProfile || uploadingAvatar || uploadingArtistImage}
                    />
                  ) : (
                    <p className="font-medium mt-1">{profile?.genre || "-"}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="bio" className="text-sm text-muted-foreground">Bio</Label>
                  {isEditingProfile ? (
                    <Textarea
                      id="bio"
                      value={profileForm.bio || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      className="mt-1"
                      disabled={savingProfile || uploadingAvatar || uploadingArtistImage}
                    />
                  ) : (
                    <p className="font-medium mt-1 whitespace-pre-wrap">
                      {profile?.bio || "No bio added yet. Click 'Edit Profile' to add one."}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ArtistProfile;

