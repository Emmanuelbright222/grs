// @ts-nocheck - This is a Deno edge function, TypeScript errors are expected in IDE
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Input validation schema
const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().trim().email("Invalid email").max(255, "Email too long"),
  message: z.string().trim().min(1, "Message is required").max(2000, "Message too long"),
  type: z.enum(["contact", "collaborate", "demo"]),
  artistName: z.string().trim().max(100).optional(),
  genre: z.string().trim().max(50).optional(),
  demoUrl: z.union([z.string().url(), z.literal("")]).optional(),
});

interface ContactEmailRequest {
  name: string;
  email: string;
  message: string;
  type: "contact" | "collaborate" | "demo";
  artistName?: string;
  genre?: string;
  demoUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests FIRST - no processing needed
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
    
    const rawData = await req.json();
    
    // Validate input
    const validationResult = contactSchema.safeParse(rawData);
    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error.flatten());
      return new Response(
        JSON.stringify({ 
          error: "Invalid input data",
          details: validationResult.error.flatten().fieldErrors,
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

    const { name, email, message, type, artistName, genre, demoUrl }: ContactEmailRequest = validationResult.data;

    console.log("Processing email request:", { name, email, type });

    // Use Resend's default test email (onboarding@resend.dev) for testing
    // This works immediately without domain verification
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";
    const toEmail = Deno.env.get("RESEND_TO_EMAIL") || "miztabrightstar@gmail.com";
    
    console.log("Email configuration:", { fromEmail, toEmail, userEmail: email });
    
    // Send confirmation email to user
    // With onboarding@resend.dev, we can send to any email address
    let confirmationEmail;
    try {
      confirmationEmail = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: type === "contact" ? "Thanks for contacting us!" : type === "collaborate" ? "Thanks for your collaboration request!" : "Thanks for submitting your demo!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Thank you, ${name}!</h1>
          <p style="color: #666; line-height: 1.6;">
            We've received your ${type === "contact" ? "message" : type === "collaborate" ? "collaboration request" : "demo submission"} and will get back to you as soon as possible.
          </p>
          ${(type === "collaborate" || type === "demo") && artistName ? `
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Artist/Producer Name:</strong> ${artistName}</p>
              ${genre ? `<p style="margin: 5px 0;"><strong>Genre:</strong> ${genre}</p>` : ''}
              ${type === "demo" && demoUrl ? `<p style="margin: 5px 0;"><strong>Demo File:</strong> <a href="${demoUrl}" target="_blank">Download Demo</a></p>` : ''}
            </div>
          ` : ''}
          <p style="color: #666; line-height: 1.6;">
            <strong>Your message:</strong><br/>
            ${message}
          </p>
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br/>
            <strong>Grace Rhythm Sounds Team</strong>
          </p>
        </div>
      `,
      });
      console.log("Confirmation email sent successfully:", confirmationEmail);
    } catch (confirmationError: any) {
      console.error("Failed to send confirmation email:", confirmationError);
      // Continue with notification email even if confirmation fails
    }

    // Send notification email to admin
    // Using onboarding@resend.dev, we can send to any email
    let notificationEmail;
    try {
      notificationEmail = await resend.emails.send({
        from: fromEmail,
        to: toEmail,
        subject: type === "contact" 
          ? `New Contact Form Submission from ${name}` 
          : type === "collaborate"
          ? `New Collaboration Request from ${name}`
          : `New Demo Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">New ${type === "contact" ? "Contact" : type === "collaborate" ? "Collaboration" : "Demo"} ${type === "demo" ? "Submission" : "Form Submission"}</h1>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            ${(type === "collaborate" || type === "demo") && artistName ? `<p style="margin: 5px 0;"><strong>Artist/Producer Name:</strong> ${artistName}</p>` : ''}
            ${genre ? `<p style="margin: 5px 0;"><strong>Genre:</strong> ${genre}</p>` : ''}
            ${type === "demo" && demoUrl ? `<p style="margin: 5px 0;"><strong>Demo File:</strong> <a href="${demoUrl}" target="_blank" style="color: #0066cc;">Download Demo</a></p>` : ''}
          </div>
          <div style="background: #fff; border-left: 4px solid #333; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Message:</strong></p>
            <p style="color: #666; line-height: 1.6; margin-top: 10px;">${message}</p>
          </div>
          <p style="color: #999; font-size: 12px;">
            Submitted at ${new Date().toLocaleString()}
          </p>
        </div>
      `,
      });
      console.log("Notification email sent successfully:", {
        emailId: notificationEmail.data?.id,
        to: toEmail,
        from: fromEmail,
        subject: type === "contact" 
          ? `New Contact Form Submission from ${name}` 
          : type === "collaborate"
          ? `New Collaboration Request from ${name}`
          : `New Demo Submission from ${name}`
      });
    } catch (notificationError: any) {
      console.error("Failed to send notification email:", {
        error: notificationError?.message,
        stack: notificationError?.stack,
        name: notificationError?.name,
        fullError: JSON.stringify(notificationError)
      });
      throw new Error(`Failed to send notification email: ${notificationError?.message || JSON.stringify(notificationError)}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        confirmationId: confirmationEmail?.data?.id || null,
        notificationId: notificationEmail?.data?.id || null,
        message: "Emails sent successfully"
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
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
