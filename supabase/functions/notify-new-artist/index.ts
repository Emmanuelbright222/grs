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

    // Get email from environment variable, fallback to Resend test domain
    // Use onboarding@resend.dev for unverified domains (works immediately)
    // Or use your verified domain once verified in Resend dashboard
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "Grace Rhythm Sounds <onboarding@resend.dev>";
    const adminEmail = Deno.env.get("RESEND_TO_EMAIL") || "miztabrightstar@gmail.com";
    
    // IMPORTANT: Resend test domain (onboarding@resend.dev) only allows sending to account owner's email
    // The Resend account owner email (used to sign up) is: nwekeemmanuel850@gmail.com
    // When using test domain, we must send to the Resend account owner, but we'll include admin email in content
    const isTestDomain = fromEmail.includes("onboarding@resend.dev") || fromEmail.includes("resend.dev");
    const resendAccountOwnerEmail = "nwekeemmanuel850@gmail.com"; // Resend account owner email
    
    // Determine recipient emails
    let recipientEmails: string[] = [];
    let actualAdminEmails: string[] = [];
    
    if (isTestDomain) {
      // With test domain, can only send to Resend account owner's email
      recipientEmails = [resendAccountOwnerEmail];
      // Collect actual admin emails to include in email content
      actualAdminEmails = adminEmails.length > 0 ? adminEmails : [adminEmail];
      console.log("Using test domain - sending to Resend account owner:", resendAccountOwnerEmail);
      console.log("Admin emails (will be notified via forwarded email):", actualAdminEmails);
    } else {
      // With verified domain, can send to any email
      recipientEmails = adminEmails.length > 0 ? adminEmails : [adminEmail];
      actualAdminEmails = recipientEmails;
    }

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
          ${isTestDomain && actualAdminEmails.length > 0 ? `
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #856404;"><strong>📧 Forward to Admin:</strong> ${actualAdminEmails.join(", ")}</p>
            <p style="margin: 5px 0 0 0; color: #856404; font-size: 12px;">This email was sent to the Resend account owner. Please forward to the admin email(s) above.</p>
          </div>
          ` : ''}
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Artist Name:</strong> ${registrationData.artist_name || "Not provided"}</p>
            <p style="margin: 5px 0;"><strong>Full Name:</strong> ${registrationData.full_name || "Not provided"}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${registrationData.email}</p>
            ${registrationData.genre ? `<p style="margin: 5px 0;"><strong>Genre:</strong> ${registrationData.genre}</p>` : ''}
          </div>
          <p style="color: #666; line-height: 1.6;">
            A new artist has registered on NovaTune Records. You can view their profile in the admin dashboard.
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

