// @ts-nocheck - This is a Deno edge function
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

interface RequestBody {
  user_id: string;
  platform: 'spotify' | 'apple_music' | 'youtube' | 'soundcloud';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { user_id, platform }: RequestBody = await req.json();

    if (!user_id || !platform) {
      return new Response(
        JSON.stringify({ error: "user_id and platform are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get platform connection
    const { data: connection, error: connError } = await supabase
      .from("streaming_platform_connections")
      .select("*")
      .eq("user_id", user_id)
      .eq("platform", platform)
      .eq("is_active", true)
      .maybeSingle();

    if (connError) throw connError;
    if (!connection || !connection.access_token) {
      return new Response(
        JSON.stringify({ error: "Platform not connected. Please connect your account first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let analyticsData: any[] = [];

    // Fetch data based on platform
    switch (platform) {
      case 'spotify':
        analyticsData = await fetchSpotifyAnalytics(connection.access_token, connection.platform_user_id);
        break;
      case 'apple_music':
        analyticsData = await fetchAppleMusicAnalytics(connection.access_token, connection.platform_user_id);
        break;
      case 'youtube':
        analyticsData = await fetchYouTubeAnalytics(connection.access_token, connection.platform_user_id);
        break;
      case 'soundcloud':
        analyticsData = await fetchSoundCloudAnalytics(connection.access_token, connection.platform_user_id);
        break;
      default:
        return new Response(
          JSON.stringify({ error: "Unsupported platform" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // Save to streaming_analytics table
    if (analyticsData.length > 0) {
      const insertData = analyticsData.map(item => ({
        user_id,
        platform: platform,
        track_name: item.track_name,
        streams: item.streams || 0,
        revenue: item.revenue || 0,
        date: item.date || new Date().toISOString().split('T')[0],
      }));

      const { error: insertError } = await supabase
        .from("streaming_analytics")
        .upsert(insertData, { onConflict: "user_id,platform,date,track_name" });

      if (insertError) throw insertError;

      // Update last_synced_at
      await supabase
        .from("streaming_platform_connections")
        .update({ last_synced_at: new Date().toISOString() })
        .eq("id", connection.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        records_synced: analyticsData.length,
        message: `Successfully synced ${analyticsData.length} records from ${platform}`
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error syncing streaming data:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to sync streaming data" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

// Platform-specific fetch functions (implement based on actual API endpoints)
async function fetchSpotifyAnalytics(accessToken: string, artistId: string): Promise<any[]> {
  // Example: Fetch from Spotify Web API
  // This is a placeholder - implement actual Spotify API calls
  const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}/albums`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.statusText}`);
  }

  const data = await response.json();
  // Transform Spotify data to our format
  // This is simplified - actual implementation would fetch detailed analytics
  return [];
}

async function fetchAppleMusicAnalytics(accessToken: string, artistId: string): Promise<any[]> {
  // Implement Apple Music API calls
  return [];
}

async function fetchYouTubeAnalytics(accessToken: string, channelId: string): Promise<any[]> {
  // Implement YouTube Analytics API calls
  return [];
}

async function fetchSoundCloudAnalytics(accessToken: string, userId: string): Promise<any[]> {
  // Implement SoundCloud API calls
  return [];
}

serve(handler);

