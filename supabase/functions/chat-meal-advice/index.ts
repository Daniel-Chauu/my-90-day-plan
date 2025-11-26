import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChatRequest {
  messages: Array<{ role: string; content: string }>;
  surveyData: any;
  currentMeals: any[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, surveyData, currentMeals }: ChatRequest = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Bạn là chuyên gia dinh dưỡng của chương trình 90-Day Meal Program.

THÔNG TIN NGƯỜI DÙNG:
- Cân nặng: ${surveyData.weight}kg
- Chiều cao: ${surveyData.height}cm  
- Tuổi: ${surveyData.age}
- Giới tính: ${surveyData.gender}
- Mức độ vận động: ${surveyData.activityLevel}
- Dị ứng: ${surveyData.allergies?.join(", ") || "Không có"}
- Vấn đề sức khỏe: ${surveyData.healthIssues?.join(", ") || "Không có"}
- Mục tiêu: ${surveyData.goal}

THỰC ĐƠN HIỆN TẠI:
${currentMeals.map((meal, idx) => `
${idx + 1}. ${meal.name} (${meal.time})
   - Calories: ${meal.calories}kcal
   - Protein: ${meal.protein}g | Carbs: ${meal.carbs}g | Fat: ${meal.fat}g
   - Mô tả: ${meal.description}
`).join("\n")}

NHIỆM VỤ CỦA BẠN:
- Tư vấn thay đổi món ăn phù hợp với nhu cầu dinh dưỡng và mục tiêu
- Đảm bảo giữ nguyên tổng calories và tỷ lệ macro tương tự
- Tôn trọng dị ứng và vấn đề sức khỏe
- Gợi ý món ăn Việt Nam, dễ chế biến
- Trả lời ngắn gọn, thân thiện, hữu ích

Khi gợi ý món mới, hãy bao gồm: tên món, calories, protein/carbs/fat, nguyên liệu chính.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Đang quá tải, vui lòng thử lại sau." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Hết credits, vui lòng nạp thêm." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Lỗi kết nối AI" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Lỗi không xác định" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
