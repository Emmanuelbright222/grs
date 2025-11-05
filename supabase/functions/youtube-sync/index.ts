// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
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

    // Get YouTube connection
    const { data: connection, error: connError } = await supabase
      .from("streaming_platform_connections")
      .select("*")
      .eq("user_id", user_id)
      .eq("platform", "youtube")
      .eq("is_active", true)
      .maybeSingle();

    if (connError) throw connError;
    if (!connection || !connection.access_token) {
      return new Response(
        JSON.stringify({ error: "YouTube Music not connected. Please connect your account first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if token needs refresh
    let accessToken = connection.access_token;
    if (connection.token_expires_at && new Date(connection.token_expires_at) <= new Date()) {
      const clientId = Deno.env.get("YOUTUBE_CLIENT_ID");
      const clientSecret = Deno.env.get("YOUTUBE_CLIENT_SECRET");

      if (!clientId || !clientSecret || !connection.refresh_token) {
        return new Response(
          JSON.stringify({ error: "Unable to refresh token. Please reconnect." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const refreshResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: connection.refresh_token,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        accessToken = refreshData.access_token;

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

    // Get user's channel information
    const channelResponse = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&mine=true",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    let channelData = null;
    let channelId = null;
    if (channelResponse.ok) {
      const channelResult = await channelResponse.json();
      if (channelResult.items && channelResult.items.length > 0) {
        channelData = channelResult.items[0];
        channelId = channelData.id;
      }
    }

    // Fetch user's playlists
    const playlistsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true&maxResults=50`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    let playlists = [];
    let playlistsCount = 0;
    if (playlistsResponse.ok) {
      const playlistsResult = await playlistsResponse.json();
      playlists = playlistsResult.items || [];
      playlistsCount = playlistsResult.pageInfo?.totalResults || playlists.length;
    }

    // Fetch user's channel videos (uploaded videos)
    let channelVideos = [];
    let totalViews = 0;
    if (channelId) {
      const videosResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&maxResults=10&order=viewCount`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (videosResponse.ok) {
        const videosResult = await videosResponse.json();
        channelVideos = videosResult.items || [];
        
        // Get detailed stats for videos
        if (channelVideos.length > 0) {
          const videoIds = channelVideos.map((v: any) => v.id.videoId).join(",");
          const videoStatsResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (videoStatsResponse.ok) {
            const videoStatsResult = await videoStatsResponse.json();
            channelVideos = videoStatsResult.items || [];
            totalViews = channelVideos.reduce((sum: number, video: any) => {
              return sum + parseInt(video.statistics?.viewCount || 0);
            }, 0);
          }
        }
      }
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
          channel: channelData ? {
            title: channelData.snippet?.title,
            description: channelData.snippet?.description,
            subscriberCount: channelData.statistics?.subscriberCount || 0,
            videoCount: channelData.statistics?.videoCount || 0,
            viewCount: channelData.statistics?.viewCount || 0,
          } : null,
          playlistsCount,
          playlists: playlists.slice(0, 5).map((p: any) => ({
            id: p.id,
            title: p.snippet?.title,
            itemCount: p.contentDetails?.itemCount || 0,
            thumbnail: p.snippet?.thumbnails?.default?.url,
          })),
          topVideos: channelVideos.slice(0, 5).map((v: any) => ({
            id: v.id,
            title: v.snippet?.title,
            viewCount: parseInt(v.statistics?.viewCount || 0),
            thumbnail: v.snippet?.thumbnails?.default?.url,
          })),
          totalViews,
          syncedAt: new Date().toISOString(),
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("YouTube sync error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to sync YouTube data" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

