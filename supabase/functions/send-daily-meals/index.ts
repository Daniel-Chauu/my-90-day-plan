import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting daily meal email job...");

    // Get current time in HH:MM format
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    const today = now.toISOString().split('T')[0];

    console.log(`Current time: ${currentTime}, Date: ${today}`);

    // Find users who need emails at this hour and haven't received today
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email_notifications_enabled", true)
      .like("notification_time", `${String(currentHour).padStart(2, '0')}:%`)
      .or(`last_email_sent_date.is.null,last_email_sent_date.lt.${today}`);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      throw usersError;
    }

    console.log(`Found ${users?.length || 0} users to process`);

    if (!users || users.length === 0) {
      return new Response(JSON.stringify({ message: "No users to process" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        console.log(`Processing user: ${user.email}`);

        // Get current day from profile
        const currentDay = user.current_day || 1;

        // Check if meal suggestions exist for today
        let { data: mealData, error: mealError } = await supabase
          .from("meal_suggestions")
          .select("suggestions")
          .eq("user_id", user.id)
          .eq("day_number", currentDay)
          .maybeSingle();

        // If no meal suggestions, generate them
        if (!mealData) {
          console.log(`Generating meals for user ${user.email}, day ${currentDay}`);
          
          const surveyData = {
            weight: user.weight || "70",
            height: user.height || "170",
            age: user.age || "28",
            gender: user.gender || "male",
            activityLevel: user.activity_level || "moderate",
            allergies: user.allergies || [],
            healthIssues: user.health_issues || [],
            goal: user.goal_type || "lose"
          };

          // Call generate-meal-suggestions function
          const { data: generatedMeals, error: genError } = await supabase.functions.invoke(
            "generate-meal-suggestions",
            { body: { surveyData, currentDay } }
          );

          if (genError || !generatedMeals) {
            console.error(`Failed to generate meals for user ${user.email}:`, genError);
            errorCount++;
            continue;
          }

          // Save generated meals
          await supabase.from("meal_suggestions").upsert({
            user_id: user.id,
            day_number: currentDay,
            suggestions: generatedMeals,
          });

          mealData = { suggestions: generatedMeals };
        }

        const suggestions = mealData.suggestions as any;

        // Send email with meal suggestions
        const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .header {
                  background: linear-gradient(135deg, #10b981, #3b82f6);
                  color: white;
                  padding: 30px;
                  border-radius: 12px 12px 0 0;
                  text-align: center;
                }
                .content {
                  background: #f9fafb;
                  padding: 30px;
                  border-radius: 0 0 12px 12px;
                }
                .meal {
                  background: white;
                  padding: 20px;
                  margin-bottom: 20px;
                  border-radius: 8px;
                  border-left: 4px solid #10b981;
                }
                .meal-name {
                  font-size: 18px;
                  font-weight: bold;
                  color: #10b981;
                  margin-bottom: 5px;
                }
                .meal-time {
                  color: #6b7280;
                  font-size: 14px;
                  margin-bottom: 10px;
                }
                .nutrients {
                  display: flex;
                  gap: 15px;
                  margin: 10px 0;
                  font-size: 14px;
                }
                .nutrient {
                  background: #f3f4f6;
                  padding: 5px 10px;
                  border-radius: 4px;
                }
                .tip {
                  background: #dbeafe;
                  border-left: 4px solid #3b82f6;
                  padding: 15px;
                  margin-top: 20px;
                  border-radius: 4px;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>🍽️ Thực đơn ngày ${currentDay}</h1>
                <p>Chào buổi sáng! Đây là thực đơn hôm nay của bạn</p>
              </div>
              <div class="content">
                ${suggestions.meals?.map((meal: any) => `
                  <div class="meal">
                    <div class="meal-name">${meal.name}</div>
                    <div class="meal-time">${meal.time}</div>
                    <p>${meal.description}</p>
                    <div class="nutrients">
                      <span class="nutrient">🔥 ${meal.calories} kcal</span>
                      <span class="nutrient">💪 ${meal.protein}g protein</span>
                      <span class="nutrient">🍞 ${meal.carbs}g carbs</span>
                      <span class="nutrient">🥑 ${meal.fats}g fat</span>
                    </div>
                  </div>
                `).join('')}
                
                ${suggestions.dailyTip ? `
                  <div class="tip">
                    <strong>💡 Lời khuyên hôm nay:</strong><br>
                    ${suggestions.dailyTip}
                  </div>
                ` : ''}
              </div>
            </body>
          </html>
        `;

        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "90-Day Meal Program <onboarding@resend.dev>",
            to: [user.notification_email || user.email],
            subject: `Thực đơn ngày ${currentDay} - 90-Day Meal Program`,
            html: emailHtml,
          }),
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.json();
          console.error(`Email error for ${user.email}:`, errorData);
          errorCount++;
          continue;
        }

        // Update last_email_sent_date
        await supabase
          .from("profiles")
          .update({ last_email_sent_date: today })
          .eq("id", user.id);

        console.log(`Email sent successfully to ${user.email}`);
        successCount++;

      } catch (userError) {
        console.error(`Error processing user ${user.email}:`, userError);
        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({
        message: "Daily meal email job completed",
        success: successCount,
        errors: errorCount,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-daily-meals:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
