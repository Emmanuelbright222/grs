// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

interface SpotifyTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    
    // Use service role key for database operations (bypasses RLS)
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    if (!supabaseServiceKey) {
      console.error("SUPABASE_SERVICE_ROLE_KEY not set");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle both GET (from Spotify redirect) and POST (from frontend callback)
    let code: string | null = null;
    let state: string | null = null;
    let error: string | null = null;

    if (req.method === "POST") {
      // Frontend callback sends code and state in body
      const body = await req.json().catch(() => ({}));
      code = body.code || null;
      state = body.state || null;
      error = body.error || null;
    } else {
      // Direct Spotify redirect (GET with query params)
      const url = new URL(req.url);
      code = url.searchParams.get("code");
      state = url.searchParams.get("state");
      error = url.searchParams.get("error");
    }

    if (error) {
      console.error("Spotify OAuth error:", error);
      return new Response(
        JSON.stringify({ error: `Spotify OAuth error: ${error}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!code || !state) {
      return new Response(
        JSON.stringify({ error: "Missing code or state parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = state;

    // Get Spotify credentials from environment
    const clientId = Deno.env.get("SPOTIFY_CLIENT_ID");
    const clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET");
    
    // Get redirect URI - must EXACTLY match what's in Spotify Dashboard and what was used in authorization
    // Priority: SPOTIFY_REDIRECT_URI secret > FRONTEND_URL + /auth/spotify/callback
    let redirectUri = Deno.env.get("SPOTIFY_REDIRECT_URI");
    if (!redirectUri) {
      const frontendUrl = Deno.env.get("FRONTEND_URL");
      if (!frontendUrl) {
        console.error("SPOTIFY_REDIRECT_URI or FRONTEND_URL must be set");
        return new Response(
          JSON.stringify({ error: "Redirect URI not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      // Use frontend callback URL
      redirectUri = `${frontendUrl}/auth/spotify/callback`;
    }
    
    console.log("Using redirect URI for token exchange:", redirectUri);

    if (!clientId || !clientSecret) {
      console.error("Spotify credentials not configured");
      return new Response(
        JSON.stringify({ error: "Spotify credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Token exchange failed:", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to exchange authorization code for token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tokenData: SpotifyTokenResponse = await tokenResponse.json();

    // Get user's Spotify profile
    const profileResponse = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    let platformUserId = null;
    if (profileResponse.ok) {
      const profile = await profileResponse.json();
      platformUserId = profile.id;
    }

    // Calculate token expiration
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

    // Save or update connection in database
    const { error: dbError } = await supabase
      .from("streaming_platform_connections")
      .upsert(
        {
          user_id: userId,
          platform: "spotify",
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_expires_at: expiresAt.toISOString(),
          platform_user_id: platformUserId,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,platform",
        }
      );

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to save connection to database" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return success
    return new Response(
      JSON.stringify({ success: true, message: "Spotify connected successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Spotify OAuth handler error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

