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
      
      // Try to get emails from profiles table first
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .in("user_id", userIds);
      
      if (profiles && profiles.length > 0) {
        adminEmails = profiles.map((p: any) => p.email).filter(Boolean);
      }
      
      // If no emails from profiles, try auth.users table as fallback
      if (adminEmails.length === 0) {
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        if (authUsers && !authError) {
          const adminAuthUsers = authUsers.users.filter((u: any) => userIds.includes(u.id));
          adminEmails = adminAuthUsers.map((u: any) => u.email).filter(Boolean);
        }
      }
    }
    
    console.log("Admin emails found:", adminEmails);

    // Use Resend's default test email (onboarding@resend.dev) which works immediately
    // This will forward emails to nwekeemmanuel850@gmail.com
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "Grace Rhythm Sounds <onboarding@resend.dev>";
    const adminEmail = Deno.env.get("RESEND_TO_EMAIL") || "nwekeemmanuel850@gmail.com";
    
    // With onboarding@resend.dev, emails sent to nwekeemmanuel850@gmail.com will be received
    // Use the admin email directly
    const recipientEmails = adminEmails.length > 0 ? adminEmails : [adminEmail];

    console.log("Preparing to send email:", {
      from: fromEmail,
      to: recipientEmails,
      hasApiKey: !!resendApiKey,
      apiKeyPrefix: resendApiKey ? resendApiKey.substring(0, 10) + "..." : "none"
    });

    // Send email to admins
    const emailResult = await resend.emails.send({
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

    console.log("Resend email result:", {
      success: !!emailResult.data,
      error: emailResult.error,
      emailId: emailResult.data?.id,
      recipientEmails
    });

    if (emailResult.error) {
      console.error("Resend email error:", emailResult.error);
      throw new Error(`Failed to send email: ${emailResult.error.message || JSON.stringify(emailResult.error)}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        emailId: emailResult.data?.id,
        sentTo: recipientEmails
      }),
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

