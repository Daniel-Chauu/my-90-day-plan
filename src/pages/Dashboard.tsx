import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, Apple, Flame } from "lucide-react";
import { useState, useEffect } from "react";
import MealSuggestions from "@/components/MealSuggestions";

// Mock survey data - in production this would come from user profile/database
const mockSurveyData = {
  weight: "70",
  height: "170",
  age: "28",
  gender: "male",
  activityLevel: "moderate",
  allergies: [],
  healthIssues: [],
  goal: "lose"
};

const Dashboard = () => {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDay, setCurrentDay] = useState(1);
  const totalWeeks = 13; // 90 days ≈ 13 weeks

  const handleDayClick = (dayIndex: number) => {
    const day = (currentWeek - 1) * 7 + dayIndex + 1;
    setCurrentDay(day);
  };

  return (
    <div className="min-h-screen bg-gradient-hero py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard - Lộ trình 90 ngày</h1>
          <p className="text-muted-foreground">Theo dõi tiến trình và thực đơn hàng ngày của bạn</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 shadow-medium">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">Tiến độ</h3>
            </div>
            <p className="text-3xl font-bold text-primary mb-2">Ngày {currentDay}/90</p>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-primary" style={{ width: `${(currentDay / 90) * 100}%` }} />
            </div>
          </Card>

          <Card className="p-6 shadow-medium">
            <div className="flex items-center gap-3 mb-3">
              <Flame className="h-6 w-6 text-accent" />
              <h3 className="font-semibold">Streak</h3>
            </div>
            <p className="text-3xl font-bold text-accent mb-2">7 ngày</p>
            <p className="text-sm text-muted-foreground">Cố gắng giữ vững nhé!</p>
          </Card>

          <Card className="p-6 shadow-medium">
            <div className="flex items-center gap-3 mb-3">
              <Apple className="h-6 w-6 text-secondary" />
              <h3 className="font-semibold">Hôm nay</h3>
            </div>
            <p className="text-3xl font-bold text-secondary mb-2">1,450</p>
            <p className="text-sm text-muted-foreground">/ 1,800 calories</p>
          </Card>
        </div>

        <Card className="p-6 mb-6 shadow-large">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Tuần {currentWeek}</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
                disabled={currentWeek === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(Math.min(totalWeeks, currentWeek + 1))}
                disabled={currentWeek === totalWeeks}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-7 gap-3">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, idx) => {
              const dayNumber = (currentWeek - 1) * 7 + idx + 1;
              const isSelected = dayNumber === currentDay;
              return (
                <Card
                  key={idx}
                  onClick={() => handleDayClick(idx)}
                  className={`p-4 cursor-pointer hover:border-primary transition-smooth text-center ${
                    isSelected ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <p className="font-semibold mb-2">{day}</p>
                  <p className="text-sm text-muted-foreground">Ngày {dayNumber}</p>
                  <div className={`mt-2 h-2 rounded-full ${isSelected ? 'bg-gradient-primary' : 'bg-primary/20'}`} />
                </Card>
              );
            })}
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <MealSuggestions surveyData={mockSurveyData} currentDay={currentDay} />

          <Card className="p-6 shadow-medium">
            <h3 className="text-xl font-bold mb-4">Lời khuyên hôm nay</h3>
            <div className="space-y-3">
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="font-semibold mb-1">💧 Uống đủ nước</p>
                <p className="text-sm text-muted-foreground">Mục tiêu: 2 lít/ngày</p>
              </div>
              <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                <p className="font-semibold mb-1">🏃 Vận động nhẹ</p>
                <p className="text-sm text-muted-foreground">30 phút đi bộ</p>
              </div>
              <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                <p className="font-semibold mb-1">😴 Ngủ đủ giấc</p>
                <p className="text-sm text-muted-foreground">7-8 giờ mỗi đêm</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;