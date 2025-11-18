import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  artistEmail: string;
  artistName: string;
  dashboardUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not set");
      return new Response(
        JSON.stringify({
          error: "Email service not configured",
          success: false,
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
    const { artistEmail, artistName, dashboardUrl }: NotificationEmailRequest =
      await req.json();

    if (!artistEmail || !artistName || !dashboardUrl) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
          success: false,
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

    const fromEmail =
      Deno.env.get("RESEND_FROM_EMAIL") || "info@gracerhythmsounds.com";

    // Email template with Read Now button
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Grace Rhythm Sounds</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${artistName},</h2>
            <p style="color: #666; font-size: 16px;">
              There is an announcement to look at. Please login to view by clicking on the bell icon.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${dashboardUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                Read Now
              </a>
            </div>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              Best regards,<br/>
              <strong>Grace Rhythm Sounds Team</strong>
            </p>
          </div>
        </body>
      </html>
    `;

    const emailResult = await resend.emails.send({
      from: fromEmail,
      to: artistEmail,
      subject: "New Announcement - Grace Rhythm Sounds",
      html: emailHtml,
    });

    console.log("Notification email sent:", emailResult);

    return new Response(
      JSON.stringify({
        success: true,
        emailId: emailResult.data?.id,
        message: "Email sent successfully",
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
    console.error("Error sending notification email:", error);
    return new Response(
      JSON.stringify({
        error: error?.message || "Failed to send email",
        success: false,
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
};

serve(handler);

