import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Meal = {
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  description: string;
  ingredients: string[];
  preparation: string;
};

type Suggestions = {
  meals: Meal[];
  dailyTip: string;
};

type MealSuggestionsProps = {
  surveyData: any;
  currentDay: number;
};

const MealSuggestions = ({ surveyData, currentDay }: MealSuggestionsProps) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  const generateSuggestions = useCallback(async () => {
    if (!userId) {
      toast.error('Vui lòng đăng nhập để tạo gợi ý');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-meal-suggestions', {
        body: { surveyData, currentDay }
      });

      if (error) {
        console.error('Function error:', error);
        if (error.message?.includes('429')) {
          toast.error('Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.');
        } else if (error.message?.includes('402')) {
          toast.error('Cần nạp thêm credits. Vui lòng liên hệ quản trị viên.');
        } else {
          toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
        }
        return;
      }

      if (data?.error) {
        toast.error(data.message || 'Có lỗi xảy ra');
        return;
      }

      setSuggestions(data);

      // Save to database
      try {
        const { error: saveError } = await supabase
          .from('meal_suggestions')
          .upsert({
            user_id: userId,
            day_number: currentDay,
            suggestions: data,
          }, {
            onConflict: 'user_id,day_number'
          });

        if (saveError) {
          console.error('Error saving suggestions:', saveError);
          toast.error('Không thể lưu gợi ý vào database');
        } else {
          toast.success('Đã tạo và lưu gợi ý món ăn thành công!');
        }
      } catch (saveErr) {
        console.error('Save error:', saveErr);
      }
    } catch (err) {
      console.error('Error generating suggestions:', err);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [userId, surveyData, currentDay]);

  // Load saved suggestions when day changes
  useEffect(() => {
    const loadSavedSuggestions = async () => {
      if (!userId) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('meal_suggestions')
          .select('suggestions')
          .eq('user_id', userId)
          .eq('day_number', currentDay)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading suggestions:', error);
        }

        if (data) {
          setSuggestions(data.suggestions as Suggestions);
        } else {
          // Clear suggestions if no data found
          setSuggestions(null);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSavedSuggestions();
  }, [currentDay, userId]);

  return (
    <Card className="p-6 shadow-medium">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-bold">Gợi ý AI thông minh</h3>
        </div>
        <Button
          onClick={generateSuggestions}
          disabled={loading}
          size="sm"
          className="bg-gradient-primary"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang tạo...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tạo gợi ý mới
            </>
          )}
        </Button>
      </div>

      {!suggestions && !loading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            {userId ? 'Nhấn nút để AI tạo thực đơn phù hợp với bạn' : 'Vui lòng đăng nhập để tạo gợi ý'}
          </p>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Đang phân tích và tạo gợi ý...</p>
        </div>
      )}

      {suggestions && !loading && (
        <div className="space-y-4">
          {suggestions.dailyTip && (
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm font-semibold text-primary mb-1">💡 Lời khuyên hôm nay</p>
              <p className="text-sm">{suggestions.dailyTip}</p>
            </div>
          )}

          <div className="space-y-3">
            {suggestions.meals.map((meal, idx) => (
              <Card key={idx} className="p-4 hover:shadow-medium transition-smooth">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-lg">{meal.name}</h4>
                    <p className="text-sm text-muted-foreground">{meal.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{meal.calories} kcal</p>
                    <p className="text-xs text-muted-foreground">
                      P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fats}g
                    </p>
                  </div>
                </div>

                <p className="text-sm mb-3">{meal.description}</p>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Nguyên liệu:</p>
                    <div className="flex flex-wrap gap-1">
                      {meal.ingredients.map((ing, i) => (
                        <span key={i} className="text-xs bg-muted px-2 py-1 rounded">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Cách làm:</p>
                    <p className="text-xs text-muted-foreground">{meal.preparation}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default MealSuggestions;
