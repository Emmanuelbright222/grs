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

    // Fetch user's top tracks (last 4 weeks)
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
      topTracks = tracksData.items || [];
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

    // Fetch user's playlists
    const playlistsResponse = await fetch(
      "https://api.spotify.com/v1/me/playlists?limit=1",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    let playlistsCount = 0;
    if (playlistsResponse.ok) {
      const playlistsData = await playlistsResponse.json();
      playlistsCount = playlistsData.total || 0;
    }

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
          topTracks,
          savedAlbumsCount,
          playlistsCount,
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

