// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    if (!supabaseServiceKey) {
      console.error("SUPABASE_SERVICE_ROLE_KEY not set");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle both GET (from Apple redirect) and POST (from frontend callback)
    let code: string | null = null;
    let state: string | null = null;
    let error: string | null = null;

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      code = body.code || null;
      state = body.state || null;
      error = body.error || null;
    } else {
      const url = new URL(req.url);
      code = url.searchParams.get("code");
      state = url.searchParams.get("state");
      error = url.searchParams.get("error");
    }

    if (error) {
      console.error("Apple Music OAuth error:", error);
      return new Response(
        JSON.stringify({ error: `Apple Music OAuth error: ${error}` }),
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

    // Get Apple Music credentials from environment
    const clientId = Deno.env.get("APPLE_MUSIC_CLIENT_ID");
    const clientSecret = Deno.env.get("APPLE_MUSIC_CLIENT_SECRET");
    
    // Get redirect URI - must EXACTLY match what's used in authorization
    let redirectUri = Deno.env.get("APPLE_MUSIC_REDIRECT_URI");
    if (!redirectUri) {
      const frontendUrl = Deno.env.get("FRONTEND_URL");
      if (!frontendUrl) {
        console.error("APPLE_MUSIC_REDIRECT_URI or FRONTEND_URL must be set");
        return new Response(
          JSON.stringify({ error: "Redirect URI not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      redirectUri = `${frontendUrl}/auth/apple-music/callback`;
    }
    
    console.log("Using redirect URI for token exchange:", redirectUri);

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ error: "Apple Music credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Exchange authorization code for access token
    // Note: Apple Music uses a different OAuth flow - this is a placeholder
    // You'll need to implement Apple's specific OAuth 2.0 flow
    const tokenResponse = await fetch("https://appleid.apple.com/auth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Token exchange failed:", errorData);
      console.error("Used redirect URI:", redirectUri);
      return new Response(
        JSON.stringify({ 
          error: "Failed to exchange authorization code for token",
          details: errorData.substring(0, 200)
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tokenData = await tokenResponse.json();

    // Save or update connection in database
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (tokenData.expires_in || 3600));

    const { error: dbError } = await supabase
      .from("streaming_platform_connections")
      .upsert(
        {
          user_id: userId,
          platform: "apple_music",
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_expires_at: expiresAt.toISOString(),
          platform_user_id: tokenData.user_id || null,
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

    return new Response(
      JSON.stringify({ success: true, message: "Apple Music connected successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Apple Music OAuth handler error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

