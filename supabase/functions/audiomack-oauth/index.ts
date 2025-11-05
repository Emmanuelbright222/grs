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
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state"); // user_id
    const error = url.searchParams.get("error");

    if (error) {
      return new Response(
        JSON.stringify({ error: `Audiomack OAuth error: ${error}` }),
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

    // Get Audiomack credentials from environment
    const clientId = Deno.env.get("AUDIOMACK_CLIENT_ID");
    const clientSecret = Deno.env.get("AUDIOMACK_CLIENT_SECRET");
    const redirectUri = Deno.env.get("AUDIOMACK_REDIRECT_URI") || 
      `${supabaseUrl}/functions/v1/audiomack-oauth`;

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ error: "Audiomack credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Exchange authorization code for access token
    // Note: Placeholder - Audiomack API may use different OAuth flow
    const tokenResponse = await fetch("https://api.audiomack.com/oauth/token", {
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
      return new Response(
        JSON.stringify({ error: "Failed to exchange authorization code for token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tokenData = await tokenResponse.json();

    // Get user profile
    let platformUserId = null;
    if (tokenData.access_token) {
      const profileResponse = await fetch("https://api.audiomack.com/v1/user", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        platformUserId = profile.id || profile.user_id || null;
      }
    }

    // Save or update connection in database
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (tokenData.expires_in || 3600));

    const { error: dbError } = await supabase
      .from("streaming_platform_connections")
      .upsert(
        {
          user_id: userId,
          platform: "audiomack",
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

    return new Response(
      JSON.stringify({ success: true, message: "Audiomack connected successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Audiomack OAuth handler error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

