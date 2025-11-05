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

      // Fetch playlist items (songs) for each playlist
      for (const playlist of playlists.slice(0, 10)) { // Limit to first 10 playlists
        try {
          const playlistItemsResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlist.id}&maxResults=50`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (playlistItemsResponse.ok) {
            const itemsResult = await playlistItemsResponse.json();
            const videoIds = itemsResult.items?.map((item: any) => item.contentDetails?.videoId).filter(Boolean).join(",");
            
            if (videoIds) {
              // Get video stats
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
                playlist.songs = videoStatsResult.items?.map((video: any) => ({
                  id: video.id,
                  title: video.snippet?.title,
                  viewCount: parseInt(video.statistics?.viewCount || 0),
                  likeCount: parseInt(video.statistics?.likeCount || 0),
                  thumbnail: video.snippet?.thumbnails?.default?.url,
                  categoryId: video.snippet?.categoryId || "0",
                  isMusic: video.snippet?.categoryId === "10" || // Music category
                          /music|song|track|album|artist|feat|ft\.|lyrics|audio|single/i.test(video.snippet?.title || ""),
                })) || [];
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching playlist items for ${playlist.id}:`, error);
        }
      }
    }

    // Get user's uploads playlist (all videos uploaded by user)
    let uploadsPlaylistId = null;
    if (channelData?.contentDetails?.relatedPlaylists?.uploads) {
      uploadsPlaylistId = channelData.contentDetails.relatedPlaylists.uploads;
    }

    // Fetch user's uploaded videos (from uploads playlist)
    let uploadedMusic = [];
    let uploadedVideos = [];
    let musicViews = 0;
    let videoViews = 0;
    let totalLikes = 0;
    
    if (uploadsPlaylistId) {
      try {
        const uploadsResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (uploadsResponse.ok) {
          const uploadsResult = await uploadsResponse.json();
          const uploadedVideoIds = uploadsResult.items?.map((item: any) => item.contentDetails?.videoId).filter(Boolean);
          
          if (uploadedVideoIds && uploadedVideoIds.length > 0) {
            // Fetch video details in batches
            for (let i = 0; i < uploadedVideoIds.length; i += 50) {
              const batch = uploadedVideoIds.slice(i, i + 50);
              const videoIds = batch.join(",");
              
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
                
                videoStatsResult.items?.forEach((video: any) => {
                  const isMusic = video.snippet?.categoryId === "10" || // Music category
                                /music|song|track|album|artist|feat|ft\.|lyrics|audio|single|mv|music video/i.test(video.snippet?.title || "");
                  
                  const videoData = {
                    id: video.id,
                    title: video.snippet?.title,
                    viewCount: parseInt(video.statistics?.viewCount || 0),
                    likeCount: parseInt(video.statistics?.likeCount || 0),
                    thumbnail: video.snippet?.thumbnails?.default?.url,
                    categoryId: video.snippet?.categoryId || "0",
                    isMusic,
                  };
                  
                  totalLikes += videoData.likeCount;
                  
                  if (isMusic) {
                    uploadedMusic.push(videoData);
                    musicViews += videoData.viewCount;
                  } else {
                    uploadedVideos.push(videoData);
                    videoViews += videoData.viewCount;
                  }
                });
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching uploads:", error);
      }
    }

    // Separate music playlists from regular playlists
    const musicPlaylists = playlists.filter((p: any) => {
      const title = p.snippet?.title?.toLowerCase() || "";
      return /music|song|track|album|artist|playlist|mix/i.test(title);
    });

    const regularPlaylists = playlists.filter((p: any) => {
      const title = p.snippet?.title?.toLowerCase() || "";
      return !/music|song|track|album|artist|playlist|mix/i.test(title);
    });

    // Get music from playlists (songs in music playlists)
    const musicFromPlaylists = musicPlaylists.flatMap((p: any) => 
      (p.songs || []).filter((song: any) => song.isMusic !== false)
    );

    // Sort music and videos separately
    uploadedMusic.sort((a: any, b: any) => b.viewCount - a.viewCount);
    uploadedVideos.sort((a: any, b: any) => b.viewCount - a.viewCount);
    musicFromPlaylists.sort((a: any, b: any) => b.viewCount - a.viewCount);

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
            subscriberCount: parseInt(channelData.statistics?.subscriberCount || 0),
            totalLikes,
          } : null,
          
          // MUSIC STATS (shown first)
          music: {
            uploadedMusic: uploadedMusic.slice(0, 10), // Top 10 uploaded music
            musicFromPlaylists: musicFromPlaylists.slice(0, 10), // Top 10 music from playlists
            musicPlaylists: musicPlaylists.slice(0, 5).map((p: any) => ({
              id: p.id,
              title: p.snippet?.title,
              itemCount: p.contentDetails?.itemCount || 0,
              thumbnail: p.snippet?.thumbnails?.default?.url,
              songs: (p.songs || []).filter((s: any) => s.isMusic !== false),
            })),
            totalMusicViews: musicViews,
            totalMusicCount: uploadedMusic.length + musicFromPlaylists.length,
          },
          
          // VIDEO STATS (shown second)
          videos: {
            uploadedVideos: uploadedVideos.slice(0, 10), // Top 10 uploaded videos
            regularPlaylists: regularPlaylists.slice(0, 5).map((p: any) => ({
              id: p.id,
              title: p.snippet?.title,
              itemCount: p.contentDetails?.itemCount || 0,
              thumbnail: p.snippet?.thumbnails?.default?.url,
              videos: p.songs || [],
            })),
            totalVideoViews: videoViews,
            totalVideoCount: uploadedVideos.length,
          },
          
          // GENERAL STATS
          playlistsCount,
          totalViews: musicViews + videoViews,
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

