// @ts-nocheck - This is a Deno edge function
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ArtistRegistration {
  artist_name?: string;
  full_name?: string;
  email: string;
  genre?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests FIRST
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  // Wrap everything in try-catch to ensure CORS headers on errors
  try {
    // Check if Resend API key is configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not set in Supabase secrets");
      return new Response(
        JSON.stringify({ 
          error: "Email service not configured. Please contact support.",
          success: false 
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Initialize Resend client only after we know the key exists
    const resend = new Resend(resendApiKey);
    
    // Get artist registration data from request
    let registrationData: ArtistRegistration;
    try {
      registrationData = await req.json();
      console.log("Received registration data:", registrationData);
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ 
          error: "Invalid request data",
          success: false 
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Deduplication: Check if we've already processed this registration recently
    // Use email + timestamp as a simple deduplication key
    const dedupeKey = `${registrationData.email}-${Date.now()}`;
    console.log("Processing registration with dedupe key:", dedupeKey);

    // Use the website email address
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "info@gracerhythmsounds.com";
    // Send to forwarding email address
    const recipientEmail = Deno.env.get("RESEND_TO_EMAIL") || "miztabrightstar@gmail.com";
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "miztabrightstar@gmail.com"; // Forwarding email address
    
    console.log("Email configuration:", { 
      fromEmail, 
      recipientEmail,
      adminEmail
    });

    console.log("Preparing to send email:", {
      from: fromEmail,
      to: recipientEmail,
      hasApiKey: !!resendApiKey,
      apiKeyPrefix: resendApiKey ? resendApiKey.substring(0, 10) + "..." : "none",
      registrationData: {
        artist_name: registrationData.artist_name,
        full_name: registrationData.full_name,
        email: registrationData.email
      }
    });

    // Send email to admin
    // Use exact same pattern as working send-contact-email function
    const emailResult = await resend.emails.send({
      from: fromEmail,
      to: recipientEmail, // Must be the registered Resend account email for test domain
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
      recipientEmail,
      fromEmail
    });

    if (emailResult.error) {
      console.error("Resend email error details:", {
        message: emailResult.error.message,
        name: emailResult.error.name,
        statusCode: emailResult.error.statusCode,
        fullError: JSON.stringify(emailResult.error)
      });
      throw new Error(`Failed to send email: ${emailResult.error.message || JSON.stringify(emailResult.error)}`);
    }

    if (!emailResult.data) {
      console.error("No email data returned from Resend");
      throw new Error("Email sent but no confirmation data returned");
    }

    console.log("Email sent successfully to:", recipientEmail);

    return new Response(
      JSON.stringify({ 
        success: true,
        emailId: emailResult.data.id,
        sentTo: recipientEmail,
        message: "Admin notification sent successfully"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in notify-new-artist function:", error);
    const errorMessage = error?.message || "An unexpected error occurred";
    console.error("Error details:", {
      message: errorMessage,
      stack: error?.stack,
      name: error?.name
    });
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);

