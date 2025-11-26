import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const resendApiKey = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  email: string;
  confirmationUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, confirmationUrl }: ConfirmationEmailRequest = await req.json();

    console.log(`Sending confirmation email to: ${email}`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "90-Day Meal Program <onboarding@resend.dev>",
        to: [email],
        subject: "Xác nhận đăng ký tài khoản - 90-Day Meal Program",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .container {
                  background: linear-gradient(135deg, #f0fdf4 0%, #dbeafe 100%);
                  border-radius: 12px;
                  padding: 40px;
                  text-align: center;
                }
                h1 {
                  color: #10b981;
                  font-size: 28px;
                  margin-bottom: 20px;
                }
                .button {
                  display: inline-block;
                  background: linear-gradient(135deg, #10b981, #3b82f6);
                  color: white;
                  text-decoration: none;
                  padding: 16px 32px;
                  border-radius: 8px;
                  font-weight: 600;
                  margin: 20px 0;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .footer {
                  margin-top: 30px;
                  font-size: 14px;
                  color: #666;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>🎉 Chào mừng bạn đến với 90-Day Meal Program!</h1>
                <p>Cảm ơn bạn đã đăng ký tài khoản. Hãy xác nhận email để bắt đầu hành trình 90 ngày của bạn.</p>
                <a href="${confirmationUrl}" class="button">Xác nhận email của tôi</a>
                <div class="footer">
                  <p>Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.</p>
                  <p>Link xác nhận sẽ hết hạn sau 24 giờ.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(`Resend API error: ${JSON.stringify(errorData)}`);
    }

    const data = await emailResponse.json();
    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending confirmation email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
