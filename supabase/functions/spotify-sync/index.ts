// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "user_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get Spotify connection
    const { data: connection, error: connError } = await supabase
      .from("streaming_platform_connections")
      .select("*")
      .eq("user_id", user_id)
      .eq("platform", "spotify")
      .eq("is_active", true)
      .maybeSingle();

    if (connError) throw connError;
    if (!connection || !connection.access_token) {
      return new Response(
        JSON.stringify({ error: "Spotify not connected. Please connect your account first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if token needs refresh
    let accessToken = connection.access_token;
    if (connection.token_expires_at && new Date(connection.token_expires_at) <= new Date()) {
      // Token expired, refresh it
      const clientId = Deno.env.get("SPOTIFY_CLIENT_ID");
      const clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET");

      if (!clientId || !clientSecret || !connection.refresh_token) {
        return new Response(
          JSON.stringify({ error: "Unable to refresh token. Please reconnect." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const refreshResponse = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: connection.refresh_token,
        }),
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        accessToken = refreshData.access_token;

        // Update token in database
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + (refreshData.expires_in || 3600));

        await supabase
          .from("streaming_platform_connections")
          .update({
            access_token: accessToken,
            token_expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", connection.id);
      }
    }

    // Fetch user's top tracks (last 4 weeks) - listening history
    const topTracksResponse = await fetch(
      "https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=short_term",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    let topTracks = [];
    if (topTracksResponse.ok) {
      const tracksData = await topTracksResponse.json();
      topTracks = (tracksData.items || []).map((track: any) => ({
        id: track.id,
        name: track.name,
        artists: track.artists?.map((a: any) => ({ name: a.name })) || [],
        album: track.album?.name || "Unknown",
        popularity: track.popularity || 0,
        preview_url: track.preview_url,
      }));
    }

    // Fetch user's saved albums count
    const savedAlbumsResponse = await fetch(
      "https://api.spotify.com/v1/me/albums?limit=1",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    let savedAlbumsCount = 0;
    if (savedAlbumsResponse.ok) {
      const albumsData = await savedAlbumsResponse.json();
      savedAlbumsCount = albumsData.total || 0;
    }

    // Fetch user's playlists with details
    const playlistsResponse = await fetch(
      "https://api.spotify.com/v1/me/playlists?limit=50",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    let playlists = [];
    let playlistsCount = 0;
    if (playlistsResponse.ok) {
      const playlistsData = await playlistsResponse.json();
      playlists = playlistsData.items || [];
      playlistsCount = playlistsData.total || 0;

      // Fetch playlist items (tracks) for each playlist
      for (const playlist of playlists.slice(0, 10)) { // Limit to first 10 playlists
        try {
          const playlistTracksResponse = await fetch(
            `https://api.spotify.com/v1/playlists/${playlist.id}/tracks?limit=50`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (playlistTracksResponse.ok) {
            const tracksResult = await playlistTracksResponse.json();
            playlist.tracks = tracksResult.items?.map((item: any) => ({
              id: item.track?.id,
              name: item.track?.name,
              artists: item.track?.artists?.map((a: any) => a.name).join(", ") || "Unknown",
              album: item.track?.album?.name || "Unknown",
              popularity: item.track?.popularity || 0, // Spotify popularity score (0-100)
              duration_ms: item.track?.duration_ms || 0,
              preview_url: item.track?.preview_url,
            })) || [];
          }
        } catch (error) {
          console.error(`Error fetching playlist tracks for ${playlist.id}:`, error);
        }
      }
    }

    // Get all unique tracks from playlists and sort by popularity (closest to stream count)
    const allTracks = playlists.flatMap((p: any) => p.tracks || []);
    const uniqueTracksMap = new Map();
    allTracks.forEach((track: any) => {
      if (track.id && (!uniqueTracksMap.has(track.id) || uniqueTracksMap.get(track.id).popularity < track.popularity)) {
        uniqueTracksMap.set(track.id, track);
      }
    });
    const topSongs = Array.from(uniqueTracksMap.values())
      .sort((a: any, b: any) => b.popularity - a.popularity)
      .slice(0, 10);

    // Update last_synced_at
    await supabase
      .from("streaming_platform_connections")
      .update({
        last_synced_at: new Date().toISOString(),
      })
      .eq("id", connection.id);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          topTracks, // User's most played tracks (listening history)
          savedAlbumsCount,
          playlistsCount,
          playlists: playlists.slice(0, 5).map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            tracksCount: p.tracks?.length || 0,
            total: p.tracks?.total || 0,
            tracks: p.tracks || [],
          })),
          topSongs, // Top songs across all playlists sorted by popularity (most streamed)
          syncedAt: new Date().toISOString(),
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Spotify sync error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to sync Spotify data" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

