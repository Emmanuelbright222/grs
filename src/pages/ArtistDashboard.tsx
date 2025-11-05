import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Music, TrendingUp, DollarSign, ExternalLink, Upload, User, Edit2, Save, X, Camera, AlertCircle, Calendar, MoreVertical, Trash2, CheckCircle2, XCircle, ArrowLeft, AlertTriangle, Download, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StreamingData {
  platform: string;
  track_name: string;
  streams: number;
  revenue: number;
  date: string;
}

const ArtistDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [streamingData, setStreamingData] = useState<StreamingData[]>([]);
  const [demoUploads, setDemoUploads] = useState<any[]>([]);
  const [allDemos, setAllDemos] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewingAsArtist, setViewingAsArtist] = useState(false); // Admin viewing artist's dashboard
  const [viewingArtistId, setViewingArtistId] = useState<string | null>(null); // Artist ID being viewed
  const [analytics, setAnalytics] = useState({
    artistsCount: 0,
    releasesCount: 0,
    eventsCount: 0,
  });
  const [uploadingDemo, setUploadingDemo] = useState(false);
  const [demoHcaptchaToken, setDemoHcaptchaToken] = useState<string | null>(null);
  const demoHcaptchaRef = useRef<HCaptcha>(null);
  const [demoForm, setDemoForm] = useState({
    name: "",
    message: "",
    file: null as File | null,
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    bio: "",
    avatarFile: null as File | null,
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [spotifyConnection, setSpotifyConnection] = useState<any>(null);
  const [spotifyData, setSpotifyData] = useState<any>(null);
  const [syncingSpotify, setSyncingSpotify] = useState(false);
  const [audiomackConnection, setAudiomackConnection] = useState<any>(null);
  const [audiomackData, setAudiomackData] = useState<any>(null);
  const [syncingAudiomack, setSyncingAudiomack] = useState(false);
  const [boomplayConnection, setBoomplayConnection] = useState<any>(null);
  const [boomplayData, setBoomplayData] = useState<any>(null);
  const [syncingBoomplay, setSyncingBoomplay] = useState(false);
  const [appleMusicConnection, setAppleMusicConnection] = useState<any>(null);
  const [appleMusicData, setAppleMusicData] = useState<any>(null);
  const [syncingAppleMusic, setSyncingAppleMusic] = useState(false);
  const [youtubeConnection, setYoutubeConnection] = useState<any>(null);
  const [youtubeData, setYoutubeData] = useState<any>(null);
  const [syncingYoutube, setSyncingYoutube] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    spotify: false,
    youtube: false,
    appleMusic: false,
    audiomack: false,
    boomplay: false,
  });

  useEffect(() => {
    checkAuth();
    checkOAuthCallback();
  }, []);

  useEffect(() => {
    if (profile?.user_id) {
      loadPlatformConnections();
    }
  }, [profile]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/login");
      return;
    }

    // Check if admin is viewing an artist's dashboard via URL parameter
    const artistId = searchParams.get('artist_id');
    if (artistId) {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleData && roleData.role === "admin") {
        setViewingAsArtist(true);
        setViewingArtistId(artistId);
        setIsAdmin(true); // Set admin flag early
        await loadArtistProfile(artistId);
        await checkAdminRole(user.id);
        setLoading(false);
        return;
      }
    }

    const profileData = await loadProfile(user.id);
    if (profileData) {
      console.log("Dashboard - Profile loaded:", {
        artist_name: profileData.artist_name,
        full_name: profileData.full_name,
        email: profileData.email,
        avatar_url: profileData.avatar_url
      });
      setProfile(profileData);
    }
    await checkAdminRole(user.id);
    await loadStreamingData(user.id);
    await loadDemoUploads(user.id);
    setLoading(false);
  };

  const loadArtistProfile = async (artistId: string) => {
    try {
      console.log("Loading artist profile for ID:", artistId);
      
      // First try to get profile by profile id
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", artistId)
        .maybeSingle();

      if (error) {
        console.error("Error loading profile by id:", error);
        throw error;
      }

      if (profileData) {
        console.log("Profile loaded by id:", profileData);
        setProfile(profileData);
        
        // Use user_id from profile to load streaming data
        if (profileData.user_id) {
          await loadStreamingData(profileData.user_id);
          await loadDemoUploads(profileData.user_id);
        }
        return;
      }

      // Try by user_id if artistId is a user_id UUID
      const { data: profileByUserId, error: userIdError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", artistId)
        .maybeSingle();

      if (userIdError) {
        console.error("Error loading profile by user_id:", userIdError);
        throw userIdError;
      }

      if (profileByUserId) {
        console.log("Profile loaded by user_id:", profileByUserId);
        setProfile(profileByUserId);
        await loadStreamingData(artistId);
        await loadDemoUploads(artistId);
      } else {
        console.error("No profile found for artistId:", artistId);
        toast({
          title: "Error",
          description: "Artist profile not found",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error loading artist profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load artist profile",
        variant: "destructive",
      });
    }
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
        console.log("Profile loaded:", {
          artist_name: data?.artist_name,
          full_name: data?.full_name,
          email: data?.email,
          avatar_url: data?.avatar_url,
          has_avatar: !!data?.avatar_url
        });
        setProfile(data || null);
        if (data) {
          setProfileForm({ 
            bio: data.bio || "", 
            avatarFile: null,
          });
        }
        return data;
      }
    } catch (err) {
      console.error("Exception loading profile:", err);
      return null;
    }
  };

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (error) {
        if (import.meta.env.DEV) {
          console.log("Admin check error:", error.message);
        }
        return;
      }

      if (data && data.role === "admin") {
        setIsAdmin(true);
        if (!viewingAsArtist) {
          await loadAllDemos();
          await loadAnalytics();
        }
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Admin role check failed:", err);
      }
    }
  };

  const loadAllDemos = async () => {
    const { data: authenticatedDemos, error: authError } = await supabase
      .from("demo_uploads")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: publicDemos, error: publicError } = await supabase
      .from("public_demo_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (authError) console.error("Error loading authenticated demos:", authError);
    if (publicError) console.error("Error loading public demos:", publicError);

    const allDemosData = [
      ...(authenticatedDemos?.map(d => ({ ...d, source: 'authenticated' })) || []),
      ...(publicDemos?.map(d => ({ ...d, source: 'public' })) || []),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setAllDemos(allDemosData);
  };

  const loadAnalytics = async () => {
    const [artistsResult, releasesResult, eventsResult] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("releases").select("id", { count: "exact", head: true }),
      supabase.from("events").select("id", { count: "exact", head: true }),
    ]);

    setAnalytics({
      artistsCount: artistsResult.count || 0,
      releasesCount: releasesResult.count || 0,
      eventsCount: eventsResult.count || 0,
    });
  };

  const checkOAuthCallback = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("spotify_connected") === "true") {
      toast({
        title: "Success!",
        description: "Spotify account connected successfully.",
      });
      window.history.replaceState({}, "", window.location.pathname);
      loadPlatformConnections();
    } else if (params.get("apple_music_connected") === "true") {
      toast({
        title: "Success!",
        description: "Apple Music account connected successfully.",
      });
      window.history.replaceState({}, "", window.location.pathname);
      loadPlatformConnections();
    } else if (params.get("youtube_connected") === "true") {
      toast({
        title: "Success!",
        description: "YouTube Music account connected successfully.",
      });
      window.history.replaceState({}, "", window.location.pathname);
      loadPlatformConnections();
    } else if (params.get("audiomack_connected") === "true") {
      toast({
        title: "Success!",
        description: "Audiomack account connected successfully.",
      });
      window.history.replaceState({}, "", window.location.pathname);
      loadPlatformConnections();
    } else if (params.get("boomplay_connected") === "true") {
      toast({
        title: "Success!",
        description: "Boomplay account connected successfully.",
      });
      window.history.replaceState({}, "", window.location.pathname);
      loadPlatformConnections();
    } else if (params.get("error")) {
      toast({
        title: "Connection Error",
        description: params.get("message") || "Failed to connect account.",
        variant: "destructive",
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
  };

  const loadPlatformConnections = async () => {
    if (!profile?.user_id) return;
    
    try {
      const { data, error } = await supabase
        .from("streaming_platform_connections" as any)
        .select("*")
        .eq("user_id", profile.user_id)
        .eq("is_active", true);

      if (error) throw error;

      const spotifyConn = data?.find((conn: any) => conn.platform === "spotify");
      const audiomackConn = data?.find((conn: any) => conn.platform === "audiomack");
      const boomplayConn = data?.find((conn: any) => conn.platform === "boomplay");
      const appleMusicConn = data?.find((conn: any) => conn.platform === "apple_music");
      const youtubeConn = data?.find((conn: any) => conn.platform === "youtube");
      setSpotifyConnection(spotifyConn || null);
      setAudiomackConnection(audiomackConn || null);
      setBoomplayConnection(boomplayConn || null);
      setAppleMusicConnection(appleMusicConn || null);
      setYoutubeConnection(youtubeConn || null);
    } catch (error: any) {
      console.error("Error loading platform connections:", error);
    }
  };

  const handleConnectSpotify = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please log in to connect Spotify.",
          variant: "destructive",
        });
        return;
      }

      // Get Spotify Client ID from environment
      const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
      
      if (!clientId || clientId === "YOUR_SPOTIFY_CLIENT_ID") {
        toast({
          title: "Configuration Error",
          description: "Spotify Client ID not configured. Please add VITE_SPOTIFY_CLIENT_ID to .env.local",
          variant: "destructive",
        });
        return;
      }

      // Construct redirect URI - use frontend callback route
      // For local testing, use network IP if available (Spotify doesn't accept localhost)
      // In production, use your actual domain
      const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const redirectUri = isLocal 
        ? `http://172.20.10.2:8080/auth/spotify/callback` // Update with your network IP from terminal
        : `${window.location.origin}/auth/spotify/callback`;
      
      // Construct Spotify OAuth URL
      const scopes = [
        "user-read-private",
        "user-read-email",
        "user-top-read",
        "user-library-read",
        "playlist-read-private",
      ].join(" ");

      const authUrl = new URL("https://accounts.spotify.com/authorize");
      authUrl.searchParams.set("client_id", clientId);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("scope", scopes);
      authUrl.searchParams.set("state", user.id);
      authUrl.searchParams.set("show_dialog", "false");

      // Redirect to Spotify OAuth
      window.location.href = authUrl.toString();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate Spotify connection.",
        variant: "destructive",
      });
    }
  };

  const handleSyncSpotify = async () => {
    if (!profile?.user_id) return;

    setSyncingSpotify(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const functionUrl = `${supabaseUrl}/functions/v1/spotify-sync`;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
        },
        body: JSON.stringify({ user_id: profile.user_id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to sync Spotify data");
      }

      const result = await response.json();
      setSpotifyData(result.data);
      setExpandedSections(prev => ({ ...prev, spotify: true })); // Auto-expand after sync
      
      toast({
        title: "Success!",
        description: "Spotify data synced successfully.",
      });

      // Reload connection to update last_synced_at
      await loadPlatformConnections();
    } catch (error: any) {
      toast({
        title: "Sync Error",
        description: error.message || "Failed to sync Spotify data.",
        variant: "destructive",
      });
    } finally {
      setSyncingSpotify(false);
    }
  };

  const handleDisconnectSpotify = async () => {
    if (!spotifyConnection) return;

    try {
      const { error } = await (supabase as any)
        .from("streaming_platform_connections")
        .update({ is_active: false })
        .eq("id", spotifyConnection.id);

      if (error) throw error;

      setSpotifyConnection(null);
      setSpotifyData(null);

      toast({
        title: "Disconnected",
        description: "Spotify account disconnected successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to disconnect Spotify.",
        variant: "destructive",
      });
    }
  };

  const handleConnectAudiomack = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please log in to connect Audiomack.",
          variant: "destructive",
        });
        return;
      }

      const clientId = import.meta.env.VITE_AUDIOMACK_CLIENT_ID;
      
      if (!clientId) {
        toast({
          title: "Configuration Error",
          description: "Audiomack Client ID not configured. Please add VITE_AUDIOMACK_CLIENT_ID to .env.local",
          variant: "destructive",
        });
        return;
      }

      const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const redirectUri = isLocal 
        ? `http://172.20.10.2:8080/auth/audiomack/callback`
        : `${window.location.origin}/auth/audiomack/callback`;

      // Audiomack OAuth URL
      const authUrl = new URL("https://api.audiomack.com/oauth/authorize");
      authUrl.searchParams.set("client_id", clientId);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", "read");
      authUrl.searchParams.set("state", user.id);

      window.location.href = authUrl.toString();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate Audiomack connection.",
        variant: "destructive",
      });
    }
  };

  const handleConnectBoomplay = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please log in to connect Boomplay.",
          variant: "destructive",
        });
        return;
      }

      const clientId = import.meta.env.VITE_BOOMPLAY_CLIENT_ID;
      
      if (!clientId) {
        toast({
          title: "Configuration Error",
          description: "Boomplay Client ID not configured. Please add VITE_BOOMPLAY_CLIENT_ID to .env.local",
          variant: "destructive",
        });
        return;
      }

      const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const redirectUri = isLocal 
        ? `http://172.20.10.2:8080/auth/boomplay/callback`
        : `${window.location.origin}/auth/boomplay/callback`;

      // Boomplay OAuth URL
      const authUrl = new URL("https://api.boomplay.com/oauth/authorize");
      authUrl.searchParams.set("client_id", clientId);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", "read");
      authUrl.searchParams.set("state", user.id);

      window.location.href = authUrl.toString();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate Boomplay connection.",
        variant: "destructive",
      });
    }
  };

  const handleSyncAudiomack = async () => {
    if (!profile?.user_id) return;

    setSyncingAudiomack(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const functionUrl = `${supabaseUrl}/functions/v1/audiomack-sync`;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
        },
        body: JSON.stringify({ user_id: profile.user_id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to sync Audiomack data");
      }

      const result = await response.json();
      setAudiomackData(result.data);
      
      toast({
        title: "Success!",
        description: "Audiomack data synced successfully.",
      });

      await loadPlatformConnections();
    } catch (error: any) {
      toast({
        title: "Sync Error",
        description: error.message || "Failed to sync Audiomack data.",
        variant: "destructive",
      });
    } finally {
      setSyncingAudiomack(false);
    }
  };

  const handleDisconnectAudiomack = async () => {
    if (!audiomackConnection) return;

    try {
      const { error } = await (supabase as any)
        .from("streaming_platform_connections")
        .update({ is_active: false })
        .eq("id", audiomackConnection.id);

      if (error) throw error;

      setAudiomackConnection(null);
      setAudiomackData(null);

      toast({
        title: "Disconnected",
        description: "Audiomack account disconnected successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to disconnect Audiomack.",
        variant: "destructive",
      });
    }
  };

  const handleSyncBoomplay = async () => {
    if (!profile?.user_id) return;

    setSyncingBoomplay(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const functionUrl = `${supabaseUrl}/functions/v1/boomplay-sync`;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
        },
        body: JSON.stringify({ user_id: profile.user_id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to sync Boomplay data");
      }

      const result = await response.json();
      setBoomplayData(result.data);
      
      toast({
        title: "Success!",
        description: "Boomplay data synced successfully.",
      });

      await loadPlatformConnections();
    } catch (error: any) {
      toast({
        title: "Sync Error",
        description: error.message || "Failed to sync Boomplay data.",
        variant: "destructive",
      });
    } finally {
      setSyncingBoomplay(false);
    }
  };

  const handleDisconnectBoomplay = async () => {
    if (!boomplayConnection) return;

    try {
      const { error } = await (supabase as any)
        .from("streaming_platform_connections")
        .update({ is_active: false })
        .eq("id", boomplayConnection.id);

      if (error) throw error;

      setBoomplayConnection(null);
      setBoomplayData(null);

      toast({
        title: "Disconnected",
        description: "Boomplay account disconnected successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to disconnect Boomplay.",
        variant: "destructive",
      });
    }
  };

  const handleConnectAppleMusic = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please log in to connect Apple Music.",
          variant: "destructive",
        });
        return;
      }

      const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const redirectUri = isLocal 
        ? `http://172.20.10.2:8080/auth/apple-music/callback`
        : `${window.location.origin}/auth/apple-music/callback`;

      const clientId = import.meta.env.VITE_APPLE_MUSIC_CLIENT_ID;
      
      if (!clientId) {
        toast({
          title: "Configuration Error",
          description: "Apple Music Client ID not configured. Please add VITE_APPLE_MUSIC_CLIENT_ID to .env.local",
          variant: "destructive",
        });
        return;
      }

      const authUrl = new URL("https://appleid.apple.com/auth/authorize");
      authUrl.searchParams.set("client_id", clientId);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", "email name");
      authUrl.searchParams.set("state", user.id);
      authUrl.searchParams.set("response_mode", "form_post");

      window.location.href = authUrl.toString();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate Apple Music connection.",
        variant: "destructive",
      });
    }
  };

  const handleSyncAppleMusic = async () => {
    if (!profile?.user_id) return;

    setSyncingAppleMusic(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const functionUrl = `${supabaseUrl}/functions/v1/apple-music-sync`;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
        },
        body: JSON.stringify({ user_id: profile.user_id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to sync Apple Music data");
      }

      const result = await response.json();
      setAppleMusicData(result.data);
      
      toast({
        title: "Success!",
        description: "Apple Music data synced successfully.",
      });

      await loadPlatformConnections();
    } catch (error: any) {
      toast({
        title: "Sync Error",
        description: error.message || "Failed to sync Apple Music data.",
        variant: "destructive",
      });
    } finally {
      setSyncingAppleMusic(false);
    }
  };

  const handleDisconnectAppleMusic = async () => {
    if (!appleMusicConnection) return;

    try {
      const { error } = await (supabase as any)
        .from("streaming_platform_connections")
        .update({ is_active: false })
        .eq("id", appleMusicConnection.id);

      if (error) throw error;

      setAppleMusicConnection(null);
      setAppleMusicData(null);

      toast({
        title: "Disconnected",
        description: "Apple Music account disconnected successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to disconnect Apple Music.",
        variant: "destructive",
      });
    }
  };

  const handleConnectYouTube = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please log in to connect YouTube Music.",
          variant: "destructive",
        });
        return;
      }

      const clientId = import.meta.env.VITE_YOUTUBE_CLIENT_ID;
      
      if (!clientId) {
        toast({
          title: "Configuration Error",
          description: "YouTube Client ID not configured. Please add VITE_YOUTUBE_CLIENT_ID to .env.local",
          variant: "destructive",
        });
        return;
      }

      const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const redirectUri = isLocal 
        ? `http://172.20.10.2:8080/auth/youtube/callback`
        : `${window.location.origin}/auth/youtube/callback`;

      const scopes = [
        "https://www.googleapis.com/auth/youtube.readonly",
      ].join(" ");

      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      authUrl.searchParams.set("client_id", clientId);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", scopes);
      authUrl.searchParams.set("access_type", "offline");
      authUrl.searchParams.set("prompt", "consent");
      authUrl.searchParams.set("state", user.id);

      window.location.href = authUrl.toString();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate YouTube Music connection.",
        variant: "destructive",
      });
    }
  };

  const handleSyncYouTube = async () => {
    if (!profile?.user_id) return;

    setSyncingYoutube(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const functionUrl = `${supabaseUrl}/functions/v1/youtube-sync`;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
        },
        body: JSON.stringify({ user_id: profile.user_id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to sync YouTube data");
      }

      const result = await response.json();
      setYoutubeData(result.data);
      setExpandedSections(prev => ({ ...prev, youtube: true })); // Auto-expand after sync
      
      toast({
        title: "Success!",
        description: "YouTube Music data synced successfully.",
      });

      await loadPlatformConnections();
    } catch (error: any) {
      toast({
        title: "Sync Error",
        description: error.message || "Failed to sync YouTube Music data.",
        variant: "destructive",
      });
    } finally {
      setSyncingYoutube(false);
    }
  };

  const handleDisconnectYouTube = async () => {
    if (!youtubeConnection) return;

    try {
      const { error } = await (supabase as any)
        .from("streaming_platform_connections")
        .update({ is_active: false })
        .eq("id", youtubeConnection.id);

      if (error) throw error;

      setYoutubeConnection(null);
      setYoutubeData(null);

      toast({
        title: "Disconnected",
        description: "YouTube Music account disconnected successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to disconnect YouTube Music.",
        variant: "destructive",
      });
    }
  };

  const loadStreamingData = async (userId: string) => {
    const { data, error } = await supabase
      .from("streaming_analytics")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error loading streaming data:", error);
    } else {
      setStreamingData((data as StreamingData[]) || []);
    }
  };

  const loadDemoUploads = async (userId: string) => {
    const { data, error } = await supabase
      .from("demo_uploads")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading demo uploads:", error);
    } else {
      setDemoUploads(data || []);
    }
  };

  const updateDemoStatus = async (demoId: string, status: string, source: string) => {
    try {
      const table = source === 'authenticated' ? 'demo_uploads' : 'public_demo_submissions';
      
      // Get demo details before updating
      const { data: demoData } = await supabase
        .from(table)
        .select("*")
        .eq("id", demoId)
        .single();

      const { error } = await supabase
        .from(table)
        .update({ status })
        .eq("id", demoId);

      if (error) throw error;

      // Send email notification
      if (demoData && demoData.email) {
        try {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const functionUrl = import.meta.env.VITE_CUSTOM_EMAIL_FUNCTION_URL || 
            `${supabaseUrl}/functions/v1/send-demo-status-email`;
          
          const statusMessages: Record<string, string> = {
            approved: "Your demo has been approved! 🎉",
            rejected: "Your demo submission has been reviewed.",
            needs_improvement: "Your demo needs some improvements before we can approve it.",
            deleted: "Your demo submission has been removed.",
          };

          const headers: HeadersInit = {
            "Content-Type": "application/json",
          };

          if (!import.meta.env.VITE_CUSTOM_EMAIL_FUNCTION_URL) {
            headers["apikey"] = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
            headers["Authorization"] = `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ""}`;
          }

          const response = await fetch(functionUrl, {
            method: "POST",
            headers,
            body: JSON.stringify({
              email: demoData.email,
              name: demoData.name || demoData.artist_name || "Artist",
              status: status,
              message: statusMessages[status] || `Your demo status has been updated to: ${status}`,
            }),
          });

          if (!response.ok) {
            console.error("Email notification failed:", await response.text());
          }
        } catch (emailError) {
          console.error("Failed to send email notification:", emailError);
          // Don't fail the status update if email fails
        }
      }

      toast({
        title: "Success",
        description: status === 'needs_improvement' 
          ? "Marked as Needs Improvement" 
          : `Demo ${status} successfully`,
      });

      await loadAllDemos();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update demo status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDemo = async (demoId: string, source: string) => {
    if (!confirm("Are you sure you want to delete this demo submission?")) return;

    try {
      const table = source === 'authenticated' ? 'demo_uploads' : 'public_demo_submissions';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", demoId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Demo deleted successfully",
      });

      await loadAllDemos();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete demo",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
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

      const validationError = validateImageFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      const targetUserId = viewingAsArtist && viewingArtistId ? viewingArtistId : user.id;
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", targetUserId);

      if (updateError) throw updateError;

      toast({
        title: "Avatar updated!",
        description: "Profile picture has been updated successfully.",
      });

      await loadProfile(targetUserId);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const targetUserId = viewingAsArtist && viewingArtistId ? viewingArtistId : user.id;
      const updateData: any = { bio: profileForm.bio };
      
      if (profileForm.avatarFile) {
        await handleAvatarUpload(profileForm.avatarFile);
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", targetUserId);

      if (updateError) throw updateError;

      toast({
        title: "Profile updated!",
        description: "Your profile has been saved successfully.",
      });

      setIsEditingProfile(false);
      await loadProfile(targetUserId);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const getTotalStreams = () => {
    return streamingData.reduce((sum, item) => sum + item.streams, 0);
  };

  const getTotalRevenue = () => {
    return streamingData.reduce((sum, item) => sum + parseFloat(item.revenue.toString()), 0).toFixed(2);
  };

  const getStreamsByPlatform = () => {
    const platforms: { [key: string]: number } = {};
    streamingData.forEach(item => {
      platforms[item.platform] = (platforms[item.platform] || 0) + item.streams;
    });
    return platforms;
  };

  const getProfileCompletion = () => {
    if (!profile) return 0;
    let completed = 0;
    const total = 7; // full_name, artist_name, email, genre, bio, avatar_url, phone_number
    
    if (profile.full_name) completed++;
    if (profile.artist_name) completed++;
    if (profile.email) completed++;
    if (profile.genre) completed++;
    if (profile.bio) completed++;
    if (profile.avatar_url) completed++;
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
    if (!profile.phone_number) missing.push("Phone Number");
    return missing;
  };

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!demoHcaptchaToken) {
      toast({
        title: "Verification Required",
        description: "Please complete the hCaptcha verification",
        variant: "destructive",
      });
      return;
    }
    
    if (viewingAsArtist) {
      toast({
        title: "Not Allowed",
        description: "Cannot submit demo while viewing as admin",
        variant: "destructive",
      });
      return;
    }

    setUploadingDemo(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let fileUrl = null;
      
      if (demoForm.file) {
        const fileExt = demoForm.file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('audio-demos')
          .upload(fileName, demoForm.file);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('audio-demos')
          .getPublicUrl(fileName);
        
        fileUrl = publicUrl;
      }

      const { error: insertError } = await supabase
        .from("demo_uploads")
        .insert({
          user_id: user.id,
          name: profile?.full_name || "",
          email: profile?.email || "",
          artist_name: profile?.artist_name || "",
          genre: profile?.genre || "",
          message: demoForm.message,
          file_url: fileUrl,
          status: "pending"
        });

      if (insertError) throw insertError;

      toast({
        title: "Demo submitted!",
        description: "Your demo has been uploaded successfully. We'll review it soon.",
      });

      setDemoForm({ name: "", message: "", file: null });
      await loadDemoUploads(user.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload demo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingDemo(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  const platformStreams = getStreamsByPlatform();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Admin Viewing Artist Banner */}
          {viewingAsArtist && isAdmin && (
            <Card className="mb-6 p-4 bg-accent/10 border-accent/20">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <AlertCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  <div className="flex-1 text-center md:text-left">
                    <p className="font-semibold">Viewing as: {profile?.artist_name || profile?.full_name || "Artist"}</p>
                    <p className="text-sm text-muted-foreground">You are viewing this artist's dashboard as an admin</p>
                  </div>
                </div>
                <div className="flex justify-center md:justify-end">
                  <Button
                    onClick={() => {
                      // Clear query params
                      const url = new URL(window.location.href);
                      url.searchParams.delete('artist_id');
                      window.history.replaceState({}, '', url.pathname);
                      navigate("/dashboard", { replace: true });
                    }}
                    variant="hero"
                    size="sm"
                    className="w-full md:w-auto"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Admin Dashboard
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar Display */}
              {(!isAdmin || viewingAsArtist) && (
                <div className="flex-shrink-0">
                  {profile?.avatar_url && profile.avatar_url.trim() ? (
                    <img
                      key={`avatar-${profile.avatar_url}-${Date.now()}`}
                      src={`${profile.avatar_url}?t=${Date.now()}`}
                      alt={profile?.artist_name || profile?.full_name || "Profile"}
                      className="w-16 h-16 rounded-full object-cover border-4 border-accent/20"
                      onError={(e) => {
                        console.error("Avatar image failed to load:", profile.avatar_url);
                        e.currentTarget.style.display = "none";
                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                        if (placeholder) placeholder.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-16 h-16 rounded-full bg-muted flex items-center justify-center border-4 border-accent/20 ${profile?.avatar_url && profile.avatar_url.trim() ? 'hidden' : ''}`}
                  >
                    <User className="w-8 h-8 text-muted-foreground" />
                  </div>
                </div>
              )}
              <div className="text-center md:text-left">
                <h1 className="text-1xl md:text-3xl lg:text-4xl font-bold mb-2">
                  {isAdmin && !viewingAsArtist
                    ? "Admin Dashboard" 
                    : `Welcome, ${profile?.artist_name || profile?.full_name || profile?.email?.split("@")[0] || "Artist"}!`}
                </h1>
                {isAdmin && !viewingAsArtist && (
                  <div className="mt-2 flex justify-center md:justify-start">
                    <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm font-medium">
                      Admin
                    </span>
                  </div>
                )}
                <p className="text-muted-foreground">
                  {isAdmin && !viewingAsArtist ? "Manage artists and demo submissions" : "Track your music performance across platforms"}
                </p>
              </div>
            </div>
            <div className="hidden md:flex flex-wrap gap-2">
              {isAdmin && !viewingAsArtist && (
                <>
                  <Button onClick={() => navigate("/dashboard/artists")} variant="hero">
                    Artists
                  </Button>
                  <Button onClick={() => navigate("/dashboard/releases")} variant="hero">
                    Releases
                  </Button>
                  <Button onClick={() => navigate("/dashboard/events")} variant="hero">
                    Events
                  </Button>
                  <Button onClick={() => navigate("/dashboard/news")} variant="hero">
                    News
                  </Button>
                  <Button onClick={() => navigate("/dashboard/admin-management")} variant="hero">
                    Admin Management
                  </Button>
                </>
              )}
              {!isAdmin && !viewingAsArtist && (
                <Button onClick={() => navigate("/dashboard/profile")} variant="hero">
                  My Profile
                </Button>
              )}
              {!viewingAsArtist && (
                <Button onClick={handleSignOut} variant="hero">
                  Sign Out
                </Button>
              )}
            </div>
          </div>

          {/* Profile Completion Progress Bar - For Artists */}
          {!isAdmin && !viewingAsArtist && profile && getProfileCompletion() < 100 && (
            <Card className="p-6 border-0 shadow-soft mb-8">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-accent" />
                <h3 className="font-semibold">Complete Your Profile</h3>
                <span className="ml-auto text-sm font-medium">{getProfileCompletion()}% Complete</span>
              </div>
              <Progress value={getProfileCompletion()} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                Missing: {getMissingFields().join(", ")}
              </p>
              <Button 
                onClick={() => navigate("/dashboard/profile")} 
                variant="hero" 
                size="sm" 
                className="mt-3"
              >
                Complete Profile →
              </Button>
            </Card>
          )}

          {/* Admin Analytics */}
          {isAdmin && !viewingAsArtist && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 border-0 shadow-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Artists</p>
                    <p className="text-3xl font-bold">{analytics.artistsCount}</p>
                  </div>
                  <User className="w-12 h-12 text-accent opacity-50" />
                </div>
              </Card>
              <Card className="p-6 border-0 shadow-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Releases</p>
                    <p className="text-3xl font-bold">{analytics.releasesCount}</p>
                  </div>
                  <Music className="w-12 h-12 text-accent opacity-50" />
                </div>
              </Card>
              <Card className="p-6 border-0 shadow-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Events</p>
                    <p className="text-3xl font-bold">{analytics.eventsCount}</p>
                  </div>
                  <Calendar className="w-12 h-12 text-accent opacity-50" />
                </div>
              </Card>
            </div>
          )}

          {/* Stats Overview - Only for artists (not when admin viewing) */}
          {!isAdmin && streamingData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 border-0 shadow-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Streams</p>
                    <p className="text-3xl font-bold">{getTotalStreams().toLocaleString()}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-accent opacity-50" />
                </div>
              </Card>
              <Card className="p-6 border-0 shadow-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold">${getTotalRevenue()}</p>
                  </div>
                  <DollarSign className="w-12 h-12 text-accent opacity-50" />
                </div>
              </Card>
              <Card className="p-6 border-0 shadow-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Platforms</p>
                    <p className="text-3xl font-bold">{Object.keys(platformStreams).length}</p>
                  </div>
                  <BarChart3 className="w-12 h-12 text-accent opacity-50" />
                </div>
              </Card>
            </div>
          )}

          {/* Admin: All Demo Submissions */}
          {isAdmin && !viewingAsArtist && (
            <Card className="p-6 border-0 shadow-soft mb-8">
              <h2 className="text-2xl font-bold mb-6">All Demo Submissions</h2>
              {allDemos.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No demo submissions yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Name/Artist</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-left py-3 px-4">Genre</th>
                        <th className="text-left py-3 px-4">File</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allDemos.map((demo) => (
                        <tr key={demo.id} className="border-b border-border/50 hover:bg-muted/50">
                          <td className="py-3 px-4">
                            {new Date(demo.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">{demo.name || demo.artist_name || "-"}</td>
                          <td className="py-3 px-4">{demo.email || "-"}</td>
                          <td className="py-3 px-4">{demo.genre || "-"}</td>
                          <td className="py-3 px-4">
                            {demo.file_url ? (
                              <div className="flex gap-2">
                                <a
                                  href={demo.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-accent hover:underline text-sm"
                                >
                                  <ExternalLink className="w-4 h-4 inline mr-1" />
                                  View
                                </a>
                                <a
                                  href={demo.file_url}
                                  download
                                  className="text-accent hover:underline text-sm"
                                >
                                  <Download className="w-4 h-4 inline mr-1" />
                                  Download
                                </a>
                              </div>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              demo.status === 'approved' ? 'bg-green-500/20 text-green-600' :
                              demo.status === 'rejected' ? 'bg-red-500/20 text-red-600' :
                              demo.status === 'needs_improvement' ? 'bg-orange-500/20 text-orange-600' :
                              'bg-yellow-500/20 text-yellow-600'
                            }`}>
                              {demo.status === 'needs_improvement' ? 'Needs Improvement' : (demo.status || 'pending')}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {(demo.status === 'pending' || demo.status === 'needs_improvement') && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => updateDemoStatus(demo.id, 'approved', demo.source)}
                                      className="text-green-600"
                                    >
                                      <CheckCircle2 className="w-4 h-4 mr-2" />
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => updateDemoStatus(demo.id, 'rejected', demo.source)}
                                      className="text-red-600"
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Reject
                                    </DropdownMenuItem>
                                    {demo.status === 'pending' && (
                                      <DropdownMenuItem
                                        onClick={() => updateDemoStatus(demo.id, 'needs_improvement', demo.source)}
                                        className="text-orange-600"
                                      >
                                        <AlertTriangle className="w-4 h-4 mr-2" />
                                        Needs Improvement
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                  </>
                                )}
                                <DropdownMenuItem
                                  onClick={() => handleDeleteDemo(demo.id, demo.source)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* Platform Integration - Only for artists */}
          {!isAdmin && (
            <Card className="p-6 border-0 shadow-soft mb-8">
              <h2 className="text-1xl font-bold mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                Streaming Platforms
              </h2>
              
              {/* All Platforms in 2-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Spotify Connection */}
                <Collapsible 
                  open={expandedSections.spotify} 
                  onOpenChange={(open) => setExpandedSections(prev => ({ ...prev, spotify: open }))}
                >
                  <div className="p-4 border rounded-lg bg-gradient-to-br from-white to-slate-50/50 shadow-[0_8px_30px_rgba(10,37,64,0.15)] hover:shadow-[0_20px_60px_rgba(10,37,64,0.3)] transition-all duration-300 border-slate-200/50 backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                          S
                        </div>
                        <div>
                          <h3 className="font-semibold">Spotify</h3>
                          {spotifyConnection ? (
                            <p className="text-sm text-green-600">Connected</p>
                          ) : (
                            <p className="text-sm text-muted-foreground">Not connected</p>
                          )}
                        </div>
                      </div>
                      {spotifyConnection ? (
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button
                            variant="hero"
                            size="sm"
                            onClick={handleSyncSpotify}
                            disabled={syncingSpotify}
                            className="flex-1 sm:flex-initial"
                          >
                            {syncingSpotify ? "Syncing..." : "Sync Data"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDisconnectSpotify}
                            className="flex-1 sm:flex-initial"
                          >
                            Disconnect
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="hero"
                          size="sm"
                          onClick={handleConnectSpotify}
                          className="w-full sm:w-auto"
                        >
                          Connect Spotify
                        </Button>
                      )}
                    </div>
                    
                    {spotifyConnection && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                          <span>Last synced:</span>
                          <span>
                            {spotifyConnection.last_synced_at
                              ? new Date(spotifyConnection.last_synced_at).toLocaleString()
                              : "Never"}
                          </span>
                        </div>
                        {spotifyConnection.platform_user_id && (
                          <div className="text-xs text-muted-foreground">
                            Spotify ID: {spotifyConnection.platform_user_id}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Collapsible Data Section */}
                    {spotifyData && (
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full mt-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border-slate-200 transition-colors"
                        >
                          <span className="font-semibold text-slate-700">View Analytics</span>
                          {expandedSections.spotify ? (
                            <ChevronUp className="h-4 w-4 text-slate-600" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-slate-600" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    )}

                    <CollapsibleContent>
                      {spotifyData && (
                        <div className="mt-4 pt-4 border-t border-border space-y-4">
                          {/* Stats - Better Aligned */}
                          <div className="grid grid-cols-5 gap-3">
                            <div className="text-center p-3 bg-slate-50 rounded-lg">
                              <p className="text-xl font-bold">{spotifyData.topTracks?.length || 0}</p>
                              <p className="text-xs text-muted-foreground mt-1">Top Tracks</p>
                            </div>
                            <div className="text-center p-3 bg-slate-50 rounded-lg">
                              <p className="text-xl font-bold">{spotifyData.savedAlbumsCount || 0}</p>
                              <p className="text-xs text-muted-foreground mt-1">Saved Albums</p>
                            </div>
                            <div className="text-center p-3 bg-slate-50 rounded-lg">
                              <p className="text-xl font-bold">{spotifyData.playlistsCount || 0}</p>
                              <p className="text-xs text-muted-foreground mt-1">Playlists</p>
                            </div>
                            <div className="text-center p-3 bg-slate-50 rounded-lg">
                              <p className="text-xl font-bold">{spotifyData.topSongs?.length || 0}</p>
                              <p className="text-xs text-muted-foreground mt-1">Top Songs</p>
                            </div>
                            <div className="text-center p-3 bg-slate-50 rounded-lg">
                              <p className="text-xl font-bold">{spotifyData.playlists?.reduce((sum: number, p: any) => sum + (p.tracksCount || 0), 0) || 0}</p>
                              <p className="text-xs text-muted-foreground mt-1">Total Songs</p>
                            </div>
                          </div>

                          {/* Top Songs (Most Streamed/Popular) */}
                          {spotifyData.topSongs && spotifyData.topSongs.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-semibold mb-3">Top Songs (Most Popular):</p>
                              <ul className="space-y-2">
                                {spotifyData.topSongs.slice(0, 10).map((song: any, idx: number) => (
                                  <li key={song.id} className="text-sm flex items-center gap-3 p-2 bg-slate-50 rounded hover:bg-slate-100 transition-colors">
                                    <span className="text-muted-foreground font-bold w-6">{idx + 1}.</span>
                                    <span className="flex-1 truncate">{song.name}</span>
                                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">{song.artists}</span>
                                    <span className="text-xs text-muted-foreground font-semibold whitespace-nowrap">
                                      {song.popularity}/100 popularity
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Playlists with Songs */}
                          {spotifyData.playlists && spotifyData.playlists.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-semibold mb-3">Your Playlists:</p>
                              <div className="space-y-3">
                                {spotifyData.playlists.map((playlist: any) => (
                                  <div key={playlist.id} className="p-3 bg-slate-50 rounded-lg">
                                    <p className="font-semibold text-sm mb-2">
                                      {playlist.name} ({playlist.tracksCount || 0} {playlist.tracksCount === 1 ? 'song' : 'songs'})
                                    </p>
                                    {playlist.tracks && playlist.tracks.length > 0 && (
                                      <ul className="space-y-1 ml-4">
                                        {playlist.tracks.slice(0, 10).map((track: any) => (
                                          <li key={track.id} className="text-xs text-muted-foreground flex items-center justify-between">
                                            <span className="flex-1 truncate">• {track.name} - {track.artists}</span>
                                            <span className="ml-2 text-xs font-medium">
                                              {track.popularity}/100
                                            </span>
                                          </li>
                                        ))}
                                        {playlist.tracks.length > 10 && (
                                          <li className="text-xs text-muted-foreground italic">
                                            ...and {playlist.tracks.length - 10} more
                                          </li>
                                        )}
                                      </ul>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Top Tracks (Listening History) */}
                          {spotifyData.topTracks && spotifyData.topTracks.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-semibold mb-2">Your Most Played Tracks (Last 4 Weeks):</p>
                              <ul className="space-y-2">
                                {spotifyData.topTracks.slice(0, 5).map((track: any, idx: number) => (
                                  <li key={track.id} className="text-sm flex items-center gap-2 p-2 bg-slate-50 rounded">
                                    <span className="text-muted-foreground font-bold w-6">{idx + 1}.</span>
                                    <span className="flex-1 truncate">{track.name}</span>
                                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                      {track.artists?.[0]?.name || "Unknown"}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </CollapsibleContent>
                  </div>
                </Collapsible>

                {/* Audiomack Connection */}
                  <div className="p-4 border rounded-lg bg-gradient-to-br from-white to-slate-50/50 shadow-[0_8px_30px_rgba(10,37,64,0.15)] hover:shadow-[0_20px_60px_rgba(10,37,64,0.3)] transition-all duration-300 border-slate-200/50 backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                          A
                        </div>
                        <div>
                          <h3 className="font-semibold">Audiomack</h3>
                          {audiomackConnection ? (
                            <p className="text-sm text-green-600">Connected</p>
                          ) : (
                            <p className="text-sm text-muted-foreground">Not connected</p>
                          )}
                        </div>
                      </div>
                      {audiomackConnection ? (
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button
                            variant="hero"
                            size="sm"
                            onClick={handleSyncAudiomack}
                            disabled={syncingAudiomack}
                            className="flex-1 sm:flex-initial"
                          >
                            {syncingAudiomack ? "Syncing..." : "Sync Data"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDisconnectAudiomack}
                            className="flex-1 sm:flex-initial"
                          >
                            Disconnect
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="hero"
                          size="sm"
                          onClick={handleConnectAudiomack}
                          className="w-full sm:w-auto"
                        >
                          Connect Audiomack
                        </Button>
                      )}
                    </div>
                  {audiomackConnection && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                        <span>Last synced:</span>
                        <span>
                          {audiomackConnection.last_synced_at
                            ? new Date(audiomackConnection.last_synced_at).toLocaleString()
                            : "Never"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Boomplay Connection */}
                  <div className="p-4 border rounded-lg bg-gradient-to-br from-white to-slate-50/50 shadow-[0_8px_30px_rgba(10,37,64,0.15)] hover:shadow-[0_20px_60px_rgba(10,37,64,0.3)] transition-all duration-300 border-slate-200/50 backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          B
                        </div>
                        <div>
                          <h3 className="font-semibold">Boomplay</h3>
                          {boomplayConnection ? (
                            <p className="text-sm text-green-600">Connected</p>
                          ) : (
                            <p className="text-sm text-muted-foreground">Not connected</p>
                          )}
                        </div>
                      </div>
                      {boomplayConnection ? (
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button
                            variant="hero"
                            size="sm"
                            onClick={handleSyncBoomplay}
                            disabled={syncingBoomplay}
                            className="flex-1 sm:flex-initial"
                          >
                            {syncingBoomplay ? "Syncing..." : "Sync Data"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDisconnectBoomplay}
                            className="flex-1 sm:flex-initial"
                          >
                            Disconnect
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="hero"
                          size="sm"
                          onClick={handleConnectBoomplay}
                          className="w-full sm:w-auto"
                        >
                          Connect Boomplay
                        </Button>
                      )}
                    </div>
                  {boomplayConnection && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                        <span>Last synced:</span>
                        <span>
                          {boomplayConnection.last_synced_at
                            ? new Date(boomplayConnection.last_synced_at).toLocaleString()
                            : "Never"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                {/* Apple Music Connection */}
                  <div className="p-4 border rounded-lg bg-gradient-to-br from-white to-slate-50/50 shadow-[0_8px_30px_rgba(10,37,64,0.15)] hover:shadow-[0_20px_60px_rgba(10,37,64,0.3)] transition-all duration-300 border-slate-200/50 backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                          A
                        </div>
                        <div>
                          <h3 className="font-semibold">Apple Music</h3>
                          {appleMusicConnection ? (
                            <p className="text-sm text-green-600">Connected</p>
                          ) : (
                            <p className="text-sm text-muted-foreground">Not connected</p>
                          )}
                        </div>
                      </div>
                      {appleMusicConnection ? (
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button
                            variant="hero"
                            size="sm"
                            onClick={handleSyncAppleMusic}
                            disabled={syncingAppleMusic}
                            className="flex-1 sm:flex-initial"
                          >
                            {syncingAppleMusic ? "Syncing..." : "Sync Data"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDisconnectAppleMusic}
                            className="flex-1 sm:flex-initial"
                          >
                            Disconnect
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="hero"
                          size="sm"
                          onClick={handleConnectAppleMusic}
                          className="w-full sm:w-auto"
                        >
                          Connect Apple Music
                        </Button>
                      )}
                    </div>
                  {appleMusicConnection && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                        <span>Last synced:</span>
                        <span>
                          {appleMusicConnection.last_synced_at
                            ? new Date(appleMusicConnection.last_synced_at).toLocaleString()
                            : "Never"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* YouTube Music Connection */}
                <Collapsible 
                  open={expandedSections.youtube} 
                  onOpenChange={(open) => setExpandedSections(prev => ({ ...prev, youtube: open }))}
                >
                  <div className="p-4 border rounded-lg bg-gradient-to-br from-white to-slate-50/50 shadow-[0_8px_30px_rgba(10,37,64,0.15)] hover:shadow-[0_20px_60px_rgba(10,37,64,0.3)] transition-all duration-300 border-slate-200/50 backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                          Y
                        </div>
                        <div>
                          <h3 className="font-semibold">YouTube Music</h3>
                          {youtubeConnection ? (
                            <p className="text-sm text-green-600">Connected</p>
                          ) : (
                            <p className="text-sm text-muted-foreground">Not connected</p>
                          )}
                        </div>
                      </div>
                      {youtubeConnection ? (
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button
                            variant="hero"
                            size="sm"
                            onClick={handleSyncYouTube}
                            disabled={syncingYoutube}
                            className="flex-1 sm:flex-initial"
                          >
                            {syncingYoutube ? "Syncing..." : "Sync Data"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDisconnectYouTube}
                            className="flex-1 sm:flex-initial"
                          >
                            Disconnect
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="hero"
                          size="sm"
                          onClick={handleConnectYouTube}
                          className="w-full sm:w-auto"
                        >
                          Connect YouTube Music
                        </Button>
                      )}
                    </div>
                    {youtubeConnection && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                          <span>Last synced:</span>
                          <span>
                            {youtubeConnection.last_synced_at
                              ? new Date(youtubeConnection.last_synced_at).toLocaleString()
                              : "Never"}
                          </span>
                        </div>
                        {youtubeConnection.platform_user_id && (
                          <div className="text-xs text-muted-foreground">
                            Channel ID: {youtubeConnection.platform_user_id}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Collapsible Data Section */}
                    {youtubeData && (
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full mt-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border-slate-200 transition-colors"
                        >
                          <span className="font-semibold text-slate-700">View Analytics</span>
                          {expandedSections.youtube ? (
                            <ChevronUp className="h-4 w-4 text-slate-600" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-slate-600" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    )}

                    <CollapsibleContent>
                      {youtubeData && (
                        <div className="mt-4 pt-4 border-t border-border space-y-6">
                          {/* Channel Stats */}
                          {youtubeData.channel && (
                            <div className="grid grid-cols-3 gap-3">
                              <div className="text-center p-3 bg-slate-50 rounded-lg">
                                <p className="text-xl font-bold">{Number(youtubeData.channel.subscriberCount || 0).toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground mt-1">Subscribers</p>
                              </div>
                              <div className="text-center p-3 bg-slate-50 rounded-lg">
                                <p className="text-xl font-bold">{Number(youtubeData.channel.totalLikes || 0).toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground mt-1">Total Likes</p>
                              </div>
                              <div className="text-center p-3 bg-slate-50 rounded-lg">
                                <p className="text-xl font-bold">{Number(youtubeData.totalViews || 0).toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground mt-1">Total Views</p>
                              </div>
                            </div>
                          )}

                          {/* MUSIC SECTION (Shown First) */}
                          {youtubeData.music && (
                            <div className="space-y-4">
                              <div className="border-l-4 border-red-500 pl-3">
                                <h4 className="text-lg font-bold text-red-600">🎵 Music</h4>
                              </div>

                              {/* Music Stats */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="text-center p-3 bg-red-50 rounded-lg">
                                  <p className="text-xl font-bold text-red-600">{Number(youtubeData.music.totalMusicViews || 0).toLocaleString()}</p>
                                  <p className="text-xs text-muted-foreground mt-1">Music Streams</p>
                                </div>
                                <div className="text-center p-3 bg-red-50 rounded-lg">
                                  <p className="text-xl font-bold text-red-600">{youtubeData.music.totalMusicCount || 0}</p>
                                  <p className="text-xs text-muted-foreground mt-1">Music Tracks</p>
                                </div>
                              </div>

                              {/* Uploaded Music */}
                              {youtubeData.music.uploadedMusic && youtubeData.music.uploadedMusic.length > 0 && (
                                <div className="mt-4">
                                  <p className="text-sm font-semibold mb-3">🎤 Music You Uploaded (Top Streams):</p>
                                  <ul className="space-y-2">
                                    {youtubeData.music.uploadedMusic.map((song: any, idx: number) => (
                                      <li key={song.id} className="text-sm flex items-center gap-3 p-2 bg-slate-50 rounded hover:bg-slate-100 transition-colors">
                                        <span className="text-muted-foreground font-bold w-6">{idx + 1}.</span>
                                        <span className="flex-1 truncate">{song.title}</span>
                                        <span className="text-xs text-muted-foreground font-semibold whitespace-nowrap">
                                          {song.viewCount.toLocaleString()} streams
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Music from Playlists */}
                              {youtubeData.music.musicFromPlaylists && youtubeData.music.musicFromPlaylists.length > 0 && (
                                <div className="mt-4">
                                  <p className="text-sm font-semibold mb-3">🎵 Music from Playlists (Top Streams):</p>
                                  <ul className="space-y-2">
                                    {youtubeData.music.musicFromPlaylists.slice(0, 10).map((song: any, idx: number) => (
                                      <li key={song.id} className="text-sm flex items-center gap-3 p-2 bg-slate-50 rounded hover:bg-slate-100 transition-colors">
                                        <span className="text-muted-foreground font-bold w-6">{idx + 1}.</span>
                                        <span className="flex-1 truncate">{song.title}</span>
                                        <span className="text-xs text-muted-foreground font-semibold whitespace-nowrap">
                                          {song.viewCount.toLocaleString()} streams
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Music Playlists */}
                              {youtubeData.music.musicPlaylists && youtubeData.music.musicPlaylists.length > 0 && (
                                <div className="mt-4">
                                  <p className="text-sm font-semibold mb-3">🎼 Your Music Playlists:</p>
                                  <div className="space-y-3">
                                    {youtubeData.music.musicPlaylists.map((playlist: any) => (
                                      <div key={playlist.id} className="p-3 bg-red-50 rounded-lg border border-red-100">
                                        <p className="font-semibold text-sm mb-2 text-red-700">
                                          {playlist.title} ({playlist.itemCount} {playlist.itemCount === 1 ? 'track' : 'tracks'})
                                        </p>
                                        {playlist.songs && playlist.songs.length > 0 && (
                                          <ul className="space-y-1 ml-4">
                                            {playlist.songs.slice(0, 5).map((song: any) => (
                                              <li key={song.id} className="text-xs text-muted-foreground flex items-center justify-between">
                                                <span className="flex-1 truncate">• {song.title}</span>
                                                <span className="ml-2 text-xs font-medium">
                                                  {song.viewCount.toLocaleString()} streams
                                                </span>
                                              </li>
                                            ))}
                                            {playlist.songs.length > 5 && (
                                              <li className="text-xs text-muted-foreground italic">
                                                ...and {playlist.songs.length - 5} more
                                              </li>
                                            )}
                                          </ul>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* VIDEOS SECTION (Shown Second) */}
                          {youtubeData.videos && (
                            <div className="space-y-4 border-t-2 pt-6">
                              <div className="border-l-4 border-blue-500 pl-3">
                                <h4 className="text-lg font-bold text-blue-600">📹 Videos</h4>
                              </div>

                              {/* Video Stats */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                  <p className="text-xl font-bold text-blue-600">{Number(youtubeData.videos.totalVideoViews || 0).toLocaleString()}</p>
                                  <p className="text-xs text-muted-foreground mt-1">Video Views</p>
                                </div>
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                  <p className="text-xl font-bold text-blue-600">{youtubeData.videos.totalVideoCount || 0}</p>
                                  <p className="text-xs text-muted-foreground mt-1">Videos Uploaded</p>
                                </div>
                              </div>

                              {/* Uploaded Videos */}
                              {youtubeData.videos.uploadedVideos && youtubeData.videos.uploadedVideos.length > 0 && (
                                <div className="mt-4">
                                  <p className="text-sm font-semibold mb-3">📹 Videos You Uploaded (Top Views):</p>
                                  <ul className="space-y-2">
                                    {youtubeData.videos.uploadedVideos.map((video: any, idx: number) => (
                                      <li key={video.id} className="text-sm flex items-center gap-3 p-2 bg-slate-50 rounded hover:bg-slate-100 transition-colors">
                                        <span className="text-muted-foreground font-bold w-6">{idx + 1}.</span>
                                        <span className="flex-1 truncate">{video.title}</span>
                                        <span className="text-xs text-muted-foreground font-semibold whitespace-nowrap">
                                          {video.viewCount.toLocaleString()} views
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Regular Playlists (Non-Music) */}
                              {youtubeData.videos.regularPlaylists && youtubeData.videos.regularPlaylists.length > 0 && (
                                <div className="mt-4">
                                  <p className="text-sm font-semibold mb-3">📋 Your Video Playlists:</p>
                                  <div className="space-y-3">
                                    {youtubeData.videos.regularPlaylists.map((playlist: any) => (
                                      <div key={playlist.id} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                        <p className="font-semibold text-sm mb-2 text-blue-700">
                                          {playlist.title} ({playlist.itemCount} {playlist.itemCount === 1 ? 'video' : 'videos'})
                                        </p>
                                        {playlist.videos && playlist.videos.length > 0 && (
                                          <ul className="space-y-1 ml-4">
                                            {playlist.videos.slice(0, 5).map((video: any) => (
                                              <li key={video.id} className="text-xs text-muted-foreground flex items-center justify-between">
                                                <span className="flex-1 truncate">• {video.title}</span>
                                                <span className="ml-2 text-xs font-medium">
                                                  {video.viewCount.toLocaleString()} views
                                                </span>
                                              </li>
                                            ))}
                                            {playlist.videos.length > 5 && (
                                              <li className="text-xs text-muted-foreground italic">
                                                ...and {playlist.videos.length - 5} more
                                              </li>
                                            )}
                                          </ul>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              </div>
            </Card>
          )}

          {/* Demo Upload - Only for artists (not when admin viewing) */}
          {!isAdmin && !viewingAsArtist && (
            <>
              <Card className="p-6 border-0 shadow-soft mb-8">
                <h2 className="text-1xl font-bold mb-4">Upload Demo</h2>
                <form onSubmit={handleDemoSubmit}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="demo-message">Message (Optional)</Label>
                      <Textarea
                        id="demo-message"
                        value={demoForm.message}
                        onChange={(e) => setDemoForm({ ...demoForm, message: e.target.value })}
                        placeholder="Tell us about your demo..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="demo-file">Demo File</Label>
                      <Input
                        id="demo-file"
                        type="file"
                        accept="audio/*"
                        onChange={(e) => setDemoForm({ ...demoForm, file: e.target.files?.[0] || null })}
                      />
                    </div>
                    <div className="flex justify-center">
                      <HCaptcha
                        sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY || "10000000-ffff-ffff-ffff-000000000001"}
                        onVerify={(token) => {
                          setDemoHcaptchaToken(token);
                        }}
                        onExpire={() => {
                          setDemoHcaptchaToken(null);
                        }}
                        onError={(err) => {
                          console.error("hCaptcha error:", err);
                          toast({
                            title: "Captcha Error",
                            description: "Please refresh the page and try again",
                            variant: "destructive",
                          });
                        }}
                        ref={demoHcaptchaRef}
                        theme="light"
                      />
                    </div>
                    <Button type="submit" disabled={uploadingDemo || !demoHcaptchaToken}>
                      {uploadingDemo ? "Uploading..." : "Submit Demo"}
                    </Button>
                  </div>
                </form>
              </Card>

              {/* My Demo Submissions - Show status */}
              {demoUploads.length > 0 && (
                <Card className="p-6 border-0 shadow-soft mb-8">
                  <h2 className="text-2xl font-bold mb-4">My Demo Submissions</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4">Date Submitted</th>
                          <th className="text-left py-3 px-4">Message</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-left py-3 px-4">File</th>
                        </tr>
                      </thead>
                      <tbody>
                        {demoUploads.map((demo) => (
                          <tr key={demo.id} className="border-b border-border/50 hover:bg-muted/50">
                            <td className="py-3 px-4">
                              {new Date(demo.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              {demo.message || "-"}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs ${
                                demo.status === 'approved' ? 'bg-green-500/20 text-green-600' :
                                demo.status === 'rejected' ? 'bg-red-500/20 text-red-600' :
                                demo.status === 'needs_improvement' ? 'bg-orange-500/20 text-orange-600' :
                                'bg-yellow-500/20 text-yellow-600'
                              }`}>
                                {demo.status === 'needs_improvement' ? 'Needs Improvement' : (demo.status || 'pending')}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {demo.file_url ? (
                                <a
                                  href={demo.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-accent hover:underline"
                                >
                                  View File
                                </a>
                              ) : (
                                "-"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </>
          )}

          {/* Streaming Data Table - Only for artists */}
          {!isAdmin && streamingData.length > 0 && (
            <Card className="p-6 border-0 shadow-soft">
              <h2 className="text-2xl font-bold mb-6">Recent Streaming Activity</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Track</th>
                      <th className="text-left py-3 px-4">Platform</th>
                      <th className="text-right py-3 px-4">Streams</th>
                      <th className="text-right py-3 px-4">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {streamingData.map((item, index) => (
                      <tr key={index} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="py-3 px-4">{new Date(item.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4">{item.track_name}</td>
                        <td className="py-3 px-4 capitalize">{item.platform.replace(/_/g, " ")}</td>
                        <td className="py-3 px-4 text-right">{item.streams.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">${parseFloat(item.revenue.toString()).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* No Streaming Data - Only for artists */}
          {!isAdmin && streamingData.length === 0 && !viewingAsArtist && (
            <Card className="p-12 text-center border-0 shadow-soft">
              <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">No Streaming Data Yet</h3>
              <p className="text-muted-foreground">
                Connect your streaming platforms to start tracking your analytics
              </p>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ArtistDashboard;
