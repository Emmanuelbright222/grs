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
const demoStatusSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  name: z.string().trim().min(1, "Name is required"),
  status: z.enum(["approved", "rejected", "needs_improvement", "deleted"]),
  message: z.string().trim().optional(),
});

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests FIRST
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    // Check if Resend API key is configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not set in Supabase secrets");
      return new Response(
        JSON.stringify({ 
          error: "Email service not configured",
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

    const resend = new Resend(resendApiKey);
    const rawData = await req.json();
    
    // Validate input
    const validationResult = demoStatusSchema.safeParse(rawData);
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

    const { email, name, status, message } = validationResult.data;

    const statusConfig: Record<string, { subject: string; color: string; icon: string }> = {
      approved: {
        subject: "🎉 Your Demo Has Been Approved!",
        color: "#10b981",
        icon: "✅",
      },
      rejected: {
        subject: "Demo Submission Update",
        color: "#ef4444",
        icon: "❌",
      },
      needs_improvement: {
        subject: "📝 Demo Needs Improvement",
        color: "#f59e0b",
        icon: "⚠️",
      },
      deleted: {
        subject: "Demo Submission Removed",
        color: "#6b7280",
        icon: "🗑️",
      },
    };

    const config = statusConfig[status] || statusConfig.rejected;
    const customMessage = message || `Your demo submission status has been updated to: ${status}`;

    // Send email to artist
    const emailResult = await resend.emails.send({
      from: "Grace Rhythm Sounds <nwekeemmanuel850@gmail.com>",
      to: [email],
      subject: config.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">${config.icon} ${config.subject}</h1>
          <p style="color: #666; line-height: 1.6;">
            Hello ${name},
          </p>
          <p style="color: #666; line-height: 1.6;">
            ${customMessage}
          </p>
          ${status === "needs_improvement" ? `
            <div style="background: #fef3c7; border-left: 4px solid ${config.color}; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e;">
                <strong>Next Steps:</strong> Please review your demo submission and make the necessary improvements. You can resubmit your demo once you've made the changes.
              </p>
            </div>
          ` : ''}
          ${status === "approved" ? `
            <div style="background: #d1fae5; border-left: 4px solid ${config.color}; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #065f46;">
                <strong>Congratulations!</strong> We're excited to work with you. Our team will be in touch soon with next steps.
              </p>
            </div>
          ` : ''}
          <p style="color: #666; line-height: 1.6; margin-top: 20px;">
            Best regards,<br/>
            <strong>Grace Rhythm Sounds Team</strong>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This is an automated notification. Please do not reply to this email.
          </p>
        </div>
      `,
    });

    console.log("Demo status email sent:", emailResult);

    return new Response(
      JSON.stringify({ 
        success: true,
        emailId: emailResult.data?.id
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
    console.error("Error in send-demo-status-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error?.message || "An unexpected error occurred",
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

