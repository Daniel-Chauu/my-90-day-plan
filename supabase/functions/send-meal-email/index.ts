import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, dayNumber, suggestions } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, notification_email, email_notifications_enabled")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      console.error("Error fetching profile:", profileError);
      throw new Error("User profile not found");
    }

    // Check if email notifications are enabled
    if (!profile.email_notifications_enabled) {
      console.log("Email notifications disabled for user");
      return new Response(
        JSON.stringify({ message: "Email notifications disabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const targetEmail = profile.notification_email || profile.email;

    // Create beautiful email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
              line-height: 1.6;
              color: #1f2937;
              margin: 0;
              padding: 0;
              background-color: #f3f4f6;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
            }
            .header {
              background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
              border-radius: 0;
            }
            .header h1 {
              margin: 0 0 10px 0;
              font-size: 32px;
              font-weight: 700;
              text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header p {
              margin: 0;
              font-size: 16px;
              opacity: 0.95;
            }
            .content {
              padding: 30px;
            }
            .day-badge {
              display: inline-block;
              background: linear-gradient(135deg, #3b82f6, #2563eb);
              color: white;
              padding: 8px 20px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 600;
              margin-bottom: 20px;
            }
            .meal {
              background: #ffffff;
              border: 2px solid #e5e7eb;
              border-radius: 12px;
              padding: 24px;
              margin-bottom: 20px;
              transition: all 0.3s ease;
            }
            .meal:hover {
              border-color: #10b981;
              box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
            }
            .meal-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 12px;
              flex-wrap: wrap;
            }
            .meal-name {
              font-size: 20px;
              font-weight: 700;
              color: #10b981;
              margin: 0 0 4px 0;
            }
            .meal-time {
              color: #6b7280;
              font-size: 14px;
              font-weight: 500;
              background: #f3f4f6;
              padding: 4px 12px;
              border-radius: 12px;
            }
            .meal-description {
              color: #4b5563;
              margin: 12px 0;
              font-size: 15px;
              line-height: 1.6;
            }
            .nutrients {
              display: flex;
              gap: 12px;
              flex-wrap: wrap;
              margin: 16px 0;
            }
            .nutrient {
              background: linear-gradient(135deg, #f0fdf4, #dcfce7);
              color: #166534;
              padding: 8px 14px;
              border-radius: 8px;
              font-size: 13px;
              font-weight: 600;
              border: 1px solid #bbf7d0;
            }
            .nutrient.calories {
              background: linear-gradient(135deg, #fef3c7, #fde68a);
              color: #92400e;
              border-color: #fcd34d;
            }
            .ingredients {
              margin: 16px 0;
            }
            .ingredients-title {
              font-weight: 600;
              color: #374151;
              margin-bottom: 8px;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .ingredients-list {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
            }
            .ingredient {
              background: #f9fafb;
              color: #374151;
              padding: 6px 12px;
              border-radius: 6px;
              font-size: 13px;
              border: 1px solid #e5e7eb;
            }
            .preparation {
              margin-top: 16px;
              padding: 16px;
              background: #f9fafb;
              border-radius: 8px;
              border-left: 4px solid #10b981;
            }
            .preparation-title {
              font-weight: 600;
              color: #374151;
              margin-bottom: 8px;
              font-size: 14px;
            }
            .preparation-text {
              color: #6b7280;
              font-size: 14px;
              line-height: 1.6;
              margin: 0;
            }
            .tip {
              background: linear-gradient(135deg, #dbeafe, #bfdbfe);
              border: 2px solid #3b82f6;
              padding: 20px;
              border-radius: 12px;
              margin-top: 24px;
            }
            .tip-icon {
              font-size: 24px;
              margin-bottom: 8px;
            }
            .tip-title {
              font-weight: 700;
              color: #1e40af;
              margin: 0 0 8px 0;
              font-size: 16px;
            }
            .tip-text {
              color: #1e3a8a;
              font-size: 14px;
              line-height: 1.6;
              margin: 0;
            }
            .footer {
              background: #f9fafb;
              padding: 24px;
              text-align: center;
              border-top: 2px solid #e5e7eb;
            }
            .footer-text {
              color: #6b7280;
              font-size: 13px;
              margin: 4px 0;
            }
            .divider {
              height: 2px;
              background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
              margin: 24px 0;
            }
            @media only screen and (max-width: 600px) {
              .header h1 {
                font-size: 24px;
              }
              .content {
                padding: 20px;
              }
              .meal {
                padding: 16px;
              }
              .nutrients {
                gap: 8px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍽️ Thực Đơn Hôm Nay</h1>
              <p>Chương trình 90 ngày lành mạnh</p>
            </div>
            
            <div class="content">
              <div class="day-badge">📅 Ngày ${dayNumber}/90</div>
              
              ${suggestions.meals?.map((meal: any, index: number) => {
                const timeEmoji = meal.time.includes('Sáng') ? '🌅' : meal.time.includes('Trưa') ? '☀️' : '🌙';
                return `
                  <div class="meal">
                    <div class="meal-header">
                      <div>
                        <h2 class="meal-name">${timeEmoji} ${meal.name}</h2>
                        <span class="meal-time">${meal.time}</span>
                      </div>
                    </div>
                    
                    <p class="meal-description">${meal.description}</p>
                    
                    <div class="nutrients">
                      <span class="nutrient calories">🔥 ${meal.calories} kcal</span>
                      <span class="nutrient">💪 ${meal.protein}g protein</span>
                      <span class="nutrient">🍞 ${meal.carbs}g carbs</span>
                      <span class="nutrient">🥑 ${meal.fats}g chất béo</span>
                    </div>
                    
                    ${meal.ingredients?.length > 0 ? `
                      <div class="ingredients">
                        <div class="ingredients-title">🛒 Nguyên liệu</div>
                        <div class="ingredients-list">
                          ${meal.ingredients.map((ing: string) => `
                            <span class="ingredient">${ing}</span>
                          `).join('')}
                        </div>
                      </div>
                    ` : ''}
                    
                    ${meal.preparation ? `
                      <div class="preparation">
                        <div class="preparation-title">👨‍🍳 Cách làm</div>
                        <p class="preparation-text">${meal.preparation}</p>
                      </div>
                    ` : ''}
                  </div>
                  ${index < suggestions.meals.length - 1 ? '<div class="divider"></div>' : ''}
                `;
              }).join('')}
              
              ${suggestions.dailyTip ? `
                <div class="tip">
                  <div class="tip-icon">💡</div>
                  <h3 class="tip-title">Lời Khuyên Hôm Nay</h3>
                  <p class="tip-text">${suggestions.dailyTip}</p>
                </div>
              ` : ''}
            </div>
            
            <div class="footer">
              <p class="footer-text"><strong>90-Day Meal Program</strong></p>
              <p class="footer-text">Hành trình dinh dưỡng lành mạnh của bạn</p>
              <p class="footer-text" style="margin-top: 12px; font-size: 12px;">
                Chúc bạn một ngày tràn đầy năng lượng! 💚
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "90-Day Meal Program <onboarding@resend.dev>",
        to: [targetEmail],
        subject: `🍽️ Thực đơn ngày ${dayNumber} - Chương trình 90 ngày`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error("Resend API error:", errorData);
      throw new Error(`Failed to send email: ${JSON.stringify(errorData)}`);
    }

    const emailData = await emailResponse.json();
    console.log("Email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ success: true, emailId: emailData.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-meal-email:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
