import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { surveyData, currentDay } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context from survey data
    const goalMap: Record<string, string> = {
      lose: "giảm cân",
      gain: "tăng cân lành mạnh",
      muscle: "tăng cơ",
      maintain: "duy trì sức khỏe",
      clean: "ăn clean và detox"
    };

    const activityMap: Record<string, string> = {
      sedentary: "ít vận động",
      light: "vận động nhẹ",
      moderate: "vận động trung bình",
      active: "vận động nhiều",
      "very-active": "vận động rất nhiều"
    };

    const systemPrompt = `Bạn là chuyên gia dinh dưỡng Việt Nam, chuyên tạo thực đơn lành mạnh và khoa học.
Nhiệm vụ: Gợi ý 3 món ăn Việt Nam phù hợp cho bữa sáng, trưa, tối.

Yêu cầu:
- Món ăn phải phổ biến, dễ làm tại Việt Nam
- Tính chính xác calories và macro (protein, carbs, fats)
- Tránh các thực phẩm dị ứng đã được nêu
- Phù hợp với vấn đề sức khỏe (nếu có)
- Đa dạng, không lặp lại món cũ

Format trả về JSON:
{
  "meals": [
    {
      "name": "Tên món",
      "time": "Sáng/Trưa/Tối",
      "calories": 450,
      "protein": 30,
      "carbs": 45,
      "fats": 15,
      "description": "Mô tả ngắn món ăn",
      "ingredients": ["Nguyên liệu 1", "Nguyên liệu 2"],
      "preparation": "Cách làm vắn tắt"
    }
  ],
  "dailyTip": "Lời khuyên dinh dưỡng cho ngày hôm nay"
}`;

    const userPrompt = `Thông tin người dùng:
- Cân nặng: ${surveyData.weight}kg, Chiều cao: ${surveyData.height}cm
- Tuổi: ${surveyData.age}, Giới tính: ${surveyData.gender === 'male' ? 'Nam' : 'Nữ'}
- Mức độ vận động: ${activityMap[surveyData.activityLevel]}
- Mục tiêu: ${goalMap[surveyData.goal]}
- Dị ứng: ${surveyData.allergies.length > 0 ? surveyData.allergies.join(', ') : 'Không có'}
- Vấn đề sức khỏe: ${surveyData.healthIssues.length > 0 ? surveyData.healthIssues.join(', ') : 'Không có'}
- Đang ở ngày ${currentDay}/90 của chương trình

Hãy gợi ý 3 món ăn Việt Nam phù hợp cho ngày hôm nay.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Rate limit exceeded", 
            message: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau." 
          }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "Payment required", 
            message: "Cần nạp thêm credits vào Lovable AI. Vui lòng liên hệ quản trị viên." 
          }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const suggestions = JSON.parse(content);

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-meal-suggestions:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Có lỗi xảy ra khi tạo gợi ý. Vui lòng thử lại."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
