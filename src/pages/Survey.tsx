import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Activity, Target, Heart } from "lucide-react";

type SurveyData = {
  weight: string;
  height: string;
  age: string;
  gender: string;
  activityLevel: string;
  allergies: string[];
  healthIssues: string[];
  goal: string;
};

const Survey = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [surveyData, setSurveyData] = useState<SurveyData>({
    weight: "",
    height: "",
    age: "",
    gender: "",
    activityLevel: "",
    allergies: [],
    healthIssues: [],
    goal: "",
  });

  const updateField = (field: keyof SurveyData, value: any) => {
    setSurveyData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: 'allergies' | 'healthIssues', item: string) => {
    setSurveyData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      navigate('/results', { state: { surveyData } });
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return surveyData.weight && surveyData.height && surveyData.age && surveyData.gender && surveyData.activityLevel;
      case 2:
        return true;
      case 3:
        return surveyData.goal;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Thông tin thể chất</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Cân nặng (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="65"
                  value={surveyData.weight}
                  onChange={(e) => updateField('weight', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Chiều cao (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="170"
                  value={surveyData.height}
                  onChange={(e) => updateField('height', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Tuổi</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  value={surveyData.age}
                  onChange={(e) => updateField('age', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Giới tính</Label>
                <RadioGroup value={surveyData.gender} onValueChange={(value) => updateField('gender', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Nam</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Nữ</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Mức độ hoạt động</Label>
              <RadioGroup value={surveyData.activityLevel} onValueChange={(value) => updateField('activityLevel', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sedentary" id="sedentary" />
                  <Label htmlFor="sedentary">Ít vận động (văn phòng)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light">Nhẹ nhàng (1-3 ngày/tuần)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="moderate" />
                  <Label htmlFor="moderate">Trung bình (3-5 ngày/tuần)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active">Năng động (6-7 ngày/tuần)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very-active" id="very-active" />
                  <Label htmlFor="very-active">Rất năng động (2 buổi/ngày)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="h-6 w-6 text-secondary" />
              <h2 className="text-2xl font-bold">Sức khỏe & Dị ứng</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-base mb-3 block">Dị ứng thực phẩm (nếu có)</Label>
                <div className="grid md:grid-cols-2 gap-3">
                  {['Hải sản', 'Sữa', 'Trứng', 'Đậu phộng', 'Đậu nành', 'Gluten', 'Hạt'].map(item => (
                    <div key={item} className="flex items-center space-x-2">
                      <Checkbox
                        id={`allergy-${item}`}
                        checked={surveyData.allergies.includes(item)}
                        onCheckedChange={() => toggleArrayItem('allergies', item)}
                      />
                      <Label htmlFor={`allergy-${item}`} className="cursor-pointer">{item}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base mb-3 block">Vấn đề sức khỏe (nếu có)</Label>
                <div className="grid md:grid-cols-2 gap-3">
                  {['Tiểu đường', 'Huyết áp cao', 'Mỡ máu', 'Tim mạch', 'Đau dạ dày', 'Không có'].map(item => (
                    <div key={item} className="flex items-center space-x-2">
                      <Checkbox
                        id={`health-${item}`}
                        checked={surveyData.healthIssues.includes(item)}
                        onCheckedChange={() => toggleArrayItem('healthIssues', item)}
                      />
                      <Label htmlFor={`health-${item}`} className="cursor-pointer">{item}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Target className="h-6 w-6 text-accent" />
              <h2 className="text-2xl font-bold">Mục tiêu của bạn</h2>
            </div>

            <RadioGroup value={surveyData.goal} onValueChange={(value) => updateField('goal', value)}>
              <Card className="p-4 cursor-pointer hover:border-primary transition-smooth">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="lose" id="lose" />
                  <div>
                    <Label htmlFor="lose" className="text-base font-semibold cursor-pointer">Giảm cân (Fat Loss)</Label>
                    <p className="text-sm text-muted-foreground">Giảm mỡ thừa, săn chắc cơ thể</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 cursor-pointer hover:border-primary transition-smooth">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="gain" id="gain" />
                  <div>
                    <Label htmlFor="gain" className="text-base font-semibold cursor-pointer">Tăng cân (Lean Bulk)</Label>
                    <p className="text-sm text-muted-foreground">Tăng cơ bắp lành mạnh</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 cursor-pointer hover:border-primary transition-smooth">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="muscle" id="muscle" />
                  <div>
                    <Label htmlFor="muscle" className="text-base font-semibold cursor-pointer">Tăng cơ</Label>
                    <p className="text-sm text-muted-foreground">Phát triển cơ bắp tối đa</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 cursor-pointer hover:border-primary transition-smooth">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="maintain" id="maintain" />
                  <div>
                    <Label htmlFor="maintain" className="text-base font-semibold cursor-pointer">Duy trì sức khỏe</Label>
                    <p className="text-sm text-muted-foreground">Giữ dáng và ăn uống cân bằng</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 cursor-pointer hover:border-primary transition-smooth">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="clean" id="clean" />
                  <div>
                    <Label htmlFor="clean" className="text-base font-semibold cursor-pointer">Ăn "Clean" / Detox</Label>
                    <p className="text-sm text-muted-foreground">Thanh lọc cơ thể, ăn sạch</p>
                  </div>
                </div>
              </Card>
            </RadioGroup>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Khảo sát cá nhân hóa</h1>
            <span className="text-sm text-muted-foreground">Bước {step}/3</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-primary transition-smooth" 
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        <Card className="p-8 shadow-large">
          {renderStep()}

          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              Quay lại
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="bg-gradient-primary"
            >
              {step === 3 ? 'Xem kết quả' : 'Tiếp tục'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Survey;