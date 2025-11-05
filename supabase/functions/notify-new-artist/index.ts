// @ts-nocheck - This is a Deno edge function
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ArtistRegistration {
  artist_name?: string;
  full_name?: string;
  email: string;
  genre?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(resendApiKey);
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    // Get artist registration data from request
    const registrationData: ArtistRegistration = await req.json();

    // Get all admin emails via profiles table (which has email field)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Query user_roles to get admin user IDs
    const { data: adminRoles, error: adminError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");
    
    let adminEmails: string[] = [];
    
    if (adminRoles && adminRoles.length > 0) {
      const userIds = adminRoles.map((r: any) => r.user_id);
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .in("user_id", userIds);
      
      if (profiles) {
        adminEmails = profiles.map((p: any) => p.email).filter(Boolean);
      }
    }

    // Get email from environment variable, fallback to default
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "Grace Rhythm Sounds <noreply@gracerhythmsounds.com>";
    const toEmail = Deno.env.get("RESEND_TO_EMAIL") || "nwekeemmanuel850@gmail.com";
    
    // If no admin emails found, send to default email
    const recipientEmails = adminEmails.length > 0 
      ? adminEmails 
      : [toEmail];

    // Send email to admins
    await resend.emails.send({
      from: fromEmail,
      to: recipientEmails,
      subject: `New Artist Registration: ${registrationData.artist_name || registrationData.full_name || "Unknown"}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">New Artist Registration</h1>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Artist Name:</strong> ${registrationData.artist_name || "Not provided"}</p>
            <p style="margin: 5px 0;"><strong>Full Name:</strong> ${registrationData.full_name || "Not provided"}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${registrationData.email}</p>
            ${registrationData.genre ? `<p style="margin: 5px 0;"><strong>Genre:</strong> ${registrationData.genre}</p>` : ''}
          </div>
          <p style="color: #666; line-height: 1.6;">
            A new artist has registered on Grace Rhythm Sounds. You can view their profile in the admin dashboard.
          </p>
          <p style="color: #999; font-size: 12px;">
            Registered at ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in notify-new-artist:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

