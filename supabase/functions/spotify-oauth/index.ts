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

  // This function is called by Spotify OAuth callback (no auth headers from Spotify)
  // Supabase Edge Functions require apikey header, but OAuth callbacks don't include it
  // We'll use service role key internally to bypass RLS
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // Use service role key for database operations (bypasses RLS)
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    if (!supabaseServiceKey) {
      console.error("SUPABASE_SERVICE_ROLE_KEY not set");
      const frontendUrl = Deno.env.get("FRONTEND_URL") || "http://localhost:8083";
      return Response.redirect(
        `${frontendUrl}/dashboard?error=server_config_error`,
        302
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state"); // Contains user_id
    const error = url.searchParams.get("error");
    
    // Check for apikey in headers (Supabase gateway requirement)
    // For OAuth callbacks, Spotify doesn't send headers, but Supabase gateway
    // may have already validated if called correctly
    const authHeader = req.headers.get("Authorization") || req.headers.get("apikey");

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
    
    // Get redirect URI from environment or construct from Supabase URL
    // Must match exactly what's registered in Spotify Dashboard
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const redirectUri = Deno.env.get("SPOTIFY_REDIRECT_URI") || 
      `${supabaseUrl}/functions/v1/spotify-oauth`;

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

