import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, TrendingUp, Target, Calendar, Apple } from "lucide-react";
import { useEffect, useState } from "react";

type NutritionPlan = {
  bmr: number;
  tdee: number;
  targetCalories: number;
  protein: number;
  carbs: number;
  fats: number;
  recommendation: string;
};

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { surveyData } = location.state || {};
  const [plan, setPlan] = useState<NutritionPlan | null>(null);

  useEffect(() => {
    if (!surveyData) {
      navigate('/survey');
      return;
    }

    // Calculate BMR using Mifflin-St Jeor Equation
    const weight = parseFloat(surveyData.weight);
    const height = parseFloat(surveyData.height);
    const age = parseFloat(surveyData.age);
    
    let bmr = 0;
    if (surveyData.gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Calculate TDEE based on activity level
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      'very-active': 1.9
    };
    
    const tdee = bmr * activityMultipliers[surveyData.activityLevel];

    // Adjust calories based on goal
    let targetCalories = tdee;
    let recommendation = "";
    
    switch (surveyData.goal) {
      case 'lose':
        targetCalories = tdee * 0.8; // -20%
        recommendation = "Giảm cân lành mạnh với thâm hụt calories vừa phải";
        break;
      case 'gain':
        targetCalories = tdee * 1.15; // +15%
        recommendation = "Tăng cân đều đặn với thặng dư calories phù hợp";
        break;
      case 'muscle':
        targetCalories = tdee * 1.1; // +10%
        recommendation = "Tăng cơ hiệu quả với protein cao";
        break;
      case 'maintain':
        targetCalories = tdee;
        recommendation = "Duy trì cân nặng và sức khỏe tối ưu";
        break;
      case 'clean':
        targetCalories = tdee * 0.95; // -5%
        recommendation = "Thanh lọc cơ thể với thực phẩm sạch";
        break;
    }

    // Calculate macros
    let proteinPercent = 0.3;
    let carbsPercent = 0.45;
    let fatsPercent = 0.25;

    if (surveyData.goal === 'muscle' || surveyData.goal === 'gain') {
      proteinPercent = 0.35;
      carbsPercent = 0.45;
      fatsPercent = 0.2;
    } else if (surveyData.goal === 'lose') {
      proteinPercent = 0.35;
      carbsPercent = 0.35;
      fatsPercent = 0.3;
    }

    const protein = Math.round((targetCalories * proteinPercent) / 4);
    const carbs = Math.round((targetCalories * carbsPercent) / 4);
    const fats = Math.round((targetCalories * fatsPercent) / 9);

    setPlan({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      protein,
      carbs,
      fats,
      recommendation
    });
  }, [surveyData, navigate]);

  if (!plan) return null;

  return (
    <div className="min-h-screen bg-gradient-hero py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3">Kết quả phân tích của bạn</h1>
          <p className="text-lg text-muted-foreground">{plan.recommendation}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 shadow-medium">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">BMR</h3>
            </div>
            <p className="text-3xl font-bold text-primary">{plan.bmr}</p>
            <p className="text-sm text-muted-foreground mt-1">Calories/ngày (nghỉ ngơi)</p>
          </Card>

          <Card className="p-6 shadow-medium">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="h-6 w-6 text-secondary" />
              <h3 className="font-semibold">TDEE</h3>
            </div>
            <p className="text-3xl font-bold text-secondary">{plan.tdee}</p>
            <p className="text-sm text-muted-foreground mt-1">Tổng năng lượng tiêu thụ</p>
          </Card>

          <Card className="p-6 shadow-medium">
            <div className="flex items-center gap-3 mb-3">
              <Target className="h-6 w-6 text-accent" />
              <h3 className="font-semibold">Mục tiêu</h3>
            </div>
            <p className="text-3xl font-bold text-accent">{plan.targetCalories}</p>
            <p className="text-sm text-muted-foreground mt-1">Calories/ngày nên ăn</p>
          </Card>
        </div>

        <Card className="p-8 mb-8 shadow-large">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Apple className="h-7 w-7 text-primary" />
            Phân bổ dinh dưỡng hàng ngày
          </h2>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Protein</span>
                <span className="font-bold text-primary">{plan.protein}g</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-primary" style={{ width: '35%' }} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">Xây dựng và phục hồi cơ bắp</p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Carbs</span>
                <span className="font-bold text-secondary">{plan.carbs}g</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-secondary" style={{ width: '45%' }} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">Nguồn năng lượng chính</p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Fats</span>
                <span className="font-bold text-accent">{plan.fats}g</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-accent" style={{ width: '20%' }} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">Hormone và sức khỏe tế bào</p>
            </div>
          </div>
        </Card>

        <Card className="p-8 bg-gradient-primary text-primary-foreground shadow-large">
          <div className="flex items-start gap-4">
            <Calendar className="h-12 w-12 flex-shrink-0" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3">Lộ trình 90 ngày của bạn</h2>
              <p className="mb-6 opacity-90">
                Chúng tôi đã tạo một kế hoạch dinh dưỡng cá nhân hóa hoàn chỉnh cho 90 ngày tới. 
                Mỗi ngày sẽ có thực đơn phù hợp với mục tiêu và sở thích của bạn.
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate('/dashboard')}
                className="font-semibold"
              >
                Xem lộ trình chi tiết
              </Button>
            </div>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/survey')}
          >
            Làm lại khảo sát
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;