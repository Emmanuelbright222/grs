// @ts-nocheck - This is a Deno edge function
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface DemoSubmission {
  name: string;
  email: string;
  artist_name?: string;
  genre?: string;
  message?: string;
  demoUrl?: string;
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
    const demoData: DemoSubmission = await req.json();

    console.log("Processing demo submission notification:", {
      name: demoData.name,
      email: demoData.email,
      artist_name: demoData.artist_name
    });

    // Use Resend's test email (onboarding@resend.dev) for testing
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";
    const adminEmail = Deno.env.get("RESEND_TO_EMAIL") || "nwekeemmanuel850@gmail.com";

    console.log("Email configuration:", { fromEmail, adminEmail });

    // Send notification email to admin
    const emailResult = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `New Demo Submission from ${demoData.artist_name || demoData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">New Demo Submission</h1>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Name:</strong> ${demoData.name}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${demoData.email}</p>
            ${demoData.artist_name ? `<p style="margin: 5px 0;"><strong>Artist Name:</strong> ${demoData.artist_name}</p>` : ''}
            ${demoData.genre ? `<p style="margin: 5px 0;"><strong>Genre:</strong> ${demoData.genre}</p>` : ''}
            ${demoData.demoUrl ? `<p style="margin: 5px 0;"><strong>Demo File:</strong> <a href="${demoData.demoUrl}" target="_blank" style="color: #0066cc;">Download Demo</a></p>` : ''}
          </div>
          ${demoData.message ? `
            <div style="background: #fff; border-left: 4px solid #333; padding: 15px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Message:</strong></p>
              <p style="color: #666; line-height: 1.6; margin-top: 10px;">${demoData.message}</p>
            </div>
          ` : ''}
          <p style="color: #999; font-size: 12px;">
            Submitted at ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    });

    console.log("Demo submission email result:", {
      success: !!emailResult.data,
      error: emailResult.error,
      emailId: emailResult.data?.id,
      sentTo: adminEmail
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

    console.log("Demo submission notification sent successfully to:", adminEmail);

    return new Response(
      JSON.stringify({ 
        success: true,
        emailId: emailResult.data.id,
        sentTo: adminEmail,
        message: "Demo submission notification sent successfully"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in notify-demo-submission:", error);
    return new Response(
      JSON.stringify({ 
        error: error?.message || "An unexpected error occurred",
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

